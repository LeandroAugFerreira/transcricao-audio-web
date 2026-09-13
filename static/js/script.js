// ============================================================
// ELEMENTOS DA INTERFACE
// ============================================================

const inputArquivos =
    document.getElementById("arquivos");

const inputPasta =
    document.getElementById("pasta-arquivos");

const listaArquivos =
    document.getElementById("lista-arquivos");

const cabecalhoArquivos =
    document.getElementById("cabecalho-arquivos");

const botaoTranscrever =
    document.getElementById("botao-transcrever");

const botaoPausar =
    document.getElementById("botao-pausar");

const botaoCancelar =
    document.getElementById("botao-cancelar");

const botaoLimpar =
    document.getElementById("botao-limpar");

const botaoNovaTranscricao =
    document.getElementById(
        "botao-nova-transcricao"
    );

const painelProgresso =
    document.getElementById(
        "painel-progresso"
    );

const progressoTexto =
    document.getElementById(
        "progresso-texto"
    );

const progressoContador =
    document.getElementById(
        "progresso-contador"
    );

const barraProgressoPreenchimento =
    document.getElementById(
        "barra-progresso-preenchimento"
    );

const arquivoAtual =
    document.getElementById(
        "arquivo-atual"
    );

const cronometroAtual =
    document.getElementById(
        "cronometro-atual"
    );

const quantidadeFila =
    document.getElementById(
        "quantidade-fila"
    );

const estadoFila =
    document.getElementById(
        "estado-fila"
    );

const uploadArea =
    document.querySelector(
        ".upload-area"
    );


// ============================================================
// ESTADO DA APLICAÇÃO
// ============================================================

let arquivosSelecionados = [];

let processando = false;

let pausaSolicitada = false;

let cancelamentoSolicitado = false;

let cancelamentoEmAndamento = false;

let indiceAtualProcessamento = -1;

let resolverPausa = null;


// ============================================================
// SESSÕES
// ============================================================

let contadorSessao = 0;

let sessaoAtual = null;


// ============================================================
// CONTROLE DE EXECUÇÃO
// ============================================================

let contadorExecucao = 0;

let execucaoAtualId = null;


// ============================================================
// FETCH ATUAL
// ============================================================

let controladorFetchAtual = null;


// ============================================================
// CRONÔMETROS
// ============================================================

let intervaloCronometroArquivo = null;

let intervaloCronometroTotal = null;

let inicioCronometroArquivo = null;

let inicioCronometroTotal = null;

let segundosTotaisFila = 0;


// ============================================================
// IDENTIFICADOR DAS LINHAS
// ============================================================

let contadorIdentificador = 0;


// ============================================================
// FORMATOS PERMITIDOS
// ============================================================

const extensoesPermitidas = [
    ".mp3",
    ".mp4",
    ".wav",
    ".m4a"
];


// ============================================================
// IDENTIFICADOR DO ARQUIVO
// ============================================================

function criarIdentificadorArquivo(
    arquivo
) {

    const caminhoRelativo =
        arquivo.webkitRelativePath
        ||
        "";


    return [
        caminhoRelativo,
        arquivo.name,
        arquivo.size,
        arquivo.lastModified
    ].join("|");
}


// ============================================================
// ID DA LINHA
// ============================================================

function criarIdLinha() {

    contadorIdentificador++;


    return (
        `arquivo-${Date.now()}-${contadorIdentificador}`
    );
}


// ============================================================
// VERIFICAR FORMATO
// ============================================================

function arquivoPermitido(
    arquivo
) {

    const nome =
        arquivo.name.toLowerCase();


    return extensoesPermitidas.some(
        extensao =>
            nome.endsWith(
                extensao
            )
    );
}


// ============================================================
// FORMATAR TAMANHO
// ============================================================

function formatarTamanho(
    bytes
) {

    if (bytes === 0) {

        return "0 B";
    }


    const unidades = [
        "B",
        "KB",
        "MB",
        "GB"
    ];


    const indice = Math.min(

        Math.floor(
            Math.log(bytes)
            /
            Math.log(1024)
        ),

        unidades.length - 1
    );


    const valor = (
        bytes
        /
        Math.pow(
            1024,
            indice
        )
    ).toFixed(
        indice === 0
            ?
            0
            :
            1
    );


    return (
        `${valor} ${unidades[indice]}`
    );
}


// ============================================================
// FORMATAR TEMPO
// ============================================================

function formatarTempo(
    segundos
) {

    segundos = Math.max(
        0,
        Math.floor(
            segundos
        )
    );


    const minutos =
        Math.floor(
            segundos / 60
        );


    const segundosRestantes =
        segundos % 60;


    return (
        String(
            minutos
        ).padStart(
            2,
            "0"
        )
        +
        ":"
        +
        String(
            segundosRestantes
        ).padStart(
            2,
            "0"
        )
    );
}


// ============================================================
// BUSCAR LINHA
// ============================================================

function obterLinha(
    item
) {

    return document.getElementById(
        item.id
    );
}


// ============================================================
// ARQUIVOS DA SESSÃO ATUAL
// ============================================================

function obterArquivosSessaoAtual() {

    if (
        sessaoAtual === null
    ) {

        return [];
    }


    return arquivosSelecionados.filter(
        item =>
            item.sessao ===
            sessaoAtual
    );
}


// ============================================================
// ARQUIVOS AGUARDANDO
// ============================================================

function obterArquivosAguardando() {

    return arquivosSelecionados.filter(
        item =>
            item.status ===
            "aguardando"
    );
}


// ============================================================
// VERIFICAR SE EXISTEM ARQUIVOS AGUARDANDO
// ============================================================

