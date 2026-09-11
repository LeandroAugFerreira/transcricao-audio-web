# Importa o Flask e a função responsável por carregar arquivos HTML
from flask import Flask, render_template


# Cria a nossa aplicação Flask
app = Flask(__name__)


# Define a página inicial do sistema
@app.route("/")
def inicio():

    # Procura o arquivo index.html dentro da pasta templates
    return render_template("index.html")


# Inicia o servidor quando executamos este arquivo
if __name__ == "__main__":
    app.run(debug=True)