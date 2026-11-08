# VoxTexto V2.0 — evidências verificáveis

**Atualização:** 08/11/2026. **Base anterior:** [Validação histórica](../github/VALIDACAO.md) com seis testes de release, sem teste de reconhecimento de fala.

## Resultado da execução nova

[GitHub Actions #42535099487](https://github.com/LeandroAugFerreira/transcricao-audio-web/actions/runs/42535099487), commit `f3f0fbfc6fb8a07f1cb678f9e56632ce941ed0d4`:

- **15 testes unittest aprovados** em Python 3.13: seis de versão/instalador pré-existentes + **nove novos testes de integração Flask/SQLite/DOCX**.
- `python scripts/validate_release.py` aprovado, confirmando versão **2.0** e nome esperado de instalador `TranscricaoEmTexto-Setup-V2.0.exe`.
- Workflow leve instalou **Flask 3.1.0** e **python-docx 1.1.2**, além das dependências transitivas, **sem** `torch`, `whisper`, modelos, FFmpeg ou mídia pessoal.
- DOCX real foi gravado em diretório temporário, aberto com `python-docx` e validado quanto ao conteúdo sintético. Não houve envio a serviço externo.

**Atenção:** validar metadados de instalador NÃO significa que um EXE novo foi construído. A compilação Windows tem workflow histórico e não foi acionada nesta revisão.

## Nove testes novos

Arquivo: [tests/test_recruiting_flows.py](../../tests/test_recruiting_flows.py).

| Teste | Operação realmente executada | Exclusão explícita |
| --- | --- | --- |
| Rotas anônimas | Flask real retorna 401 nas APIs protegidas e redireciona download | Não há credencial real |
| Nome/formatos | Normaliza caminhos de upload e testa extensões permitidas/negadas | Não valida magic bytes ou conteúdo de áudio |
| Requisição sem mídia | `/transcrever` devolve 400 e histórico vazio | Não chama worker |
| Extensão inválida | Rejeita `.exe` antes do worker, sem histórico | Não inspeciona malware |
| Sucesso com texto sintético | Flask grava upload, SQLite, tratamento de texto, DOCX real e download | **Whisper substituído por mock** |
| Repetir nome | Gera dois nomes DOCX diferentes e preserva histórico | Não significa deduplicação de áudio |
| Erro sintético | Histórico `erro` e limpeza do upload | Sem falha real de inferência |
| Cancelamento sintético | Histórico `cancelado`, sem DOCX | Sem interrupção de processo real |
| Segundo usuário | Histórico/Word isolados, cancelamento alheio 403, evento autorizado do proprietário | `reiniciar_worker` substituído por mock |

## Isolamento real do CI

A suíte importa **uma cópia de app.py** dentro de `TemporaryDirectory`, com SQLite, chave de sessão, uploads e DOCX confinados à pasta efêmera do teste. Não usa `historico.db`, `sessao.key`, `uploads` ou `transcricoes` do autor. Uma conta fictícia é criada no banco descartável; uma segunda testa os limites de acesso. Os bytes de teste com extensão WAV **não são áudio válido**, pois o worker foi substituído.

O runtime usa apenas arquivos de teste de código e texto gerados pela suíte; **nenhum modelo Whisper é carregado/baixado**.

## O que NÃO foi testado agora

- STT real com Whisper small, FFmpeg, PyTorch, GPU/CPU, velocidade ou latência.
- WER, CER, sotaques, ruído, idioma, diarização, qualidade textual ou reconhecimento de voz.
- Cancelamento e reinício físico do worker sob carga real.
- Navegador Chromium real, teclado, responsividade, todos os fluxos de UI.
- Build Windows, instalador, atualizações Inno Setup ou download de modelo.
- Limites de arquivo, CSRF, pentest, carga concorrente, criptografia/retention, deploy público.

## Demonstração acessível ao recrutador

[Tour estático do VoxTexto](https://leandroaugferreira.github.io/voxtexto-demo.html): visitantes escolhem cenários de conclusão, erro e cancelamento sobre uma tarefa fictícia. O tour simula o histórico de duas contas e exibe um texto fixo ilustrativo; não executa API, não recebe mídia, não produz DOCX, não persiste estado e **não é evidência de transcrição automática**.

## Testes antigos versus novos

Os [seis testes antigos](../../tests/test_release.py) só validam metadados de release. Os nove novos representam **maior cobertura do backend**, mas **não** autorizam dizer que o Whisper foi homologado. Essa distinção é central em entrevistas.

[Auditoria](AUDITORIA.md) · [Roteiro](ROTEIRO_DEMO.md) · [Plano](PLANO_DE_MELHORIAS.md).
