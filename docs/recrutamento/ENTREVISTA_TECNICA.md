# VoxTexto — 15 perguntas de entrevista técnica (Python)

Baseado no código real de [app.py](../../app.py) e nos testes, sem inventar experiência profissional ou benchmarks. O autor deve ser capaz de mostrar linhas/funções, justificar decisões e explicar quais partes elaborou com ajuda de ferramentas.

## 1. Qual problema o VoxTexto resolve?
Organiza a transcrição local de mídia em texto, com histórico e documento Word, permitindo acompanhar erros/cancelamentos. Não foi medida economia de tempo de clientes. **Estudar:** requisitos de processamento de mídia e produto local.

## 2. Que stack foi utilizada?
Python/Flask, HTML/CSS/JavaScript (sem React), SQLite, Whisper `small`/PyTorch, FFmpeg e python-docx. Empacotamento PyInstaller e Inno Setup. [README](../../README.md).

## 3. Por que o Whisper roda em outro processo?
Inferência pode bloquear e consumir recursos; `multiprocessing.spawn` com filas isola o processamento do servidor Flask, permitindo controlar falhas e reinício. [worker_whisper](../../app.py). **Estudar:** multiprocessing vs threads, serialização IPC.

## 4. Como o servidor conversa com o worker?
Filas de comandos/resultados enviam tarefa e resposta. O wrapper detecta término inesperado, cancelamento e erros; não se resume a uma chamada HTTP externa. [app.py](../../app.py). **Estudar:** timeouts e estados concorrentes.

## 5. Como funciona o cancelamento?
O `/cancelar` confere a conta proprietária da tarefa ativa sob lock, sinaliza evento e reinicia worker quando autorizado. O teste verifica esse controle com evento de teste, não com inferência real. [test_recruiting_flows.py](../../tests/test_recruiting_flows.py).

## 6. Como controla o processamento simultâneo?
Há `processamento_lock` global ao entrar em `/transcrever`, simplificando consistência no aplicativo local e limitando paralelismo. **Estudar:** fila de jobs durável, throughput e escalabilidade.

## 7. Como evita acesso a transcrições de outra conta?
`/historico` consulta por `usuario_id`, e `/download` verifica propriedade e status concluído. Testes usam dois usuários para provar negação. [app.py](../../app.py).

## 8. Como o upload é validado?
Normaliza o nome recebido e aceita extensão de lista (`mp3, mp4, wav, m4a, ogg`); verifica se arquivo foi salvo e não está vazio. Não há confirmação de tipo real ou limite explícito `MAX_CONTENT_LENGTH` no código auditado. **Estudar:** magic bytes, limites e quotas.

## 9. Como trata falhas durante transcrição?
Registra `erro` e mensagem amigável no SQLite, responde JSON, e tenta remover o upload temporário num `finally`. O teste cobre resposta falsa de falha; não é uma falha de PyTorch executada. [app.py](../../app.py).

## 10. Como transforma a transcrição em Word?
Limpa texto, aplica substituições delimitadas e organiza frases em parágrafos. `python-docx` gera DOCX formatado. O teste abre o DOCX produzido com conteúdo sintético para verificar saída real. [test_recruiting_flows.py](../../tests/test_recruiting_flows.py).

## 11. Por que usar SQLite?
Baixo custo operacional e persistência local por usuário; a aplicação não precisa de banco hospedado. **Estudar:** WAL, concorrência, locking, backup, retenção.

## 12. O login é suficiente para publicar publicamente?
Não. A sessão usa cookie, mas a revisão identificou ausência de `MAX_CONTENT_LENGTH`/CSRF demonstrado, cookie Secure ausente e `debug=not MODO_EXECUTAVEL`. O servidor é local em loopback, **não** endurecido para internet. [AUDITORIA.md](AUDITORIA.md).

## 13. O CI executou Whisper de verdade?
**Não.** Novos testes substituem a função de transcrição por uma resposta sintética; executam Flask, SQLite, tratamentos e Word reais. São 15 testes aprovados no [Actions #42535099487](https://github.com/LeandroAugFerreira/transcricao-audio-web/actions/runs/42535099487). **Estudar:** mocks versus testes de integração e ensaios de ML.

## 14. O que precisa para medir a precisão?
Áudios com consentimento e transcrições-referência licenciadas/originais, metodologia de normalização, WER/CER, casos de ruído, sotaque e duração, além de hardware/modelo/versão registrados. Não inventar números.

## 15. Qual seria o próximo refactor de alto valor?
Separar módulos de autenticação, processamento, domínio de histórico e documento, mantendo regressão; impor limites de arquivo, CSRF, política de retenção e teste real com áudio sintético. **Estudar:** extração por interface, coesão/acoplamento, observabilidade.

---

## Treino técnico

Desenhar `upload → Flask → SQLite → processo Whisper → limpeza → DOCX → histórico`. Explicar diferença entre teste com mock e reconhecimento real, e como autorização impede cancelar/download de outra conta. Mostrar o CI no mesmo commit e discutir custos de memória, CPU, privacidade e a necessidade de não publicar servidor local como SaaS.

**Evitar afirmações não comprovadas:** percentual de acerto, economia de horas, transcrições de clientes, velocidade, GPU validada, cancelamento real de inferência nesta revisão, build Windows novo.