function possuiArquivosAguardando() {

    return arquivosSelecionados.some(
        item =>
            item.status ===
            "aguardando"
    );
}


// ============================================================
// RESUMO DA SESSÃO
// ============================================================

function obterResumoSessaoAtual() {

    const arquivos =
        obterArquivosSessaoAtual();


    const concluidos =
        arquivos.filter(
            item =>
                item.status ===
                "concluido"
        ).length;


    const erros =
        arquivos.filter(
            item =>
                item.status ===
                "erro"
        ).length;


    const cancelados =
        arquivos.filter(
            item =>
                item.status ===
                "cancelado"
        ).length;


    const aguardando =
        arquivos.filter(
            item =>
                item.status ===
                "aguardando"
        ).length;


    const transcrevendo =
        arquivos.filter(
            item =>
                item.status ===
                "transcrevendo"
                ||
                item.status ===
                "cancelando"
        ).length;


    const encerrados =
        concluidos
        +
        erros
        +
        cancelados;


    return {

        total:
            arquivos.length,

        concluidos:
            concluidos,

        erros:
            erros,

        cancelados:
            cancelados,

        aguardando:
            aguardando,

        transcrevendo:
            transcrevendo,

        encerrados:
            encerrados
    };
}


// ============================================================
// QUANTIDADE DE ARQUIVOS
// ============================================================

function atualizarQuantidadeFila() {

    const quantidade =
        arquivosSelecionados.length;


    quantidadeFila.textContent =
        quantidade === 1
            ?
            "1 arquivo"
            :
            `${quantidade} arquivos`;


    cabecalhoArquivos.style.display =
        quantidade > 0
            ?
            "grid"
            :
            "none";
}


// ============================================================
// PRÉVIA DA FILA
// ============================================================

function atualizarPreviaNovaFila() {

    if (processando) {

        return;
    }


    const aguardando =
        obterArquivosAguardando().length;


    if (
        aguardando > 0
    ) {

        progressoContador.textContent =
            `0 de ${aguardando}`;


        barraProgressoPreenchimento.style.width =
            "0%";


        progressoTexto.textContent =
            "Arquivos aguardando processamento";
    }
}


// ============================================================
// CONTROLES
// ============================================================

function atualizarControles() {

    const possuiArquivos =
        arquivosSelecionados.length > 0;


    const possuiAguardando =
        possuiArquivosAguardando();


    if (processando) {

        botaoTranscrever.disabled =
            true;


        botaoTranscrever.textContent =
            "Processando...";


        botaoLimpar.disabled =
            true;


        botaoPausar.disabled =
            cancelamentoSolicitado;


        botaoCancelar.disabled =
            cancelamentoSolicitado;


        botaoNovaTranscricao.hidden =
            true;


        return;
    }


    botaoTranscrever.disabled =
        !possuiAguardando;


    botaoTranscrever.textContent =
        "Iniciar Transcrição";


    botaoLimpar.disabled =
        !possuiArquivos;


    botaoPausar.disabled =
        true;


    botaoCancelar.disabled =
        true;
}


// ============================================================
// MOSTRAR NOVA TRANSCRIÇÃO
// ============================================================

function mostrarBotaoNovaTranscricao() {

    botaoNovaTranscricao.hidden =
        false;
}


// ============================================================
// OCULTAR NOVA TRANSCRIÇÃO
// ============================================================

function ocultarBotaoNovaTranscricao() {

    botaoNovaTranscricao.hidden =
        true;
}


// ============================================================
// PROGRESSO DA SESSÃO
// ============================================================

function atualizarProgressoSessaoAtual() {

    const resumo =
        obterResumoSessaoAtual();


    progressoContador.textContent =
        `${resumo.encerrados} de ${resumo.total}`;


    let percentual =
        0;


    if (
        resumo.total > 0
    ) {

        percentual =
            (
                resumo.encerrados
                /
                resumo.total
            )
            *
            100;
    }


    barraProgressoPreenchimento.style.width =
        `${percentual}%`;
}


// ============================================================
// RESUMO DA SESSÃO
// ============================================================

function mostrarResumoSessao(
    titulo
) {

    const resumo =
        obterResumoSessaoAtual();


    progressoTexto.textContent =
        (
            `${titulo} • `
            +
            `${resumo.concluidos} concluído(s) • `
            +
            `${resumo.erros} erro(s) • `
            +
            `${resumo.cancelados} cancelado(s)`
        );


    progressoContador.textContent =
        `${resumo.encerrados} de ${resumo.total}`;


    barraProgressoPreenchimento.style.width =
        resumo.total > 0
            ?
            "100%"
            :
            "0%";
}


// ============================================================
// STATUS DA LINHA
// ============================================================

function atualizarStatusLinha(
    item,
    status,
    textoStatus
) {

    item.status =
        status;


    const linha =
        obterLinha(
            item
        );


    if (!linha) {

        return;
    }


    const elementoStatus =
        linha.querySelector(
            ".status"
        );


    if (elementoStatus) {

        elementoStatus.className =
            `status status-${status}`;


        elementoStatus.textContent =
            textoStatus;
    }


    if (
        status === "transcrevendo"
        ||
        status === "cancelando"
    ) {

        linha.classList.add(
            "linha-em-processamento"
        );

    } else {

        linha.classList.remove(
            "linha-em-processamento"
        );
    }
}


// ============================================================
// TEMPO DO ARQUIVO
// ============================================================

