# VoxTexto V2.0 — auditoria técnica para recrutamento

**Código-base auditado:** [main](https://github.com/LeandroAugFerreira/transcricao-audio-web/tree/545d5c91006b5e64586463ed766c726c2f00f5d5), commit `545d5c91006b5e64586463ed766c726c2f00f5d5` (08/11/2026). **Escopo:** leitura estática de módulos e cenários leves executados sobre uma cópia temporária do Flask original. Não é pentest, teste de precisão de fala nem homologação de instalador.

## Parecer para recrutadores

O VoxTexto demonstra **engenharia Python para processamento local de mídia**, não apenas chamada de API de IA. A aplicação usa Flask para entrada, histórico SQLite por usuário, processo separado `multiprocessing.spawn` para Whisper/PyTorch, filas de comando e resultado, controle de cancelamento e geração de Word com `python-docx`.

O código central tem aproximadamente 6.900 linhas em [app.py](../../app.py), e a interface reúne HTML/CSS/JavaScript sem React. Para uma entrevista júnior, explicar criticamente a arquitetura e os testes importa mais do que apresentar esse tamanho como prova de qualidade. O principal risco de manutenção é concentrar muitas responsabilidades em um arquivo único.

## Código efetivamente inspecionado

- [app.py](../../app.py): definição Flask, sessão, autenticação e perfis, inicialização SQLite, `/transcrever`, `/historico`, `/cancelar`, `/download`, processamento, tratamento de texto, geração DOCX, worker e FFmpeg.
- [templates](../../templates), [static/js/script.js](../../static/js/script.js): interface e acionamento de fluxos; a revisão do frontend não foi linha a linha.
- [requirements.txt](../../requirements.txt), [requirements-windows-exe.txt](../../requirements-windows-exe.txt): Flask, Whisper/PyTorch, python-docx, diferenças de ambiente fonte/build.
- [tests/test_release.py](../../tests/test_release.py), [scripts/validate_release.py](../../scripts/validate_release.py): testes prévios de metadados e release.
- [tests/test_recruiting_flows.py](../../tests/test_recruiting_flows.py): 9 testes de integração novos com respostas sintéticas do worker.
- [windows-build.yml](../../.github/workflows/windows-build.yml) e [novo CI leve](../../.github/workflows/recruiting-tests.yml).

## Implementado vs simulado vs pendente

| Capacidade | O que foi encontrado | Evidência |
| --- | --- | --- |
| Upload de MP3/MP4/WAV/M4A/OGG | Validação de extensão e nome, gravação temporária | Código real e testes leves |
| Whisper `small` / FFmpeg | Worker separado e conversão/transcrição local programadas | Código real, **inferência não reexecutada nesta revisão** |
| Fila e cancelamento | Filas entre Flask/worker, lock e verificação do proprietário da tarefa ativa | Código, testes de permissão usando evento simulado |
| Resultado e falhas | Estados `transcrevendo`, `concluido`, `erro` e `cancelado` | Testes reais de Flask/SQLite com worker substituído |
| Tratamento e Word | Normalização/correções seguras/parágrafos, geração `.docx` | DOCX real gerado e lido pelos testes |
| Histórico | SQLite local por usuário, download autorizado conforme propriedade/status | Testes reais no banco temporário |
| Instalação Windows | Fluxo de PyInstaller/Inno Setup versionado | Workflow histórico; **novo instalador não gerado nesta revisão** |
| Demo no navegador | Visualização estática de três estados | Sem API, áudio, banco, inferência ou Word real |
| Precisão e velocidade | Nenhum ensaio WER/CER/latência atual | **Não medidos** |

## Principais forças

1. **Isolamento do processamento pesado:** o worker de fala pode ser encerrado/reiniciado sem confundir a requisição Flask com inferência simultânea no mesmo processo.
2. **Controles de acesso no backend:** histórico e download restringem `usuario_id`; cancelamento confere quem iniciou a tarefa ativa sob lock.
3. **Caminho de erro explícito:** falha/cancelamento são persistidos, e uploads temporários passam por `finally` para limpeza.
4. **Entregável real:** `python-docx` gera documento Word com formatação, não uma imagem ou texto colado na interface.
5. **CI leve reproduzível:** novos testes usam apenas Flask + python-docx em diretório efêmero; não fazem download do modelo nem áudio pessoal.

## Riscos e pontos de atenção antes de hospedar

- **Limite de upload ausente:** a configuração Flask não define `MAX_CONTENT_LENGTH`. O código confere que o arquivo salvo é não vazio, mas não demonstra limite de tamanho antes de consumir disco. Prioridade alta.
- **CSRF não demonstrado:** autenticação usa sessão via cookie, mas não foi encontrado token CSRF nos endpoints mutáveis (incluindo limpar histórico e cancelar). Avaliar proteção para uma interface de navegador.
- **Cookie seguro:** HttpOnly e SameSite Lax estão configurados, mas não há `SESSION_COOKIE_SECURE` no código. A aplicação roda em loopback HTTP; não se deve assumir segurança de implantação pública.
- **Debug do servidor:** `app.run(debug=not MODO_EXECUTAVEL)`, embora restrito a 127.0.0.1. Para implantação, debug deve permanecer desligado.
- **Arquivo monolítico e concorrência:** `app.py` reúne UI, autenticação, filas, documentos e DB. `processamento_lock` serializa globalmente o fluxo, e a abordagem não foi testada sob carga concorrente.
- **Retenção e privacidade:** arquivos DOCX, transcrições e SQLite permanecem localmente; o usuário controla histórico. Política formal de retenção/criptografia e consentimento não foram auditados.
- **Validação do arquivo:** a extensão é uma lista permitida, mas isso não comprova análise real de MIME/magic bytes. Testes falsos de extensão não devem ser descritos como detecção de mídia segura.
- **Custo computacional:** Whisper `small` + PyTorch pode exigir memória/CPU significativas; não há benchmark independente, WER/CER, hardware-alvo homologado nesta revisão.

Esses riscos **não autorizam** ativar servidor público. Nenhum dado de outra instalação deve ser migrado para a demo.

## Regressão executada

[GitHub Actions #42535099487](https://github.com/LeandroAugFerreira/transcricao-audio-web/actions/runs/42535099487): **15 testes aprovados** (6 antigos de release + 9 novos de integração) e verificação de consistência V2.0 concluída. O teste gera DOCX de texto sintético, exercita a rota Flask e verifica isolamento de usuário; **o modelo Whisper não foi carregado**. Consulte [EVIDENCIAS.md](EVIDENCIAS.md).

## Recomendação profissional

Apresentar: “VoxTexto é um aplicativo local em Python/Flask para organizar transcrição Whisper com worker separado, tratamento de erros, histórico SQLite por usuário e geração de documentos Word. Testei as rotas e os artefatos de saída em integração com worker simulado, sem alegar medições de acurácia do modelo.”

[Estudo de caso](ESTUDO_DE_CASO.md) · [Arquitetura](ARQUITETURA.md) · [Plano](PLANO_DE_MELHORIAS.md).
