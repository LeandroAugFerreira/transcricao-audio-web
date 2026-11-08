# VoxTexto — roteiro de apresentação técnica de 3 minutos

**O tour público é visualização estática, sem áudio nem processamento verdadeiro.** Aplicativo real e testes são separados.

## 00:00–00:25 — Problema

Abra [página do VoxTexto](https://leandroaugferreira.github.io/python.html).

Fala: “O VoxTexto converte gravações em texto editável via Whisper local, mas meu foco de engenharia é controlar tarefas, falhas e histórico com permissões por usuário. Não é uma plataforma SaaS.”

## 00:25–01:00 — Arquitetura

Abra [diagrama](ARQUITETURA.md) e destaque Flask, SQLite, worker separado, Whisper/FFmpeg, processamento e python-docx.

Fala: “Separar o processo pesado da requisição HTTP evita misturar a interface com a carga da inferência. O resultado é tratado e exportado para Word.”

## 01:00–01:35 — Caminho feliz

Abra [tour estático](https://leandroaugferreira.github.io/voxtexto-demo.html). Selecione “Transcrição concluída”, clique Adicionar exemplo → Simular worker → Finalizar.

Fala: “Essa tela só ilustra o estado. O teste de integração de verdade envia bytes fictícios à rota Flask, mocka a resposta do Whisper e verifica SQLite, DOCX, download e limpeza do upload.”

## 01:35–02:05 — Falhas e cancelamento

No tour, escolha “Falha do worker” ou “Cancelamento autorizado”. Crie outra tarefa e mostre estado final. Altere a conta de demonstração durante uma tarefa ativa.

Fala: “Os estados são gravados no histórico; outra pessoa não deveria cancelar tarefa ou baixar arquivo de quem criou. O teste cobre essa autorização, embora não encerre o PyTorch real.”

## 02:05–02:35 — Testes e evidência

Abra [test_recruiting_flows.py](../../tests/test_recruiting_flows.py) e o [CI](https://github.com/LeandroAugFerreira/transcricao-audio-web/actions/runs/42535099487).

Fala: “Nesta revisão foram 15 testes aprovados. Nove deles são novos: Flask, histórico, isolamento entre usuários e Word reais, mas reconhecimento de fala é simulado.”

## 02:35–03:00 — Limites e evolução

Fala: “Não medi precisão, WER, velocidade ou GPU. Antes de hospedar, revisaria tamanho máximo de arquivo, CSRF, sessão segura e retenção. Para próxima etapa, usaria um áudio original de teste para avaliar o modelo de fato.”

## Perguntas frequentes

- *“Posso enviar um áudio aqui?”* Não. O tour do GitHub Pages não recebe mídias; somente app local.
- *“O Whisper acertou quantos por cento?”* Sem medição auditável; não inventar.
- *“O Word foi testado de verdade?”* Sim, com texto sintético fornecido por mock, e não inferido de áudio.
- *“O instalador foi reconstruído?”* Não nesta revisão; o fluxo Windows histórico permanece separado.
- *“Por que não disponibilizar login web real?”* O backend local ainda precisa de controles de segurança/privacidade antes de ficar público.

[15 perguntas](ENTREVISTA_TECNICA.md) · [Evidências](EVIDENCIAS.md).