function atualizarTempoLinha(
    item,
    segundos
) {

    item.tempo =
        segundos;


    const linha =
        obterLinha(
            item
        );


    if (!linha) {

        return;
    }


    const elementoTempo =
        linha.querySelector(
            ".tempo-arquivo"
        );


    if (elementoTempo) {

        elementoTempo.textContent =
            formatarTempo(
                segundos
            );
    }
}


// ============================================================
// LIMPAR RESULTADO DO ARQUIVO
// ============================================================

function limparResultadoArquivo(
    item
) {

    item.transcricao =
        "";

    item.arquivoDocx =
        null;

    item.erro =
        "";

    item.tempo =
        0;


    const linha =
        obterLinha(
            item
        );


    if (!linha) {

        return;
    }


    const elementoTempo =
        linha.querySelector(
            ".tempo-arquivo"
        );


    if (elementoTempo) {

        elementoTempo.textContent =
            "00:00";
    }


    const areaAcoes =
        linha.querySelector(
            ".acoes-arquivo"
        );


    if (areaAcoes) {

        areaAcoes.textContent =
            "—";
    }


    const tituloTranscricao =
        linha.querySelector(
            ".titulo-transcricao"
        );


    if (tituloTranscricao) {

        tituloTranscricao.textContent =
            "Transcrição";
    }


    const textoTranscricao =
        linha.querySelector(
            ".texto-transcricao"
        );


    if (textoTranscricao) {

        textoTranscricao.textContent =
            "";
    }


    const areaTranscricao =
        linha.querySelector(
            ".area-transcricao"
        );


    if (areaTranscricao) {

        areaTranscricao.classList.remove(
            "aberta"
        );
    }
}


// ============================================================
// REATIVAR ARQUIVO
// ============================================================

function reativarArquivo(
    item,
    arquivo
) {

    item.arquivo =
        arquivo;


    item.sessao =
        processando
            ?
            sessaoAtual
            :
            null;


    limparResultadoArquivo(
        item
    );


    atualizarStatusLinha(
        item,
        "aguardando",
        "Aguardando"
    );
}


// ============================================================
// AÇÕES DO ARQUIVO CONCLUÍDO
// ============================================================

function criarAcoesConcluidas(
    item
) {

    const linha =
        obterLinha(
            item
        );


    if (!linha) {

        return;
    }


    const areaAcoes =
        linha.querySelector(
            ".acoes-arquivo"
        );


    if (!areaAcoes) {

        return;
    }


    areaAcoes.innerHTML =
        "";


    // ========================================================
    // VISUALIZAR
    // ========================================================

    const botaoVisualizar =
        document.createElement(
            "button"
        );


    botaoVisualizar.type =
        "button";


    botaoVisualizar.className =
        "botao-visualizar";


    botaoVisualizar.textContent =
        "Visualizar";


    botaoVisualizar.addEventListener(
        "click",
        () => {

            const area =
                linha.querySelector(
                    ".area-transcricao"
                );


            if (!area) {

                return;
            }


            const aberta =
                area.classList.contains(
                    "aberta"
                );


            area.classList.toggle(
                "aberta",
                !aberta
            );


            botaoVisualizar.textContent =
                aberta
                    ?
                    "Visualizar"
                    :
                    "Ocultar";
        }
    );


    areaAcoes.appendChild(
        botaoVisualizar
    );


    // ========================================================
    // DOWNLOAD WORD
    // ========================================================

    if (
        item.arquivoDocx
    ) {

        const linkDownload =
            document.createElement(
                "a"
            );


        linkDownload.className =
            "botao-download";


        linkDownload.textContent =
            "Baixar Word";


        linkDownload.href =
            `/download/${encodeURIComponent(
                item.arquivoDocx
            )}`;


        areaAcoes.appendChild(
            linkDownload
        );
    }
}


// ============================================================
// MENSAGEM DE ERRO PARA O USUÁRIO
// ============================================================

function obterMensagemErroUsuario(
    erro
) {

    if (!erro) {

        return (
            "Não foi possível concluir a transcrição."
        );
    }


    if (
        erro.name ===
        "AbortError"
    ) {

        return (
            "O processamento foi cancelado."
        );
    }


    const mensagem =
        String(
            erro.message
            ||
            erro
        ).trim();


    const mensagemMinuscula =
        mensagem.toLowerCase();


    if (
        mensagemMinuscula.includes(
            "failed to fetch"
        )
        ||
        mensagemMinuscula.includes(
            "networkerror"
        )
        ||
        mensagemMinuscula.includes(
            "network request failed"
        )
    ) {

        return (
            "Não foi possível se comunicar com o servidor. "
            +
            "Verifique se o aplicativo continua aberto "
            +
            "e tente novamente."
        );
    }


    if (
        mensagemMinuscula.includes(
            "resposta inválida"
        )
    ) {

        return (
            "O servidor respondeu de forma inesperada. "
            +
            "Tente novamente."
        );
    }


    if (!mensagem) {

        return (
            "Ocorreu um erro inesperado durante o processamento."
        );
    }


    return mensagem;
}


// ============================================================
// MOSTRAR ERRO DO ARQUIVO
// ============================================================

