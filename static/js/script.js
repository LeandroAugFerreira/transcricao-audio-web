// ============================================================
// TRANSCRIÇÃO EM TEXTO
// FRONTEND PRINCIPAL
// ============================================================


// ============================================================
// ELEMENTOS DA INTERFACE
// ============================================================

const inputArquivos =
    document.getElementById("arquivos");

const inputPasta =
    document.getElementById("pasta-arquivos");


const botaoSelecionarUpload =
    document.getElementById(
        "botao-selecionar-upload"
    );




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
// WHISPER AI — VISUALIZADOR DINÂMICO
// ============================================================

let whisperAnimacaoId =
    null;

let whisperCanvasContexto =
    null;

let whisperCanvasLargura =
    0;

let whisperCanvasAltura =
    0;

let whisperCanvasDpr =
    1;

let whisperNos =
    [];

let whisperTempoAnterior =
    0;


function obterEstadoVisualWhisper() {

    if (
        cancelamentoEmAndamento
        ||
        cancelamentoSolicitado
    ) {

        return "cancelando";
    }


    if (
        processando
        &&
        pausaSolicitada
    ) {

        return "pausado";
    }


    if (
        processando
    ) {

        return "processando";
    }


    const resumo =
        obterResumoDashboard();


    if (
        resumo.total >
        0
        &&
        resumo.concluidos ===
            resumo.total
    ) {

        return "concluido";
    }


    return "aguardando";
}


function atualizarWhisperVisualizador() {

    if (
        !whisperCard
        ||
        !whisperStatusDinamico
    ) {

        return;
    }


    const estado =
        obterEstadoVisualWhisper();


    whisperCard.classList.remove(
        "whisper-estado-aguardando",
        "whisper-estado-processando",
        "whisper-estado-pausado",
        "whisper-estado-cancelando",
        "whisper-estado-concluido"
    );


    whisperCard.classList.add(
        `whisper-estado-${estado}`
    );


    const textos = {

        aguardando:
            "PRONTO • SMALL • CPU",

        processando:
            "PROCESSANDO • SMALL • CPU",

        pausado:
            "PAUSADO • SMALL • CPU",

        cancelando:
            "CANCELANDO • SMALL • CPU",

        concluido:
            "CONCLUÍDO • SMALL • CPU"
    };


    whisperStatusDinamico.textContent =
        textos[
            estado
        ]
        ||
        textos.aguardando;
}


function prepararWhisperCanvas() {

    if (
        !whisperNeuralCanvas
    ) {

        return false;
    }


    const retangulo =
        whisperNeuralCanvas.getBoundingClientRect();


    if (
        retangulo.width <=
            0
        ||
        retangulo.height <=
            0
    ) {

        return false;
    }


    const dpr =
        Math.min(
            window.devicePixelRatio
            ||
            1,
            2
        );


    const largura =
        Math.max(
            1,
            Math.floor(
                retangulo.width
                *
                dpr
            )
        );


    const altura =
        Math.max(
            1,
            Math.floor(
                retangulo.height
                *
                dpr
            )
        );


    if (
        whisperNeuralCanvas.width !==
            largura
        ||
        whisperNeuralCanvas.height !==
            altura
    ) {

        whisperNeuralCanvas.width =
            largura;


        whisperNeuralCanvas.height =
            altura;


        whisperCanvasContexto =
            whisperNeuralCanvas.getContext(
                "2d"
            );


        whisperCanvasDpr =
            dpr;


        whisperCanvasLargura =
            retangulo.width;


        whisperCanvasAltura =
            retangulo.height;


        criarNosWhisper();
    }


    return Boolean(
        whisperCanvasContexto
    );
}


function criarNosWhisper() {

    whisperNos =
        [];


    const quantidade =
        34;


    for (
        let indice =
            0;

        indice <
            quantidade;

        indice++
    ) {

        const angulo =
            (
                indice
                /
                quantidade
            )
            *
            Math.PI
            *
            2;


        const raioX =
            0.12
            +
            Math.random()
            *
            0.09;


        const raioY =
            0.24
            +
            Math.random()
            *
            0.20;


        whisperNos.push(
            {
                angulo:
                    angulo,

                raioX:
                    raioX,

                raioY:
                    raioY,

                fase:
                    Math.random()
                    *
                    Math.PI
                    *
                    2,

                velocidade:
                    0.22
                    +
                    Math.random()
                    *
                    0.28
            }
        );
    }
}


function corWhisper(
    proporcao,
    alpha
) {

    const t =
        Math.max(
            0,
            Math.min(
                1,
                proporcao
            )
        );


    const r =
        Math.round(
            25
            +
            122
            *
            t
        );


    const g =
        Math.round(
            222
            -
            112
            *
            t
        );


    const b =
        255;


    return (
        `rgba(${r}, ${g}, ${b}, ${alpha})`
    );
}


function desenharWhisperCanvas(
    tempo
) {

    if (
        !prepararWhisperCanvas()
    ) {

        whisperAnimacaoId =
            requestAnimationFrame(
                desenharWhisperCanvas
            );


        return;
    }


    const modoPerformance =
        hudPerformanceAtivo();


    const fpsAlvo =
        document.hidden
            ?
            2
            :
            modoPerformance
                ?
                24
                :
                processando
                    ?
                    30
                    :
                    12;


    const intervaloQuadro =
        1000
        /
        fpsAlvo;


    if (
        whisperTempoAnterior
        &&
        (
            tempo
            -
            whisperTempoAnterior
        )
        <
        intervaloQuadro
    ) {

        whisperAnimacaoId =
            requestAnimationFrame(
                desenharWhisperCanvas
            );


        return;
    }


    const ctx =
        whisperCanvasContexto;


    const largura =
        whisperCanvasLargura;


    const altura =
        whisperCanvasAltura;


    const dpr =
        whisperCanvasDpr;


    ctx.setTransform(
        dpr,
        0,
        0,
        dpr,
        0,
        0
    );


    ctx.clearRect(
        0,
        0,
        largura,
        altura
    );


    const estado =
        obterEstadoVisualWhisper();


    const ativo =
        estado ===
            "processando";


    const pausado =
        estado ===
            "pausado";


    const intensidade =
        ativo
            ?
            1
            :
            pausado
                ?
                0.34
                :
                0.20;


    const velocidade =
        ativo
            ?
            0.0045
            :
            pausado
                ?
                0.0007
                :
                0.0015;


    const tempoNormalizado =
        tempo
        *
        velocidade;


    /*
        WAVEFORM PRINCIPAL
    */

    const centroY =
        altura
        *
        0.53;


    const inicioX =
        largura
        *
        0.06;


    const fimX =
        largura
        *
        0.70;


    const quantidadeBarras =
        Math.max(
            44,
            Math.floor(
                largura
                /
                8
            )
        );


    const larguraDisponivel =
        fimX
        -
        inicioX;


    for (
        let indice =
            0;

        indice <
            quantidadeBarras;

        indice++
    ) {

        const proporcao =
            indice
            /
            (
                quantidadeBarras
                -
                1
            );


        const x =
            inicioX
            +
            proporcao
            *
            larguraDisponivel;


        const envelope =
            Math.pow(
                Math.sin(
                    Math.PI
                    *
                    proporcao
                ),
                0.62
            );


        const ondaA =
            Math.sin(
                tempoNormalizado
                *
                4.6
                +
                indice
                *
                0.63
            );


        const ondaB =
            Math.sin(
                tempoNormalizado
                *
                2.1
                -
                indice
                *
                0.31
            );


        const ondaC =
            Math.sin(
                tempoNormalizado
                *
                7.8
                +
                indice
                *
                0.17
            );


        const movimento =
            (
                Math.abs(
                    ondaA
                )
                *
                0.54
                +
                Math.abs(
                    ondaB
                )
                *
                0.30
                +
                Math.abs(
                    ondaC
                )
                *
                0.16
            );


        const base =
            4
            +
            envelope
            *
            altura
            *
            (
                0.10
                +
                intensidade
                *
                0.31
                *
                movimento
            );


        const cor =
            corWhisper(
                proporcao,
                0.86
            );


        ctx.beginPath();


        ctx.moveTo(
            x,
            centroY
            -
            base
        );


        ctx.lineTo(
            x,
            centroY
            +
            base
        );


        ctx.lineWidth =
            ativo
                ?
                2.5
                :
                1.8;


        ctx.lineCap =
            "round";


        ctx.strokeStyle =
            cor;


        ctx.shadowBlur =
            ativo
                ?
                10
                :
                5;


        ctx.shadowColor =
            cor;


        ctx.stroke();
    }


    /*
        LINHA CENTRAL LUMINOSA
    */

    const gradienteLinha =
        ctx.createLinearGradient(
            inicioX,
            0,
            fimX,
            0
        );


    gradienteLinha.addColorStop(
        0,
        "rgba(0, 220, 255, 0)"
    );


    gradienteLinha.addColorStop(
        0.30,
        "rgba(0, 220, 255, 0.38)"
    );


    gradienteLinha.addColorStop(
        0.68,
        "rgba(123, 70, 255, 0.34)"
    );


    gradienteLinha.addColorStop(
        1,
        "rgba(123, 70, 255, 0)"
    );


    ctx.beginPath();


    ctx.moveTo(
        inicioX,
        centroY
    );


    ctx.lineTo(
        fimX,
        centroY
    );


    ctx.lineWidth =
        1;


    ctx.strokeStyle =
        gradienteLinha;


    ctx.shadowBlur =
        8;


    ctx.shadowColor =
        "rgba(45, 204, 255, 0.48)";


    ctx.stroke();


    /*
        REDE NEURAL / CABEÇA ABSTRATA À DIREITA
    */

    const centroXNos =
        largura
        *
        0.84;


    const centroYNos =
        altura
        *
        0.50;


    const pontos =
        whisperNos.map(
            no => {

                const pulsacao =
                    1
                    +
                    Math.sin(
                        tempoNormalizado
                        *
                        no.velocidade
                        +
                        no.fase
                    )
                    *
                    (
                        ativo
                            ?
                            0.075
                            :
                            0.025
                    );


                return {
                    x:
                        centroXNos
                        +
                        Math.cos(
                            no.angulo
                        )
                        *
                        largura
                        *
                        no.raioX
                        *
                        pulsacao,

                    y:
                        centroYNos
                        +
                        Math.sin(
                            no.angulo
                        )
                        *
                        altura
                        *
                        no.raioY
                        *
                        pulsacao
                };
            }
        );


    for (
        let i =
            0;

        i <
            pontos.length;

        i++
    ) {

        for (
            let j =
                i + 1;

            j <
                pontos.length;

            j++
        ) {

            const dx =
                pontos[
                    i
                ].x
                -
                pontos[
                    j
                ].x;


            const dy =
                pontos[
                    i
                ].y
                -
                pontos[
                    j
                ].y;


            const distancia =
                Math.sqrt(
                    dx
                    *
                    dx
                    +
                    dy
                    *
                    dy
                );


            const limite =
                largura
                *
                0.10;


            if (
                distancia >
                limite
            ) {

                continue;
            }


            const alpha =
                (
                    1
                    -
                    distancia
                    /
                    limite
                )
                *
                (
                    ativo
                        ?
                        0.33
                        :
                        0.16
                );


            ctx.beginPath();


            ctx.moveTo(
                pontos[
                    i
                ].x,
                pontos[
                    i
                ].y
            );


            ctx.lineTo(
                pontos[
                    j
                ].x,
                pontos[
                    j
                ].y
            );


            ctx.lineWidth =
                0.7;


            ctx.strokeStyle =
                `rgba(76, 132, 255, ${alpha})`;


            ctx.shadowBlur =
                0;


            ctx.stroke();
        }
    }


    pontos.forEach(
        (
            ponto,
            indice
        ) => {

            const t =
                indice
                /
                Math.max(
                    1,
                    pontos.length
                    -
                    1
                );


            const cor =
                corWhisper(
                    0.45
                    +
                    t
                    *
                    0.55,
                    ativo
                        ?
                        0.92
                        :
                        0.55
                );


            ctx.beginPath();


            ctx.arc(
                ponto.x,
                ponto.y,
                ativo
                    ?
                    1.6
                    :
                    1.1,
                0,
                Math.PI
                *
                2
            );


            ctx.fillStyle =
                cor;


            ctx.shadowBlur =
                ativo
                    ?
                    9
                    :
                    4;


            ctx.shadowColor =
                cor;


            ctx.fill();
        }
    );


    /*
        ARCO QUE CONECTA WAVEFORM À REDE
    */

    ctx.beginPath();


    ctx.moveTo(
        largura
        *
        0.64,
        centroY
    );


    ctx.bezierCurveTo(
        largura
        *
        0.72,
        centroY
        -
        altura
        *
        0.25,

        largura
        *
        0.76,
        centroY
        +
        altura
        *
        0.22,

        largura
        *
        0.80,
        centroY
    );


    const gradienteConexao =
        ctx.createLinearGradient(
            largura
            *
            0.64,
            0,
            largura
            *
            0.82,
            0
        );


    gradienteConexao.addColorStop(
        0,
        "rgba(62, 223, 255, 0.65)"
    );


    gradienteConexao.addColorStop(
        1,
        "rgba(130, 73, 255, 0.72)"
    );


    ctx.lineWidth =
        ativo
            ?
            2
            :
            1.2;


    ctx.strokeStyle =
        gradienteConexao;


    ctx.shadowBlur =
        ativo
            ?
            11
            :
            5;


    ctx.shadowColor =
        "rgba(100, 94, 255, 0.45)";


    ctx.stroke();


    whisperTempoAnterior =
        tempo;


    whisperAnimacaoId =
        requestAnimationFrame(
            desenharWhisperCanvas
        );
}


function iniciarWhisperCanvas() {

    if (
        !whisperNeuralCanvas
    ) {

        return;
    }


    if (
        whisperAnimacaoId !==
        null
    ) {

        cancelAnimationFrame(
            whisperAnimacaoId
        );
    }


    whisperAnimacaoId =
        requestAnimationFrame(
            desenharWhisperCanvas
        );
}


// ============================================================
// DASHBOARD
// ============================================================

const kpiFila =
    document.getElementById(
        "kpi-fila"
    );

const kpiProcessando =
    document.getElementById(
        "kpi-processando"
    );

const kpiConcluidos =
    document.getElementById(
        "kpi-concluidos"
    );

const kpiPercentual =
    document.getElementById(
        "kpi-percentual"
    );

const kpiCircular =
    document.querySelector(
        ".kpi-circular"
    );

const tempoTotalDashboard =
    document.getElementById(
        "tempo-total-dashboard"
    );

const espacoTotalDashboard =
    document.getElementById(
        "espaco-total-dashboard"
    );

const arquivosTotalDashboard =
    document.getElementById(
        "arquivos-total-dashboard"
    );

const modeloDashboard =
    document.getElementById(
        "modelo-dashboard"
    );

const dispositivoDashboard =
    document.getElementById(
        "dispositivo-dashboard"
    );

const aceleracaoDashboard =
    document.getElementById(
        "aceleracao-dashboard"
    );

const statusTranscricaoPainel =
    document.getElementById(
        "status-transcricao-painel"
    );

const transcricaoPreview =
    document.getElementById(
        "transcricao-preview"
    );

const tituloTranscricaoPainel =
    document.querySelector(
        ".transcricao-card-cabecalho h3"
    );

const botaoExportarWord =
    document.getElementById(
        "botao-exportar-word"
    );

const indicadorNotificacao =
    document.querySelector(
        ".notificacao-indicador"
    );

const statusPonto =
    document.querySelector(
        ".status-ponto"
    );

const itensSidebar =
    document.querySelectorAll(
        ".sidebar-item"
    );

const botaoTema =
    document.getElementById(
        "botao-tema"
    );

const iconeTema =
    document.getElementById(
        "icone-tema"
    );

const metaThemeColor =
    document.querySelector(
        'meta[name="theme-color"]'
    );

const whisperCard =
    document.getElementById(
        "whisper-card"
    );

const whisperNeuralCanvas =
    document.getElementById(
        "whisper-neural-canvas"
    );

const whisperStatusDinamico =
    document.getElementById(
        "whisper-status-dinamico"
    );


// ============================================================
// HUD — MODO PERFORMANCE
// ============================================================

function hudPerformanceAtivo() {

    return (
        document.body.dataset.theme ===
            "hud"
        &&
        (
            processando
            ||
            cancelamentoEmAndamento
            ||
            cancelamentoSolicitado
        )
        &&
        !pausaSolicitada
    );
}


function atualizarModoPerformanceHud() {

    const ativo =
        hudPerformanceAtivo();


    document.body.classList.toggle(
        "hud-performance",
        ativo
    );


    /*
        O atributo abaixo também serve como indicação semântica
        e facilita futuras otimizações no CSS/JS.
    */

    document.body.dataset.performance =
        ativo
            ?
            "on"
            :
            "off";
}


// ============================================================
// TEMAS
// ============================================================

const CHAVE_TEMA =
    "transcricao-em-texto-tema";


const TEMAS_DISPONIVEIS = [
    "dark",
    "light",
    "hud"
];


const TEMA_CONFIGURACAO = {

    dark: {
        nome:
            "Escuro",

        icone:
            "☾",

        proximo:
            "Claro",

        corNavegador:
            "#06172d"
    },

    light: {
        nome:
            "Claro",

        icone:
            "☀",

        proximo:
            "HUD",

        corNavegador:
            "#eef5fb"
    },

    hud: {
        nome:
            "HUD",

        icone:
            "◈",

        proximo:
            "Escuro",

        corNavegador:
            "#061317"
    }
};


function obterTemaSalvo() {

    try {

        const salvo =
            localStorage.getItem(
                CHAVE_TEMA
            );


        if (
            TEMAS_DISPONIVEIS.includes(
                salvo
            )
        ) {

            return salvo;
        }

    } catch (
        erro
    ) {

        console.warn(
            "Não foi possível ler o tema salvo:",
            erro
        );
    }


    return "dark";
}


