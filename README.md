🎙️ Transcrição em Texto

Aplicação web local desenvolvida em Python para transcrição automática de arquivos de áudio e vídeo utilizando o modelo Whisper.

O projeto possui interface web, fila de processamento, cancelamento imediato, tratamento de erros, geração automática de documentos Microsoft Word e distribuição para Windows por meio de executável e instalador.

Versão atual: v1.1.1

🖥️ Demonstração

Interface principal

Seleção de múltiplos arquivos para criação da fila de processamento.



Processamento

Acompanhamento da fila em tempo real, com progresso, arquivo atual, cronômetros e estados individuais.



Resultado da transcrição

Após a conclusão, o texto pode ser visualizado diretamente na aplicação e exportado para Microsoft Word.



📌 Sobre o projeto

O Transcrição em Texto foi desenvolvido com o objetivo de transformar arquivos de áudio e vídeo em documentos de texto de forma simples, organizada e automatizada.

A aplicação utiliza o Whisper para reconhecimento de fala e um backend desenvolvido com Flask.

O processamento da transcrição ocorre localmente no computador do usuário. Os arquivos de áudio e vídeo não são enviados para uma API externa de transcrição.

Na versão para Windows, o programa é distribuído com as dependências necessárias para execução, incluindo o FFmpeg. O usuário final não precisa instalar Python, Git, VS Code ou FFmpeg separadamente.

✨ Principais funcionalidades

Upload de arquivos individuais

Upload de pasta completa

Drag and drop

Suporte a múltiplos arquivos

Fila de processamento

Processamento sequencial

Adição de novos arquivos durante a execução

Controle de pausa entre arquivos

Cancelamento imediato da transcrição

Reinicialização automática do worker após cancelamento

Cronômetro individual por arquivo

Cronômetro total da fila

Barra de progresso

Identificação visual dos estados da transcrição

Visualização do texto diretamente na interface

Tratamento de erros sem interromper toda a fila

Possibilidade de tentar novamente arquivos com erro

Prevenção de arquivos duplicados

Limpeza automática dos uploads temporários

Recuperação de uploads temporários abandonados

Geração automática de documentos Word

Proteção contra sobrescrita de documentos existentes

Nova sessão de transcrição sem necessidade de atualizar a página

Execução local em http://localhost:5000

Executável para Windows

Instalador para Windows com atalho no Menu Iniciar e opção de atalho na Área de Trabalho

FFmpeg integrado à distribuição Windows

🆕 Novidades da v1.1.1

A versão v1.1.1 corrige e fortalece o processo automatizado de build para Windows.

Principais mudanças:

correção do empacotamento do FFmpeg no GitHub Actions;

remoção do uso do shim do Chocolatey;

download direto do build estático do FFmpeg 8.1.2;

validação do SHA-256 do pacote do FFmpeg;

validação do tamanho e execução do ffmpeg.exe antes do empacotamento;

validação do FFmpeg já incorporado ao diretório final do PyInstaller;

build reproduzível do instalador utilizando GitHub Actions;

geração do instalador como artifact do GitHub Actions;

preparação da cadeia de build para futura assinatura digital via SignPath Foundation.

🎧 Formatos suportados

A aplicação aceita atualmente:

MP3
MP4
WAV
M4A

📄 Arquivos gerados

As transcrições são exportadas no formato:

.docx

Os documentos possuem formatação automática com:

título;

identificação do arquivo original;

modelo utilizado;

data e horário da geração;

cabeçalho;

rodapé;

numeração de páginas;

texto justificado;

separação automática em parágrafos.

Caso já exista um documento com o mesmo nome, a aplicação evita a sobrescrita.

Exemplo:

Aula 1.docx
Aula 1 (2).docx
Aula 1 (3).docx

🧠 Modelo de transcrição

A versão atual utiliza:

Whisper small

Configuração principal:

language="pt"
task="transcribe"
temperature=0
condition_on_previous_text=True
fp16=False