function mostrarErroArquivo(
    item,
    mensagem
) {

    item.erro =
        mensagem;


    const linha =
        obterLinha(
            item
        );


    if (!linha) {

        return;
    }


    const titulo =
        linha.querySelector(
            ".titulo-transcricao"
        );


    const texto =
        linha.querySelector(
            ".texto-transcricao"
        );


    const area =
        linha.querySelector(
            ".area-transcricao"
        );


    const areaAcoes =
        linha.querySelector(
            ".acoes-arquivo"
        );


    if (titulo) {

        titulo.textContent =
            "Erro no processamento";
    }


    if (texto) {

        texto.textContent =
            mensagem;
    }


    if (!areaAcoes) {

        return;
    }


    areaAcoes.innerHTML =
        "";


    const botaoVerErro =
        document.createElement(
            "button"
        );


    botaoVerErro.type =
        "button";


    botaoVerErro.className =
        "botao-visualizar";


    botaoVerErro.textContent =
        "Ver erro";


    botaoVerErro.addEventListener(
        "click",
        () => {

            if (!area) {

                return;
            }


            const aberta =
                area.classList.contains(
                    "aberta"
                );


            area.classList.toggle(
                "aberta",
                !aberta
            );


            botaoVerErro.textContent =
                aberta
                    ?
                    "Ver erro"
                    :
                    "Ocultar erro";
        }
    );


    areaAcoes.appendChild(
        botaoVerErro
    );
}


// ============================================================
// CRIAR LINHA DO ARQUIVO
// ============================================================

function criarLinhaArquivo(
    item
) {

    const linha =
        document.createElement(
            "div"
        );


    linha.id =
        item.id;


    linha.className =
        "linha-arquivo";


    const linhaPrincipal =
        document.createElement(
            "div"
        );


    linhaPrincipal.className =
        "linha-arquivo-principal";


    // ========================================================
    // NOME
    // ========================================================

    const colunaNome =
        document.createElement(
            "div"
        );


    colunaNome.className =
        "nome-arquivo";


    const nome =
        document.createElement(
            "strong"
        );


    nome.textContent =
        item.arquivo.name;


    colunaNome.appendChild(
        nome
    );


    // ========================================================
    // TAMANHO
    // ========================================================

    const colunaTamanho =
        document.createElement(
            "div"
        );


    colunaTamanho.className =
        "tamanho-arquivo";


    colunaTamanho.textContent =
        formatarTamanho(
            item.arquivo.size
        );


    // ========================================================
    // STATUS
    // ========================================================

    const colunaStatus =
        document.createElement(
            "div"
        );


    const status =
        document.createElement(
            "span"
        );


    status.className =
        "status status-aguardando";


    status.textContent =
        "Aguardando";


    colunaStatus.appendChild(
        status
    );


    // ========================================================
    // TEMPO
    // ========================================================

    const colunaTempo =
        document.createElement(
            "div"
        );


    colunaTempo.className =
        "tempo-arquivo";


    colunaTempo.textContent =
        "00:00";


    // ========================================================
    // AÇÕES
    // ========================================================

    const colunaAcoes =
        document.createElement(
            "div"
        );


    colunaAcoes.className =
        "acoes-arquivo";


    colunaAcoes.textContent =
        "—";


    linhaPrincipal.appendChild(
        colunaNome
    );


    linhaPrincipal.appendChild(
        colunaTamanho
    );


    linhaPrincipal.appendChild(
        colunaStatus
    );


    linhaPrincipal.appendChild(
        colunaTempo
    );


    linhaPrincipal.appendChild(
        colunaAcoes
    );


    linha.appendChild(
        linhaPrincipal
    );


    // ========================================================
    // ÁREA DA TRANSCRIÇÃO
    // ========================================================

    const areaTranscricao =
        document.createElement(
            "div"
        );


    areaTranscricao.className =
        "area-transcricao";


    const caixaTranscricao =
        document.createElement(
            "div"
        );


    caixaTranscricao.className =
        "caixa-transcricao";


    const tituloTranscricao =
        document.createElement(
            "div"
        );


    tituloTranscricao.className =
        "titulo-transcricao";


    tituloTranscricao.textContent =
        "Transcrição";


    const textoTranscricao =
        document.createElement(
            "div"
        );


    textoTranscricao.className =
        "texto-transcricao";


    caixaTranscricao.appendChild(
        tituloTranscricao
    );


    caixaTranscricao.appendChild(
        textoTranscricao
    );


    areaTranscricao.appendChild(
        caixaTranscricao
    );


    linha.appendChild(
        areaTranscricao
    );


    listaArquivos.appendChild(
        linha
    );
}


// ============================================================
// ADICIONAR ARQUIVOS
// ============================================================