function atualizarBotaoTema(
    tema
) {

    const configuracao =
        TEMA_CONFIGURACAO[
            tema
        ]
        ||
        TEMA_CONFIGURACAO.dark;


    if (
        iconeTema
    ) {

        iconeTema.textContent =
            configuracao.icone;
    }


    if (
        botaoTema
    ) {

        botaoTema.title =
            (
                `Tema: ${configuracao.nome}`
                +
                ` • próximo: ${configuracao.proximo}`
            );


        botaoTema.setAttribute(
            "aria-label",
            (
                `Tema atual: ${configuracao.nome}. `
                +
                `Clique para alternar para ${configuracao.proximo}.`
            )
        );
    }


    if (
        metaThemeColor
    ) {

        metaThemeColor.setAttribute(
            "content",
            configuracao.corNavegador
        );
    }
}


function aplicarTema(
    tema,
    salvar = true
) {

    const temaValido =
        TEMAS_DISPONIVEIS.includes(
            tema
        )
            ?
            tema
            :
            "dark";


    document.body.dataset.theme =
        temaValido;


    atualizarBotaoTema(
        temaValido
    );


    atualizarModoPerformanceHud();


    if (
        salvar
    ) {

        try {

            localStorage.setItem(
                CHAVE_TEMA,
                temaValido
            );

        } catch (
            erro
        ) {

            console.warn(
                "Não foi possível salvar o tema:",
                erro
            );
        }
    }
}


function alternarTema() {

    const temaAtual =
        document.body.dataset.theme
        ||
        "dark";


    const indice =
        TEMAS_DISPONIVEIS.indexOf(
            temaAtual
        );


    const proximoIndice =
        (
            indice
            +
            1
        )
        %
        TEMAS_DISPONIVEIS.length;


    aplicarTema(
        TEMAS_DISPONIVEIS[
            proximoIndice
        ]
    );
}


function configurarTema() {

    aplicarTema(
        obterTemaSalvo(),
        false
    );


    if (
        botaoTema
    ) {

        botaoTema.addEventListener(
            "click",
            alternarTema
        );
    }
}


// ============================================================
// VIEWS
// ============================================================

const viewsDashboard =
    document.querySelectorAll(
        ".view-dashboard"
    );


// ============================================================
// HISTÓRICO
// ============================================================

const historicoTotalResumo =
    document.getElementById(
        "historico-total-resumo"
    );

const historicoTotal =
    document.getElementById(
        "historico-total"
    );

const botaoLimparHistorico =
    document.getElementById(
        "botao-limpar-historico"
    );

const historicoConcluidos =
    document.getElementById(
        "historico-concluidos"
    );

const historicoProcessando =
    document.getElementById(
        "historico-processando"
    );

const historicoErros =
    document.getElementById(
        "historico-erros"
    );

const buscaTranscricoes =
    document.getElementById(
        "busca-transcricoes"
    );

const filtrosHistorico =
    document.querySelectorAll(
        ".historico-filtro"
    );

const historicoTranscricoes =
    document.getElementById(
        "historico-transcricoes"
    );

const historicoVazio =
    document.getElementById(
        "historico-vazio"
    );

const historicoIrInicio =
    document.getElementById(
        "historico-ir-inicio"
    );


// ============================================================
// USUÁRIOS — ADMINISTRAÇÃO
// ============================================================

const usuariosTotalResumo =
    document.getElementById(
        "usuarios-total-resumo"
    );

const usuariosNovo =
    document.getElementById(
        "usuarios-novo"
    );

const usuariosBusca =
    document.getElementById(
        "usuarios-busca"
    );

const usuariosFeedback =
    document.getElementById(
        "usuarios-feedback"
    );

const usuariosLista =
    document.getElementById(
        "usuarios-lista"
    );

const usuariosVazio =
    document.getElementById(
        "usuarios-vazio"
    );

const usuarioModal =
    document.getElementById(
        "usuario-modal"
    );

const usuarioModalTitulo =
    document.getElementById(
        "usuario-modal-titulo"
    );

const usuarioModalFechar =
    document.getElementById(
        "usuario-modal-fechar"
    );

const usuarioForm =
    document.getElementById(
        "usuario-form"
    );

const usuarioFormId =
    document.getElementById(
        "usuario-form-id"
    );

const usuarioFormNome =
    document.getElementById(
        "usuario-form-nome"
    );

const usuarioFormEmail =
    document.getElementById(
        "usuario-form-email"
    );

const usuarioFormLogin =
    document.getElementById(
        "usuario-form-login"
    );

const usuarioFormPerfil =
    document.getElementById(
        "usuario-form-perfil"
    );

const usuarioFormAtivo =
    document.getElementById(
        "usuario-form-ativo"
    );

const usuarioFormSenha =
    document.getElementById(
        "usuario-form-senha"
    );

const usuarioFormSenhaLabel =
    document.getElementById(
        "usuario-form-senha-label"
    );

const usuarioFormSenhaAjuda =
    document.getElementById(
        "usuario-form-senha-ajuda"
    );

const usuarioFormFeedback =
    document.getElementById(
        "usuario-form-feedback"
    );

const usuarioFormAvisoProprio =
    document.getElementById(
        "usuario-form-aviso-proprio"
    );

const usuarioFormCancelar =
    document.getElementById(
        "usuario-form-cancelar"
    );

const usuarioFormSalvar =
    document.getElementById(
        "usuario-form-salvar"
    );

const usuarioAtualId =
    Number(
        document.body.dataset.usuarioId
        ||
        0
    );

let usuariosAdministracao =
    [];

let carregandoUsuarios =
    false;


// ============================================================
// FILA DEDICADA
// ============================================================

const filaDedicadaResumo =
    document.getElementById(
        "fila-dedicada-resumo"
    );

const filaDedicadaTotal =
    document.getElementById(
        "fila-dedicada-total"
    );

const filaDedicadaAguardando =
    document.getElementById(
        "fila-dedicada-aguardando"
    );

const filaDedicadaProcessando =
    document.getElementById(
        "fila-dedicada-processando"
    );

const filaDedicadaEncerrados =
    document.getElementById(
        "fila-dedicada-encerrados"
    );

const filaDedicadaArquivoAtual =
    document.getElementById(
        "fila-dedicada-arquivo-atual"
    );

const filaDedicadaTempo =
    document.getElementById(
        "fila-dedicada-tempo"
    );

const filaDedicadaProgressoTexto =
    document.getElementById(
        "fila-dedicada-progresso-texto"
    );

const filaDedicadaProgressoContador =
    document.getElementById(
        "fila-dedicada-progresso-contador"
    );

const filaDedicadaBarraPreenchimento =
    document.getElementById(
        "fila-dedicada-barra-preenchimento"
    );

const filaDedicadaLista =
    document.getElementById(
        "fila-dedicada-lista"
    );

const filaDedicadaVazia =
    document.getElementById(
        "fila-dedicada-vazia"
    );

const filaDedicadaIrInicio =
    document.getElementById(
        "fila-dedicada-ir-inicio"
    );

const filaDedicadaEstado =
    document.getElementById(
        "fila-dedicada-estado"
    );

const filaDedicadaIniciar =
    document.getElementById(
        "fila-dedicada-iniciar"
    );

const filaDedicadaPausar =
    document.getElementById(
        "fila-dedicada-pausar"
    );

const filaDedicadaCancelar =
    document.getElementById(
        "fila-dedicada-cancelar"
    );



// ============================================================
// CONFIGURAÇÕES
// ============================================================

const configConfirmarCancelamento =
    document.getElementById(
        "config-confirmar-cancelamento"
    );

const configAtualizarHistorico =
    document.getElementById(
        "config-atualizar-historico"
    );

const configRestaurarPadroes =
    document.getElementById(
        "config-restaurar-padroes"
    );

const configAbrirPasta =
    document.getElementById(
        "config-abrir-pasta"
    );

const configPastaSaida =
    document.getElementById(
        "config-pasta-saida"
    );

const configModelo =
    document.getElementById(
        "config-modelo"
    );

const configIdioma =
    document.getElementById(
        "config-idioma"
    );

const configProcessamento =
    document.getElementById(
        "config-processamento"
    );


// ============================================================
// ESTATÍSTICAS
// ============================================================

const estatTotalResumo =
    document.getElementById(
        "estat-total-resumo"
    );

const estatTotal =
    document.getElementById(
        "estat-total"
    );

const estatConcluidos =
    document.getElementById(
        "estat-concluidos"
    );

const estatTaxa =
    document.getElementById(
        "estat-taxa"
    );

const estatTempoTotal =
    document.getElementById(
        "estat-tempo-total"
    );

const estatTempoMedio =
    document.getElementById(
        "estat-tempo-medio"
    );

const estatVolumeTotal =
    document.getElementById(
        "estat-volume-total"
    );

const estatUltimaAtividade =
    document.getElementById(
        "estat-ultima-atividade"
    );

const estatStatusLista =
    document.getElementById(
        "estat-status-lista"
    );

const estatFormatosLista =
    document.getElementById(
        "estat-formatos-lista"
    );


// ============================================================
// SISTEMA
// ============================================================

const sidebarStatusGeral =
    document.getElementById(
        "sidebar-status-geral"
    );

const sidebarStatusWhisper =
    document.getElementById(
        "sidebar-status-whisper"
    );

const sidebarStatusFfmpeg =
    document.getElementById(
        "sidebar-status-ffmpeg"
    );

const sidebarStatusHistorico =
    document.getElementById(
        "sidebar-status-historico"
    );

const sidebarStatusModelo =
    document.getElementById(
        "sidebar-status-modelo"
    );

const sidebarPontoWhisper =
    document.getElementById(
        "sidebar-ponto-whisper"
    );

const sidebarPontoFfmpeg =
    document.getElementById(
        "sidebar-ponto-ffmpeg"
    );

const sidebarPontoHistorico =
    document.getElementById(
        "sidebar-ponto-historico"
    );

const sistemaWhisper =
    document.getElementById(
        "sistema-whisper"
    );

const sistemaFfmpeg =
    document.getElementById(
        "sistema-ffmpeg"
    );

const sistemaHistorico =
    document.getElementById(
        "sistema-historico"
    );

const sistemaVersao =
    document.getElementById(
        "sistema-versao"
    );

const sistemaModelo =
    document.getElementById(
        "sistema-modelo"
    );

const sistemaDispositivo =
    document.getElementById(
        "sistema-dispositivo"
    );

const sistemaModo =
    document.getElementById(
        "sistema-modo"
    );

const sistemaPastaTranscricoes =
    document.getElementById(
        "sistema-pasta-transcricoes"
    );

const sistemaCaminhoBanco =
    document.getElementById(
        "sistema-caminho-banco"
    );

const sistemaCaminhoFfmpeg =
    document.getElementById(
        "sistema-caminho-ffmpeg"
    );

const sistemaAtualizar =
    document.getElementById(
        "sistema-atualizar"
    );