Foi escolhido o modelo small por apresentar um bom equilíbrio entre qualidade da transcrição em português e desempenho em processamento local.

A aplicação também possui um modo de compatibilidade para um erro específico de tensor vazio. Nesse cenário, uma nova tentativa é realizada com:

condition_on_previous_text=False

🏗️ Arquitetura

Fluxo simplificado da aplicação:

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
FFmpeg + PyTorch
   │
   ▼
Tratamento do texto
   │
   ▼
python-docx
   │
   ▼
Documento Word

⚙️ Worker separado

Uma das principais características técnicas do projeto é a utilização de um processo separado para executar o Whisper.

Flask
  │
  ├── Interface / requisições
  │
  └── Worker Whisper
          │
          └── FFmpeg

Essa arquitetura permite que o servidor Flask continue respondendo enquanto uma transcrição está sendo executada.

Também permite implementar o cancelamento imediato de uma transcrição.

Quando o usuário cancela:

o backend sinaliza o cancelamento;

o processo responsável pelo Whisper é encerrado;

possíveis subprocessos associados são encerrados;

um novo worker é criado;

o modelo Whisper é novamente preparado;

a aplicação fica pronta para uma nova transcrição.

🛡️ Estabilidade do PyTorch no Windows

Durante o desenvolvimento da distribuição Windows, foram identificadas condições importantes para manter o Whisper estável dentro do executável.

A distribuição atual foi validada com:

torch 2.8.0+cpu
OMP_NUM_THREADS=1
MKL_NUM_THREADS=1

Além disso, o arquivo:

rthook_torch_windows.py

é utilizado como runtime hook do PyInstaller para preparar a pasta de bibliotecas do PyTorch e carregar c10.dll antes da inicialização do Torch no executável.

Essa configuração faz parte do build Windows da aplicação.

🎞️ FFmpeg no build Windows

A versão v1.1.1 utiliza um build estático do FFmpeg para Windows.

O workflow automatizado:

baixa o pacote do FFmpeg;

valida o SHA-256 esperado;

extrai o pacote;

localiza o ffmpeg.exe real;

valida o tamanho do executável;

executa ffmpeg -version;

incorpora o binário ao build do PyInstaller;

executa novamente o FFmpeg já empacotado.

Essa validação evita a distribuição acidental de shims ou redirecionadores que dependam de instalações externas.

🛡️ Tratamento de erros

A aplicação possui tratamento para diferentes situações, incluindo:

arquivo inválido;

arquivo vazio;

formato incompatível;

falha de leitura pelo FFmpeg;

falhas internas do Whisper;

encerramento inesperado do worker;

erro de comunicação entre frontend e backend;

cancelamento durante o processamento.

Um erro em determinado arquivo não precisa interromper toda a fila.

A interface identifica o arquivo com:

✕ Erro

e apresenta uma mensagem explicativa.

🧹 Gerenciamento de arquivos temporários

Os arquivos enviados são utilizados apenas durante o processamento.

Após:

conclusão
erro
cancelamento

o upload temporário é automaticamente removido.

Além disso, quando a aplicação é iniciada, arquivos temporários deixados por uma interrupção inesperada são identificados e removidos.

Os documentos Word gerados permanecem armazenados normalmente.

💾 Armazenamento no Windows

No executável instalado, o aplicativo não grava os arquivos de trabalho dentro de Program Files.

Os dados do usuário ficam em:

C:\Users\<usuario>\Documents\Transcrição em Texto\

As transcrições ficam em:

C:\Users\<usuario>\Documents\Transcrição em Texto\transcricoes

Os uploads temporários utilizam:

C:\Users\<usuario>\Documents\Transcrição em Texto\uploads

O cache do modelo Whisper fica em:

%LOCALAPPDATA%\TranscricaoEmTexto\modelos

Na primeira execução em um computador novo, o modelo small pode precisar ser baixado. Depois de armazenado no cache local, ele pode ser reutilizado nas execuções seguintes.