function adicionarArquivos(
    lista
) {

    const arquivos =
        Array.from(
            lista
        );


    if (
        arquivos.length === 0
    ) {

        return;
    }


    let quantidadeInvalidos =
        0;

    let quantidadeDuplicados =
        0;

    let quantidadeAdicionados =
        0;

    let quantidadeReativados =
        0;


    arquivos.forEach(
        arquivo => {

            // =================================================
            // FORMATO
            // =================================================

            if (
                !arquivoPermitido(
                    arquivo
                )
            ) {

                quantidadeInvalidos++;

                return;
            }


            // =================================================
            // DUPLICIDADE
            // =================================================

            const identificador =
                criarIdentificadorArquivo(
                    arquivo
                );


            const existente =
                arquivosSelecionados.find(
                    item =>
                        item.identificador ===
                        identificador
                );


            if (existente) {

                // Arquivo cancelado ou com erro pode ser
                // selecionado novamente.

                if (
                    existente.status ===
                    "cancelado"
                    ||
                    existente.status ===
                    "erro"
                ) {

                    reativarArquivo(
                        existente,
                        arquivo
                    );


                    quantidadeReativados++;


                    return;
                }


                quantidadeDuplicados++;


                return;
            }


            // =================================================
            // NOVO ITEM
            // =================================================

            const item = {

                id:
                    criarIdLinha(),

                identificador:
                    identificador,

                arquivo:
                    arquivo,

                status:
                    "aguardando",

                tempo:
                    0,

                transcricao:
                    "",

                arquivoDocx:
                    null,

                erro:
                    "",

                sessao:
                    processando
                        ?
                        sessaoAtual
                        :
                        null
            };


            arquivosSelecionados.push(
                item
            );


            criarLinhaArquivo(
                item
            );


            quantidadeAdicionados++;
        }
    );


    atualizarQuantidadeFila();


    if (
        possuiArquivosAguardando()
        &&
        !processando
    ) {

        estadoFila.textContent =
            "Pronto para iniciar";


        atualizarPreviaNovaFila();
    }


    if (processando) {

        atualizarProgressoSessaoAtual();
    }


    atualizarControles();


    // ========================================================
    // AVISOS
    // ========================================================

    if (
        quantidadeInvalidos > 0
    ) {

        alert(

            quantidadeInvalidos === 1
                ?
                "1 arquivo foi ignorado porque o formato não é suportado."
                :
                `${quantidadeInvalidos} arquivos foram ignorados porque os formatos não são suportados.`
        );
    }


    if (
        quantidadeDuplicados > 0
    ) {

        alert(

            quantidadeDuplicados === 1
                ?
                "1 arquivo duplicado não foi adicionado novamente."
                :
                `${quantidadeDuplicados} arquivos duplicados não foram adicionados novamente.`
        );
    }


    console.log(
        "Arquivos adicionados:",
        quantidadeAdicionados
    );


    console.log(
        "Arquivos reativados:",
        quantidadeReativados
    );
}


// ============================================================
// CRONÔMETRO DO ARQUIVO
// ============================================================

function iniciarCronometroArquivo(
    item
) {

    pararCronometroArquivo();


    inicioCronometroArquivo =
        Date.now();


    atualizarTempoLinha(
        item,
        0
    );


    intervaloCronometroArquivo =
        setInterval(
            () => {

                const segundos =
                    Math.floor(
                        (
                            Date.now()
                            -
                            inicioCronometroArquivo
                        )
                        /
                        1000
                    );


                atualizarTempoLinha(
                    item,
                    segundos
                );

            },
            1000
        );
}


// ============================================================
// PARAR CRONÔMETRO DO ARQUIVO
// ============================================================

function pararCronometroArquivo() {

    if (
        intervaloCronometroArquivo !==
        null
    ) {

        clearInterval(
            intervaloCronometroArquivo
        );


        intervaloCronometroArquivo =
            null;
    }


    inicioCronometroArquivo =
        null;
}


// ============================================================
// CRONÔMETRO TOTAL
// ============================================================

function iniciarCronometroTotal() {

    pararCronometroTotal(
        false
    );


    segundosTotaisFila =
        0;


    inicioCronometroTotal =
        Date.now();


    cronometroAtual.textContent =
        "00:00";


    intervaloCronometroTotal =
        setInterval(
            () => {

                segundosTotaisFila =
                    Math.floor(
                        (
                            Date.now()
                            -
                            inicioCronometroTotal
                        )
                        /
                        1000
                    );


                cronometroAtual.textContent =
                    formatarTempo(
                        segundosTotaisFila
                    );

            },
            1000
        );
}


// ============================================================
// PARAR CRONÔMETRO TOTAL
// ============================================================

function pararCronometroTotal(
    mostrarTotal = true
) {

    if (
        intervaloCronometroTotal !==
        null
    ) {

        clearInterval(
            intervaloCronometroTotal
        );


        intervaloCronometroTotal =
            null;
    }


    if (
        inicioCronometroTotal !==
        null
    ) {

        segundosTotaisFila =
            Math.floor(
                (
                    Date.now()
                    -
                    inicioCronometroTotal
                )
                /
                1000
            );
    }


    inicioCronometroTotal =
        null;


    if (mostrarTotal) {

        cronometroAtual.textContent =
            `Total: ${formatarTempo(
                segundosTotaisFila
            )}`;
    }
}


// ============================================================
// AGUARDAR SE PAUSADO
// ============================================================

async function aguardarSePausado() {

    if (
        !pausaSolicitada
        ||
        cancelamentoSolicitado
    ) {

        return;
    }


    estadoFila.textContent =
        "Fila pausada";


    progressoTexto.textContent =
        "Processamento pausado";


    arquivoAtual.textContent =
        "Aguardando continuação";


    await new Promise(
        resolve => {

            resolverPausa =
                resolve;
        }
    );


    resolverPausa =
        null;
}


// ============================================================
// PAUSAR / CONTINUAR
// ============================================================

function alternarPausa() {

    if (
        !processando
        ||
        cancelamentoSolicitado
    ) {

        return;
    }


    // ========================================================
    // CONTINUAR
    // ========================================================

    if (pausaSolicitada) {

        pausaSolicitada =
            false;


        botaoPausar.textContent =
            "Pausar";


        estadoFila.textContent =
            "Processando";


        progressoTexto.textContent =
            "Processamento retomado";


        if (resolverPausa) {

            resolverPausa();


            resolverPausa =
                null;
        }


        return;
    }


    // ========================================================
    // SOLICITAR PAUSA
    // ========================================================

    pausaSolicitada =
        true;


    botaoPausar.textContent =
        "Continuar";


    estadoFila.textContent =
        "Pausa solicitada";


    progressoTexto.textContent =
        "A fila pausará após o arquivo atual";
}


// ============================================================
// CANCELAR ARQUIVOS AGUARDANDO
// ============================================================

