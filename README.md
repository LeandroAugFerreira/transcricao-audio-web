# 🎙️ Transcrição em Texto

Aplicação web desenvolvida em Python para transcrição automática de arquivos de áudio e vídeo utilizando o modelo **Whisper**.

O projeto possui interface web, fila de processamento, cancelamento imediato, tratamento de erros e geração automática das transcrições em documentos Microsoft Word.

> Versão atual: **v1.0.0**

---

## 📌 Sobre o projeto

O **Transcrição em Texto** foi desenvolvido com o objetivo de transformar arquivos de áudio e vídeo em documentos de texto de forma simples, organizada e automatizada.

A aplicação utiliza o **OpenAI Whisper** para reconhecimento de fala e um backend desenvolvido com **Flask**.

O processamento ocorre localmente no computador, permitindo que os arquivos sejam transcritos sem depender de serviços externos de transcrição.

---

## ✨ Principais funcionalidades

- Upload de arquivos individuais
- Upload de pasta completa
- Drag and drop
- Suporte a múltiplos arquivos
- Fila de processamento
- Processamento sequencial
- Adição de novos arquivos durante a execução
- Controle de pausa entre arquivos
- Cancelamento imediato da transcrição
- Reinicialização automática do worker após cancelamento
- Cronômetro individual por arquivo
- Cronômetro total da fila
- Barra de progresso
- Identificação visual dos estados da transcrição
- Visualização do texto diretamente na interface
- Tratamento de erros sem interromper toda a fila
- Possibilidade de tentar novamente arquivos com erro
- Prevenção de arquivos duplicados
- Limpeza automática dos uploads temporários
- Recuperação de uploads temporários abandonados
- Geração automática de documentos Word
- Proteção contra sobrescrita de documentos existentes
- Nova sessão de transcrição sem necessidade de atualizar a página

---

## 🎧 Formatos suportados

A aplicação aceita atualmente:

```text
MP3
MP4
WAV
M4A
```

---

## 📄 Arquivos gerados

As transcrições são exportadas no formato:

```text
.docx
```

Os documentos possuem formatação automática com:

- título;
- identificação do arquivo original;
- modelo utilizado;
- data e horário da geração;
- cabeçalho;
- rodapé;
- numeração de páginas;
- texto justificado;
- separação automática em parágrafos.

Caso já exista um documento com o mesmo nome, a aplicação evita a sobrescrita.

Exemplo:

```text
Aula 1.docx
Aula 1 (2).docx
Aula 1 (3).docx
```

---

## 🧠 Modelo de transcrição

A versão atual utiliza:

```text
Whisper small
```

Configuração principal:

```python
language="pt"
task="transcribe"
temperature=0
condition_on_previous_text=True
fp16=False
```

Foi escolhido o modelo `small` por apresentar um bom equilíbrio entre qualidade da transcrição em português e desempenho em processamento local.

---

## 🏗️ Arquitetura

Fluxo simplificado da aplicação:

```text
Usuário
   │
   ▼
HTML / CSS / JavaScript
   │
   ▼
Flask
   │
   ▼
Fila de processamento
   │
   ▼
Worker Whisper
   │
   ▼
Tratamento do texto
   │
   ▼
python-docx
   │
   ▼
Documento Word
```

---

## ⚙️ Worker separado

Uma das principais características técnicas do projeto é a utilização de um **processo separado para executar o Whisper**.

```text
Flask
  │
  ├── Interface / requisições
  │
  └── Worker Whisper
          │
          └── FFmpeg
```

Essa arquitetura permite que o servidor Flask continue respondendo enquanto uma transcrição está sendo executada.

Também permite implementar o **cancelamento imediato** de uma transcrição.

Quando o usuário cancela:

1. o backend sinaliza o cancelamento;
2. o processo responsável pelo Whisper é encerrado;
3. possíveis subprocessos do FFmpeg também são encerrados;
4. um novo worker é criado;
5. o modelo Whisper é novamente preparado;
6. a aplicação fica pronta para uma nova transcrição.

---

## 🛡️ Tratamento de erros

A aplicação possui tratamento para diferentes situações, incluindo:

- arquivo inválido;
- arquivo vazio;
- formato incompatível;
- falha de leitura pelo FFmpeg;
- falhas internas do Whisper;
- encerramento inesperado do worker;
- erro de comunicação entre frontend e backend;
- cancelamento durante o processamento.

Um erro em determinado arquivo não precisa interromper toda a fila.

A interface identifica o arquivo com:

```text
✕ Erro
```

e permite visualizar uma mensagem explicativa.

---

## 🧹 Gerenciamento de arquivos temporários

Os arquivos enviados são utilizados apenas durante o processamento.

Após:

```text
conclusão
erro
cancelamento
```

o upload temporário é automaticamente removido.

Além disso, quando a aplicação é iniciada, arquivos temporários deixados por uma interrupção inesperada são identificados e removidos.

Os documentos Word gerados permanecem armazenados normalmente.

---

