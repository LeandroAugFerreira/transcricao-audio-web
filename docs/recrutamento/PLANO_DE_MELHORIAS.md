# VoxTexto V2.0 — plano de evolução para entrevistas de Python

**Data:** 08/11/2026. **Critério:** empregabilidade e verificabilidade, sem criar promessas sobre IA/tempo economizado.

| Ordem | Trabalho | Impacto para recrutadores | Esforço | Risco | Aceite |
| --- | --- | --- | --- | --- | --- |
| P0 | 9 testes integração Flask/SQLite/Word com worker simulado | Alta confiança backend | Médio | Baixo | 15 unittest verdes no CI, sem dados privados |
| P0 | Tour estático de três estados e separação por conta | Demonstração sem instalação | Médio | Baixo | Tela mobile sem API/upload ou documento real |
| P0 | Auditoria + arquitetura + evidências e entrevista | Comunicação | Baixo | Baixo | Referências cruzadas e limites explícitos |
| P1 | Limite de upload por requisição, validação MIME/arquivo e quotas | Segurança + robustez | Médio | Alto se omitido | Arquivos grandes/errados recusados sem consumir disco excessivo |
| P1 | Proteção CSRF e cookies/headers seguros; desligar debug | Segurança | Médio | Alto se exposto | Testes Flask negativos e comportamento local preservado |
| P1 | Retenção/expurgo por usuário, backups e privacidade | Confiança no produto | Médio | Médio/alto | Política e testes de limpeza de SQLite/DOCX |
| P1 | Testar worker real com áudio **original e não pessoal**, pequeno e com transcrição de referência | Evidência de IA de fato | Médio/alto | Médio | WER/CER, duração, hardware/modelo, seeds e artefatos sem dados pessoais |
| P1 | CI com verificação de FFmpeg/pacotes e teste de cancelamento real | Resiliência | Alto | Médio/alto | Runner isolado, sem download inseguro e logs verificáveis |
| P1 | QA browser real e responsividade/teclado/feedback de erro | Full Stack | Médio | Baixo/médio | Fluxo de login/upload fictício com código de backend isolado |
| P2 | Extrair `app.py` em rotas, serviços, persistência, documentos, worker | Manutenibilidade | Alto | Médio/alto | Refatorações incrementais, 15 testes preservados |
| P2 | Escalonar fila multiusuário com jobs persistidos e limites | Evolução | Alto | Alto | Não perder tarefa em reinício, comportamento concorrente verificável |
| P2 | Avaliar diferenças de PyTorch fonte vs Windows, recursos RAM/CPU e versão FFmpeg | Release confiável | Médio/alto | Alto | Testes de build e instalação Windows em ambiente limpo |
| P3 | Recursos opcionais: diarização, idiomas, exportações adicionais | Valor de produto | Alto | Variável | Requisito real, testes e consentimento antes de codificar |

## Acesso para triagem

O [tour HTML/JS estático](https://leandroaugferreira.github.io/voxtexto-demo.html) permite simular sucesso, erro e cancelamento com duas contas fictícias, sem upload, inferência, banco ou API expostos. Para comprovação de engenharia, abrir [testes](../../tests/test_recruiting_flows.py) e [CI](EVIDENCIAS.md), e para UX mostrar [capturas e vídeo existentes](https://leandroaugferreira.github.io/python.html).

**Não publicar Flask real para visitas** no estado atual. A aplicação foi concebida para loopback local e arquivos pessoais; a ausência de CSRF/tamanho/retention e a opção debug requerem revisão antes de qualquer implantação remota.

## Evidência que ainda NÃO existe

- WER/CER, velocidade/minuto, accuracy, memória GPU/CPU, ganho de produtividade.
- Novo build/instalador em Windows validado no mesmo commit do caso.
- Teste browser integrado completo ou cancelamento de Whisper real.
- Consentimento/segurança para uploads de áudio privado de terceiros.

## Prioridade recomendada

Após este case, investir na **segurança de upload e na prova de inferência com áudio sintético/licenciado**, e só depois avançar para novos recursos. Para recrutadores, explicar falha e acesso a dados é um diferencial mais forte que listar muitos formatos extras.

[Auditoria](AUDITORIA.md) · [Evidências](EVIDENCIAS.md).
