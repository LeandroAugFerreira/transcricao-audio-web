; ============================================================
; INSTALADOR - TRANSCRIÇÃO EM TEXTO
; ============================================================

#define MyAppName "Transcrição em Texto"
#define MyAppVersion "1.1.1"
#define MyAppPublisher "Leandro Augusto Ferreira"
#define MyAppExeName "Transcricao em Texto.exe"

[Setup]

; Identificador único do aplicativo.
; NÃO ALTERAR depois que o programa for distribuído.
AppId={{A8F70173-C63D-4E21-B36D-44BC1288A1F5}

AppName={#MyAppName}
AppVersion={#MyAppVersion}
AppPublisher={#MyAppPublisher}

; Pasta onde o programa será instalado
DefaultDirName={autopf}\Transcrição em Texto

; Nome que aparecerá no Menu Iniciar
DefaultGroupName={#MyAppName}

; Permite desinstalação pelo Windows
UninstallDisplayName={#MyAppName}

; Nome do instalador que será criado
OutputBaseFilename=TranscricaoEmTexto-Setup

; Pasta onde o instalador final será salvo
OutputDir=installer-output

; Compactação
Compression=lzma2/max
SolidCompression=yes

; Aparência moderna
WizardStyle=modern

; Arquitetura
ArchitecturesAllowed=x64compatible
ArchitecturesInstallIn64BitMode=x64compatible

; O programa precisa do Windows 10 ou superior
MinVersion=10.0

; Permite ao usuário escolher se quer atalho na área de trabalho
DisableProgramGroupPage=yes

; Fecha aplicações quando necessário durante atualização
CloseApplications=yes
RestartApplications=no


; ============================================================
; ARQUIVOS
; ============================================================

[Files]

; Copia absolutamente tudo que está na pasta do EXE,
; incluindo _internal, FFmpeg, Torch, Whisper etc.
Source: "dist\Transcricao em Texto\*"; \
    DestDir: "{app}"; \
    Flags: ignoreversion recursesubdirs createallsubdirs


; ============================================================
; ATALHOS
; ============================================================

[Icons]

; Menu Iniciar
Name: "{autoprograms}\{#MyAppName}"; \
    Filename: "{app}\{#MyAppExeName}"

; Área de Trabalho
Name: "{autodesktop}\{#MyAppName}"; \
    Filename: "{app}\{#MyAppExeName}"; \
    Tasks: desktopicon


; ============================================================
; OPÇÕES DO INSTALADOR
; ============================================================

[Tasks]

Name: "desktopicon"; \
    Description: "Criar um atalho na Área de Trabalho"; \
    GroupDescription: "Atalhos:"; \
    Flags: checkedonce


; ============================================================
; EXECUTAR AO FINAL DA INSTALAÇÃO
; ============================================================

[Run]

Filename: "{app}\{#MyAppExeName}"; \
    Description: "Abrir {#MyAppName}"; \
    Flags: nowait postinstall skipifsilent