const sistemaAbrirPasta =
    document.getElementById(
        "sistema-abrir-pasta"
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

let paginaAtualDashboard =
    "inicio";

let filtroHistoricoAtual =
    "todos";

let historicoPersistente = [];

let historicoCarregando = false;

let historicoErroCarregamento = "";

let intervaloAtualizacaoHistorico = null;

const INTERVALO_ATUALIZACAO_HISTORICO_MS =
    2500;

let contadorSessao = 0;

let sessaoAtual = null;

let contadorExecucao = 0;

let execucaoAtualId = null;

let controladorFetchAtual = null;

let intervaloCronometroArquivo = null;

let intervaloCronometroTotal = null;

let inicioCronometroArquivo = null;

let inicioCronometroTotal = null;

let segundosTotaisFila = 0;

let contadorIdentificador = 0;

let itemTranscricaoSelecionadoId = null;



// ============================================================
// PREFERÊNCIAS LOCAIS DA INTERFACE
// ============================================================

const CHAVE_CONFIGURACOES =
    "transcricao-em-texto-config-v1";


const CONFIGURACOES_PADRAO = {

    confirmarCancelamento:
        true,

    atualizarHistoricoAutomaticamente:
        true
};


function carregarConfiguracoesUsuario() {

    try {

        const salvo =
            localStorage.getItem(
                CHAVE_CONFIGURACOES
            );


        if (
            !salvo
        ) {

            return {
                ...CONFIGURACOES_PADRAO
            };
        }


        const dados =
            JSON.parse(
                salvo
            );


        return {

            confirmarCancelamento:
                dados.confirmarCancelamento !==
                    false,

            atualizarHistoricoAutomaticamente:
                dados.atualizarHistoricoAutomaticamente !==
                    false
        };

    } catch (
        erro
    ) {

        console.warn(
            "Não foi possível carregar as configurações locais:",
            erro
        );


        return {
            ...CONFIGURACOES_PADRAO
        };
    }
}


function salvarConfiguracoesUsuario() {

    try {

        localStorage.setItem(
            CHAVE_CONFIGURACOES,
            JSON.stringify(
                configuracoesUsuario
            )
        );

    } catch (
        erro
    ) {

        console.warn(
            "Não foi possível salvar as configurações locais:",
            erro
        );
    }
}


let configuracoesUsuario =
    carregarConfiguracoesUsuario();


let statusSistemaAtual =
    null;


// ============================================================
// FORMATOS
// ============================================================

const extensoesPermitidas = [
    ".mp3",
    ".mp4",
    ".wav",
    ".m4a"
];


// ============================================================
// ESTILO COMPLEMENTAR DA INTERFACE
// ============================================================

function configurarEstiloTabelaInicio() {

    const estilosAntigos = [
        "estilo-tabela-inicio-v2",
        "estilo-tabela-inicio-v3",
        "estilo-tabela-inicio-v4",
        "estilo-interface-v5"
    ];


    estilosAntigos.forEach(
        id => {

            const elemento =
                document.getElementById(
                    id
                );


            if (
                elemento
            ) {

                elemento.remove();
            }
        }
    );


    const estilo =
        document.createElement(
            "style"
        );


    estilo.id =
        "estilo-interface-v5";


    estilo.textContent =
        `

        /* =====================================================
           TABELA DE ARQUIVOS
           ===================================================== */

        .secao-fila,
        .lista-arquivos,
        .linha-arquivo {
            min-width: 0;
            max-width: 100%;
            box-sizing: border-box;
        }


        .secao-fila {
            overflow: hidden;
        }


        .lista-arquivos {
            overflow-x: hidden;
        }


        .linha-arquivo {
            width: 100%;
            overflow: hidden;
        }


        .cabecalho-arquivos,
        .linha-arquivo-principal {
            width: 100%;
            max-width: 100%;
            min-width: 0;

            box-sizing: border-box;

            display: grid;

            grid-template-columns:
                minmax(0, 2.15fr)
                minmax(0, 0.90fr)
                minmax(0, 0.90fr)
                minmax(0, 0.90fr)
                minmax(0, 1.20fr)
                minmax(0, 1.55fr);

            column-gap: 6px;

            align-items: center;

            padding-left: 12px;
            padding-right: 12px;
        }


        .linha-arquivo-principal {
            min-height: 58px;
        }


        .cabecalho-arquivos span {
            min-width: 0;
            max-width: 100%;

            box-sizing: border-box;

            display: flex;

            align-items: center;
            justify-content: center;

            overflow: hidden;

            text-align: center;

            white-space: nowrap;
        }


        .cabecalho-arquivos span:first-child {
            justify-content: flex-start;

            text-align: left;
        }


        .cabecalho-arquivos span:last-child {
            font-size: 10px;

            letter-spacing: 0.2px;
        }


        .linha-arquivo-principal > div {
            min-width: 0;
            max-width: 100%;

            box-sizing: border-box;

            overflow: hidden;
        }


        .nome-arquivo {
            display: flex;

            align-items: center;

            justify-content: flex-start;
        }


        .nome-arquivo strong {
            display: block;

            width: 100%;

            min-width: 0;

            overflow: hidden;

            white-space: nowrap;

            text-overflow: ellipsis;
        }


        .coluna-formato-fila {
            display: flex;

            align-items: center;

            justify-content: center;
        }


        .formato-fila-badge {
            width: auto;

            min-width: 0;

            max-width: 100%;

            height: 28px;

            padding: 0 7px;

            box-sizing: border-box;

            display: inline-flex;

            align-items: center;

            justify-content: center;

            gap: 5px;

            color: #9ed3ff;

            background: #0b2b50;

            border: 1px solid #285b91;

            border-radius: 7px;

            font-size: 10px;

            font-weight: 700;

            white-space: nowrap;
        }


        .formato-fila-icone {
            display: inline-flex;

            align-items: center;

            justify-content: center;

            flex-shrink: 0;

            color: #54ddff;

            font-size: 13px;

            line-height: 1;
        }


        .coluna-duracao-fila {
            display: flex;

            align-items: center;

            justify-content: center;

            color: #8dc7ed;

            font-family:
                Consolas,
                "Courier New",
                monospace;

            font-size: 11px;

            white-space: nowrap;
        }


        .duracao-carregando {
            color: #547c9f;
        }


        .coluna-tamanho-fila {
            display: flex;

            align-items: center;

            justify-content: center;

            color: #77a8d4;

            font-size: 11px;

            white-space: nowrap;
        }


        .coluna-status-fila {
            display: flex;

            align-items: center;

            justify-content: center;
        }


        .coluna-status-fila .status {
            max-width: 100%;

            box-sizing: border-box;

            display: inline-flex;

            align-items: center;

            justify-content: center;

            margin: 0 auto;

            white-space: nowrap;
        }


        .coluna-processamento-fila {
            display: flex;

            align-items: center;

            justify-content: center;

            color: #76a9d7;

            font-family:
                Consolas,
                "Courier New",
                monospace;

            font-size: 11px;

            white-space: nowrap;
        }


        /* =====================================================
           CANCELAR + EXPORTAR WORD
           MESMA LARGURA
           ===================================================== */

        .linha-acoes-principais-iguais {
            width: 100% !important;

            display: grid !important;

            grid-template-columns:
                minmax(0, 1fr)
                minmax(0, 1fr) !important;

            gap: 10px !important;

            box-sizing: border-box !important;
        }


        .linha-acoes-principais-iguais
        #botao-cancelar,
        .linha-acoes-principais-iguais
        #botao-exportar-word {
            width: 100% !important;

            min-width: 0 !important;

            max-width: none !important;

            margin: 0 !important;

            box-sizing: border-box !important;
        }


        /* =====================================================
           DESKTOP COMPACTO
           ===================================================== */

        @media (max-width: 1350px) {

            .cabecalho-arquivos,
            .linha-arquivo-principal {
                grid-template-columns:
                    minmax(0, 2fr)
                    minmax(0, 0.85fr)
                    minmax(0, 0.85fr)
                    minmax(0, 0.85fr)
                    minmax(0, 1.15fr)
                    minmax(0, 1.55fr);

                column-gap: 5px;

                padding-left: 10px;

                padding-right: 10px;
            }


            .cabecalho-arquivos {
                font-size: 10px;

                letter-spacing: 0.4px;
            }


            .cabecalho-arquivos span:last-child {
                font-size: 9px;
            }


            .formato-fila-badge {
                padding-left: 5px;

                padding-right: 5px;

                gap: 4px;

                font-size: 9px;
            }


            .coluna-duracao-fila,
            .coluna-tamanho-fila,
            .coluna-processamento-fila {
                font-size: 10px;
            }
        }


        /* =====================================================
           TABLET
           ===================================================== */

        @media (max-width: 900px) {

            .cabecalho-arquivos {
                display: none !important;
            }


            .linha-arquivo-principal {
                grid-template-columns:
                    minmax(0, 1fr)
                    auto;

                gap: 10px 14px;

                padding-left: 12px;

                padding-right: 12px;
            }


            .nome-arquivo {
                grid-column: 1 / -1;
            }


            .coluna-formato-fila {
                justify-content: flex-start;
            }


            .coluna-status-fila {
                justify-content: flex-end;
            }
        }


        /* =====================================================
           MOBILE
           ===================================================== */

        @media (max-width: 620px) {

            .cabecalho-arquivos {
                display: none !important;
            }


            .linha-arquivo-principal {
                grid-template-columns:
                    minmax(0, 1fr)
                    auto;

                gap: 10px 12px;

                padding-left: 10px;

                padding-right: 10px;
            }


            .nome-arquivo {
                grid-column: 1 / -1;
            }


            .coluna-formato-fila {
                grid-column: 1;

                justify-content: flex-start;
            }


            .coluna-status-fila {
                grid-column: 2;

                justify-content: flex-end;
            }


            .coluna-duracao-fila,
            .coluna-tamanho-fila,
            .coluna-processamento-fila {
                display: none;
            }


            .linha-acoes-principais-iguais {
                grid-template-columns:
                    1fr !important;
            }
        }
        `;


    document.head.appendChild(
        estilo
    );
}


// ============================================================
// CONFIGURAR LARGURA IGUAL DOS BOTÕES
// ============================================================

function configurarBotoesAcaoPrincipais() {

    if (
        !botaoCancelar
        ||
        !botaoExportarWord
    ) {

        return;
    }


    const paiCancelar =
        botaoCancelar.parentElement;


    const paiExportar =
        botaoExportarWord.parentElement;


    if (
        paiCancelar
        &&
        paiCancelar ===
        paiExportar
    ) {

        paiCancelar.classList.add(
            "linha-acoes-principais-iguais"
        );


        return;
    }


    /*
        Caso o HTML tenha wrappers individuais,
        procuramos um ancestral compartilhado.
    */

    let ancestralCancelar =
        paiCancelar;


    while (
        ancestralCancelar
    ) {

        if (
            ancestralCancelar.contains(
                botaoExportarWord
            )
        ) {

            ancestralCancelar.classList.add(
                "linha-acoes-principais-iguais"
            );


            break;
        }


        ancestralCancelar =
            ancestralCancelar.parentElement;
    }
}


// ============================================================
// CABEÇALHO DA FILA
// ============================================================

function configurarCabecalhoFilaInicio() {

    if (
        !cabecalhoArquivos
    ) {

        return;
    }


    cabecalhoArquivos.innerHTML =
        "";


    const titulos = [
        "NOME",
        "FORMATO",
        "DURAÇÃO",
        "TAMANHO",
        "STATUS",
        "PROCESSAMENTO"
    ];


    titulos.forEach(
        titulo => {

            const span =
                document.createElement(
                    "span"
                );


            span.textContent =
                titulo;


            cabecalhoArquivos.appendChild(
                span
            );
        }
    );
}


// ============================================================
// IDENTIFICADOR
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
// ID
// ============================================================

function criarIdLinha() {

    contadorIdentificador++;


    return (
        `arquivo-${Date.now()}-${contadorIdentificador}`
    );
}


// ============================================================
// FORMATO PERMITIDO
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
// TAMANHO
// ============================================================

function formatarTamanho(
    bytes
) {

    const valorBytes =
        Number(
            bytes
            ||
            0
        );


    if (
        valorBytes <=
        0
    ) {

        return "0 B";
    }


    const unidades = [
        "B",
        "KB",
        "MB",
        "GB"
    ];


    const indice =
        Math.min(

            Math.floor(
                Math.log(
                    valorBytes
                )
                /
                Math.log(
                    1024
                )
            ),

            unidades.length - 1
        );


    const valor =
        (
            valorBytes
            /
            Math.pow(
                1024,
                indice
            )
        ).toFixed(
            indice ===
            0
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
// TEMPO
// ============================================================

function formatarTempo(
    segundos
) {

    const total =
        Math.max(
            0,
            Math.floor(
                Number(
                    segundos
                    ||
                    0
                )
            )
        );


    const minutos =
        Math.floor(
            total / 60
        );


    const segundosRestantes =
        total % 60;


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


function formatarTempoLongo(
    segundos
) {

    const total =
        Math.max(
            0,
            Math.floor(
                Number(
                    segundos
                    ||
                    0
                )
            )
        );


    const horas =
        Math.floor(
            total / 3600
        );


    const minutos =
        Math.floor(
            (
                total % 3600
            )
            /
            60
        );


    const segundosRestantes =
        total % 60;


    return (
        String(
            horas
        ).padStart(
            2,
            "0"
        )
        +
        ":"
        +
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


function formatarDuracaoMidia(
    segundos
) {

    const valor =
        Number(
            segundos
        );


    if (
        !Number.isFinite(
            valor
        )
        ||
        valor <=
        0
    ) {

        return "—";
    }


    const total =
        Math.floor(
            valor
        );


    const horas =
        Math.floor(
            total / 3600
        );


    const minutos =
        Math.floor(
            (
                total % 3600
            )
            /
            60
        );


    const segundosRestantes =
        total % 60;


    if (
        horas >
        0
    ) {

        return (
            String(
                horas
            ).padStart(
                2,
                "0"
            )
            +
            ":"
            +
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
// FORMATO
// ============================================================

function obterFormatoArquivo(
    nomeArquivo
) {

    const nome =
        String(
            nomeArquivo
            ||
            ""
        ).toLowerCase();


    if (
        nome.endsWith(".mp3")
    ) {

        return "MP3";
    }


    if (
        nome.endsWith(".wav")
    ) {

        return "WAV";
    }


    if (
        nome.endsWith(".mp4")
    ) {

        return "MP4";
    }


    if (
        nome.endsWith(".m4a")
    ) {

        return "M4A";
    }


    return "ARQ";
}


function obterIconeFormato(
    formato
) {

    const icones = {

        MP3:
            "♫",

        WAV:
            "≋",

        MP4:
            "▶",

        M4A:
            "◈"
    };


    return (
        icones[
            formato
        ]
        ||
        "▣"
    );
}


function criarBadgeFormato(
    nomeArquivo
) {

    const formato =
        obterFormatoArquivo(
            nomeArquivo
        );


    const badge =
        document.createElement(
            "span"
        );


    badge.className =
        "formato-fila-badge";


    const icone =
        document.createElement(
            "span"
        );


    icone.className =
        "formato-fila-icone";


    icone.textContent =
        obterIconeFormato(
            formato
        );


    const texto =
        document.createElement(
            "span"
        );


    texto.textContent =
        formato;


    badge.appendChild(
        icone
    );


    badge.appendChild(
        texto
    );


    return badge;
}


// ============================================================
// DURAÇÃO DA MÍDIA
// ============================================================

function obterDuracaoArquivo(
    arquivo
) {

    return new Promise(
        resolve => {

            if (
                !arquivo
            ) {

                resolve(
                    null
                );


                return;
            }


            const formato =
                obterFormatoArquivo(
                    arquivo.name
                );


            const elemento =
                document.createElement(

                    formato ===
                    "MP4"
                        ?
                        "video"
                        :
                        "audio"
                );


            const url =
                URL.createObjectURL(
                    arquivo
                );


            let finalizado =
                false;


            const finalizar =
                valor => {

                    if (
                        finalizado
                    ) {

                        return;
                    }


                    finalizado =
                        true;


                    try {

                        URL.revokeObjectURL(
                            url
                        );

                    } catch {

                    }


                    try {

                        elemento.removeAttribute(
                            "src"
                        );


                        elemento.load();

                    } catch {

                    }


                    resolve(
                        valor
                    );
                };


            elemento.preload =
                "metadata";


            elemento.onloadedmetadata =
                () => {

                    const duracao =
                        Number(
                            elemento.duration
                        );


                    if (
                        Number.isFinite(
                            duracao
                        )
                        &&
                        duracao >
                        0
                    ) {

                        finalizar(
                            duracao
                        );

                    } else {

                        finalizar(
                            null
                        );
                    }
                };


            elemento.onerror =
                () => {

                    finalizar(
                        null
                    );
                };


            elemento.src =
                url;


            try {

                elemento.load();

            } catch {

                finalizar(
                    null
                );
            }


            setTimeout(
                () => {

                    finalizar(
                        null
                    );

                },
                10000
            );
        }
    );
}


function atualizarDuracaoLinha(
    item
) {

    const linha =
        obterLinha(
            item
        );


    if (
        !linha
    ) {

        return;
    }


    const coluna =
        linha.querySelector(
            ".coluna-duracao-fila"
        );


    if (
        !coluna
    ) {

        return;
    }


    coluna.classList.remove(
        "duracao-carregando"
    );


    if (
        item.duracaoCarregando
    ) {

        coluna.textContent =
            "Lendo...";


        coluna.classList.add(
            "duracao-carregando"
        );


        return;
    }


    coluna.textContent =
        formatarDuracaoMidia(
            item.duracao
        );
}


async function carregarDuracaoItem(
    item
) {

    if (
        !item
        ||
        !item.arquivo
    ) {

        return;
    }


    item.duracaoCarregando =
        true;


    atualizarDuracaoLinha(
        item
    );


    const duracao =
        await obterDuracaoArquivo(
            item.arquivo
        );


    item.duracao =
        duracao;


    item.duracaoCarregando =
        false;


    atualizarDuracaoLinha(
        item
    );
}


// ============================================================
// RESUMO DO DASHBOARD
// ============================================================

function obterResumoDashboard() {

    const total =
        arquivosSelecionados.length;


    const concluidos =
        arquivosSelecionados.filter(
            item =>
                item.status ===
                "concluido"
        ).length;


    const erros =
        arquivosSelecionados.filter(
            item =>
                item.status ===
                "erro"
        ).length;


    const cancelados =
        arquivosSelecionados.filter(
            item =>
                item.status ===
                "cancelado"
        ).length;


    const aguardando =
        arquivosSelecionados.filter(
            item =>
                item.status ===
                "aguardando"
        ).length;


    const transcrevendo =
        arquivosSelecionados.filter(
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
            total,

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
// ÚLTIMO ITEM
// ============================================================

function obterUltimoItem(
    condicao
) {

    for (
        let indice =
            arquivosSelecionados.length - 1;

        indice >= 0;

        indice--
    ) {

        const item =
            arquivosSelecionados[
                indice
            ];


        if (
            condicao(
                item
            )
        ) {

            return item;
        }
    }


    return null;
}


// ============================================================
// TRANSCRIÇÃO SELECIONADA MANUALMENTE
// ============================================================

function obterItemTranscricaoSelecionado() {

    if (
        !itemTranscricaoSelecionadoId
    ) {

        return null;
    }


    const item =
        arquivosSelecionados.find(
            arquivo =>
                arquivo.id ===
                itemTranscricaoSelecionadoId
        );


    if (
        !item
        ||
        item.status !==
            "concluido"
    ) {

        itemTranscricaoSelecionadoId =
            null;


        return null;
    }


    return item;
}


function atualizarSelecaoVisualTranscricao() {

    arquivosSelecionados.forEach(
        item => {

            const linha =
                obterLinha(
                    item
                );


            if (
                !linha
            ) {

                return;
            }


            const disponivel =
                item.status ===
                    "concluido"
                &&
                Boolean(
                    item.transcricao
                );


            const selecionado =
                disponivel
                &&
                item.id ===
                    itemTranscricaoSelecionadoId;


            linha.classList.toggle(
                "linha-transcricao-disponivel",
                disponivel
            );


            linha.classList.toggle(
                "linha-transcricao-selecionada",
                selecionado
            );


            linha.setAttribute(
                "aria-selected",
                selecionado
                    ?
                    "true"
                    :
                    "false"
            );


            if (
                disponivel
            ) {

                linha.tabIndex =
                    0;


                linha.title =
                    selecionado
                        ?
                        "Transcrição exibida. Clique novamente para voltar ao acompanhamento automático."
                        :
                        "Clique para visualizar a transcrição deste arquivo.";

            } else {

                linha.removeAttribute(
                    "tabindex"
                );


                linha.removeAttribute(
                    "title"
                );
            }
        }
    );
}


function selecionarTranscricaoDaFila(
    item
) {

    if (
        !item
        ||
        item.status !==
            "concluido"
        ||
        !item.transcricao
    ) {

        return;
    }


    if (
        itemTranscricaoSelecionadoId ===
        item.id
    ) {

        itemTranscricaoSelecionadoId =
            null;

    } else {

        itemTranscricaoSelecionadoId =
            item.id;
    }


    atualizarSelecaoVisualTranscricao();


    atualizarPainelTranscricao();
}


// ============================================================
// ITEM PRINCIPAL
// ============================================================

function obterItemPainelTranscricao() {

    const atual =
        obterUltimoItem(
            item =>
                item.status ===
                "transcrevendo"
                ||
                item.status ===
                "cancelando"
        );


    if (
        atual
    ) {

        return atual;
    }


    const concluido =
        obterUltimoItem(
            item =>
                item.status ===
                "concluido"
        );


    if (
        concluido
    ) {

        return concluido;
    }


    const erro =
        obterUltimoItem(
            item =>
                item.status ===
                "erro"
        );


    if (
        erro
    ) {

        return erro;
    }


    const cancelado =
        obterUltimoItem(
            item =>
                item.status ===
                "cancelado"
        );


    if (
        cancelado
    ) {

        return cancelado;
    }


    return obterUltimoItem(
        item =>
            item.status ===
            "aguardando"
    );
}


// ============================================================
// COR DO STATUS
// ============================================================

function atualizarCorStatusPainel(
    status
) {

    if (
        !statusPonto
    ) {

        return;
    }


    const cores = {

        aguardando:
            "#34e5a1",

        transcrevendo:
            "#3ee7ff",

        concluido:
            "#34e5a1",

        erro:
            "#ff4864",

        cancelando:
            "#ffbd4a",

        cancelado:
            "#9aa9bd"
    };


    const cor =
        cores[
            status
        ]
        ||
        "#34e5a1";


    statusPonto.style.background =
        cor;


    statusPonto.style.boxShadow =
        `0 0 10px ${cor}`;
}


// ============================================================
// PAINEL DE TRANSCRIÇÃO
// ============================================================

function atualizarPainelTranscricao(
    itemPreferencial = null
) {

    if (
        !statusTranscricaoPainel
        ||
        !transcricaoPreview
    ) {

        return;
    }


    const itemSelecionado =
        obterItemTranscricaoSelecionado();


    const item =
        itemSelecionado
        ||
        itemPreferencial
        ||
        obterItemPainelTranscricao();


    const selecaoManual =
        Boolean(
            itemSelecionado
        );


    atualizarSelecaoVisualTranscricao();


    transcricaoPreview.innerHTML =
        "";


    const tempo =
        document.createElement(
            "span"
        );


    tempo.className =
        "transcricao-tempo-preview";


    const texto =
        document.createElement(
            "p"
        );


    if (
        tituloTranscricaoPainel
    ) {

        if (
            selecaoManual
            &&
            item
            &&
            item.arquivo
        ) {

            tituloTranscricaoPainel.textContent =
                `Transcrição • ${item.arquivo.name}`;


            tituloTranscricaoPainel.title =
                item.arquivo.name;

        } else {

            tituloTranscricaoPainel.textContent =
                "Transcrição";


            tituloTranscricaoPainel.removeAttribute(
                "title"
            );
        }
    }


    if (
        !item
    ) {

        statusTranscricaoPainel.textContent =
            "Aguardando...";


        atualizarCorStatusPainel(
            "aguardando"
        );


        tempo.textContent =
            "[00:00:00]";


        texto.textContent =
            "Adicione um arquivo para iniciar uma nova transcrição.";

    } else {

        tempo.textContent =
            `[${formatarTempoLongo(
                item.tempo
                ||
                0
            )}]`;


        atualizarCorStatusPainel(
            item.status
        );


        if (
            item.status ===
            "transcrevendo"
        ) {

            statusTranscricaoPainel.textContent =
                "Processando...";


            texto.textContent =
                (
                    `Transcrevendo ${item.arquivo.name}. `
                    +
                    "O texto será exibido aqui assim que o Whisper concluir o processamento."
                );

        } else if (
            item.status ===
            "cancelando"
        ) {

            statusTranscricaoPainel.textContent =
                "Cancelando...";


            texto.textContent =
                `Encerrando o processamento de ${item.arquivo.name}.`;

        } else if (
            item.status ===
            "concluido"
        ) {

            statusTranscricaoPainel.textContent =
                "Concluído";


            texto.textContent =
                item.transcricao
                ||
                "Transcrição concluída.";

        } else if (
            item.status ===
            "erro"
        ) {

            statusTranscricaoPainel.textContent =
                "Erro";


            texto.textContent =
                item.erro
                ||
                "O arquivo apresentou um erro durante o processamento.";

        } else if (
            item.status ===
            "cancelado"
        ) {

            statusTranscricaoPainel.textContent =
                "Cancelado";


            texto.textContent =
                `O processamento de ${item.arquivo.name} foi cancelado.`;

        } else {

            statusTranscricaoPainel.textContent =
                "Aguardando...";


            texto.textContent =
                `${item.arquivo.name} está aguardando processamento.`;
        }
    }


    transcricaoPreview.appendChild(
        tempo
    );


    transcricaoPreview.appendChild(
        texto
    );


    if (
        item
        &&
        (
            item.status ===
            "transcrevendo"
            ||
            item.status ===
            "cancelando"
        )
    ) {

        const cursor =
            document.createElement(
                "span"
            );


        cursor.className =
            "cursor-transcricao";


        transcricaoPreview.appendChild(
            cursor
        );
    }
}


// ============================================================
// TEMPO TOTAL
// ============================================================

function atualizarTempoTotalDashboard() {

    if (
        !tempoTotalDashboard
    ) {

        return;
    }


    tempoTotalDashboard.textContent =
        formatarTempoLongo(
            segundosTotaisFila
        );
}


// ============================================================
// WORD
// ============================================================

function obterUltimoDocumentoWord() {

    return obterUltimoItem(
        item =>
            item.status ===
                "concluido"
            &&
            Boolean(
                item.arquivoDocx
            )
    );
}


function atualizarBotaoExportarWord() {

    if (
        !botaoExportarWord
    ) {

        return;
    }


    const item =
        obterUltimoDocumentoWord();


    botaoExportarWord.disabled =
        !item;


    if (
        item
    ) {

        botaoExportarWord.title =
            `Baixar ${item.arquivoDocx}`;

    } else {

        botaoExportarWord.title =
            "Conclua uma transcrição para liberar a exportação.";
    }
}


function exportarUltimoWord() {

    const item =
        obterUltimoDocumentoWord();


    if (
        !item
        ||
        !item.arquivoDocx
    ) {

        return;
    }


    const link =
        document.createElement(
            "a"
        );


    link.href =
        `/download/${encodeURIComponent(
            item.arquivoDocx
        )}`;


    link.style.display =
        "none";


    document.body.appendChild(
        link
    );


    link.click();


    link.remove();
}


// ============================================================
// DASHBOARD
// ============================================================

function atualizarDashboard(
    itemPainel = null
) {

    const resumo =
        obterResumoDashboard();


    if (
        kpiFila
    ) {

        kpiFila.textContent =
            resumo.total;
    }


    if (
        kpiProcessando
    ) {

        kpiProcessando.textContent =
            resumo.transcrevendo;
    }


    if (
        kpiConcluidos
    ) {

        kpiConcluidos.textContent =
            resumo.concluidos;
    }


    let percentual =
        0;


    if (
        resumo.total >
        0
    ) {

        percentual =
            Math.round(
                (
                    resumo.encerrados
                    /
                    resumo.total
                )
                *
                100
            );
    }


    percentual =
        Math.max(
            0,
            Math.min(
                100,
                percentual
            )
        );


    if (
        kpiPercentual
    ) {

        kpiPercentual.textContent =
            `${percentual}%`;
    }


    if (
        kpiCircular
    ) {

        const angulo =
            percentual * 3.6;


        kpiCircular.style.background =
            (
                "radial-gradient(circle at center, #08172d 56%, transparent 58%), "
                +
                `conic-gradient(#49e2ff 0deg, #4a8fff ${angulo}deg, rgba(67, 105, 164, 0.22) ${angulo}deg)`
            );
    }


    const totalBytes =
        arquivosSelecionados.reduce(

            (
                acumulado,
                item
            ) =>
                acumulado
                +
                (
                    item.arquivo
                        ?
                        item.arquivo.size
                        :
                        0
                ),

            0
        );


    if (
        espacoTotalDashboard
    ) {

        espacoTotalDashboard.textContent =
            totalBytes ===
            0
                ?
                "0 MB"
                :
                formatarTamanho(
                    totalBytes
                );
    }


    if (
        arquivosTotalDashboard
    ) {

        arquivosTotalDashboard.textContent =
            resumo.total ===
            1
                ?
                "em 1 arquivo"
                :
                `em ${resumo.total} arquivos`;
    }


    if (
        modeloDashboard
    ) {

        modeloDashboard.textContent =
            "Whisper small";
    }


    if (
        dispositivoDashboard
    ) {

        dispositivoDashboard.textContent =
            "CPU";
    }


    if (
        aceleracaoDashboard
    ) {

        aceleracaoDashboard.textContent =
            "Processamento local";
    }


    if (
        indicadorNotificacao
    ) {

        indicadorNotificacao.textContent =
            resumo.erros
            +
            resumo.cancelados;
    }


    atualizarTempoTotalDashboard();


    atualizarModoPerformanceHud();


    atualizarWhisperVisualizador();


    atualizarBotaoExportarWord();


    atualizarPainelTranscricao(
        itemPainel
    );


    atualizarFilaDedicada();


    if (
        paginaAtualDashboard ===
        "transcricoes"
    ) {

        atualizarHistoricoTranscricoes();
    }
}


// ============================================================
// STATUS
// ============================================================

function obterTextoStatusHistorico(
    status
) {

    const textos = {

        aguardando:
            "Aguardando",

        transcrevendo:
            "Transcrevendo...",

        concluido:
            "✓ Concluído",

        erro:
            "✕ Erro",

        cancelando:
            "Cancelando...",

        cancelado:
            "Cancelado"
    };


    return (
        textos[
            status
        ]
        ||
        status
        ||
        "Aguardando"
    );
}


// ============================================================
// HISTÓRICO
// ============================================================

function criarArquivoVirtualHistorico(
    nome,
    tamanhoBytes
) {

    return {

        name:
            nome
            ||
            "Arquivo",

        size:
            Number(
                tamanhoBytes
                ||
                0
            )
    };
}


function normalizarRegistroHistorico(
    registro
) {

    const historicoId =
        Number(
            registro.id
        );


    return {

        id:
            `historico-${historicoId}`,

        historicoId:
            historicoId,

        arquivo:
            criarArquivoVirtualHistorico(
                registro.arquivo,
                registro.tamanho_bytes
            ),

        status:
            registro.status
            ||
            "erro",

        tempo:
            Number(
                registro.tempo
                ||
                0
            ),

        transcricao:
            registro.transcricao
            ||
            "",

        arquivoDocx:
            (
                registro.download_disponivel
                &&
                registro.arquivo_docx
            )
                ?
                registro.arquivo_docx
                :
                null,

        erro:
            registro.erro
            ||
            "",

        criadoEm:
            registro.criado_em
            ||
            "",

        atualizadoEm:
            registro.atualizado_em
            ||
            "",

        origemHistorico:
            "persistente"
    };
}


function normalizarItemFilaParaHistorico(
    item
) {

    return {

        id:
            `fila-${item.id}`,

        historicoId:
            item.historicoId
            ||
            null,

        arquivo:
            criarArquivoVirtualHistorico(

                item.arquivo
                    ?
                    item.arquivo.name
                    :
                    "Arquivo",

                item.arquivo
                    ?
                    item.arquivo.size
                    :
                    0
            ),

        status:
            item.status
            ||
            "aguardando",

        tempo:
            Number(
                item.tempo
                ||
                0
            ),

        transcricao:
            item.transcricao
            ||
            "",

        arquivoDocx:
            item.arquivoDocx
            ||
            null,

        erro:
            item.erro
            ||
            "",

        origemHistorico:
            "sessao"
    };
}


function obterItensHistoricoParaExibicao() {

    const persistentes =
        historicoPersistente.map(
            item => ({

                ...item,

                arquivo: {
                    ...item.arquivo
                }
            })
        );


    const temporarios =
        [];


    const indicesUsados =
        new Set();


    arquivosSelecionados.forEach(
        itemLocal => {

            const nome =
                itemLocal.arquivo
                    ?
                    itemLocal.arquivo.name
                    :
                    "";


            if (
                !nome
            ) {

                return;
            }


            if (
                itemLocal.status ===
                "aguardando"
            ) {

                temporarios.push(
                    normalizarItemFilaParaHistorico(
                        itemLocal
                    )
                );


                return;
            }


            let indiceCorrespondente =
                -1;


            if (
                itemLocal.historicoId !==
                    null
                &&
                itemLocal.historicoId !==
                    undefined
            ) {

                indiceCorrespondente =
                    persistentes.findIndex(

                        (
                            item,
                            indice
                        ) =>
                            !indicesUsados.has(
                                indice
                            )
                            &&
                            Number(
                                item.historicoId
                            )
                            ===
                            Number(
                                itemLocal.historicoId
                            )
                    );
            }


            if (
                indiceCorrespondente ===
                -1
            ) {

                indiceCorrespondente =
                    persistentes.findIndex(

                        (
                            item,
                            indice
                        ) =>
                            !indicesUsados.has(
                                indice
                            )
                            &&
                            item.arquivo
                            &&
                            item.arquivo.name ===
                                nome
                            &&
                            item.status ===
                                "transcrevendo"
                    );
            }


            if (
                indiceCorrespondente >=
                0
            ) {

                indicesUsados.add(
                    indiceCorrespondente
                );


                const atual =
                    persistentes[
                        indiceCorrespondente
                    ];


                persistentes[
                    indiceCorrespondente
                ] = {

                    ...atual,

                    status:
                        itemLocal.status,

                    tempo:
                        Number(
                            itemLocal.tempo
                            ||
                            atual.tempo
                            ||
                            0
                        ),

                    transcricao:
                        itemLocal.transcricao
                        ||
                        atual.transcricao
                        ||
                        "",

                    arquivoDocx:
                        itemLocal.arquivoDocx
                        ||
                        atual.arquivoDocx
                        ||
                        null,

                    erro:
                        itemLocal.erro
                        ||
                        atual.erro
                        ||
                        ""
                };


                return;
            }


            const deveAdicionar =
                (
                    itemLocal.status ===
                        "transcrevendo"
                    ||
                    itemLocal.status ===
                        "cancelando"
                    ||
                    (
                        itemLocal.historicoId !==
                            null
                        &&
                        itemLocal.historicoId !==
                            undefined
                    )
                );


            if (
                deveAdicionar
            ) {

                temporarios.push(
                    normalizarItemFilaParaHistorico(
                        itemLocal
                    )
                );
            }
        }
    );


    return [
        ...temporarios,
        ...persistentes
    ];
}


async function carregarHistoricoPersistente(
    opcoes = {}
) {

    const silencioso =
        Boolean(
            opcoes.silencioso
        );


    if (
        historicoCarregando
    ) {

        return;
    }


    historicoCarregando =
        true;


    if (
        !silencioso
    ) {

        atualizarHistoricoTranscricoes();
    }


    try {

        const resposta =
            await fetch(
                "/historico",
                {
                    method:
                        "GET",

                    cache:
                        "no-store",

                    headers: {
                        Accept:
                            "application/json"
                    }
                }
            );


        let dados;


        try {

            dados =
                await resposta.json();

        } catch {

            throw new Error(
                "O servidor retornou uma resposta inválida ao carregar o histórico."
            );
        }


        if (
            !resposta.ok
            ||
            dados.sucesso ===
                false
        ) {

            throw new Error(
                dados.mensagem
                ||
                "Não foi possível carregar o histórico."
            );
        }


        const registros =
            Array.isArray(
                dados.registros
            )
                ?
                dados.registros
                :
                [];


        historicoPersistente =
            registros.map(
                normalizarRegistroHistorico
            );


        historicoErroCarregamento =
            "";

    } catch (
        erro
    ) {

        console.error(
            "Erro ao carregar histórico:",
            erro
        );


        historicoErroCarregamento =
            erro.message
            ||
            "Não foi possível carregar o histórico.";

    } finally {

        historicoCarregando =
            false;


        atualizarHistoricoTranscricoes();


        if (
            paginaAtualDashboard ===
            "estatisticas"
        ) {

            atualizarEstatisticas();
        }
    }
}


async function limparHistoricoPersistente() {

    if (
        !botaoLimparHistorico
    ) {

        return;
    }


    if (
        processando
        ||
        cancelamentoEmAndamento
    ) {

        alert(
            "Aguarde o processamento atual terminar antes de limpar o histórico."
        );


        return;
    }


    if (
        historicoPersistente.length ===
        0
    ) {

        return;
    }


    const confirmado =
        window.confirm(
            "Deseja realmente limpar todo o histórico salvo?\n\n"
            +
            "Esta ação remove os registros do histórico, mas NÃO apaga os arquivos Word já gerados."
        );


    if (
        !confirmado
    ) {

        return;
    }


    const textoOriginal =
        botaoLimparHistorico.innerHTML;


    botaoLimparHistorico.disabled =
        true;


    botaoLimparHistorico.textContent =
        "Limpando...";


    try {

        const resposta =
            await fetch(
                "/historico",
                {
                    method:
                        "DELETE",

                    cache:
                        "no-store",

                    headers: {
                        Accept:
                            "application/json"
                    }
                }
            );


        let dados;


        try {

            dados =
                await resposta.json();

        } catch {

            throw new Error(
                "O servidor retornou uma resposta inválida ao limpar o histórico."
            );
        }


        if (
            !resposta.ok
            ||
            dados.sucesso ===
                false
        ) {

            throw new Error(
                dados.mensagem
                ||
                "Não foi possível limpar o histórico."
            );
        }


        historicoPersistente =
            [];


        historicoErroCarregamento =
            "";


        atualizarHistoricoTranscricoes();


        atualizarEstatisticas();


        alert(
            dados.removidos ===
                1
                ?
                "1 registro foi removido do histórico."
                :
                `${dados.removidos || 0} registros foram removidos do histórico.`
        );

    } catch (
        erro
    ) {

        console.error(
            "Erro ao limpar histórico:",
            erro
        );


        alert(
            erro.message
            ||
            "Não foi possível limpar o histórico."
        );

    } finally {

        botaoLimparHistorico.innerHTML =
            textoOriginal;


        atualizarHistoricoTranscricoes();
    }
}


function pararAtualizacaoAutomaticaHistorico() {

    if (
        intervaloAtualizacaoHistorico !==
        null
    ) {

        clearInterval(
            intervaloAtualizacaoHistorico
        );


        intervaloAtualizacaoHistorico =
            null;
    }
}


function iniciarAtualizacaoAutomaticaHistorico() {

    pararAtualizacaoAutomaticaHistorico();


    if (
        !configuracoesUsuario
            .atualizarHistoricoAutomaticamente
    ) {

        return;
    }


    intervaloAtualizacaoHistorico =
        setInterval(

            () => {

                if (
                    paginaAtualDashboard !==
                    "transcricoes"
                ) {

                    pararAtualizacaoAutomaticaHistorico();


                    return;
                }


                carregarHistoricoPersistente(
                    {
                        silencioso:
                            true
                    }
                );
            },

            INTERVALO_ATUALIZACAO_HISTORICO_MS
        );
}


function atualizarResumoHistorico(
    itens = null
) {

    const lista =
        itens
        ||
        obterItensHistoricoParaExibicao();


    const total =
        lista.length;


    const concluidos =
        lista.filter(
            item =>
                item.status ===
                "concluido"
        ).length;


    const processandoHistorico =
        lista.filter(
            item =>
                item.status ===
                    "transcrevendo"
                ||
                item.status ===
                    "cancelando"
        ).length;


    const erros =
        lista.filter(
            item =>
                item.status ===
                "erro"
        ).length;


    if (
        historicoTotalResumo
    ) {

        historicoTotalResumo.textContent =
            total ===
            1
                ?
                "1 registro"
                :
                `${total} registros`;
    }


    if (
        historicoTotal
    ) {

        historicoTotal.textContent =
            total;
    }


    if (
        historicoConcluidos
    ) {

        historicoConcluidos.textContent =
            concluidos;
    }


    if (
        historicoProcessando
    ) {

        historicoProcessando.textContent =
            processandoHistorico;
    }


    if (
        historicoErros
    ) {

        historicoErros.textContent =
            erros;
    }


    if (
        botaoLimparHistorico
    ) {

        const possuiHistoricoPersistente =
            historicoPersistente.length >
            0;


        botaoLimparHistorico.disabled =
            !possuiHistoricoPersistente
            ||
            processando
            ||
            cancelamentoEmAndamento;


        if (
            processando
            ||
            cancelamentoEmAndamento
        ) {

            botaoLimparHistorico.title =
                "Aguarde o processamento atual terminar para limpar o histórico.";

        } else if (
            !possuiHistoricoPersistente
        ) {

            botaoLimparHistorico.title =
                "Não há registros salvos para limpar.";

        } else {

            botaoLimparHistorico.title =
                "Remove os registros salvos do histórico. Os arquivos Word gerados não são apagados.";
        }
    }
}


function itemPassaFiltroHistorico(
    item
) {

    if (
        filtroHistoricoAtual ===
        "todos"
    ) {

        return true;
    }


    if (
        filtroHistoricoAtual ===
        "transcrevendo"
    ) {

        return (
            item.status ===
                "transcrevendo"
            ||
            item.status ===
                "cancelando"
        );
    }


    return (
        item.status ===
        filtroHistoricoAtual
    );
}


function itemPassaBuscaHistorico(
    item
) {

    if (
        !buscaTranscricoes
    ) {

        return true;
    }


    const termo =
        buscaTranscricoes.value
            .trim()
            .toLowerCase();


    if (
        !termo
    ) {

        return true;
    }


    const nome =
        item.arquivo
            ?
            String(
                item.arquivo.name
                ||
                ""
            ).toLowerCase()
            :
            "";


    return nome.includes(
        termo
    );
}


function criarAreaExpandidaHistorico(
    item
) {

    const area =
        document.createElement(
            "div"
        );


    area.className =
        "historico-transcricao-expandida";


    const caixa =
        document.createElement(
            "div"
        );


    caixa.className =
        "historico-transcricao-caixa";


    const titulo =
        document.createElement(
            "div"
        );


    titulo.className =
        "historico-transcricao-titulo";


    const texto =
        document.createElement(
            "div"
        );


    texto.className =
        "historico-transcricao-texto";


    if (
        item.status ===
        "concluido"
    ) {

        titulo.textContent =
            "Transcrição";


        texto.textContent =
            item.transcricao
            ||
            "A transcrição foi concluída, mas nenhum texto foi retornado.";

    } else if (
        item.status ===
        "erro"
    ) {

        titulo.textContent =
            "Erro no processamento";


        texto.textContent =
            item.erro
            ||
            "Não foi possível concluir esta transcrição.";

    } else if (
        item.status ===
        "cancelado"
    ) {

        titulo.textContent =
            "Processamento cancelado";


        texto.textContent =
            item.erro
            ||
            "Esta transcrição foi cancelada.";

    } else {

        titulo.textContent =
            "Processamento";


        texto.textContent =
            "O arquivo ainda não possui uma transcrição disponível.";
    }


    caixa.appendChild(
        titulo
    );


    caixa.appendChild(
        texto
    );


    area.appendChild(
        caixa
    );


    return area;
}


function criarAcoesHistorico(
    item,
    areaExpandida
) {

    const area =
        document.createElement(
            "div"
        );


    area.className =
        "historico-item-acoes";


    const podeVisualizar =
        item.status ===
            "concluido"
        ||
        item.status ===
            "erro"
        ||
        item.status ===
            "cancelado";


    const botaoVisualizar =
        document.createElement(
            "button"
        );


    botaoVisualizar.type =
        "button";


    botaoVisualizar.className =
        "historico-acao historico-acao-visualizar";


    botaoVisualizar.textContent =
        item.status ===
            "erro"
            ?
            "Ver erro"
            :
            "Visualizar";


    if (
        !podeVisualizar
    ) {

        botaoVisualizar.disabled =
            true;


        botaoVisualizar.classList.add(
            "historico-acao-desabilitada"
        );

    } else {

        botaoVisualizar.addEventListener(
            "click",
            () => {

                const aberta =
                    areaExpandida.classList.toggle(
                        "aberta"
                    );


                botaoVisualizar.textContent =
                    aberta
                        ?
                        "Ocultar"
                        :
                        (
                            item.status ===
                                "erro"
                                ?
                                "Ver erro"
                                :
                                "Visualizar"
                        );
            }
        );
    }


    area.appendChild(
        botaoVisualizar
    );


    if (
        item.status ===
            "concluido"
        &&
        item.arquivoDocx
    ) {

        const linkWord =
            document.createElement(
                "a"
            );


        linkWord.className =
            "historico-acao historico-acao-word";


        linkWord.href =
            `/download/${encodeURIComponent(
                item.arquivoDocx
            )}`;


        linkWord.textContent =
            "Baixar Word";


        area.appendChild(
            linkWord
        );

    } else {

        const indisponivel =
            document.createElement(
                "span"
            );


        indisponivel.className =
            "historico-acao historico-acao-desabilitada";


        indisponivel.textContent =
            "Word indisponível";


        area.appendChild(
            indisponivel
        );
    }


    return area;
}


function criarItemHistorico(
    item
) {

    const container =
        document.createElement(
            "article"
        );


    container.className =
        "historico-item";


    container.dataset.historicoId =
        String(
            item.historicoId
            ??
            item.id
            ??
            ""
        );


    container.dataset.arquivoNome =
        item.arquivo
            ?
            item.arquivo.name
            :
            "";


    container.dataset.status =
        item.status
        ||
        "";


    const principal =
        document.createElement(
            "div"
        );


    principal.className =
        "historico-item-principal";


    const nome =
        document.createElement(
            "strong"
        );


    nome.className =
        "historico-item-nome";


    nome.textContent =
        item.arquivo
            ?
            item.arquivo.name
            :
            "Arquivo";


    const tamanho =
        document.createElement(
            "span"
        );


    tamanho.className =
        "historico-item-tamanho";


    tamanho.textContent =
        item.arquivo
            ?
            formatarTamanho(
                item.arquivo.size
            )
            :
            "—";


    const status =
        document.createElement(
            "span"
        );


    status.className =
        `status status-${item.status}`;


    status.textContent =
        obterTextoStatusHistorico(
            item.status
        );


    const tempo =
        document.createElement(
            "span"
        );


    tempo.className =
        "historico-item-tempo";


    tempo.textContent =
        formatarTempo(
            item.tempo
            ||
            0
        );


    const areaExpandida =
        criarAreaExpandidaHistorico(
            item
        );


    const acoes =
        criarAcoesHistorico(
            item,
            areaExpandida
        );


    principal.appendChild(
        nome
    );


    principal.appendChild(
        tamanho
    );


    principal.appendChild(
        status
    );


    principal.appendChild(
        tempo
    );


    principal.appendChild(
        acoes
    );


    container.appendChild(
        principal
    );


    container.appendChild(
        areaExpandida
    );


    return container;
}


function atualizarEstadoVazioHistorico(
    quantidade
) {

    if (
        !historicoVazio
    ) {

        return;
    }


    const titulo =
        historicoVazio.querySelector(
            "strong"
        );


    const descricao =
        historicoVazio.querySelector(
            "p"
        );


    const botao =
        historicoVazio.querySelector(
            "button"
        );


    if (
        historicoCarregando
        &&
        historicoPersistente.length ===
        0
    ) {

        historicoVazio.hidden =
            false;


        if (
            titulo
        ) {

            titulo.textContent =
                "Carregando histórico...";
        }


        if (
            descricao
        ) {

            descricao.textContent =
                "Consultando as transcrições salvas.";
        }


        if (
            botao
        ) {

            botao.hidden =
                true;
        }


        return;
    }


    if (
        historicoErroCarregamento
        &&
        historicoPersistente.length ===
            0
    ) {

        historicoVazio.hidden =
            false;


        if (
            titulo
        ) {

            titulo.textContent =
                "Não foi possível carregar o histórico";
        }


        if (
            descricao
        ) {

            descricao.textContent =
                historicoErroCarregamento;
        }


        if (
            botao
        ) {

            botao.hidden =
                false;
        }


        return;
    }


    if (
        quantidade >
        0
    ) {

        historicoVazio.hidden =
            true;


        return;
    }


    historicoVazio.hidden =
        false;


    const possuiRegistros =
        obterItensHistoricoParaExibicao()
            .length >
        0;


    if (
        titulo
    ) {

        titulo.textContent =
            possuiRegistros
                ?
                "Nenhuma transcrição encontrada"
                :
                "Nenhuma transcrição salva";
    }


    if (
        descricao
    ) {

        descricao.textContent =
            possuiRegistros
                ?
                "Nenhum registro corresponde ao filtro selecionado."
                :
                "As transcrições processadas aparecerão aqui.";
    }


    if (
        botao
    ) {

        botao.hidden =
            false;
    }
}


function atualizarHistoricoTranscricoes() {

    if (
        !historicoTranscricoes
    ) {

        return;
    }


    const todos =
        obterItensHistoricoParaExibicao();


    atualizarResumoHistorico(
        todos
    );


    const scrollAnterior =
        historicoTranscricoes.scrollTop;


    historicoTranscricoes.innerHTML =
        "";


    const itens =
        todos.filter(
            item =>
                itemPassaFiltroHistorico(
                    item
                )
                &&
                itemPassaBuscaHistorico(
                    item
                )
        );


    itens.forEach(
        item => {

            historicoTranscricoes.appendChild(
                criarItemHistorico(
                    item
                )
            );
        }
    );


    historicoTranscricoes.scrollTop =
        scrollAnterior;


    atualizarEstadoVazioHistorico(
        itens.length
    );
}


function atualizarTempoHistoricoItem(
    item
) {

    if (
        !historicoTranscricoes
        ||
        !item
        ||
        !item.arquivo
    ) {

        return;
    }


    const linhas =
        Array.from(
            historicoTranscricoes.querySelectorAll(
                ".historico-item"
            )
        );


    const linha =
        linhas.find(
            elemento =>
                elemento.dataset.arquivoNome ===
                    item.arquivo.name
                &&
                (
                    elemento.dataset.status ===
                        "transcrevendo"
                    ||
                    elemento.dataset.status ===
                        "cancelando"
                )
        );


    if (
        !linha
    ) {

        return;
    }


    const tempo =
        linha.querySelector(
            ".historico-item-tempo"
        );


    if (
        tempo
    ) {

        tempo.textContent =
            formatarTempo(
                item.tempo
                ||
                0
            );
    }
}


// ============================================================
// FILA DEDICADA
// ============================================================

function criarItemFilaDedicada(
    item,
    indice
) {

    const linha =
        document.createElement(
            "div"
        );


    linha.className =
        "fila-dedicada-item";


    if (
        item.status ===
            "transcrevendo"
        ||
        item.status ===
            "cancelando"
    ) {

        linha.classList.add(
            "fila-dedicada-item-processando"
        );
    }


    const ordem =
        document.createElement(
            "span"
        );


    ordem.className =
        "fila-dedicada-ordem";


    ordem.textContent =
        String(
            indice + 1
        ).padStart(
            2,
            "0"
        );


    const nome =
        document.createElement(
            "span"
        );


    nome.className =
        "fila-dedicada-nome";


    nome.textContent =
        item.arquivo.name;


    const tamanho =
        document.createElement(
            "span"
        );


    tamanho.className =
        "fila-dedicada-tamanho";


    tamanho.textContent =
        formatarTamanho(
            item.arquivo.size
        );


    const status =
        document.createElement(
            "span"
        );


    status.className =
        `status status-${item.status}`;


    status.textContent =
        obterTextoStatusHistorico(
            item.status
        );


    const tempo =
        document.createElement(
            "span"
        );


    tempo.className =
        "fila-dedicada-tempo-item";


    tempo.textContent =
        formatarTempo(
            item.tempo
            ||
            0
        );


    linha.appendChild(
        ordem
    );


    linha.appendChild(
        nome
    );


    linha.appendChild(
        tamanho
    );


    linha.appendChild(
        status
    );


    linha.appendChild(
        tempo
    );


    return linha;
}


function atualizarFilaDedicada() {

    if (
        !filaDedicadaLista
        &&
        !filaDedicadaTotal
    ) {

        return;
    }


    const resumo =
        obterResumoDashboard();


    if (
        filaDedicadaResumo
    ) {

        filaDedicadaResumo.textContent =
            resumo.total ===
            1
                ?
                "1 arquivo"
                :
                `${resumo.total} arquivos`;
    }


    if (
        filaDedicadaTotal
    ) {

        filaDedicadaTotal.textContent =
            resumo.total;
    }


    if (
        filaDedicadaAguardando
    ) {

        filaDedicadaAguardando.textContent =
            resumo.aguardando;
    }


    if (
        filaDedicadaProcessando
    ) {

        filaDedicadaProcessando.textContent =
            resumo.transcrevendo;
    }


    if (
        filaDedicadaEncerrados
    ) {

        filaDedicadaEncerrados.textContent =
            resumo.encerrados;
    }


    const atual =
        obterUltimoItem(
            item =>
                item.status ===
                    "transcrevendo"
                ||
                item.status ===
                    "cancelando"
        );


    if (
        filaDedicadaArquivoAtual
    ) {

        filaDedicadaArquivoAtual.textContent =
            atual
                ?
                atual.arquivo.name
                :
                "Nenhum arquivo em processamento";
    }


    if (
        filaDedicadaTempo
    ) {

        filaDedicadaTempo.textContent =
            atual
                ?
                formatarTempo(
                    atual.tempo
                )
                :
                "00:00";
    }


    const percentual =
        resumo.total >
        0
            ?
            Math.round(
                (
                    resumo.encerrados
                    /
                    resumo.total
                )
                *
                100
            )
            :
            0;


    if (
        filaDedicadaProgressoTexto
    ) {

        filaDedicadaProgressoTexto.textContent =
            processando
                ?
                "Processamento em andamento"
                :
                (
                    resumo.total >
                    0
                        ?
                        "Fila pronta"
                        :
                        "Aguardando arquivos"
                );
    }


    if (
        filaDedicadaProgressoContador
    ) {

        filaDedicadaProgressoContador.textContent =
            `${resumo.encerrados} de ${resumo.total}`;
    }


    if (
        filaDedicadaBarraPreenchimento
    ) {

        filaDedicadaBarraPreenchimento.style.width =
            `${percentual}%`;
    }


    if (
        filaDedicadaEstado
    ) {

        filaDedicadaEstado.textContent =
            estadoFila
                ?
                estadoFila.textContent
                :
                "Aguardando arquivos";
    }


    if (
        filaDedicadaLista
    ) {

        filaDedicadaLista.innerHTML =
            "";


        arquivosSelecionados.forEach(
            (
                item,
                indice
            ) => {

                filaDedicadaLista.appendChild(
                    criarItemFilaDedicada(
                        item,
                        indice
                    )
                );
            }
        );
    }


    if (
        filaDedicadaVazia
    ) {

        filaDedicadaVazia.hidden =
            arquivosSelecionados.length >
            0;
    }


    if (
        filaDedicadaIniciar
    ) {

        filaDedicadaIniciar.disabled =
            processando
            ||
            !possuiArquivosAguardando();


        filaDedicadaIniciar.textContent =
            processando
                ?
                "Em execução..."
                :
                "Iniciar Transcrição";
    }


    if (
        filaDedicadaPausar
    ) {

        filaDedicadaPausar.disabled =
            !processando
            ||
            cancelamentoSolicitado;


        filaDedicadaPausar.textContent =
            pausaSolicitada
                ?
                "Continuar"
                :
                "Pausar";
    }


    if (
        filaDedicadaCancelar
    ) {

        filaDedicadaCancelar.disabled =
            !processando
            ||
            cancelamentoSolicitado;
    }
}



// ============================================================
// CONFIGURAÇÕES — INTERFACE
// ============================================================

function atualizarTelaConfiguracoes() {

    if (
        configConfirmarCancelamento
    ) {

        configConfirmarCancelamento.checked =
            configuracoesUsuario
                .confirmarCancelamento;
    }


    if (
        configAtualizarHistorico
    ) {

        configAtualizarHistorico.checked =
            configuracoesUsuario
                .atualizarHistoricoAutomaticamente;
    }


    if (
        statusSistemaAtual
    ) {

        if (
            configPastaSaida
        ) {

            configPastaSaida.textContent =
                statusSistemaAtual
                    .pasta_transcricoes
                ||
                "Não disponível";
        }


        if (
            configModelo
        ) {

            configModelo.textContent =
                statusSistemaAtual.modelo
                ||
                "small";
        }


        if (
            configIdioma
        ) {

            configIdioma.textContent =
                statusSistemaAtual.idioma
                ||
                "Português (pt)";
        }


        if (
            configProcessamento
        ) {

            configProcessamento.textContent =
                (
                    `${statusSistemaAtual.dispositivo || "CPU"}`
                    +
                    " • Local • Sequencial"
                );
        }
    }
}


function restaurarConfiguracoesPadrao() {

    configuracoesUsuario = {
        ...CONFIGURACOES_PADRAO
    };


    salvarConfiguracoesUsuario();


    atualizarTelaConfiguracoes();


    if (
        paginaAtualDashboard ===
        "transcricoes"
    ) {

        iniciarAtualizacaoAutomaticaHistorico();
    }
}


// ============================================================
// ESTATÍSTICAS
// ============================================================

function criarBarraEstatistica(
    nome,
    valor,
    total
) {

    const item =
        document.createElement(
            "div"
        );


    item.className =
        "estatistica-barra-item";


    const rotulo =
        document.createElement(
            "span"
        );


    rotulo.className =
        "estatistica-barra-nome";


    rotulo.textContent =
        nome;


    const trilho =
        document.createElement(
            "div"
        );


    trilho.className =
        "estatistica-barra-trilho";


    const preenchimento =
        document.createElement(
            "div"
        );


    preenchimento.className =
        "estatistica-barra-preenchimento";


    const percentual =
        total >
        0
            ?
            Math.round(
                (
                    valor
                    /
                    total
                )
                *
                100
            )
            :
            0;


    preenchimento.style.width =
        `${Math.max(
            0,
            Math.min(
                100,
                percentual
            )
        )}%`;


    trilho.appendChild(
        preenchimento
    );


    const numero =
        document.createElement(
            "span"
        );


    numero.className =
        "estatistica-barra-valor";


    numero.textContent =
        `${valor} (${percentual}%)`;


    item.appendChild(
        rotulo
    );


    item.appendChild(
        trilho
    );


    item.appendChild(
        numero
    );


    return item;
}


function formatarDataHistorico(
    valor
) {

    if (
        !valor
    ) {

        return "—";
    }


    const data =
        new Date(
            valor
        );


    if (
        Number.isNaN(
            data.getTime()
        )
    ) {

        return "—";
    }


    return data.toLocaleString(
        "pt-BR",
        {
            dateStyle:
                "short",

            timeStyle:
                "short"
        }
    );
}


function atualizarEstatisticas() {

    const itens =
        historicoPersistente;


    const total =
        itens.length;


    const concluidos =
        itens.filter(
            item =>
                item.status ===
                "concluido"
        ).length;


    const erros =
        itens.filter(
            item =>
                item.status ===
                "erro"
        ).length;


    const cancelados =
        itens.filter(
            item =>
                item.status ===
                "cancelado"
        ).length;


    const processandoHistorico =
        itens.filter(
            item =>
                item.status ===
                    "transcrevendo"
                ||
                item.status ===
                    "cancelando"
        ).length;


    const taxa =
        total >
        0
            ?
            Math.round(
                (
                    concluidos
                    /
                    total
                )
                *
                100
            )
            :
            0;


    const tempoTotal =
        itens.reduce(
            (
                acumulado,
                item
            ) =>
                acumulado
                +
                Number(
                    item.tempo
                    ||
                    0
                ),
            0
        );


    const tempoMedio =
        total >
        0
            ?
            Math.round(
                tempoTotal
                /
                total
            )
            :
            0;


    const volumeTotal =
        itens.reduce(
            (
                acumulado,
                item
            ) =>
                acumulado
                +
                Number(
                    item.arquivo
                        ?
                        item.arquivo.size
                        :
                        0
                ),
            0
        );


    if (
        estatTotalResumo
    ) {

        estatTotalResumo.textContent =
            total ===
            1
                ?
                "1 registro"
                :
                `${total} registros`;
    }


    if (
        estatTotal
    ) {

        estatTotal.textContent =
            total;
    }


    if (
        estatConcluidos
    ) {

        estatConcluidos.textContent =
            concluidos;
    }


    if (
        estatTaxa
    ) {

        estatTaxa.textContent =
            `${taxa}%`;
    }


    if (
        estatTempoTotal
    ) {

        estatTempoTotal.textContent =
            formatarTempoLongo(
                tempoTotal
            );
    }


    if (
        estatTempoMedio
    ) {

        estatTempoMedio.textContent =
            formatarTempo(
                tempoMedio
            );
    }


    if (
        estatVolumeTotal
    ) {

        estatVolumeTotal.textContent =
            formatarTamanho(
                volumeTotal
            );
    }


    if (
        estatUltimaAtividade
    ) {

        const maisRecente =
            itens.length >
            0
                ?
                itens[0]
                :
                null;


        estatUltimaAtividade.textContent =
            maisRecente
                ?
                formatarDataHistorico(
                    maisRecente.atualizadoEm
                    ||
                    maisRecente.criadoEm
                )
                :
                "—";
    }


    if (
        estatStatusLista
    ) {

        estatStatusLista.innerHTML =
            "";


        const status = [
            [
                "Concluídos",
                concluidos
            ],
            [
                "Erros",
                erros
            ],
            [
                "Cancelados",
                cancelados
            ],
            [
                "Processando",
                processandoHistorico
            ]
        ];


        status.forEach(
            (
                [
                    nome,
                    valor
                ]
            ) => {

                estatStatusLista.appendChild(
                    criarBarraEstatistica(
                        nome,
                        valor,
                        total
                    )
                );
            }
        );
    }


    if (
        estatFormatosLista
    ) {

        estatFormatosLista.innerHTML =
            "";


        const formatos = {
            MP3:
                0,
            WAV:
                0,
            MP4:
                0,
            M4A:
                0
        };


        itens.forEach(
            item => {

                const formato =
                    obterFormatoArquivo(
                        item.arquivo
                            ?
                            item.arquivo.name
                            :
                            ""
                    );


                if (
                    Object.prototype.hasOwnProperty.call(
                        formatos,
                        formato
                    )
                ) {

                    formatos[
                        formato
                    ]++;
                }
            }
        );


        Object.entries(
            formatos
        ).forEach(
            (
                [
                    nome,
                    valor
                ]
            ) => {

                estatFormatosLista.appendChild(
                    criarBarraEstatistica(
                        nome,
                        valor,
                        total
                    )
                );
            }
        );
    }
}


// ============================================================
// SISTEMA
// ============================================================

function aplicarEstadoPonto(
    elemento,
    ativo
) {

    if (
        !elemento
    ) {

        return;
    }


    elemento.classList.remove(
        "ativo",
        "erro",
        "verificando"
    );


    elemento.classList.add(
        ativo
            ?
            "ativo"
            :
            "erro"
    );
}


function aplicarEstadoSistemaTexto(
    elemento,
    ativo,
    textoAtivo,
    textoErro
) {

    if (
        !elemento
    ) {

        return;
    }


    elemento.textContent =
        ativo
            ?
            textoAtivo
            :
            textoErro;


    elemento.classList.toggle(
        "ativo",
        ativo
    );


    elemento.classList.toggle(
        "erro",
        !ativo
    );
}


function atualizarInterfaceSistema(
    dados
) {

    statusSistemaAtual =
        dados;


    const whisperAtivo =
        Boolean(
            dados.whisper_ativo
        );


    const ffmpegAtivo =
        Boolean(
            dados.ffmpeg_ativo
        );


    const historicoAtivo =
        Boolean(
            dados.historico_ativo
        );


    if (
        sidebarStatusWhisper
    ) {

        sidebarStatusWhisper.textContent =
            whisperAtivo
                ?
                "Ativo"
                :
                "Indisponível";
    }


    if (
        sidebarStatusFfmpeg
    ) {

        sidebarStatusFfmpeg.textContent =
            ffmpegAtivo
                ?
                "Ativo"
                :
                "Indisponível";
    }


    if (
        sidebarStatusHistorico
    ) {

        sidebarStatusHistorico.textContent =
            historicoAtivo
                ?
                "Ativo"
                :
                "Indisponível";
    }


    aplicarEstadoPonto(
        sidebarPontoWhisper,
        whisperAtivo
    );


    aplicarEstadoPonto(
        sidebarPontoFfmpeg,
        ffmpegAtivo
    );


    aplicarEstadoPonto(
        sidebarPontoHistorico,
        historicoAtivo
    );


    const tudoAtivo =
        whisperAtivo
        &&
        ffmpegAtivo
        &&
        historicoAtivo;


    if (
        sidebarStatusGeral
    ) {

        sidebarStatusGeral.textContent =
            tudoAtivo
                ?
                "Operacional"
                :
                "Atenção";
    }


    if (
        sidebarStatusModelo
    ) {

        sidebarStatusModelo.textContent =
            `Whisper ${dados.modelo || "small"}`;
    }


    aplicarEstadoSistemaTexto(
        sistemaWhisper,
        whisperAtivo,
        "Ativo",
        "Indisponível"
    );


    aplicarEstadoSistemaTexto(
        sistemaFfmpeg,
        ffmpegAtivo,
        "Ativo",
        "Indisponível"
    );


    aplicarEstadoSistemaTexto(
        sistemaHistorico,
        historicoAtivo,
        "Ativo",
        "Indisponível"
    );


    if (
        sistemaVersao
    ) {

        sistemaVersao.textContent =
            `v${dados.versao || "1.2.0"}`;
    }


    if (
        sistemaModelo
    ) {

        sistemaModelo.textContent =
            dados.modelo
            ||
            "small";
    }


    if (
        sistemaDispositivo
    ) {

        sistemaDispositivo.textContent =
            dados.dispositivo
            ||
            "CPU";
    }


    if (
        sistemaModo
    ) {

        sistemaModo.textContent =
            dados.modo_execucao
            ||
            "Python";
    }


    if (
        sistemaPastaTranscricoes
    ) {

        sistemaPastaTranscricoes.textContent =
            dados.pasta_transcricoes
            ||
            "Não disponível";
    }


    if (
        sistemaCaminhoBanco
    ) {

        sistemaCaminhoBanco.textContent =
            dados.caminho_banco
            ||
            "Não disponível";
    }


    if (
        sistemaCaminhoFfmpeg
    ) {

        sistemaCaminhoFfmpeg.textContent =
            dados.caminho_ffmpeg
            ||
            "Não encontrado";
    }


    atualizarTelaConfiguracoes();
}


async function carregarStatusSistema() {

    try {

        const resposta =
            await fetch(
                "/sistema",
                {
                    method:
                        "GET",

                    cache:
                        "no-store",

                    headers: {
                        Accept:
                            "application/json"
                    }
                }
            );


        const dados =
            await resposta.json();


        if (
            !resposta.ok
            ||
            dados.sucesso ===
                false
        ) {

            throw new Error(
                dados.mensagem
                ||
                "Não foi possível consultar o sistema."
            );
        }


        atualizarInterfaceSistema(
            dados
        );

    } catch (
        erro
    ) {

        console.error(
            "Erro ao consultar o sistema:",
            erro
        );


        [
            sidebarPontoWhisper,
            sidebarPontoFfmpeg,
            sidebarPontoHistorico
        ].forEach(
            ponto => {

                aplicarEstadoPonto(
                    ponto,
                    false
                );
            }
        );


        if (
            sidebarStatusGeral
        ) {

            sidebarStatusGeral.textContent =
                "Indisponível";
        }


        if (
            sidebarStatusWhisper
        ) {

            sidebarStatusWhisper.textContent =
                "Indisponível";
        }


        if (
            sidebarStatusFfmpeg
        ) {

            sidebarStatusFfmpeg.textContent =
                "Indisponível";
        }


        if (
            sidebarStatusHistorico
        ) {

            sidebarStatusHistorico.textContent =
                "Indisponível";
        }
    }
}


async function abrirPastaTranscricoes(
    botao = null
) {

    const textoOriginal =
        botao
            ?
            botao.textContent
            :
            "";


    if (
        botao
    ) {

        botao.disabled =
            true;


        botao.textContent =
            "Abrindo...";
    }


    try {

        const resposta =
            await fetch(
                "/abrir-pasta-transcricoes",
                {
                    method:
                        "POST",

                    headers: {
                        Accept:
                            "application/json"
                    }
                }
            );


        const dados =
            await resposta.json();


        if (
            !resposta.ok
            ||
            !dados.sucesso
        ) {

            throw new Error(
                dados.mensagem
                ||
                "Não foi possível abrir a pasta."
            );
        }

    } catch (
        erro
    ) {

        console.error(
            erro
        );


        alert(
            erro.message
            ||
            "Não foi possível abrir a pasta de transcrições."
        );

    } finally {

        if (
            botao
        ) {

            botao.disabled =
                false;


            botao.textContent =
                textoOriginal;
        }
    }
}


function configurarPaginasFuncionais() {

    atualizarTelaConfiguracoes();


    if (
        configConfirmarCancelamento
    ) {

        configConfirmarCancelamento.addEventListener(
            "change",
            () => {

                configuracoesUsuario
                    .confirmarCancelamento =
                        configConfirmarCancelamento
                            .checked;


                salvarConfiguracoesUsuario();
            }
        );
    }


    if (
        configAtualizarHistorico
    ) {

        configAtualizarHistorico.addEventListener(
            "change",
            () => {

                configuracoesUsuario
                    .atualizarHistoricoAutomaticamente =
                        configAtualizarHistorico
                            .checked;


                salvarConfiguracoesUsuario();


                if (
                    paginaAtualDashboard ===
                    "transcricoes"
                ) {

                    if (
                        configuracoesUsuario
                            .atualizarHistoricoAutomaticamente
                    ) {

                        iniciarAtualizacaoAutomaticaHistorico();

                    } else {

                        pararAtualizacaoAutomaticaHistorico();
                    }
                }
            }
        );
    }


    if (
        configRestaurarPadroes
    ) {

        configRestaurarPadroes.addEventListener(
            "click",
            restaurarConfiguracoesPadrao
        );
    }


    if (
        configAbrirPasta
    ) {

        configAbrirPasta.addEventListener(
            "click",
            () => {

                abrirPastaTranscricoes(
                    configAbrirPasta
                );
            }
        );
    }


    if (
        sistemaAbrirPasta
    ) {

        sistemaAbrirPasta.addEventListener(
            "click",
            () => {

                abrirPastaTranscricoes(
                    sistemaAbrirPasta
                );
            }
        );
    }


    if (
        sistemaAtualizar
    ) {

        sistemaAtualizar.addEventListener(
            "click",
            carregarStatusSistema
        );
    }
}


// ============================================================
// API — LEITURA SEGURA DE RESPOSTAS
// ============================================================

async function lerRespostaApi(
    resposta
) {

    const tipoConteudo =
        (
            resposta.headers.get(
                "content-type"
            )
            ||
            ""
        )
        .toLowerCase();


    const texto =
        await resposta.text();


    if (
        !tipoConteudo.includes(
            "application/json"
        )
    ) {

        const resumo =
            texto
            .replace(
                /<[^>]*>/g,
                " "
            )
            .replace(
                /\s+/g,
                " "
            )
            .trim()
            .slice(
                0,
                180
            );


        throw new Error(
            (
                `Erro HTTP ${resposta.status}: `
                +
                "o servidor respondeu em HTML em vez de JSON."
                +
                (
                    resumo
                    ?
                    ` Resposta: ${resumo}`
                    :
                    ""
                )
            )
        );
    }


    try {

        return JSON.parse(
            texto
        );

    } catch {

        throw new Error(
            (
                `Erro HTTP ${resposta.status}: `
                +
                "a API retornou um JSON inválido."
            )
        );
    }
}


// ============================================================
// USUÁRIOS — FUNÇÕES
// ============================================================

function formatarDataUsuario(
    valor
) {

    if (
        !valor
    ) {

        return "Nunca";
    }


    const data =
        new Date(
            valor
        );


    if (
        Number.isNaN(
            data.getTime()
        )
    ) {

        return "—";
    }


    return data.toLocaleString(
        "pt-BR",
        {
            dateStyle:
                "short",

            timeStyle:
                "short"
        }
    );
}


function mostrarFeedbackUsuarios(
    mensagem,
    tipo = "erro"
) {

    if (
        !usuariosFeedback
    ) {

        return;
    }


    if (
        !mensagem
    ) {

        usuariosFeedback.hidden =
            true;

        usuariosFeedback.textContent =
            "";

        usuariosFeedback.className =
            "usuarios-feedback";


        return;
    }


    usuariosFeedback.hidden =
        false;

    usuariosFeedback.textContent =
        mensagem;

    usuariosFeedback.className =
        `usuarios-feedback ${tipo}`;
}


function mostrarFeedbackFormularioUsuario(
    mensagem
) {

    if (
        !usuarioFormFeedback
    ) {

        return;
    }


    if (
        !mensagem
    ) {

        usuarioFormFeedback.hidden =
            true;

        usuarioFormFeedback.textContent =
            "";


        return;
    }


    usuarioFormFeedback.hidden =
        false;

    usuarioFormFeedback.textContent =
        mensagem;
}


function criarCelulaUsuario(
    texto,
    classe = ""
) {

    const td =
        document.createElement(
            "td"
        );


    if (
        classe
    ) {

        td.className =
            classe;
    }


    td.textContent =
        texto;


    return td;
}


function obterUsuariosFiltrados() {

    const termo =
        (
            usuariosBusca?.value
            ||
            ""
        )
        .trim()
        .toLowerCase();


    if (
        !termo
    ) {

        return [
            ...usuariosAdministracao
        ];
    }


    return usuariosAdministracao.filter(
        item => {

            const texto =
                [
                    item.nome,
                    item.email,
                    item.usuario,
                    item.perfil,
                    item.ativo
                        ?
                        "ativo"
                        :
                        "inativo"
                ]
                .join(
                    " "
                )
                .toLowerCase();


            return texto.includes(
                termo
            );
        }
    );
}


function criarBotaoAcaoUsuario(
    texto,
    classe,
    onClick,
    desabilitado = false
) {

    const botao =
        document.createElement(
            "button"
        );


    botao.type =
        "button";

    botao.className =
        `usuario-acao ${classe}`;

    botao.textContent =
        texto;

    botao.disabled =
        desabilitado;


    if (
        !desabilitado
    ) {

        botao.addEventListener(
            "click",
            onClick
        );
    }


    return botao;
}


function renderizarUsuariosAdmin() {

    if (
        !usuariosLista
    ) {

        return;
    }


    usuariosLista.replaceChildren();


    const filtrados =
        obterUsuariosFiltrados();


    if (
        usuariosTotalResumo
    ) {

        const total =
            usuariosAdministracao.length;


        usuariosTotalResumo.textContent =
            total ===
                1
                ?
                "1 usuário"
                :
                `${total} usuários`;
    }


    if (
        usuariosVazio
    ) {

        usuariosVazio.hidden =
            filtrados.length >
            0;
    }


    if (
        filtrados.length ===
        0
    ) {

        return;
    }


    filtrados.forEach(
        item => {

            const linha =
                document.createElement(
                    "tr"
                );


            if (
                Number(
                    item.id
                )
                ===
                usuarioAtualId
            ) {

                linha.classList.add(
                    "usuario-linha-atual"
                );
            }


            // USUÁRIO
            const tdUsuario =
                document.createElement(
                    "td"
                );


            const identidade =
                document.createElement(
                    "div"
                );

            identidade.className =
                "usuario-lista-identidade";


            const avatar =
                document.createElement(
                    "span"
                );

            avatar.className =
                "usuario-lista-avatar";

            avatar.textContent =
                item.iniciais
                ||
                "US";


            const textos =
                document.createElement(
                    "div"
                );


            const nome =
                document.createElement(
                    "strong"
                );

            nome.textContent =
                item.nome;


            const login =
                document.createElement(
                    "span"
                );

            login.textContent =
                `@${item.usuario}`;


            if (
                Number(
                    item.id
                )
                ===
                usuarioAtualId
            ) {

                const voce =
                    document.createElement(
                        "small"
                    );

                voce.textContent =
                    "Você";

                textos.append(
                    nome,
                    login,
                    voce
                );

            } else {

                textos.append(
                    nome,
                    login
                );
            }


            identidade.append(
                avatar,
                textos
            );


            tdUsuario.appendChild(
                identidade
            );


            // E-MAIL
            const tdEmail =
                criarCelulaUsuario(
                    item.email,
                    "usuario-email"
                );


            // PERFIL
            const tdPerfil =
                document.createElement(
                    "td"
                );


            const badgePerfil =
                document.createElement(
                    "span"
                );

            badgePerfil.className =
                (
                    item.perfil ===
                        "admin"
                        ?
                        "usuario-badge-perfil admin"
                        :
                        "usuario-badge-perfil usuario"
                );

            badgePerfil.textContent =
                item.perfil ===
                    "admin"
                    ?
                    "Administrador"
                    :
                    "Usuário";

            tdPerfil.appendChild(
                badgePerfil
            );


            // STATUS
            const tdStatus =
                document.createElement(
                    "td"
                );


            const status =
                document.createElement(
                    "span"
                );

            status.className =
                (
                    item.ativo
                    ?
                    "usuario-status ativo"
                    :
                    "usuario-status inativo"
                );


            const ponto =
                document.createElement(
                    "i"
                );

            ponto.className =
                (
                    item.ativo
                    ?
                    "usuario-status-ponto ativo"
                    :
                    "usuario-status-ponto inativo"
                );


            const statusTexto =
                document.createElement(
                    "span"
                );

            statusTexto.textContent =
                item.ativo
                    ?
                    "Ativo"
                    :
                    "Inativo";


            status.append(
                ponto,
                statusTexto
            );

            tdStatus.appendChild(
                status
            );


            // ÚLTIMO ACESSO
            const tdAcesso =
                criarCelulaUsuario(
                    formatarDataUsuario(
                        item.ultimo_acesso
                    ),
                    "usuario-ultimo-acesso"
                );


            // AÇÕES
            const tdAcoes =
                document.createElement(
                    "td"
                );

            tdAcoes.className =
                "usuarios-acoes";


            const editar =
                criarBotaoAcaoUsuario(
                    "Editar",
                    "editar",
                    () => {

                        abrirModalUsuario(
                            item
                        );
                    }
                );


            const excluir =
                criarBotaoAcaoUsuario(
                    "Excluir",
                    "excluir",
                    () => {

                        excluirUsuarioAdmin(
                            item
                        );
                    },
                    Number(
                        item.id
                    )
                    ===
                    usuarioAtualId
                );


            tdAcoes.append(
                editar,
                excluir
            );


            linha.append(
                tdUsuario,
                tdEmail,
                tdPerfil,
                tdStatus,
                tdAcesso,
                tdAcoes
            );


            usuariosLista.appendChild(
                linha
            );
        }
    );
}


async function carregarUsuariosAdmin() {

    if (
        !usuariosLista
        ||
        carregandoUsuarios
    ) {

        return;
    }


    carregandoUsuarios =
        true;


    mostrarFeedbackUsuarios(
        ""
    );


    if (
        usuariosAdministracao.length ===
        0
    ) {

        usuariosLista.innerHTML =
            `
                <tr>
                    <td
                        colspan="6"
                        class="usuarios-carregando"
                    >
                        Carregando usuários...
                    </td>
                </tr>
            `;
    }


    try {

        const resposta =
            await fetch(
                "/api/usuarios",
                {
                    method:
                        "GET",

                    cache:
                        "no-store",

                    headers: {
                        Accept:
                            "application/json"
                    }
                }
            );


        const dados =
            await lerRespostaApi(
                resposta
            );


        if (
            resposta.status ===
            401
        ) {

            window.location.href =
                "/login";


            return;
        }


        if (
            !resposta.ok
            ||
            dados.sucesso ===
                false
        ) {

            throw new Error(
                dados.mensagem
                ||
                "Não foi possível carregar os usuários."
            );
        }


        usuariosAdministracao =
            Array.isArray(
                dados.usuarios
            )
                ?
                dados.usuarios
                :
                [];


        renderizarUsuariosAdmin();

    } catch (
        erro
    ) {

        console.error(
            "Erro ao carregar usuários:",
            erro
        );


        mostrarFeedbackUsuarios(
            erro.message
            ||
            "Não foi possível carregar os usuários."
        );


        usuariosLista.replaceChildren();

    } finally {

        carregandoUsuarios =
            false;
    }
}


function configurarCamposContaPropria(
    proprioUsuario
) {

    if (
        usuarioFormPerfil
    ) {

        usuarioFormPerfil.disabled =
            proprioUsuario;
    }


    if (
        usuarioFormAtivo
    ) {

        usuarioFormAtivo.disabled =
            proprioUsuario;
    }


    if (
        usuarioFormAvisoProprio
    ) {

        usuarioFormAvisoProprio.hidden =
            !proprioUsuario;
    }
}


function abrirModalUsuario(
    item = null
) {

    if (
        !usuarioModal
        ||
        !usuarioForm
    ) {

        return;
    }


    usuarioForm.reset();


    mostrarFeedbackFormularioUsuario(
        ""
    );


    const editando =
        Boolean(
            item
        );


    if (
        usuarioModalTitulo
    ) {

        usuarioModalTitulo.textContent =
            editando
                ?
                "Editar usuário"
                :
                "Novo usuário";
    }


    if (
        usuarioFormId
    ) {

        usuarioFormId.value =
            editando
                ?
                String(
                    item.id
                )
                :
                "";
    }


    if (
        usuarioFormNome
    ) {

        usuarioFormNome.value =
            editando
                ?
                item.nome
                :
                "";
    }


    if (
        usuarioFormEmail
    ) {

        usuarioFormEmail.value =
            editando
                ?
                item.email
                :
                "";
    }


    if (
        usuarioFormLogin
    ) {

        usuarioFormLogin.value =
            editando
                ?
                item.usuario
                :
                "";
    }


    if (
        usuarioFormPerfil
    ) {

        usuarioFormPerfil.value =
            editando
                ?
                item.perfil
                :
                "usuario";
    }


    if (
        usuarioFormAtivo
    ) {

        usuarioFormAtivo.value =
            (
                !editando
                ||
                item.ativo
            )
                ?
                "1"
                :
                "0";
    }


    if (
        usuarioFormSenha
    ) {

        usuarioFormSenha.value =
            "";

        usuarioFormSenha.required =
            !editando;
    }


    if (
        usuarioFormSenhaLabel
    ) {

        usuarioFormSenhaLabel.textContent =
            editando
                ?
                "Nova senha"
                :
                "Senha";
    }


    if (
        usuarioFormSenhaAjuda
    ) {

        usuarioFormSenhaAjuda.textContent =
            editando
                ?
                "Deixe em branco para manter a senha atual."
                :
                "A senha é obrigatória e deve ter pelo menos 8 caracteres.";
    }


    configurarCamposContaPropria(
        editando
        &&
        Number(
            item.id
        )
        ===
        usuarioAtualId
    );


    usuarioModal.hidden =
        false;

    usuarioModal.setAttribute(
        "aria-hidden",
        "false"
    );

    document.body.classList.add(
        "modal-usuario-aberto"
    );


    setTimeout(
        () => {

            usuarioFormNome?.focus();
        },
        30
    );
}


function fecharModalUsuario() {

    if (
        !usuarioModal
    ) {

        return;
    }


    usuarioModal.hidden =
        true;

    usuarioModal.setAttribute(
        "aria-hidden",
        "true"
    );

    document.body.classList.remove(
        "modal-usuario-aberto"
    );


    configurarCamposContaPropria(
        false
    );


    mostrarFeedbackFormularioUsuario(
        ""
    );
}


async function salvarUsuarioAdmin(
    evento
) {

    evento.preventDefault();


    if (
        !usuarioForm
    ) {

        return;
    }


    const idTexto =
        usuarioFormId?.value
        ||
        "";

    const editando =
        Boolean(
            idTexto
        );


    const id =
        editando
            ?
            Number(
                idTexto
            )
            :
            null;


    const dados = {
        nome:
            usuarioFormNome?.value
            ||
            "",

        email:
            usuarioFormEmail?.value
            ||
            "",

        usuario:
            usuarioFormLogin?.value
            ||
            "",

        perfil:
            usuarioFormPerfil?.value
            ||
            "usuario",

        ativo:
            (
                usuarioFormAtivo?.value
                ||
                "1"
            )
            ===
            "1",

        senha:
            usuarioFormSenha?.value
            ||
            ""
    };


    if (
        !editando
        &&
        dados.senha.length <
        8
    ) {

        mostrarFeedbackFormularioUsuario(
            "A senha precisa ter pelo menos 8 caracteres."
        );


        return;
    }


    const textoOriginal =
        usuarioFormSalvar?.textContent
        ||
        "Salvar usuário";


    if (
        usuarioFormSalvar
    ) {

        usuarioFormSalvar.disabled =
            true;

        usuarioFormSalvar.textContent =
            editando
                ?
                "Salvando..."
                :
                "Criando...";
    }


    mostrarFeedbackFormularioUsuario(
        ""
    );


    try {

        const resposta =
            await fetch(
                editando
                    ?
                    `/api/usuarios/${id}`
                    :
                    "/api/usuarios",
                {
                    method:
                        editando
                            ?
                            "PUT"
                            :
                            "POST",

                    headers: {
                        "Content-Type":
                            "application/json",

                        Accept:
                            "application/json"
                    },

                    body:
                        JSON.stringify(
                            dados
                        )
                }
            );


        const retorno =
            await lerRespostaApi(
                resposta
            );


        if (
            resposta.status ===
            401
        ) {

            window.location.href =
                "/login";


            return;
        }


        if (
            !resposta.ok
            ||
            retorno.sucesso ===
                false
        ) {

            throw new Error(
                retorno.mensagem
                ||
                "Não foi possível salvar o usuário."
            );
        }


        fecharModalUsuario();


        await carregarUsuariosAdmin();


        if (
            retorno.recarregar
        ) {

            window.location.reload();


            return;
        }


        mostrarFeedbackUsuarios(
            retorno.mensagem
            ||
            "Usuário salvo com sucesso.",
            "sucesso"
        );

    } catch (
        erro
    ) {

        console.error(
            "Erro ao salvar usuário:",
            erro
        );


        mostrarFeedbackFormularioUsuario(
            erro.message
            ||
            "Não foi possível salvar o usuário."
        );

    } finally {

        if (
            usuarioFormSalvar
        ) {

            usuarioFormSalvar.disabled =
                false;

            usuarioFormSalvar.textContent =
                textoOriginal;
        }
    }
}


async function excluirUsuarioAdmin(
    item
) {

    if (
        !item
    ) {

        return;
    }


    if (
        Number(
            item.id
        )
        ===
        usuarioAtualId
    ) {

        return;
    }


    const confirmado =
        window.confirm(
            (
                `Excluir o usuário "${item.nome}"?\n\n`
                +
                "Essa ação remove a conta de acesso do sistema."
            )
        );


    if (
        !confirmado
    ) {

        return;
    }


    try {

        const resposta =
            await fetch(
                `/api/usuarios/${item.id}`,
                {
                    method:
                        "DELETE",

                    headers: {
                        Accept:
                            "application/json"
                    }
                }
            );


        const retorno =
            await lerRespostaApi(
                resposta
            );


        if (
            resposta.status ===
            401
        ) {

            window.location.href =
                "/login";


            return;
        }


        if (
            !resposta.ok
            ||
            retorno.sucesso ===
                false
        ) {

            throw new Error(
                retorno.mensagem
                ||
                "Não foi possível excluir o usuário."
            );
        }


        await carregarUsuariosAdmin();


        mostrarFeedbackUsuarios(
            retorno.mensagem
            ||
            "Usuário excluído com sucesso.",
            "sucesso"
        );

    } catch (
        erro
    ) {

        console.error(
            "Erro ao excluir usuário:",
            erro
        );


        mostrarFeedbackUsuarios(
            erro.message
            ||
            "Não foi possível excluir o usuário."
        );
    }
}


function configurarUsuariosAdmin() {

    if (
        !usuariosLista
    ) {

        return;
    }


    usuariosNovo?.addEventListener(
        "click",
        () => {

            abrirModalUsuario();
        }
    );


    usuariosBusca?.addEventListener(
        "input",
        renderizarUsuariosAdmin
    );


    usuarioModalFechar?.addEventListener(
        "click",
        fecharModalUsuario
    );


    usuarioFormCancelar?.addEventListener(
        "click",
        fecharModalUsuario
    );


    usuarioForm?.addEventListener(
        "submit",
        salvarUsuarioAdmin
    );


    usuarioModal?.querySelectorAll(
        "[data-fechar-modal-usuario]"
    ).forEach(
        elemento => {

            elemento.addEventListener(
                "click",
                fecharModalUsuario
            );
        }
    );


    document.addEventListener(
        "keydown",
        evento => {

            if (
                evento.key ===
                    "Escape"
                &&
                usuarioModal
                &&
                !usuarioModal.hidden
            ) {

                fecharModalUsuario();
            }
        }
    );
}


// ============================================================
// NAVEGAÇÃO
// ============================================================

function navegarParaPagina(
    pagina
) {

    const destino =
        document.querySelector(
            `.view-dashboard[data-view="${pagina}"]`
        );


    if (
        !destino
    ) {

        return;
    }


    paginaAtualDashboard =
        pagina;


    viewsDashboard.forEach(
        view => {

            const ativa =
                view ===
                destino;


            view.hidden =
                !ativa;


            view.classList.toggle(
                "view-ativa",
                ativa
            );
        }
    );


    itensSidebar.forEach(
        item => {

            item.classList.toggle(
                "ativo",
                item.dataset.pagina ===
                    pagina
            );
        }
    );


    if (
        pagina ===
        "transcricoes"
    ) {

        atualizarHistoricoTranscricoes();


        carregarHistoricoPersistente(
            {
                silencioso:
                    historicoPersistente.length >
                    0
            }
        );


        iniciarAtualizacaoAutomaticaHistorico();

    } else {

        pararAtualizacaoAutomaticaHistorico();
    }


    if (
        pagina ===
        "fila"
    ) {

        atualizarFilaDedicada();
    }


    if (
        pagina ===
        "estatisticas"
    ) {

        atualizarEstatisticas();


        carregarHistoricoPersistente(
            {
                silencioso:
                    true
            }
        );
    }


    if (
        pagina ===
        "configuracoes"
    ) {

        atualizarTelaConfiguracoes();


        if (
            !statusSistemaAtual
        ) {

            carregarStatusSistema();
        }
    }


    if (
        pagina ===
        "usuarios"
    ) {

        carregarUsuariosAdmin();
    }


    if (
        pagina ===
        "sistema"
    ) {

        carregarStatusSistema();
    }


    window.scrollTo(
        {
            top:
                0,

            behavior:
                "smooth"
        }
    );
}


// ============================================================
// SIDEBAR
// ============================================================

function configurarSidebar() {

    itensSidebar.forEach(
        item => {

            item.addEventListener(
                "click",
                () => {

                    navegarParaPagina(
                        item.dataset.pagina
                    );
                }
            );
        }
    );


    if (
        buscaTranscricoes
    ) {

        buscaTranscricoes.addEventListener(
            "input",
            atualizarHistoricoTranscricoes
        );
    }


    if (
        botaoLimparHistorico
    ) {

        botaoLimparHistorico.addEventListener(
            "click",
            limparHistoricoPersistente
        );
    }


    filtrosHistorico.forEach(
        botao => {

            botao.addEventListener(
                "click",
                () => {

                    filtroHistoricoAtual =
                        botao.dataset.filtroHistorico
                        ||
                        "todos";


                    filtrosHistorico.forEach(
                        filtro => {

                            filtro.classList.toggle(
                                "ativo",
                                filtro ===
                                    botao
                            );
                        }
                    );


                    atualizarHistoricoTranscricoes();
                }
            );
        }
    );


    if (
        historicoIrInicio
    ) {

        historicoIrInicio.addEventListener(
            "click",
            () => {

                navegarParaPagina(
                    "inicio"
                );
            }
        );
    }


    if (
        filaDedicadaIrInicio
    ) {

        filaDedicadaIrInicio.addEventListener(
            "click",
            () => {

                navegarParaPagina(
                    "inicio"
                );
            }
        );
    }


    if (
        filaDedicadaIniciar
    ) {

        filaDedicadaIniciar.addEventListener(
            "click",
            processarFila
        );
    }


    if (
        filaDedicadaPausar
    ) {

        filaDedicadaPausar.addEventListener(
            "click",
            alternarPausa
        );
    }


    if (
        filaDedicadaCancelar
    ) {

        filaDedicadaCancelar.addEventListener(
            "click",
            cancelarProcessamento
        );
    }


    navegarParaPagina(
        "inicio"
    );


    carregarHistoricoPersistente(
        {
            silencioso:
                true
        }
    );
}


// ============================================================
// LINHA
// ============================================================

function obterLinha(
    item
) {

    return document.getElementById(
        item.id
    );
}


// ============================================================
// SESSÃO
// ============================================================

function obterArquivosSessaoAtual() {

    if (
        sessaoAtual ===
        null
    ) {

        return [];
    }


    return arquivosSelecionados.filter(
        item =>
            item.sessao ===
            sessaoAtual
    );
}


function obterArquivosAguardando() {

    return arquivosSelecionados.filter(
        item =>
            item.status ===
            "aguardando"
    );
}


function possuiArquivosAguardando() {

    return arquivosSelecionados.some(
        item =>
            item.status ===
            "aguardando"
    );
}


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
            concluidos
            +
            erros
            +
            cancelados
    };
}


// ============================================================
// QUANTIDADE
// ============================================================

function atualizarQuantidadeFila() {

    const quantidade =
        arquivosSelecionados.length;


    if (
        quantidadeFila
    ) {

        quantidadeFila.textContent =
            quantidade ===
            1
                ?
                "1 arquivo"
                :
                `${quantidade} arquivos`;
    }


    if (
        cabecalhoArquivos
    ) {

        cabecalhoArquivos.style.display =
            quantidade >
            0
                ?
                "grid"
                :
                "none";
    }


    atualizarDashboard();
}


// ============================================================
// PRÉVIA
// ============================================================

function atualizarPreviaNovaFila() {

    if (
        processando
    ) {

        return;
    }


    const aguardando =
        obterArquivosAguardando()
            .length;


    if (
        aguardando >
        0
    ) {

        progressoContador.textContent =
            `0 de ${aguardando}`;


        barraProgressoPreenchimento.style.width =
            "0%";


        progressoTexto.textContent =
            "Arquivos aguardando processamento";
    }


    atualizarDashboard();
}


// ============================================================
// CONTROLES
// ============================================================

function atualizarControles() {

    const possuiArquivos =
        arquivosSelecionados.length >
        0;


    const possuiAguardando =
        possuiArquivosAguardando();


    if (
        processando
    ) {

        botaoTranscrever.disabled =
            true;


        botaoTranscrever.textContent =
            "Em execução...";


        botaoLimpar.disabled =
            true;


        botaoPausar.disabled =
            cancelamentoSolicitado;


        botaoCancelar.disabled =
            cancelamentoSolicitado;


        botaoNovaTranscricao.hidden =
            true;


        atualizarDashboard();


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


    atualizarDashboard();
}


function mostrarBotaoNovaTranscricao() {

    botaoNovaTranscricao.hidden =
        false;
}


function ocultarBotaoNovaTranscricao() {

    botaoNovaTranscricao.hidden =
        true;
}


// ============================================================
// PROGRESSO
// ============================================================

function atualizarProgressoSessaoAtual() {

    const resumo =
        obterResumoSessaoAtual();


    progressoContador.textContent =
        `${resumo.encerrados} de ${resumo.total}`;


    const percentual =
        resumo.total >
        0
            ?
            (
                resumo.encerrados
                /
                resumo.total
            )
            *
            100
            :
            0;


    barraProgressoPreenchimento.style.width =
        `${percentual}%`;


    atualizarDashboard();
}


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
        resumo.total >
        0
            ?
            "100%"
            :
            "0%";


    atualizarDashboard();
}


// ============================================================
// STATUS
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


    if (
        linha
    ) {

        const elemento =
            linha.querySelector(
                ".status"
            );


        if (
            elemento
        ) {

            elemento.className =
                `status status-${status}`;


            elemento.textContent =
                textoStatus;
        }


        if (
            status ===
                "transcrevendo"
            ||
            status ===
                "cancelando"
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


    atualizarSelecaoVisualTranscricao();


    atualizarDashboard(
        item
    );
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


    if (
        linha
    ) {

        const elemento =
            linha.querySelector(
                ".coluna-processamento-fila"
            );


        if (
            elemento
        ) {

            elemento.textContent =
                formatarTempo(
                    segundos
                );
        }
    }


    if (
        item.status ===
            "transcrevendo"
        ||
        item.status ===
            "cancelando"
    ) {

        atualizarPainelTranscricao(
            item
        );
    }


    if (
        paginaAtualDashboard ===
        "transcricoes"
    ) {

        atualizarTempoHistoricoItem(
            item
        );
    }


    if (
        paginaAtualDashboard ===
        "fila"
    ) {

        atualizarFilaDedicada();
    }
}


// ============================================================
// LIMPAR RESULTADO
// ============================================================

function limparResultadoArquivo(
    item
) {

    item.transcricao =
        "";

    item.arquivoDocx =
        null;

    item.historicoId =
        null;

    item.erro =
        "";

    item.tempo =
        0;


    atualizarTempoLinha(
        item,
        0
    );


    atualizarDashboard(
        item
    );
}


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
// ERROS
// ============================================================

function obterMensagemErroUsuario(
    erro
) {

    if (
        !erro
    ) {

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


    const minuscula =
        mensagem.toLowerCase();


    if (
        minuscula.includes(
            "failed to fetch"
        )
        ||
        minuscula.includes(
            "networkerror"
        )
    ) {

        return (
            "Não foi possível se comunicar com o servidor. "
            +
            "Verifique se o aplicativo continua aberto."
        );
    }


    return (
        mensagem
        ||
        "Ocorreu um erro inesperado."
    );
}


function mostrarErroArquivo(
    item,
    mensagem
) {

    item.erro =
        mensagem;


    atualizarDashboard(
        item
    );
}


// ============================================================
// CRIAR LINHA
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


    const principal =
        document.createElement(
            "div"
        );


    principal.className =
        "linha-arquivo-principal";


    // NOME

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


    // FORMATO

    const colunaFormato =
        document.createElement(
            "div"
        );


    colunaFormato.className =
        "coluna-formato-fila";


    colunaFormato.appendChild(
        criarBadgeFormato(
            item.arquivo.name
        )
    );


    // DURAÇÃO

    const colunaDuracao =
        document.createElement(
            "div"
        );


    colunaDuracao.className =
        "coluna-duracao-fila duracao-carregando";


    colunaDuracao.textContent =
        "Lendo...";


    // TAMANHO

    const colunaTamanho =
        document.createElement(
            "div"
        );


    colunaTamanho.className =
        "coluna-tamanho-fila";


    colunaTamanho.textContent =
        formatarTamanho(
            item.arquivo.size
        );


    // STATUS

    const colunaStatus =
        document.createElement(
            "div"
        );


    colunaStatus.className =
        "coluna-status-fila";


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


    // PROCESSAMENTO

    const colunaProcessamento =
        document.createElement(
            "div"
        );


    colunaProcessamento.className =
        "coluna-processamento-fila";


    colunaProcessamento.textContent =
        "00:00";


    principal.appendChild(
        colunaNome
    );


    principal.appendChild(
        colunaFormato
    );


    principal.appendChild(
        colunaDuracao
    );


    principal.appendChild(
        colunaTamanho
    );


    principal.appendChild(
        colunaStatus
    );


    principal.appendChild(
        colunaProcessamento
    );


    linha.appendChild(
        principal
    );


    linha.addEventListener(
        "click",
        () => {

            selecionarTranscricaoDaFila(
                item
            );
        }
    );


    linha.addEventListener(
        "keydown",
        evento => {

            if (
                evento.key !==
                    "Enter"
                &&
                evento.key !==
                    " "
            ) {

                return;
            }


            if (
                item.status !==
                "concluido"
            ) {

                return;
            }


            evento.preventDefault();


            selecionarTranscricaoDaFila(
                item
            );
        }
    );


    listaArquivos.appendChild(
        linha
    );


    atualizarSelecaoVisualTranscricao();
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
        arquivos.length ===
        0
    ) {

        return;
    }


    let invalidos =
        0;

    let duplicados =
        0;


    arquivos.forEach(
        arquivo => {

            if (
                !arquivoPermitido(
                    arquivo
                )
            ) {

                invalidos++;


                return;
            }


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


            if (
                existente
            ) {

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


                    carregarDuracaoItem(
                        existente
                    );


                    return;
                }


                duplicados++;


                return;
            }


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

                duracao:
                    null,

                duracaoCarregando:
                    true,

                transcricao:
                    "",

                arquivoDocx:
                    null,

                historicoId:
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


            carregarDuracaoItem(
                item
            );
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


    if (
        processando
    ) {

        atualizarProgressoSessaoAtual();
    }


    atualizarControles();


    if (
        invalidos >
        0
    ) {

        alert(
            invalidos ===
            1
                ?
                "1 arquivo foi ignorado porque o formato não é suportado."
                :
                `${invalidos} arquivos foram ignorados porque os formatos não são suportados.`
        );
    }


    if (
        duplicados >
        0
    ) {

        alert(
            duplicados ===
            1
                ?
                "1 arquivo duplicado não foi adicionado novamente."
                :
                `${duplicados} arquivos duplicados não foram adicionados novamente.`
        );
    }


    atualizarDashboard();
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


                atualizarTempoTotalDashboard();


                atualizarFilaDedicada();
            },
            1000
        );
}


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


    if (
        mostrarTotal
    ) {

        cronometroAtual.textContent =
            `Total: ${formatarTempo(
                segundosTotaisFila
            )}`;
    }


    atualizarTempoTotalDashboard();
}


// ============================================================
// PAUSA
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


function alternarPausa() {

    if (
        !processando
        ||
        cancelamentoSolicitado
    ) {

        return;
    }


    if (
        pausaSolicitada
    ) {

        pausaSolicitada =
            false;


        botaoPausar.textContent =
            "Pausar";


        estadoFila.textContent =
            "Processando";


        progressoTexto.textContent =
            "Processamento retomado";


        if (
            resolverPausa
        ) {

            resolverPausa();


            resolverPausa =
                null;
        }


        atualizarDashboard();


        return;
    }


    pausaSolicitada =
        true;


    botaoPausar.textContent =
        "Continuar";


    estadoFila.textContent =
        "Pausa solicitada";


    progressoTexto.textContent =
        "A fila pausará após o arquivo atual";


    atualizarDashboard();
}


// ============================================================
// CANCELAMENTO
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


async function cancelarProcessamento() {

    if (
        !processando
        ||
        cancelamentoEmAndamento
    ) {

        return;
    }


    if (
        configuracoesUsuario
            .confirmarCancelamento
    ) {

        const confirmado =
            window.confirm(
                "Cancelar a transcrição atual e os arquivos que ainda aguardam na fila?"
            );


        if (
            !confirmado
        ) {

            return;
        }
    }


    cancelamentoSolicitado =
        true;


    cancelamentoEmAndamento =
        true;


    pausaSolicitada =
        false;


    if (
        resolverPausa
    ) {

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
        itemAtual.status ===
            "transcrevendo"
    ) {

        atualizarStatusLinha(
            itemAtual,
            "cancelando",
            "Cancelando..."
        );
    }


    estadoFila.textContent =
        "Cancelando processamento";


    progressoTexto.textContent =
        "Encerrando Whisper...";


    atualizarDashboard();


    try {

        const resposta =
            await fetch(
                "/cancelar",
                {
                    method:
                        "POST"
                }
            );


        const dados =
            await resposta.json();


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


        pararCronometroArquivo();


        pararCronometroTotal(
            true
        );


        if (
            controladorFetchAtual
        ) {

            controladorFetchAtual.abort();


            controladorFetchAtual =
                null;
        }


        if (
            itemAtual
        ) {

            atualizarStatusLinha(
                itemAtual,
                "cancelado",
                "Cancelado"
            );
        }


        cancelarArquivosAguardandoSessaoAtual();


        processando =
            false;


        cancelamentoSolicitado =
            false;


        indiceAtualProcessamento =
            -1;


        estadoFila.textContent =
            "Processamento cancelado";


        arquivoAtual.textContent =
            "Nenhum arquivo em processamento";


        mostrarResumoSessao(
            "Fila cancelada"
        );


        mostrarBotaoNovaTranscricao();


        atualizarControles();


        carregarHistoricoPersistente(
            {
                silencioso:
                    true
            }
        );

    } catch (
        erro
    ) {

        console.error(
            erro
        );


        cancelamentoSolicitado =
            false;


        if (
            itemAtual
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


        alert(
            obterMensagemErroUsuario(
                erro
            )
        );

    } finally {

        cancelamentoEmAndamento =
            false;


        atualizarControles();
    }
}


// ============================================================
// PROCESSAR ARQUIVO
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

    } catch (
        erro
    ) {

        if (
            erro.name ===
            "AbortError"
        ) {

            throw erro;
        }


        throw new Error(
            "Não foi possível se comunicar com o servidor."
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


    const dadosResposta =
        await resposta.json();


    if (
        !resposta.ok
        ||
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
            "Nenhum resultado foi retornado."
        );
    }


    return dadosResposta.resultados[
        0
    ];
}


// ============================================================
// PROCESSAR FILA
// ============================================================

async function processarFila() {

    if (
        processando
        ||
        !possuiArquivosAguardando()
    ) {

        return;
    }


    ocultarBotaoNovaTranscricao();


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


    contadorExecucao++;


    const minhaExecucao =
        contadorExecucao;


    execucaoAtualId =
        minhaExecucao;


    processando =
        true;


    cancelamentoSolicitado =
        false;


    pausaSolicitada =
        false;


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

        while (
            true
        ) {

            if (
                execucaoAtualId !==
                minhaExecucao
                ||
                !processando
                ||
                cancelamentoSolicitado
            ) {

                break;
            }


            await aguardarSePausado();


            if (
                !processando
                ||
                cancelamentoSolicitado
            ) {

                break;
            }


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
                indice ===
                -1
            ) {

                break;
            }


            const item =
                arquivosSelecionados[
                    indice
                ];


            indiceAtualProcessamento =
                indice;


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
                    resultado.historico_id
                ) {

                    item.historicoId =
                        resultado.historico_id;
                }


                if (
                    resultado.cancelado
                ) {

                    atualizarStatusLinha(
                        item,
                        "cancelado",
                        "Cancelado"
                    );


                    break;
                }


                if (
                    resultado.sucesso
                ) {

                    item.transcricao =
                        resultado.transcricao
                        ||
                        "";


                    item.arquivoDocx =
                        resultado.arquivo_docx
                        ||
                        null;


                    item.erro =
                        "";


                    atualizarStatusLinha(
                        item,
                        "concluido",
                        "✓ Concluído"
                    );


                    carregarHistoricoPersistente(
                        {
                            silencioso:
                                true
                        }
                    );

                } else {

                    throw new Error(
                        resultado.erro
                        ||
                        "Erro desconhecido."
                    );
                }

            } catch (
                erro
            ) {

                pararCronometroArquivo();


                if (
                    erro.name ===
                    "AbortError"
                ) {

                    break;
                }


                const mensagem =
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
                    mensagem
                );


                progressoTexto.textContent =
                    "Um arquivo apresentou erro. Continuando a fila...";
            }


            atualizarProgressoSessaoAtual();
        }

    } finally {

        controladorFetchAtual =
            null;


        pararCronometroArquivo();


        if (
            execucaoAtualId !==
            minhaExecucao
        ) {

            return;
        }


        if (
            !processando
        ) {

            return;
        }


        pararCronometroTotal(
            true
        );


        processando =
            false;


        pausaSolicitada =
            false;


        cancelamentoSolicitado =
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


        atualizarDashboard();


        carregarHistoricoPersistente(
            {
                silencioso:
                    true
            }
        );
    }
}


// ============================================================
// RESET
// ============================================================

function resetarInterface() {

    pararCronometroArquivo();


    pararCronometroTotal(
        false
    );


    arquivosSelecionados =
        [];


    itemTranscricaoSelecionadoId =
        null;


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


    atualizarDashboard();
}


// ============================================================
// LIMPAR
// ============================================================

function limparLista() {

    if (
        processando
    ) {

        return;
    }


    resetarInterface();
}


// ============================================================
// NOVA TRANSCRIÇÃO
// ============================================================

function novaTranscricao() {

    if (
        processando
    ) {

        return;
    }


    resetarInterface();


    estadoFila.textContent =
        "Aguardando novos arquivos";
}


// ============================================================
// SELETOR DIRETO DE ARQUIVOS
// ============================================================

function abrirSeletorArquivos(
    evento = null
) {

    /*
        Clique normal:
        abre imediatamente o seletor nativo do sistema e permite
        escolher um ou vários arquivos.

        Shift + clique:
        preserva a antiga função "Selecionar pasta", sem exibir
        menu adicional na interface.
    */

    if (
        evento
        &&
        evento.shiftKey
        &&
        inputPasta
    ) {

        inputPasta.click();


        return;
    }


    if (
        inputArquivos
    ) {

        inputArquivos.click();
    }
}


// ============================================================
// EVENTOS
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


if (
    botaoSelecionarUpload
) {

    botaoSelecionarUpload.addEventListener(
        "click",
        evento => {

            evento.preventDefault();

            abrirSeletorArquivos(
                evento
            );
        }
    );
}


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


if (
    botaoExportarWord
) {

    botaoExportarWord.addEventListener(
        "click",
        exportarUltimoWord
    );
}


// ============================================================
// INICIALIZAÇÃO
// ============================================================

configurarEstiloTabelaInicio();


configurarCabecalhoFilaInicio();


configurarBotoesAcaoPrincipais();


configurarPaginasFuncionais();


configurarUsuariosAdmin();


configurarTema();


configurarSidebar();


carregarStatusSistema();


atualizarWhisperVisualizador();


iniciarWhisperCanvas();


cabecalhoArquivos.style.display =
    "none";


painelProgresso.style.display =
    "none";


ocultarBotaoNovaTranscricao();


atualizarQuantidadeFila();


atualizarControles();


atualizarDashboard();

// ============================================================
// WHISPER — REDIMENSIONAMENTO DO CANVAS
// ============================================================

window.addEventListener(
    "resize",
    () => {

        if (
            whisperNeuralCanvas
        ) {

            whisperNeuralCanvas.width =
                0;


            whisperNeuralCanvas.height =
                0;


            prepararWhisperCanvas();
        }
    }
);


// ============================================================
// PERFORMANCE — VISIBILIDADE DA ABA
// ============================================================

document.addEventListener(
    "visibilitychange",
    () => {

        document.body.classList.toggle(
            "pagina-oculta",
            document.hidden
        );


        atualizarModoPerformanceHud();
    }
);