function cancelarArquivosAguardandoSessaoAtual() {

    arquivosSelecionados.forEach(
        item => {

            if (
                item.sessao ===
                sessaoAtual
                &&
                item.status ===
                "aguardando"
            ) {

                atualizarStatusLinha(
                    item,
                    "cancelado",
                    "Cancelado"
                );
            }
        }
    );
}


// ============================================================
// CANCELAR PROCESSAMENTO
// ============================================================

async function cancelarProcessamento() {

    if (
        !processando
        ||
        cancelamentoEmAndamento
    ) {

        return;
    }


    const execucaoCancelada =
        execucaoAtualId;


    cancelamentoSolicitado =
        true;


    cancelamentoEmAndamento =
        true;


    pausaSolicitada =
        false;


    if (resolverPausa) {

        resolverPausa();


        resolverPausa =
            null;
    }


    const itemAtual =
        arquivosSelecionados[
            indiceAtualProcessamento
        ];


    if (
        itemAtual
        &&
        itemAtual.sessao ===
        sessaoAtual
        &&
        itemAtual.status ===
        "transcrevendo"
    ) {

        atualizarStatusLinha(
            itemAtual,
            "cancelando",
            "Cancelando..."
        );
    }


    atualizarProgressoSessaoAtual();


    estadoFila.textContent =
        "Cancelando processamento";


    progressoTexto.textContent =
        "Encerrando Whisper...";


    botaoPausar.disabled =
        true;


    botaoCancelar.disabled =
        true;


    try {

        const resposta =
            await fetch(
                "/cancelar",
                {
                    method:
                        "POST"
                }
            );


        let dados;


        try {

            dados =
                await resposta.json();

        } catch {

            throw new Error(
                "O servidor retornou uma resposta inválida ao cancelar."
            );
        }


        if (
            !resposta.ok
            ||
            !dados.sucesso
        ) {

            throw new Error(
                dados.mensagem
                ||
                "Não foi possível cancelar."
            );
        }


        // ====================================================
        // O BACKEND CONFIRMOU O CANCELAMENTO.
        // AGORA OS CRONÔMETROS PODEM SER ENCERRADOS.
        // ====================================================

        pararCronometroArquivo();


        pararCronometroTotal(
            true
        );


        // ====================================================
        // ABORTA O FETCH DA TRANSCRIÇÃO SOMENTE APÓS
        // O BACKEND CONFIRMAR O CANCELAMENTO
        // ====================================================

        if (
            controladorFetchAtual
        ) {

            controladorFetchAtual.abort();


            controladorFetchAtual =
                null;
        }


        if (
            itemAtual
            &&
            itemAtual.sessao ===
            sessaoAtual
            &&
            (
                itemAtual.status ===
                "cancelando"
                ||
                itemAtual.status ===
                "transcrevendo"
            )
        ) {

            atualizarStatusLinha(
                itemAtual,
                "cancelado",
                "Cancelado"
            );
        }


        cancelarArquivosAguardandoSessaoAtual();


        atualizarProgressoSessaoAtual();


        estadoFila.textContent =
            "Processamento cancelado";


        mostrarResumoSessao(
            "Fila cancelada"
        );


        arquivoAtual.textContent =
            "Nenhum arquivo em processamento";


        if (
            execucaoAtualId ===
            execucaoCancelada
        ) {

            execucaoAtualId =
                null;
        }


        processando =
            false;


        pausaSolicitada =
            false;


        cancelamentoSolicitado =
            false;


        cancelamentoEmAndamento =
            false;


        indiceAtualProcessamento =
            -1;


        botaoPausar.textContent =
            "Pausar";


        atualizarControles();


        mostrarBotaoNovaTranscricao();


    } catch (erro) {

        console.error(
            "Erro durante cancelamento:",
            erro
        );


        if (
            erro.name !==
            "AbortError"
        ) {

            // Se o servidor não confirmou o cancelamento,
            // voltamos o estado visual para processamento.

            cancelamentoSolicitado =
                false;


            if (
                itemAtual
                &&
                itemAtual.sessao ===
                sessaoAtual
                &&
                itemAtual.status ===
                "cancelando"
            ) {

                atualizarStatusLinha(
                    itemAtual,
                    "transcrevendo",
                    "Transcrevendo..."
                );
            }


            estadoFila.textContent =
                "Processando";


            progressoTexto.textContent =
                "Cancelamento não confirmado. "
                +
                "O processamento continua.";


            alert(
                "Não foi possível confirmar o cancelamento.\n\n"
                +
                obterMensagemErroUsuario(
                    erro
                )
            );
        }


    } finally {

        cancelamentoEmAndamento =
            false;


        atualizarControles();
    }
}


// ============================================================
// PROCESSAR UM ARQUIVO
// ============================================================

async function processarArquivo(
    item
) {

    const dados =
        new FormData();


    dados.append(
        "arquivos",
        item.arquivo
    );


    const controlador =
        new AbortController();


    controladorFetchAtual =
        controlador;


    let resposta;


    try {

        resposta =
            await fetch(
                "/transcrever",
                {
                    method:
                        "POST",

                    body:
                        dados,

                    signal:
                        controlador.signal
                }
            );


    } catch (erro) {

        if (
            erro.name ===
            "AbortError"
        ) {

            throw erro;
        }


        throw new Error(
            "Não foi possível se comunicar com o servidor. "
            +
            "Verifique se o aplicativo continua aberto "
            +
            "e tente novamente."
        );


    } finally {

        if (
            controladorFetchAtual ===
            controlador
        ) {

            controladorFetchAtual =
                null;
        }
    }


    let dadosResposta;


    try {

        dadosResposta =
            await resposta.json();

    } catch {

        throw new Error(
            "O servidor retornou uma resposta inválida."
        );
    }


    if (
        !resposta.ok
    ) {

        throw new Error(
            dadosResposta.mensagem
            ||
            "O servidor não conseguiu concluir a solicitação."
        );
    }


    if (
        dadosResposta.sucesso ===
        false
    ) {

        throw new Error(
            dadosResposta.mensagem
            ||
            "Não foi possível concluir a transcrição."
        );
    }


    if (
        !dadosResposta.resultados
        ||
        dadosResposta.resultados.length ===
        0
    ) {

        throw new Error(
            "Nenhum resultado foi retornado pelo servidor."
        );
    }


    return (
        dadosResposta.resultados[0]
    );
}


