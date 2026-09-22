# -*- mode: python ; coding: utf-8 -*-

from PyInstaller.utils.hooks import collect_all


# ============================================================
# TRANSCRIÇÃO EM TEXTO
# Versão 1.2.0
# Build final para Windows
# ============================================================


# ============================================================
# INTERFACE
# ============================================================

datas = [
    (
        "templates",
        "templates"
    ),
    (
        "static",
        "static"
    ),
]


# ============================================================
# FFMPEG
# ============================================================

binaries = [
    (
        "C:/ffmpeg/bin/ffmpeg.exe",
        "ffmpeg/bin"
    ),
]


# ============================================================
# IMPORTAÇÕES OCULTAS
# ============================================================

hiddenimports = []


# ============================================================
# WHISPER
# ============================================================

whisper_datas, whisper_binaries, whisper_hiddenimports = (
    collect_all(
        "whisper"
    )
)

datas += whisper_datas
binaries += whisper_binaries
hiddenimports += whisper_hiddenimports


# ============================================================
# ANÁLISE
# ============================================================

a = Analysis(
    [
        "app.py"
    ],

    pathex=[],

    binaries=binaries,

    datas=datas,

    hiddenimports=hiddenimports,

    hookspath=[],

    hooksconfig={},

    runtime_hooks=[
        "rthook_torch_windows.py"
    ],

    excludes=[],

    noarchive=False,

    optimize=0,
)


# ============================================================
# BYTECODE
# ============================================================

pyz = PYZ(
    a.pure
)


# ============================================================
# EXECUTÁVEL
# ============================================================

exe = EXE(
    pyz,

    a.scripts,

    [],

    exclude_binaries=True,

    name="Transcricao em Texto",

    debug=False,

    bootloader_ignore_signals=False,

    strip=False,

    # Mantemos UPX desligado para maior estabilidade
    # com PyTorch / Whisper.
    upx=False,

    # False = não mostrar a janela preta do terminal.
    console=False,

    disable_windowed_traceback=False,

    argv_emulation=False,

    target_arch=None,

    codesign_identity=None,

    entitlements_file=None,

    # Ícone oficial do aplicativo.
    icon="static/img/logo-transcricao.ico",

    # Informações exibidas nas propriedades do Windows.
    version="version_info.txt",
)


# ============================================================
# PASTA FINAL
# ============================================================

coll = COLLECT(
    exe,

    a.binaries,

    a.datas,

    strip=False,

    upx=False,

    upx_exclude=[],

    name="Transcricao em Texto",
)