# Inventário estático de rotas

Rotas identificadas nos decoradores do código. Prefixos aplicados ao incluir roteadores podem ser acrescentados ao caminho mostrado. Autenticação, permissões e payloads devem ser conferidos no código/OpenAPI; a tabela não dispensa validação nem comprova implantação.

| Arquivo | Método | Caminho declarado | Função |
|---|---|---|---|
| `app.py` | GET | `/api/status` | `api_status` |
| `app.py` | GET | `/sistema` | `sistema` |
| `app.py` | GET, DELETE | `/historico` | `historico` |
| `app.py` | GET, POST | `/api/usuarios` | `usuarios_admin` |
| `app.py` | GET, POST | `/login` | `login` |
| `app.py` | GET, POST | `/primeiro-acesso` | `primeiro_acesso` |
| `app.py` | POST | `/abrir-pasta-transcricoes` | `abrir_pasta_transcricoes` |
| `app.py` | POST | `/cancelar` | `cancelar` |
| `app.py` | POST | `/logout` | `logout` |
| `app.py` | POST | `/transcrever` | `transcrever` |
| `app.py` | PUT, DELETE | `/api/usuarios/<int:usuario_id>` | `usuario_admin_item` |
| `app.py` | ROUTE | `/` | `index` |
| `app.py` | ROUTE | `/download/<path:nome_arquivo>` | `download` |
