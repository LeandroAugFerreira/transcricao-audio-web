# ============================================================
# RUNTIME HOOK - PYTORCH / WINDOWS
#
# Este arquivo é executado automaticamente pelo PyInstaller
# antes da aplicação principal.
#
# Objetivos:
#
# 1. limitar as threads OpenMP/MKL para manter o Whisper
#    estável no Windows;
#
# 2. adicionar torch/lib ao mecanismo de busca de DLLs;
#
# 3. pré-carregar c10.dll antes do primeiro import do Torch.
#
# Isso também se aplica aos subprocessos criados pelo
# multiprocessing.
# ============================================================

import ctypes
import os
import sys


# ============================================================
# ESTABILIDADE DO PYTORCH CPU
# ============================================================

os.environ["OMP_NUM_THREADS"] = "1"
os.environ["MKL_NUM_THREADS"] = "1"


# ============================================================
# MANTÉM AS REFERÊNCIAS DAS DLLs VIVAS
# ============================================================

_DIRETORIOS_DLL = []

_C10_DLL = None


# ============================================================
# CONFIGURAÇÃO SOMENTE NO WINDOWS EMPACOTADO
# ============================================================

if (
    sys.platform == "win32"
    and getattr(
        sys,
        "frozen",
        False
    )
):

    pasta_base = getattr(
        sys,
        "_MEIPASS",
        os.path.dirname(
            sys.executable
        )
    )


    pasta_torch_lib = os.path.join(
        pasta_base,
        "torch",
        "lib"
    )


    # ========================================================
    # ADICIONAR TORCH/LIB À BUSCA DE DLLs DO WINDOWS
    # ========================================================

    if os.path.isdir(
        pasta_torch_lib
    ):

        try:

            if hasattr(
                os,
                "add_dll_directory"
            ):

                manipulador = (
                    os.add_dll_directory(
                        pasta_torch_lib
                    )
                )


                _DIRETORIOS_DLL.append(
                    manipulador
                )


        except Exception:

            pass


        # ====================================================
        # ADICIONAR TAMBÉM AO PATH DO PROCESSO
        # ====================================================

        path_atual = os.environ.get(
            "PATH",
            ""
        )


        pastas_path = path_atual.split(
            os.pathsep
        )


        if (
            pasta_torch_lib
            not in pastas_path
        ):

            os.environ["PATH"] = (
                pasta_torch_lib
                +
                os.pathsep
                +
                path_atual
            )


        # ====================================================
        # PRÉ-CARREGAR C10.DLL
        # ====================================================

        caminho_c10 = os.path.join(
            pasta_torch_lib,
            "c10.dll"
        )


        if os.path.isfile(
            caminho_c10
        ):

            try:

                _C10_DLL = (
                    ctypes.WinDLL(
                        caminho_c10
                    )
                )


            except Exception as erro:

                print()
                print("!" * 60)
                print(
                    "ERRO AO PREPARAR PYTORCH"
                )
                print(
                    "Não foi possível carregar c10.dll."
                )
                print(
                    f"Tipo: "
                    f"{type(erro).__name__}"
                )
                print(
                    f"Mensagem: "
                    f"{str(erro)}"
                )
                print("!" * 60)
                print()