; ============================================================
; INSTALADOR - TRANSCRIÇÃO EM TEXTO
; Versão 1.2.0
; ============================================================


#define MyAppName "Transcrição em Texto"
#define MyAppVersion "1.2.0"
#define MyAppPublisher "Leandro A. Ferreira"
#define MyAppExeName "Transcricao em Texto.exe"


[Setup]

; ============================================================
; IDENTIFICAÇÃO DO APLICATIVO
; ============================================================

; IMPORTANTE:
; Este AppId é o mesmo utilizado nas versões anteriores.
; NÃO ALTERAR nas próximas atualizações.
AppId={{A8F70173-C63D-4E21-B36D-44BC1288A1F5}

AppName={#MyAppName}
AppVersion={#MyAppVersion}
AppVerName={#MyAppName} {#MyAppVersion}
AppPublisher={#MyAppPublisher}


; ============================================================
; INSTALAÇÃO
; ============================================================

; Instalação por usuário.
; Não exige privilégios administrativos em uma instalação normal.
PrivilegesRequired=lowest

; Pasta padrão:
;
; C:\Users\USUARIO\AppData\Local\Programs\TranscricaoEmTexto
DefaultDirName={localappdata}\Programs\TranscricaoEmTexto

; Nome exibido no Menu Iniciar.
DefaultGroupName={#MyAppName}

; Não exibir página para seleção do grupo do Menu Iniciar.
DisableProgramGroupPage=yes


; ============================================================
; DESINSTALAÇÃO
; ============================================================

UninstallDisplayName={#MyAppName}
UninstallDisplayIcon={app}\{#MyAppExeName}

; Os dados do usuário NÃO são armazenados na pasta de instalação.
;
; Portanto, ao desinstalar o programa, permanecem preservados:
;
; Documentos\Transcrição em Texto
;
; incluindo histórico, usuários e transcrições.


; ============================================================
; ARQUIVO DE SAÍDA
; ============================================================

OutputDir=installer-output

OutputBaseFilename=TranscricaoEmTexto-Setup-v1.2.0


; ============================================================
; ÍCONE DO INSTALADOR
; ============================================================

SetupIconFile=static\img\logo-transcricao.ico


; ============================================================
; INFORMAÇÕES DE VERSÃO DO INSTALADOR
; ============================================================

VersionInfoVersion=1.2.0.0
VersionInfoCompany={#MyAppPublisher}
VersionInfoDescription=Instalador do {#MyAppName}
VersionInfoProductName={#MyAppName}
VersionInfoProductVersion={#MyAppVersion}


; ============================================================
; COMPACTAÇÃO
; ============================================================

Compression=lzma2/max
SolidCompression=yes


; ============================================================
; INTERFACE
; ============================================================

WizardStyle=modern


; ============================================================
; WINDOWS / ARQUITETURA
; ============================================================

; Aplicativo desenvolvido para Windows 64 bits.
ArchitecturesAllowed=x64compatible

; Windows 10 ou superior.
MinVersion=10.0


; ============================================================
; ATUALIZAÇÃO / APLICAÇÃO EM EXECUÇÃO
; ============================================================

; Tenta fechar a aplicação caso esteja aberta durante
; uma instalação/atualização.
CloseApplications=yes

RestartApplications=no


; ============================================================
; ARQUIVOS
; ============================================================

[Files]

; Copia todo o build ONEDIR produzido pelo PyInstaller.
;
; Isso inclui:
;
; - Transcricao em Texto.exe
; - _internal
; - Python
; - Flask
; - Whisper
; - PyTorch
; - FFmpeg
; - templates
; - static
; - demais dependências
;
Source: "dist\Transcricao em Texto\*"; \
    DestDir: "{app}"; \
    Flags: ignoreversion recursesubdirs createallsubdirs


; ============================================================
; ATALHOS
; ============================================================

[Icons]

; Menu Iniciar
Name: "{autoprograms}\{#MyAppName}"; \
    Filename: "{app}\{#MyAppExeName}"; \
    WorkingDir: "{app}"; \
    IconFilename: "{app}\{#MyAppExeName}"


; Área de Trabalho
Name: "{autodesktop}\{#MyAppName}"; \
    Filename: "{app}\{#MyAppExeName}"; \
    WorkingDir: "{app}"; \
    IconFilename: "{app}\{#MyAppExeName}"; \
    Tasks: desktopicon


; ============================================================
; OPÇÕES
; ============================================================

[Tasks]

Name: "desktopicon"; \
    Description: "Criar um atalho na Área de Trabalho"; \
    GroupDescription: "Atalhos:"; \
    Flags: checkedonce


; ============================================================
; EXECUTAR APÓS A INSTALAÇÃO
; ============================================================

[Run]

Filename: "{app}\{#MyAppExeName}"; \
    Description: "Abrir {#MyAppName}"; \
    WorkingDir: "{app}"; \
    Flags: nowait postinstall skipifsilent