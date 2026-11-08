# Protocolo dos testes de integração — VoxTexto

## Ambiente e fonte

- Arquivo: [tests/test_recruiting_flows.py](../../tests/test_recruiting_flows.py).
- Workflow: [.github/workflows/recruiting-tests.yml](../../.github/workflows/recruiting-tests.yml).
- [GitHub Actions #42535099487](https://github.com/LeandroAugFerreira/transcricao-audio-web/actions/runs/42535099487): **15 testes aprovados**, nove novos e seis de release, com validação V2.0.

Usa Python 3.13, Flask 3.1.0 e python-docx 1.1.2, além de unittest. **Não instala Whisper, PyTorch, FFmpeg nem baixa mídias ou modelos.**

## Isolamento

Cada teste cria um TemporaryDirectory, copia somente app.py e o template de login e carrega ali a aplicação Flask. Assim, a chave de sessão, o banco historico.db e as pastas uploads/transcricoes criados pelo teste não são os do checkout ou da instalação do autor.

O banco temporário recebe contas fictícias, e a função de processamento Whisper é substituída por respostas predefinidas. Nenhum áudio pessoal, token, SMTP, n8n ou outro serviço é usado. A pasta é descartada ao final do teste.

## Exercitado em testes reais

1. Login Flask e consulta autenticada à API de status.
2. Bloqueio de rotas sem sessão.
3. Normalização de nomes de arquivo, extensões e falhas de formulário.
4. Upload sintético e gravação de histórico SQLite.
5. Texto fictício devolvido por mock, tratamento da resposta, criação e leitura de DOCX real.
6. Download autorizado e remoção do upload temporário.
7. Dois arquivos com o mesmo nome geram DOCX distintos e dois registros.
8. Respostas de falha/cancelamento simuladas, gravando estados sem Word.
9. Histórico filtrado por conta, download alheio negado e cancelamento autorizado apenas ao proprietário.
10. Seis testes antigos validam metadados de versão e instalador.

## Não exercitado

A transcrição de áudio **não foi executada**: a função executar_transcricao_worker foi substituída com unittest.mock.patch.object. O ensaio comprova orquestração, integração Flask/SQLite/DOCX e controle de acesso **sob resultado sintético**; não comprova acurácia, WER/CER, uso de GPU, tempo de inferência, modelo carregado ou interrupção real de PyTorch.

Também não executa navegador gráfico, nova compilação Windows ou pentest.

## Como reproduzir

Em clone/venv novo, sem dados particulares:

~~~bash
python -m pip install Flask==3.1.0 python-docx==1.1.2
python -m unittest discover -s tests -v
python scripts/validate_release.py
~~~

Não apontar o procedimento a banco existente. Os testes carregam a aplicação em diretório descartável automaticamente.

[Auditoria](AUDITORIA.md) · [Evidências](EVIDENCIAS.md) · [Roteiro](ROTEIRO_DEMO.md).
