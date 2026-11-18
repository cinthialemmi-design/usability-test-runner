# usability-test-runner

Skill para orientar o Codex a criar testes de usabilidade de protótipos HTML no celular, com tarefas, coleta de resultados, mapas de cliques e replay visual.

A skill contém instruções, contratos, exemplos de configuração e um verificador. Ela orienta a construção dos componentes de cada estudo; não inclui uma plataforma hospedada, um SDK de captura ou um servidor pronto.

## Instalar no Codex

Peça ao Codex:

> Instale a skill deste diretório: https://github.com/cinthialemmi-design/usability-test-runner/tree/main/usability-test-runner

Para instalar manualmente, baixe o repositório e copie a pasta `usability-test-runner` que contém `SKILL.md` para sua pasta pessoal de skills do Codex, normalmente `~/.codex/skills/`.

## Usar

> Use $usability-test-runner com meu protótipo HTML para preparar um teste no celular, incluindo tarefas, critérios configuráveis, coleta, mapas de cliques e replay visual.

Forneça o HTML ou seu projeto editável, o objetivo da pesquisa e o público. A skill ajuda a definir as tarefas e critérios e a identificar as conexões de hospedagem e armazenamento necessárias.

## Capacidades

- Experiência do participante com consentimento, instruções, tarefas, pausa, respostas e encerramento.
- Marca, assets, telas, variantes, cenários, perguntas e critérios configuráveis por projeto.
- Separação entre conclusão observada, declaração do participante e avaliação humana.
- Coleta com identificação de sessão, persistência, reenvio idempotente e confirmação de recebimento.
- Mapas por tarefa, tela e visualização compatível, considerando tamanho e rolagem.
- Replay por reconstrução de capturas sanitizadas, com controles de reprodução e bundles visuais versionados.
- Mascaramento de campos e conteúdo derivado, como resumos e atributos.
- Resultados por tarefa e participação, anotações autorizadas e exportação CSV/JSON.

O replay não é vídeo. Mapas de cliques não medem olhar ou atenção. Captura de outros aplicativos, áudio, câmera, recrutamento e testes de aplicativos nativos ficam fora do escopo padrão.

## Configuração de exemplo

O arquivo [`study.example.json`](usability-test-runner/assets/study.example.json) usa um estudo fictício de reserva de salas. Ele está em modo de prévia, com dados de piloto. Os caminhos do protótipo são ilustrativos; a configuração não contém um aplicativo implementado.

A configuração usa o contrato versão 2. Projetos anteriores exigem migração explícita. Atualizar a skill não altera pesquisas já publicadas nem ativa captura retroativa.

## Verificar a configuração

Requer Python 3 e somente sua biblioteca padrão:

```sh
python3 usability-test-runner/scripts/validate_project.py usability-test-runner/assets/study.example.json
python3 usability-test-runner/scripts/test_validate_project.py
```

O verificador testa a consistência dos catálogos, referências, critérios, cenários e dependências de configuração. Ele não comprova funcionamento do protótipo, eficácia do mascaramento, autorização, hospedagem ou coleta remota. Essas partes precisam de testes de execução em cada projeto.

## Estrutura

```text
usability-test-runner/
├── SKILL.md
├── agents/
├── assets/
├── references/
└── scripts/
```

Comece por [`SKILL.md`](usability-test-runner/SKILL.md). As referências detalham planejamento, integração HTML, configuração portátil, coleta, captura visual, mapas, replay e verificação antes da distribuição.

## Dados e serviços

Este repositório contém apenas a skill, exemplos neutros e verificadores. Hospedagem, armazenamento, credenciais, autorização, consentimento e retenção são configurados em cada projeto. Resultados de participantes e segredos de projetos não fazem parte do pacote.