// ============================================================
// PROCESSAR FILA
// ============================================================

async function processarFila() {

    if (processando) {

        return;
    }


    if (
        !possuiArquivosAguardando()
    ) {

        return;
    }


    ocultarBotaoNovaTranscricao();


    // ========================================================
    // NOVA SESSÃO
    // ========================================================

    contadorSessao++;


    sessaoAtual =
        contadorSessao;


    arquivosSelecionados.forEach(
        item => {

            if (
                item.status ===
                "aguardando"
            ) {

                item.sessao =
                    sessaoAtual;
            }
        }
    );


    // ========================================================
    // NOVA EXECUÇÃO
    // ========================================================

    contadorExecucao++;


    const minhaExecucao =
        contadorExecucao;


    execucaoAtualId =
        minhaExecucao;


    processando =
        true;


    cancelamentoSolicitado =
        false;


    cancelamentoEmAndamento =
        false;


    pausaSolicitada =
        false;


    botaoPausar.textContent =
        "Pausar";


    painelProgresso.style.display =
        "block";


    estadoFila.textContent =
        "Processando";


    progressoTexto.textContent =
        "Processamento iniciado";


    atualizarControles();


    atualizarProgressoSessaoAtual();


    iniciarCronometroTotal();


    try {

        // ====================================================
        // FILA DINÂMICA
        //
        // Em vez de caminhar apenas por índice crescente,
        // procuramos sempre o próximo item "aguardando" da
        // sessão atual.
        //
        // Isso garante que:
        // - novos arquivos adicionados durante a execução
        //   sejam processados;
        // - arquivos com erro/cancelados que forem reativados
        //   não fiquem esquecidos caso estejam em uma posição
        //   anterior da lista.
        // ====================================================

        while (true) {

            if (
                execucaoAtualId !==
                minhaExecucao
            ) {

                break;
            }


            if (
                !processando
                ||
                cancelamentoSolicitado
            ) {

                break;
            }


            // =================================================
            // PAUSA ENTRE ARQUIVOS
            // =================================================

            await aguardarSePausado();


            if (
                execucaoAtualId !==
                minhaExecucao
            ) {

                break;
            }


            if (
                !processando
                ||
                cancelamentoSolicitado
            ) {

                break;
            }


            // =================================================
            // PROCURA O PRÓXIMO ARQUIVO AGUARDANDO
            // =================================================

            const indice =
                arquivosSelecionados.findIndex(
                    item =>
                        item.sessao ===
                        sessaoAtual
                        &&
                        item.status ===
                        "aguardando"
                );


            if (
                indice === -1
            ) {

                break;
            }


            const item =
                arquivosSelecionados[
                    indice
                ];


            indiceAtualProcessamento =
                indice;


            // =================================================
            // INÍCIO DO ARQUIVO
            // =================================================

            atualizarStatusLinha(
                item,
                "transcrevendo",
                "Transcrevendo..."
            );


            arquivoAtual.textContent =
                item.arquivo.name;


            progressoTexto.textContent =
                "Transcrevendo arquivo";


            estadoFila.textContent =
                "Processando";


            atualizarProgressoSessaoAtual();


            iniciarCronometroArquivo(
                item
            );


            try {

                const resultado =
                    await processarArquivo(
                        item
                    );


                pararCronometroArquivo();


                if (
                    execucaoAtualId !==
                    minhaExecucao
                ) {

                    break;
                }


                if (!processando) {

                    break;
                }


                // =============================================
                // CANCELADO PELO BACKEND
                // =============================================

                if (
                    resultado.cancelado
                ) {

                    atualizarStatusLinha(
                        item,
                        "cancelado",
                        "Cancelado"
                    );


                    atualizarProgressoSessaoAtual();


                    break;
                }


                // =============================================
                // SUCESSO
                // =============================================

                if (
                    resultado.sucesso
                ) {

                    item.erro =
                        "";


                    item.transcricao =
                        resultado.transcricao
                        ||
                        "";


                    item.arquivoDocx =
                        resultado.arquivo_docx
                        ||
                        null;


                    atualizarStatusLinha(
                        item,
                        "concluido",
                        "✓ Concluído"
                    );


                    const linha =
                        obterLinha(
                            item
                        );


                    const texto =
                        linha
                            ?
                            linha.querySelector(
                                ".texto-transcricao"
                            )
                            :
                            null;


                    const titulo =
                        linha
                            ?
                            linha.querySelector(
                                ".titulo-transcricao"
                            )
                            :
                            null;


                    if (titulo) {

                        titulo.textContent =
                            "Transcrição";
                    }


                    if (texto) {

                        texto.textContent =
                            item.transcricao;
                    }


                    criarAcoesConcluidas(
                        item
                    );


                } else {

                    throw new Error(
                        resultado.erro
                        ||
                        "Erro desconhecido."
                    );
                }


            } catch (erro) {

                pararCronometroArquivo();


                // =============================================
                // ABORT DO CANCELAMENTO
                // =============================================

                if (
                    erro.name ===
                    "AbortError"
                ) {

                    break;
                }


                // =============================================
                // EXECUÇÃO ANTIGA
                // =============================================

                if (
                    execucaoAtualId !==
                    minhaExecucao
                ) {

                    break;
                }


                if (!processando) {

                    break;
                }


                console.error(
                    `Erro ao processar ${item.arquivo.name}:`,
                    erro
                );


                const mensagemErro =
                    obterMensagemErroUsuario(
                        erro
                    );


                atualizarStatusLinha(
                    item,
                    "erro",
                    "✕ Erro"
                );


                mostrarErroArquivo(
                    item,
                    mensagemErro
                );


                progressoTexto.textContent =
                    "Um arquivo apresentou erro. "
                    +
                    "Continuando a fila...";
            }


            atualizarProgressoSessaoAtual();
        }


    } finally {

        controladorFetchAtual =
            null;


        pararCronometroArquivo();


        // ====================================================
        // EXECUÇÃO ANTIGA NÃO PODE ALTERAR A NOVA
        // ====================================================

        if (
            execucaoAtualId !==
            minhaExecucao
        ) {

            return;
        }


        if (!processando) {

            return;
        }


        // ====================================================
        // FINALIZAÇÃO NORMAL
        // ====================================================

        pararCronometroTotal(
            true
        );


        processando =
            false;


        pausaSolicitada =
            false;


        cancelamentoSolicitado =
            false;


        cancelamentoEmAndamento =
            false;


        indiceAtualProcessamento =
            -1;


        execucaoAtualId =
            null;


        botaoPausar.textContent =
            "Pausar";


        estadoFila.textContent =
            "Processamento concluído";


        mostrarResumoSessao(
            "Processamento concluído"
        );


        arquivoAtual.textContent =
            "Nenhum arquivo em processamento";


        atualizarControles();


        mostrarBotaoNovaTranscricao();
    }
}