🔐 Privacidade

A aplicação foi projetada para realizar a transcrição localmente.

O servidor Flask é iniciado apenas no endereço de loopback:

127.0.0.1

e a interface é acessada pelo navegador em:

http://localhost:5000

Isso significa que o servidor da aplicação não é publicado diretamente na rede local.

Os arquivos enviados para transcrição são processados no próprio computador e removidos da pasta temporária ao final do processamento.

O aplicativo não envia os arquivos de áudio, vídeo ou as transcrições para uma API externa de reconhecimento de fala.

Uma conexão com a internet pode ser necessária na primeira execução para baixar o modelo Whisper caso ele ainda não esteja disponível no cache local.

🛠️ Tecnologias utilizadas

Backend

Python

Flask

OpenAI Whisper

PyTorch

python-docx

multiprocessing

threading

Frontend

HTML5

CSS3

JavaScript

Processamento multimídia

FFmpeg

Distribuição Windows

PyInstaller

Inno Setup

runtime hook personalizado para PyTorch

Automação de build

GitHub Actions

Versionamento

Git

GitHub

📦 Ambiente validado para a v1.1.1

A distribuição Windows da v1.1.1 utiliza:

Python 3.13
Flask 3.1.0
openai-whisper 20250625
torch 2.8.0+cpu
python-docx 1.1.2
PyInstaller 6.22.3
pyinstaller-hooks-contrib 2026.7
FFmpeg 8.1.2 Essentials
Inno Setup 7.1.0

O build Windows utiliza especificamente torch 2.8.0+cpu.

📁 Estrutura do projeto

transcricao-audio-web/
│
├── .github/
│   └── workflows/
│       └── windows-build.yml
│
├── docs/
│   └── images/
│       ├── interface-principal.png
│       ├── processamento.png
│       └── resultado.png
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
├── transcricoes/
│
├── app.py
├── installer.iss
├── rthook_torch_windows.py
├── .gitignore
├── LICENSE
├── requirements.txt
├── requirements-windows-exe.txt
└── README.md

As pastas e arquivos gerados durante build e execução, como .venv-exe, build, dist, installer-output, arquivos .spec, uploads temporários, transcrições e mídias de teste não são versionados.

🚀 Como executar pelo código-fonte

1. Clonar o repositório

git clone https://github.com/LeandroAugFerreira/transcricao-audio-web.git

Entre na pasta:

cd transcricao-audio-web

2. Criar um ambiente virtual

No Windows:

python -m venv .venv

Ative o ambiente:

.\.venv\Scripts\Activate.ps1

3. Instalar as dependências

Para execução pelo código-fonte:

python -m pip install -r requirements.txt

4. Instalar o FFmpeg

O FFmpeg é obrigatório para que o Whisper consiga processar os arquivos de áudio e vídeo quando a aplicação é executada diretamente pelo Python.

Depois da instalação, confirme no terminal:

ffmpeg -version

Se o comando apresentar as informações da versão instalada, o FFmpeg está disponível no PATH do sistema.

Na versão instalada para Windows, o FFmpeg é incluído junto com o aplicativo.

5. Executar a aplicação

python app.py

Após a inicialização, acesse no navegador:

http://localhost:5000

🪟 Build do executável para Windows

A distribuição Windows pode ser construída automaticamente pelo GitHub Actions por meio do workflow:

.github/workflows/windows-build.yml

O workflow é executado:

manualmente por workflow_dispatch;

automaticamente quando uma tag v* é enviada ao GitHub.

Também é possível reproduzir o ambiente localmente.

Exemplo:

python -m venv .venv-exe
.\.venv-exe\Scripts\Activate.ps1
python -m pip install --upgrade pip

Instale as dependências do build:

python -m pip install -r requirements-windows-exe.txt

Confirme o PyTorch:

python -c "import torch; print('Torch:', torch.__version__); print('CUDA:', torch.cuda.is_available())"