## 🛠️ Tecnologias utilizadas

### Backend

- Python
- Flask
- OpenAI Whisper
- PyTorch
- python-docx
- multiprocessing
- threading

### Frontend

- HTML5
- CSS3
- JavaScript

### Processamento multimídia

- FFmpeg

### Versionamento

- Git
- GitHub

---

## 📦 Versões utilizadas na v1.0.0

```text
Python 3.13
Flask 3.1.0
openai-whisper 20250625
torch 2.11.0
python-docx 1.1.2
```

---

## 📁 Estrutura do projeto

```text
transcricao-audio-web/
│
├── static/
│   ├── css/
│   │   └── style.css
│   │
│   └── js/
│       └── script.js
│
├── templates/
│   └── index.html
│
├── uploads/
│
├── transcricoes/
│
├── app.py
├── .gitignore
├── requirements.txt
└── README.md
```

As pastas `uploads` e `transcricoes` são utilizadas durante a execução e não possuem seus arquivos gerados versionados no Git.

---

## 🚀 Como executar

### 1. Clonar o repositório

```bash
git clone https://github.com/LeandroAugFerreira/transcricao-audio-web.git
```

Entre na pasta:

```bash
cd transcricao-audio-web
```

---

### 2. Criar um ambiente virtual

Windows:

```powershell
python -m venv .venv
```

Ative o ambiente:

```powershell
.venv\Scripts\Activate.ps1
```

---

### 3. Instalar as dependências

```powershell
python -m pip install -r requirements.txt
```

---

### 4. Instalar o FFmpeg

O **FFmpeg é obrigatório** para que o Whisper consiga processar os arquivos de áudio e vídeo.

Depois da instalação, confirme no terminal:

```powershell
ffmpeg -version
```

Se o comando apresentar as informações da versão instalada, o FFmpeg está disponível no PATH do sistema.

---

### 5. Executar a aplicação

```powershell
python app.py
```

Após a inicialização, acesse:

```text
http://127.0.0.1:5000
```

---

## 🖥️ Utilização

1. Abra a aplicação no navegador.
2. Escolha arquivos individuais, uma pasta ou utilize drag and drop.
3. Confira os arquivos adicionados à fila.
4. Clique em **Iniciar Transcrição**.
5. Acompanhe o andamento pelo painel de progresso.
6. Quando o processamento terminar, utilize **Visualizar** para consultar o texto.
7. Clique em **Baixar Word** para obter o documento.
8. Utilize **Nova Transcrição** para iniciar uma nova sessão.

---

## 🔄 Estados da fila

Cada arquivo pode apresentar um dos seguintes estados:

```text
Aguardando
Transcrevendo...
✓ Concluído
✕ Erro
Cancelando...
Cancelado
```

---

## ⏸️ Pausa

A pausa foi projetada para ocorrer **entre arquivos**.

Quando a pausa é solicitada durante uma transcrição:

```text
arquivo atual → termina normalmente
próximo arquivo → aguarda
```

Isso evita interromper o Whisper no meio de uma operação válida.

---

## ❌ Cancelamento

Diferentemente da pausa, o cancelamento interrompe o processamento atual.

O worker do Whisper é encerrado e outro processo é preparado para permitir novas transcrições.

---

## 🔐 Privacidade

Na configuração atual, a aplicação é executada localmente.

Os arquivos utilizados para transcrição são processados no próprio computador e removidos da pasta temporária após o processamento.

---

## ⚠️ Observações

O tempo necessário para realizar uma transcrição depende principalmente de:

- duração do arquivo;
- desempenho do processador;
- modelo Whisper utilizado;
- quantidade de arquivos;
- características do áudio.

A primeira inicialização pode levar mais tempo porque o modelo Whisper precisa ser carregado.

A versão atual possui um contexto inicial voltado principalmente para conteúdos acadêmicos e termos relacionados a tecnologia e análise de dados.

---

## 🗺️ Roadmap

Possíveis evoluções futuras:

- seleção do modelo Whisper pela interface;
- contexto personalizado pelo usuário;
- exportação em PDF;
- exportação em TXT;
- download em ZIP;
- histórico de transcrições;
- processamento utilizando GPU;
- implantação do backend em servidor;
- versão pública da aplicação.

---

## 🏷️ Versão

### v1.0.0

Primeira versão estável do projeto.

Principais recursos:

- aplicação Flask;
- interface web responsiva;
- processamento com Whisper;
- fila dinâmica;
- worker separado;
- cancelamento imediato;
- tratamento de erros;
- limpeza automática de uploads;
- geração de documentos Word;
- proteção contra sobrescrita;
- gerenciamento de sessões.

---

## 👨‍💻 Autor

**Leandro Augusto Ferreira**

Projeto desenvolvido para estudo, prática de desenvolvimento Python e composição de portfólio profissional.

---

## 🔗 Links

**GitHub**

```text
https://github.com/LeandroAugFerreira/transcricao-audio-web
```

**Portfólio**

```text
https://leandroaugferreira.github.io/
```