# Validação da cópia fonte — 02/11/2026

Backend/checagens existentes: **6 aprovados**.

Frontend: Não há build frontend separado executado..

Os 6 casos verificam versão/instalador; não foi feita transcrição de áudio real nem build do instalador.

Os testes Python usaram ambientes já instalados, com segredos de ambiente removidos e arquivos temporários confinados à pasta de trabalho. O processo principal bloqueou DNS/conexões externas; conexões de loopback e subprocessos existentes foram revisados. Não foram iniciados n8n, envio SMTP real, conexão pessoal de IA ou transmissão fiscal. As simulações e documentos produzidos pelos testes são fictícios e não acompanham o pacote fonte.

Os testes inicialmente executados no sandbox não concluíram a inicialização; a execução isolada com acesso local adequado resolveu esse bloqueio de ambiente. Duas execuções completas pararam no limite inicial de cinco minutos, sem serem contabilizadas como aprovação. Os resultados acima usam as execuções concluídas e o reteste explicitado.

Dependências Python não foram instaladas ou adicionadas. Os builds reutilizaram dependências locais copiadas; para Chronos, o frontend foi restaurado em diretório novo pelo mesmo lockfile, sem scripts de instalação. Nenhum manifest da aplicação foi alterado. Os avisos de depreciação do adaptador de TestClient e o aviso de tamanho de chunk no build Chronos não foram tratados como novas funcionalidades ou como testes reprovados; não houve troca de dependências para suprimi-los.

Não houve instalação completa do backend a partir de ambiente vazio, teste de produção, novo build de EXE ou implantação. Os comandos do README foram conferidos no código, incluindo o preenchimento local de campos secretos deixados vazios nos exemplos. Este documento registra os testes locais; as execuções remotas são consultáveis na página de Actions do repositório.

As evidências estruturadas nesta pasta registram resultados reais. Os originais e os arquivos de lógica da aplicação foram preservados; somente documentação, exemplos sem credenciais e configuração de CI diferem na cópia.


---

## Revisão de recrutamento — 08/11/2026

Foi adicionada a suíte [test_recruiting_flows.py](../../tests/test_recruiting_flows.py), com **nove novos testes** de integração sobre uma cópia temporária do app Flask original: sessão/autorização, upload/validação, resultado falso do worker, histórico SQLite, Word real, tratamento de erros/cancelamento e isolamento de duas contas.

[GitHub Actions #42535099487](https://github.com/LeandroAugFerreira/transcricao-audio-web/actions/runs/42535099487) concluiu **15 unittest aprovados** e validação de versão V2.0. Os seis casos pré-existentes testam somente a release. No novo workflow o worker Whisper é substituído por mock, sem PyTorch/FFmpeg, áudio pessoal ou download do modelo; o Word é realmente gerado com python-docx a partir de texto inventado. Nenhum instalador Windows novo foi construído por esse workflow.

O [tour web](https://leandroaugferreira.github.io/voxtexto-demo.html), quando publicado pelo portfólio, é HTML/JavaScript sem upload/API/modelo e não constitui teste de inferência. As limitações e os riscos de upload/sessão estão em [AUDITORIA.md](../recrutamento/AUDITORIA.md) e [EVIDENCIAS.md](../recrutamento/EVIDENCIAS.md).