Resultado esperado:

Torch: 2.8.0+cpu
CUDA: False

📦 Gerar o executável com PyInstaller

Exemplo do comando utilizado no build Windows:

python -m PyInstaller --noconfirm --clean --onedir --name "Transcricao em Texto" --runtime-hook "rthook_torch_windows.py" --add-data "templates;templates" --add-data "static;static" --add-binary "<CAMINHO_FFMPEG>;ffmpeg\bin" --collect-all whisper app.py

O resultado será criado em:

dist\Transcricao em Texto\

A pasta inteira faz parte da aplicação. O .exe não deve ser distribuído sozinho quando o build é feito com --onedir.

📥 Gerar o instalador com Inno Setup

O arquivo:

installer.iss

contém a configuração do instalador.

Depois de gerar o executável com PyInstaller:

abra installer.iss no Inno Setup Compiler; ou

execute o build automatizado do GitHub Actions.

O instalador final possui o nome:

TranscricaoEmTexto-Setup.exe

A instalação padrão utiliza:

C:\Program Files\Transcrição em Texto

🤖 Build automatizado com GitHub Actions

O workflow de Windows executa uma cadeia automatizada de build e validação:

Código-fonte público
        ↓
GitHub Actions
        ↓
Python 3.13
        ↓
Dependências
        ↓
PyTorch 2.8.0+cpu
        ↓
Download e validação do FFmpeg
        ↓
PyInstaller
        ↓
Validação do FFmpeg empacotado
        ↓
Inno Setup
        ↓
Validação do instalador
        ↓
GitHub Actions artifact

O artifact não assinado é publicado com o nome:

TranscricaoEmTexto-Windows-Unsigned

🔏 Code signing policy

Free code signing provided by SignPath.io, certificate by SignPath Foundation.

Team roles

Este projeto é atualmente mantido por um único desenvolvedor.

Authors: Leandro Augusto Ferreira

Reviewers: Leandro Augusto Ferreira

Approvers: Leandro Augusto Ferreira

O responsável listado acima mantém o código-fonte, revisa as alterações incorporadas ao projeto e aprova as solicitações de assinatura das versões oficiais.

Privacy policy

This program will not transfer any information to other networked systems unless specifically requested by the user or the person installing or operating it.

A transcrição é realizada localmente no computador do usuário.

Os arquivos de áudio e vídeo utilizados durante o processamento não são enviados para serviços externos de reconhecimento de fala.

Uma conexão com a internet pode ser utilizada para baixar o modelo Whisper quando ele ainda não estiver disponível no cache local. Essa conexão é destinada à obtenção dos arquivos necessários do modelo; o conteúdo do usuário não é enviado para transcrição externa.

Signing rules

artefatos assinados devem corresponder a uma versão pública e identificável do código-fonte;

chaves privadas e credenciais de assinatura nunca devem ser armazenadas no repositório;

somente builds oficiais podem ser submetidos para assinatura;

alterações no código exigem um novo build antes de uma nova assinatura;

builds de desenvolvimento não devem ser apresentados como releases oficiais assinados;

toda solicitação oficial de assinatura deve ser aprovada pelo responsável pelo projeto;

somente artefatos produzidos a partir do código-fonte e dos scripts de build deste repositório podem ser submetidos para assinatura.

Status

A versão v1.1.1 está sendo preparada como release oficial do Windows.

O projeto está em processo de preparação para integração com o SignPath e assinatura digital das distribuições oficiais para Windows.

Enquanto um instalador não possuir uma assinatura confiável, mecanismos de segurança do Windows, como o Smart App Control, podem bloquear sua execução.

Não é recomendado desativar mecanismos de segurança do Windows para executar versões não assinadas.

🖥️ Utilização

Abra a aplicação.

Escolha arquivos individuais, uma pasta ou utilize drag and drop.

Confira os arquivos adicionados à fila.

Clique em Iniciar Transcrição.

Acompanhe o andamento pelo painel de progresso.

