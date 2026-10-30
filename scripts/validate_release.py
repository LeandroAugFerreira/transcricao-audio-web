"""Confere as versões antes de gerar o instalador, sem iniciar a aplicação."""

import ast
import os
from pathlib import Path
import re


ROOT = Path(__file__).resolve().parents[1]


def validate(root=ROOT, tag=None):
    app = ast.parse((root / "app.py").read_text(encoding="utf-8-sig"))
    version = next(
        ast.literal_eval(node.value)
        for node in app.body
        if isinstance(node, ast.Assign)
        and any(isinstance(t, ast.Name) and t.id == "VERSAO_APLICACAO" for t in node.targets)
    )
    if not re.fullmatch(r"\d+\.\d+", version):
        raise ValueError(f"Versão inválida: {version}")

    installer = (root / "installer.iss").read_text(encoding="utf-8-sig")
    declared = re.search(r'^#define MyAppVersion "([^"]+)"$', installer, re.M)
    if not declared or declared.group(1) != version:
        raise ValueError("A versão do instalador difere de VERSAO_APLICACAO.")
    for directive, expected in {
        "OutputBaseFilename": "TranscricaoEmTexto-Setup-V{#MyAppVersion}",
        "VersionInfoVersion": "{#MyAppVersion}.0.0",
        "VersionInfoProductVersion": "{#MyAppVersion}",
    }.items():
        value = re.search(rf"^{directive}=(.+)$", installer, re.M)
        if not value or value.group(1).strip() != expected:
            raise ValueError(f"Diretiva {directive} deve usar {expected}.")

    info = ast.parse((root / "version_info.txt").read_text(encoding="utf-8-sig"))
    expected_tuple = tuple(map(int, version.split("."))) + (0, 0)
    fields = {}
    for node in ast.walk(info):
        if not isinstance(node, ast.Call) or not isinstance(node.func, ast.Name):
            continue
        if node.func.id == "FixedFileInfo":
            fields.update({kw.arg: ast.literal_eval(kw.value) for kw in node.keywords
                           if kw.arg in ("filevers", "prodvers")})
        elif node.func.id == "StringStruct" and len(node.args) == 2:
            key = ast.literal_eval(node.args[0])
            if key in ("FileVersion", "ProductVersion"):
                fields[key] = ast.literal_eval(node.args[1])
    if fields != {"filevers": expected_tuple, "prodvers": expected_tuple,
                  "FileVersion": version, "ProductVersion": version}:
        raise ValueError("Os metadados do executável diferem de VERSAO_APLICACAO.")
    if tag is not None and tag != f"V{version}":
        raise ValueError(f"A tag {tag} difere da versão V{version}.")
    return version


if __name__ == "__main__":
    tag = os.environ.get("GITHUB_REF_NAME") if os.environ.get("GITHUB_REF_TYPE") == "tag" else None
    version = validate(tag=tag)
    outputs = f"version={version}\ninstaller=TranscricaoEmTexto-Setup-V{version}.exe\n"
    print(outputs, end="")
    if os.environ.get("GITHUB_OUTPUT"):
        with open(os.environ["GITHUB_OUTPUT"], "a", encoding="utf-8") as output:
            output.write(outputs)
