🎙️ Transcrição em Texto

Aplicação web local desenvolvida em Python para transcrição automática de arquivos de áudio e vídeo utilizando o modelo Whisper.

O projeto possui interface web, fila de processamento, cancelamento imediato, tratamento de erros, geração automática de documentos Microsoft Word e, a partir da versão v1.1.0, distribuição para Windows por meio de executável e instalador.

Versão atual: v1.1.0

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

🆕 Novidades da v1.1.0

A versão v1.1.0 adiciona a distribuição desktop para Windows.

Principais mudanças:

suporte ao empacotamento com PyInstaller;

instalador criado com Inno Setup;

FFmpeg incorporado ao aplicativo;

cache dedicado para o modelo Whisper no Windows;

pasta de dados separada da pasta de instalação;

runtime hook específico para inicialização do PyTorch no Windows;

uso de torch 2.8.0+cpu na distribuição Windows;

limitação de OpenMP/MKL a uma thread para estabilidade do worker;

abertura automática do navegador em http://localhost:5000;

manutenção do servidor restrito ao loopback local;

suporte ao cancelamento imediato também no executável instalado.

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

Durante o desenvolvimento da distribuição Windows, foram identificadas duas condições importantes para manter o Whisper estável dentro do executável.

A distribuição v1.1.0 foi validada com:

torch 2.8.0+cpu
OMP_NUM_THREADS=1
MKL_NUM_THREADS=1

Além disso, o arquivo:

rthook_torch_windows.py

é utilizado como runtime hook do PyInstaller para preparar a pasta de bibliotecas do PyTorch e carregar c10.dll antes da inicialização do Torch no executável.

Essa configuração faz parte do build Windows da aplicação.

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

Versionamento

Git

GitHub

📦 Ambiente validado para a v1.1.0

A distribuição Windows da v1.1.0 foi validada com:

Python 3.13
Flask 3.1.0
openai-whisper 20250625
torch 2.8.0+cpu
python-docx 1.1.2
PyInstaller 6.22.3
pyinstaller-hooks-contrib 2026.7
Inno Setup 7.1.0

O build Windows utiliza especificamente torch 2.8.0+cpu.

📁 Estrutura do projeto

transcricao-audio-web/
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

A distribuição Windows deve ser construída em um ambiente separado do ambiente de desenvolvimento principal.

Exemplo:

python -m venv .venv-exe
.\.venv-exe\Scripts\Activate.ps1
python -m pip install --upgrade pip

Instale o PyTorch CPU validado para o build:

python -m pip install torch==2.8.0+cpu --index-url https://download.pytorch.org/whl/cpu

Instale as demais dependências:

python -m pip install numpy Flask==3.1.0 openai-whisper==20250625 python-docx==1.1.2 pyinstaller pyinstaller-hooks-contrib

Confirme o PyTorch:

python -c "import torch; print('Torch:', torch.__version__); print('CUDA:', torch.cuda.is_available())"

Resultado esperado:

Torch: 2.8.0+cpu
CUDA: False

📦 Gerar o executável com PyInstaller

Com o ambiente .venv-exe ativo:

python -m PyInstaller --noconfirm --clean --onedir --name "Transcricao em Texto" --runtime-hook "rthook_torch_windows.py" --add-data "templates;templates" --add-data "static;static" --add-binary "C:\ffmpeg\bin\ffmpeg.exe;ffmpeg\bin" --collect-all whisper app.py

Se o FFmpeg estiver instalado em outro local, ajuste o caminho:

C:\ffmpeg\bin\ffmpeg.exe

O resultado será criado em:

dist\Transcricao em Texto\

A pasta inteira faz parte da aplicação. O .exe não deve ser distribuído sozinho quando o build é feito com --onedir.

📥 Gerar o instalador com Inno Setup

O arquivo:

installer.iss

contém a configuração do instalador.

Depois de gerar o executável com PyInstaller:

abra installer.iss no Inno Setup Compiler;

compile o script;

o instalador será criado na pasta installer-output.

O arquivo final possui o nome:

TranscricaoEmTexto-Setup.exe

A instalação padrão utiliza:

C:\Program Files\Transcrição em Texto

🔏 Política de assinatura de código

O projeto pretende utilizar assinatura de código confiável para os instaladores oficiais do Windows.

A política do projeto é:

artefatos assinados devem corresponder a uma versão pública e identificável do código-fonte;

chaves privadas de assinatura nunca devem ser armazenadas no repositório;

credenciais e segredos de assinatura não devem fazer parte do código-fonte;

o processo de assinatura deve ocorrer somente para builds oficiais;

alterações no código exigem um novo build antes de uma nova assinatura;

builds de desenvolvimento não devem ser apresentados como releases oficiais assinados.

Status atual

O instalador da v1.1.0 encontra-se em processo de preparação para assinatura digital.

Enquanto o instalador não possuir uma assinatura confiável, recursos de segurança do Windows, como o Smart App Control, podem bloquear sua execução em alguns computadores.

Não é recomendado desativar mecanismos de segurança do Windows apenas para executar uma versão não assinada.

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

🗺️ Roadmap

Possíveis evoluções futuras:

assinatura digital dos instaladores oficiais;

automação do build e release do Windows;

seleção do modelo Whisper pela interface;

contexto personalizado pelo usuário;

exportação em PDF;

histórico de transcrições;

processamento utilizando GPU;

pacote portátil alternativo ao instalador;

atualização automática;

versão pública hospedada da aplicação.

🏷️ Versões

v1.1.0

Distribuição para Windows.

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

preparação para assinatura digital.

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

👨‍💻 Autor

Leandro Augusto Ferreira

Projeto desenvolvido para estudo, prática de desenvolvimento Python e composição de portfólio profissional.

🔗 Links

GitHub

Repositório Transcrição em Texto

Portfólio

Portfólio — Leandro Augusto Ferreira