Quando o processamento terminar, utilize Visualizar para consultar o texto.

Clique em Baixar Word para obter o documento.

Utilize Nova Transcrição para iniciar uma nova sessão.

🔄 Estados da fila

Cada arquivo pode apresentar um dos seguintes estados:

Aguardando
Transcrevendo...
✓ Concluído
✕ Erro
Cancelando...
Cancelado

⏸️ Pausa

A pausa foi projetada para ocorrer entre arquivos.

Quando a pausa é solicitada durante uma transcrição:

arquivo atual → termina normalmente
próximo arquivo → aguarda

Isso evita interromper o Whisper no meio de uma operação válida.

❌ Cancelamento

Diferentemente da pausa, o cancelamento interrompe o processamento atual.

O worker do Whisper é encerrado e outro processo é preparado automaticamente para permitir novas transcrições.

Esse comportamento também foi validado na versão executável para Windows.

⚠️ Observações

O tempo necessário para realizar uma transcrição depende principalmente de:

duração do arquivo;

desempenho do processador;

modelo Whisper utilizado;

quantidade de arquivos;

características do áudio.

A primeira inicialização em um computador novo pode levar mais tempo porque o modelo Whisper precisa ser baixado e carregado.

A versão atual possui um contexto inicial voltado principalmente para conteúdos acadêmicos e termos relacionados a tecnologia e análise de dados.

O executável Windows utiliza processamento por CPU.

🧩 Componentes de terceiros

O projeto utiliza componentes Open Source de terceiros, incluindo Flask, OpenAI Whisper, PyTorch, python-docx, PyInstaller e FFmpeg.

Cada componente permanece sujeito aos seus respectivos termos e licenças.

🗺️ Roadmap

Possíveis evoluções futuras:

assinatura digital dos instaladores oficiais;

integração do SignPath ao workflow de build;

seleção do modelo Whisper pela interface;

contexto personalizado pelo usuário;

exportação em PDF;

histórico de transcrições;

processamento utilizando GPU;

pacote portátil alternativo ao instalador;

atualização automática;

versão pública hospedada da aplicação.

🏷️ Versões

v1.1.1

Correção e validação da cadeia de build para Windows.

Principais alterações:

correção do FFmpeg incorporado ao instalador;

substituição do shim do Chocolatey pelo binário real do FFmpeg;

FFmpeg 8.1.2 com validação SHA-256;

validação automatizada do FFmpeg antes e depois do PyInstaller;

build Windows validado pelo GitHub Actions;

geração do instalador como artifact automatizado;

preparação do build verificável para assinatura digital.

v1.1.0

Primeira distribuição para Windows.

Principais recursos adicionados:

executável Windows;

instalador com Inno Setup;

FFmpeg integrado;

PyTorch CPU configurado para distribuição;

runtime hook para inicialização do Torch;

cache dedicado para o modelo Whisper;

arquivos do usuário armazenados fora de Program Files;

abertura automática em http://localhost:5000;

cancelamento imediato validado no executável;

preparação inicial para assinatura digital.

v1.0.0

Primeira versão estável do projeto.

Principais recursos:

aplicação Flask;

interface web responsiva;

processamento com Whisper;

fila dinâmica;

worker separado;

cancelamento imediato;

tratamento de erros;

limpeza automática de uploads;

geração de documentos Word;

proteção contra sobrescrita;

gerenciamento de sessões.

📜 Licença

Este projeto é distribuído sob a licença MIT.

Consulte o arquivo:

LICENSE

para os termos completos.

Os componentes de terceiros incluídos ou utilizados pelo projeto permanecem sujeitos às suas próprias licenças.

👨‍💻 Autor

Leandro Augusto Ferreira

Projeto desenvolvido para estudo, prática de desenvolvimento Python e composição de portfólio profissional.

🔗 Links

GitHub

Repositório Transcrição em Texto

Portfólio

Portfólio — Leandro Augusto Ferreira