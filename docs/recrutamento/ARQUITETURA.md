# VoxTexto — arquitetura baseada no app.py

**Escopo:** aplicação local Python/Flask V2.0, sem API externa de transcrição. O diagrama representa o código, não uma infraestrutura publicada.

~~~mermaid
flowchart LR
  U[Usuário local autenticado] --> UI[HTML/CSS/JavaScript]
  UI --> FLASK[Flask: upload, status, histórico, cancelamento]
  FLASK --> AUTH[Cookie de sessão / autenticação local]
  FLASK --> SAVE[Arquivo temporário / extensões aceitas]
  FLASK --> DB[(SQLite: usuários e histórico)]
  SAVE --> EXEC[executar_transcricao_worker]
  EXEC --> CQ[Fila de comandos multiprocessing]
  CQ --> W[Worker separado spawn]
  W --> WH[Whisper small / PyTorch + FFmpeg]
  W --> RQ[Fila de resultados]
  RQ --> EXEC
  EXEC --> CLEAN[Normalização e parágrafos]
  CLEAN --> DOC[python-docx: arquivo Word]
  DOC --> DB
  FLASK --> CLEAR[Limpeza de upload no finally]
  FLASK --> DLOAD[Download com escopo por usuário]
  DLOAD --> DOC
~~~

## Fluxo de sucesso

~~~mermaid
sequenceDiagram
  autonumber
  actor U as Usuário logado
  participant API as Flask /transcrever
  participant DB as SQLite
  participant W as Worker Whisper
  participant DOC as python-docx
  U->>API: POST multipart com áudio/vídeo
  API->>API: Normaliza nome e valida extensão
  API->>DB: Cria histórico "transcrevendo"
  API->>W: Envia tarefa via fila
  W-->>API: Retorna resultado ou falha
  alt Texto reconhecido
    API->>API: Normaliza texto/parágrafos
    API->>DOC: Gera .docx
    API->>DB: Atualiza "concluido" e nome do Word
    API-->>U: JSON com resultado
  else Falha/cancelamento
    API->>DB: Atualiza "erro" / "cancelado"
    API-->>U: JSON com explicação
  end
  API->>API: Remove upload temporário
~~~

## Cancelamento de tarefa ativa

~~~mermaid
sequenceDiagram
  actor O as Proprietário da tarefa
  actor T as Outra conta
  participant API as Flask /cancelar
  participant LOCK as Lock e estado ativo
  participant W as Worker
  T->>API: Solicita cancelamento
  API->>LOCK: Confere usuario_id
  API-->>T: HTTP 403
  O->>API: Solicita cancelamento
  API->>LOCK: Confere propriedade e sinaliza evento
  API->>W: Reinicia processo
  API-->>O: Cancelamento sinalizado
~~~

A verificação de propriedade ocorre sob `estado_lock`. O CI atual testa o controle usando evento/mocks, **não** o reinício de PyTorch em trabalho real.

## Responsabilidades localizadas

| Componente | Código |
| --- | --- |
| Configuração Flask e sessão | [app.py](../../app.py) |
| Usuários, histórico e consultas SQLite | [app.py](../../app.py) |
| Upload, validação, limpeza | [app.py](../../app.py) |
| Worker e filas | [app.py](../../app.py) |
| Normalização e Word | [app.py](../../app.py) |
| Login e painel | [templates](../../templates), [static](../../static) |
| Build Windows PyInstaller/Inno Setup | [windows-build.yml](../../.github/workflows/windows-build.yml), [installer.iss](../../installer.iss) |
| Testes leves | [test_recruiting_flows.py](../../tests/test_recruiting_flows.py), [recruiting-tests.yml](../../.github/workflows/recruiting-tests.yml) |

## Limites e riscos

O código original concentra subsistemas em um único arquivo, o lock de processamento é global e ainda não há benchmark de filas concorrentes. Sem limite de upload/CSRF/segurança pública homologados, **não** publicar o Flask como serviço na internet. O tour estático do portfólio não executa o sistema.

[Auditoria](AUDITORIA.md) · [Estudo de caso](ESTUDO_DE_CASO.md).
