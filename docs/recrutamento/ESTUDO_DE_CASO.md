# VoxTexto — estudo de caso verificável para Desenvolvedor Python

**Projeto:** VoxTexto V2.0, aplicação web local de transcrição áudio/vídeo em Python/Flask. **Não é SaaS, não é React nem processamento em nuvem.**

## Problema e público

Aulas, entrevistas e reuniões podem produzir arquivos de mídia que precisam virar texto revisável e documento Word. O usuário precisa saber o que foi processado, o que falhou, a quem pertence cada resultado e se pode cancelar uma tarefa.

Público visado no software: pessoas que trabalham localmente com gravações e administradores de contas do aplicativo. **Não há clientes, redução de tempo ou precisão reais medidos** neste estudo.

## Requisitos e implementação observada

- Aceitar extensões `.mp3`, `.mp4`, `.wav`, `.m4a` e `.ogg` por formulário local.
- Normalizar nome recebido e gravar upload temporário para processamento.
- Registrar histórico `transcrevendo` em SQLite associado à conta.
- Delegar carga do Whisper `small` e processamento ao worker separado por `multiprocessing.spawn`, com filas e tratamento de cancelamento.
- Aplicar limpeza de texto e formatação em parágrafos antes de gerar DOCX.
- Marcar histórico `concluido`, `erro` ou `cancelado` e limpar uploads temporários.
- Permitir consulta/download de documento apenas ao usuário proprietário.
- Distribuir aplicativo Windows com PyInstaller e Inno Setup em fluxo de release próprio.

Referências: [app.py](../../app.py), [README](../../README.md), [workflow Windows](../../.github/workflows/windows-build.yml).

## Fluxo A — processamento concluído com worker substituído

O ensaio novo envia um arquivo WAV **sintético e não reproduzível como áudio**, usando `Flask.test_client()`. Substitui somente `executar_transcricao_worker` por uma resposta textual fixa: “Esta é uma transcrição fictícia. O serviço de teste foi concluído.”

A rota real percorre normalização, validação de extensão, escrita/remoção do upload, histórico SQLite, tratamento textual, geração de documento Word com `python-docx` e resposta JSON. O teste abre o DOCX e verifica conteúdo e permissão do download. **O Whisper e o FFmpeg não foram chamados, logo não há evidência de acurácia, linguagem reconhecida ou desempenho.**

## Fluxo B — falha ou cancelamento

O mesmo endpoint recebe, em testes separados, respostas sintéticas de falha e de cancelamento. A rota grava `erro` ou `cancelado`, não oferece DOCX inexistente e remove arquivo temporário. Outra conta não pode acessar o histórico ou baixar documento do primeiro usuário.

## Fluxo C — proteção da tarefa ativa

Um evento `threading.Event` e um ID de tarefa fictício representam uma transcrição em andamento. O teste exige HTTP 403 quando **outra conta** tenta cancelar, e confirma que apenas o proprietário sinaliza cancelamento. O reinício do worker é substituído por mock: **não foi terminada nenhuma inferência real**.

## Decisões de engenharia

| Decisão | Valor |
| --- | --- |
| Worker separado com filas | Isolar carga computacional potencialmente bloqueante |
| Processamento serializado por lock | Evitar estados concorrentes inesperados no fluxo local |
| SQLite com ID de usuário | Histórico persistente e escopo por conta |
| Estado explícito de tarefas | Diferenciar concluído, erro e cancelado |
| `finally` no upload | Reduzir resíduo de arquivos temporários |
| Geração `python-docx` | Documento editável gerado no backend |
| CI com worker mockado | Testes rápidos sem mídia privada nem download de modelos |

## Limitações e próximos passos

- O teste de integração **não roda inferência**. Precisa de fixture de áudio inteiramente original/licenciada e WER/CER medidos para documentar precisão.
- Não houve teste de duração, custo, consumo de memória, fila longa ou cancelamento de processo de verdade.
- Não foi gerado novo executável Windows nem revista a compatibilidade das duas versões de PyTorch do projeto.
- O backend usa sessão local e deve revisar CSRF, limite de upload, privacidade/retenção e debug antes de qualquer publicação.
- Arquivo único extenso reduz legibilidade. Recomenda-se refatoração incremental mantendo regressão.

## Uso em entrevista

Abrir o [tour estático do VoxTexto](https://leandroaugferreira.github.io/voxtexto-demo.html), que não recebe arquivos; [teste de integração](../../tests/test_recruiting_flows.py), [arquitetura](ARQUITETURA.md) e [CI](EVIDENCIAS.md). Explicar com precisão: a exportação DOCX e o histórico foram executados em testes, enquanto o reconhecimento de fala **não** foi repetido.

[Entrevista técnica](ENTREVISTA_TECNICA.md) · [Roteiro de 3 minutos](ROTEIRO_DEMO.md).
