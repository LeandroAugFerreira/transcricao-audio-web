"""Ensaios de recrutamento sobre o Flask real, sem rodar Whisper/PyTorch.

Cada caso importa uma cópia do app.py em um diretório temporário para impedir
acesso a historico.db, sessao.key, uploads, transcrições e arquivos do autor.
O worker Whisper é sempre substituído por resposta SINTÉTICA; não há STT real.
"""
from contextlib import redirect_stdout
from io import BytesIO, StringIO
from importlib.util import module_from_spec, spec_from_file_location
from pathlib import Path
import secrets
import shutil
import tempfile
import threading
import unittest
from unittest.mock import patch

from docx import Document
from werkzeug.security import generate_password_hash


ROOT = Path(__file__).resolve().parents[1]
TEST_TEXT = "Esta é uma transcrição fictícia. O serviço de teste foi concluído."


class RecruitingFlowTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory(prefix="voxtexto-case-")
        self.addCleanup(self.temp.cleanup)
        root = Path(self.temp.name)
        shutil.copyfile(ROOT / "app.py", root / "app.py")
        # O fluxo de login real utiliza template Flask, mas não serve mídias.
        (root / "templates").mkdir()
        shutil.copyfile(ROOT / "templates" / "login.html", root / "templates" / "login.html")
        spec = spec_from_file_location("voxtexto_case_" + secrets.token_hex(6), root / "app.py")
        self.vox = module_from_spec(spec)
        with redirect_stdout(StringIO()):
            spec.loader.exec_module(self.vox)
            self.vox.inicializar_banco_historico()
        self.password = "Senha-Ficticia-Apenas-CI-2026"
        self.admin_id = self.vox.criar_usuario_administrador(
            nome="Pessoa de Teste",
            email="pessoa@example.com",
            usuario="operador_teste",
            senha=self.password,
        )
        self.client = self.vox.app.test_client()
        auth = self.client.post(
            "/login",
            data={"login": "operador_teste", "senha": self.password},
            follow_redirects=False,
        )
        self.assertEqual(auth.status_code, 302)
        self.assertEqual(self.client.get("/api/status").json["usuario_id"], self.admin_id)

    def send(self, filename="entrevista-ficticia.wav", content=b"ARQUIVO FICTICIO, NAO AUDIO REAL"):
        return self.client.post(
            "/transcrever",
            data={"arquivos": (BytesIO(content), filename)},
            content_type="multipart/form-data",
        )

    def fake_worker(self, text=TEST_TEXT):
        return patch.object(
            self.vox, "executar_transcricao_worker",
            return_value={"sucesso": True, "cancelado": False, "texto": text},
        )

    def test_unauthenticated_routes_reject_access(self):
        anonymous = self.vox.app.test_client()
        self.assertEqual(anonymous.get("/api/status").status_code, 401)
        self.assertEqual(anonymous.get("/historico").status_code, 401)
        self.assertEqual(anonymous.delete("/historico").status_code, 401)
        self.assertEqual(anonymous.post("/transcrever").status_code, 401)
        self.assertEqual(anonymous.post("/cancelar").status_code, 401)
        self.assertEqual(anonymous.get("/download/qualquer.docx").status_code, 302)

    def test_upload_name_normalization_and_extension_allowlist(self):
        self.assertEqual(self.vox.normalizar_nome_arquivo(
            r"C:\pasta_privada\outra\aula.wav"), "aula.wav")
        self.assertEqual(self.vox.normalizar_nome_arquivo("../segredo/entrevista.mp3"),
                         "entrevista.mp3")
        for ext in ("mp3", "mp4", "wav", "m4a", "ogg"):
            self.assertTrue(self.vox.arquivo_permitido("teste." + ext))
        for ext in ("exe", "py", "php", "txt", "docx"):
            self.assertFalse(self.vox.arquivo_permitido("teste." + ext))

    def test_empty_request_is_rejected(self):
        result = self.client.post("/transcrever")
        self.assertEqual(result.status_code, 400)
        self.assertFalse(result.json["sucesso"])
        self.assertEqual(self.client.get("/historico").json["total"], 0)

    def test_invalid_extension_never_calls_worker(self):
        with patch.object(self.vox, "executar_transcricao_worker") as fake:
            result = self.send("executavel.exe")
        self.assertEqual(result.status_code, 200)
        self.assertFalse(result.json["resultados"][0]["sucesso"])
        self.assertIn("não suportado", result.json["resultados"][0]["erro"])
        fake.assert_not_called()
        self.assertEqual(self.client.get("/historico").json["total"], 0)

    def test_stubbed_worker_creates_real_docx_history_and_cleans_upload(self):
        with self.fake_worker():
            result = self.send()
        self.assertEqual(result.status_code, 200, result.data.decode()[:700])
        record = result.json["resultados"][0]
        self.assertTrue(record["sucesso"], record)
        self.assertIn("transcrição fictícia", record["transcricao"])
        word_path = Path(self.vox.PASTA_TRANSCRICOES) / record["arquivo_docx"]
        self.assertTrue(word_path.is_file())
        doc = Document(word_path)
        joined = "\n".join(p.text for p in doc.paragraphs)
        self.assertIn("VoxTexto", joined)
        self.assertIn("transcrição fictícia", joined)
        history = self.client.get("/historico").json
        self.assertEqual(history["total"], 1)
        self.assertEqual(history["registros"][0]["status"], "concluido")
        self.assertTrue(history["registros"][0]["download_disponivel"])
        download = self.client.get("/download/" + record["arquivo_docx"])
        self.assertEqual(download.status_code, 200)
        self.assertTrue(download.data.startswith(b"PK"))  # container ZIP DOCX
        self.assertEqual(list(Path(self.vox.PASTA_UPLOADS).iterdir()), [])

    def test_repeat_filename_preserves_two_docs_in_history(self):
        with self.fake_worker():
            one = self.send().json["resultados"][0]
            two = self.send().json["resultados"][0]
        self.assertTrue(one["sucesso"] and two["sucesso"])
        self.assertNotEqual(one["arquivo_docx"], two["arquivo_docx"])
        self.assertEqual(self.client.get("/historico").json["total"], 2)
        self.assertTrue((Path(self.vox.PASTA_TRANSCRICOES) / one["arquivo_docx"]).exists())
        self.assertTrue((Path(self.vox.PASTA_TRANSCRICOES) / two["arquivo_docx"]).exists())

    def test_stubbed_worker_failure_is_recorded_and_upload_removed(self):
        with patch.object(self.vox, "executar_transcricao_worker", return_value={
            "sucesso": False, "cancelado": False,
            "erro": "Falha sintética do worker para teste.",
        }):
            result = self.send()
        self.assertEqual(result.status_code, 200)
        self.assertFalse(result.json["resultados"][0]["sucesso"])
        history = self.client.get("/historico").json
        self.assertEqual(history["registros"][0]["status"], "erro")
        self.assertFalse(history["registros"][0]["download_disponivel"])
        self.assertEqual(list(Path(self.vox.PASTA_UPLOADS).iterdir()), [])

    def test_stubbed_cancellation_is_persisted_without_word(self):
        with patch.object(self.vox, "executar_transcricao_worker", return_value={
            "sucesso": False, "cancelado": True,
        }):
            result = self.send()
        self.assertEqual(result.status_code, 200)
        self.assertTrue(result.json["resultados"][0]["cancelado"])
        history = self.client.get("/historico").json["registros"]
        self.assertEqual(history[0]["status"], "cancelado")
        self.assertFalse(history[0]["download_disponivel"])
        self.assertEqual(list(Path(self.vox.PASTA_UPLOADS).iterdir()), [])

    def test_second_user_cannot_download_or_cancel_first_user_task(self):
        with self.fake_worker():
            document = self.send().json["resultados"][0]["arquivo_docx"]
        with self.vox.conectar_banco_historico() as db:
            now = "2026-11-08T12:00:00"
            cursor = db.execute(
                """INSERT INTO usuarios
                (nome,email,usuario,senha_hash,perfil,ativo,criado_em,atualizado_em,ultimo_acesso)
                VALUES (?,?,?,?,?,?,?,?,?)""",
                ("Outra Pessoa", "segunda@example.com", "segunda_pessoa",
                 generate_password_hash(self.password), "usuario", 1,
                 now, now, now),
            )
            second_id = cursor.lastrowid
            db.commit()
        other = self.vox.app.test_client()
        login = other.post("/login", data={
            "login": "segunda_pessoa", "senha": self.password,
        }, follow_redirects=False)
        self.assertEqual(login.status_code, 302)
        self.assertEqual(other.get("/api/status").json["usuario_id"], second_id)
        self.assertEqual(other.get("/historico").json["total"], 0)
        self.assertEqual(other.get("/download/" + document).status_code, 404)
        self.assertEqual(self.client.get("/download/" + document).status_code, 200)

        signal = threading.Event()
        self.vox.tarefa_ativa_id = "tarefa-ficticia-123"
        self.vox.tarefa_ativa_usuario_id = self.admin_id
        self.vox.evento_cancelamento_ativo = signal
        with patch.object(self.vox, "reiniciar_worker") as restart:
            denied = other.post("/cancelar")
            self.assertEqual(denied.status_code, 403)
            self.assertFalse(signal.is_set())
            restart.assert_not_called()
            allowed = self.client.post("/cancelar")
            self.assertEqual(allowed.status_code, 200)
            self.assertTrue(signal.is_set())
            restart.assert_called_once()
        self.vox.tarefa_ativa_id = None
        self.vox.evento_cancelamento_ativo = None
        self.vox.tarefa_ativa_usuario_id = None


if __name__ == "__main__":
    unittest.main()