// ============================================================
// RESETAR INTERFACE
// ============================================================

function resetarInterface() {

    pararCronometroArquivo();


    pararCronometroTotal(
        false
    );


    arquivosSelecionados =
        [];


    listaArquivos.innerHTML =
        "";


    inputArquivos.value =
        "";


    inputPasta.value =
        "";


    processando =
        false;


    pausaSolicitada =
        false;


    cancelamentoSolicitado =
        false;


    cancelamentoEmAndamento =
        false;


    indiceAtualProcessamento =
        -1;


    resolverPausa =
        null;


    controladorFetchAtual =
        null;


    sessaoAtual =
        null;


    execucaoAtualId =
        null;


    segundosTotaisFila =
        0;


    quantidadeFila.textContent =
        "0 arquivos";


    cabecalhoArquivos.style.display =
        "none";


    estadoFila.textContent =
        "Aguardando arquivos";


    progressoTexto.textContent =
        "Aguardando início";


    progressoContador.textContent =
        "0 de 0";


    barraProgressoPreenchimento.style.width =
        "0%";


    arquivoAtual.textContent =
        "Nenhum arquivo em processamento";


    cronometroAtual.textContent =
        "00:00";


    painelProgresso.style.display =
        "none";


    botaoPausar.textContent =
        "Pausar";


    ocultarBotaoNovaTranscricao();


    atualizarQuantidadeFila();


    atualizarControles();
}


// ============================================================
// LIMPAR LISTA
// ============================================================

function limparLista() {

    if (processando) {

        return;
    }


    resetarInterface();
}


// ============================================================
// NOVA TRANSCRIÇÃO
// ============================================================

function novaTranscricao() {

    if (processando) {

        return;
    }


    resetarInterface();


    estadoFila.textContent =
        "Aguardando novos arquivos";
}


// ============================================================
// ESCOLHER ARQUIVOS
// ============================================================

inputArquivos.addEventListener(
    "change",
    evento => {

        adicionarArquivos(
            evento.target.files
        );


        evento.target.value =
            "";
    }
);


// ============================================================
// ESCOLHER PASTA
// ============================================================

inputPasta.addEventListener(
    "change",
    evento => {

        adicionarArquivos(
            evento.target.files
        );


        evento.target.value =
            "";
    }
);


// ============================================================
// DRAG AND DROP
// ============================================================

uploadArea.addEventListener(
    "dragover",
    evento => {

        evento.preventDefault();


        uploadArea.classList.add(
            "arrastando"
        );
    }
);


uploadArea.addEventListener(
    "dragleave",
    evento => {

        evento.preventDefault();


        uploadArea.classList.remove(
            "arrastando"
        );
    }
);


uploadArea.addEventListener(
    "drop",
    evento => {

        evento.preventDefault();


        uploadArea.classList.remove(
            "arrastando"
        );


        adicionarArquivos(
            evento.dataTransfer.files
        );
    }
);


// ============================================================
// BOTÕES
// ============================================================

botaoTranscrever.addEventListener(
    "click",
    processarFila
);


botaoPausar.addEventListener(
    "click",
    alternarPausa
);


botaoCancelar.addEventListener(
    "click",
    cancelarProcessamento
);


botaoLimpar.addEventListener(
    "click",
    limparLista
);


botaoNovaTranscricao.addEventListener(
    "click",
    novaTranscricao
);


// ============================================================
// ESTADO INICIAL
// ============================================================

cabecalhoArquivos.style.display =
    "none";


painelProgresso.style.display =
    "none";


ocultarBotaoNovaTranscricao();


atualizarQuantidadeFila();


atualizarControles();