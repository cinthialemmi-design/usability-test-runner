# usability-test-runner

Skill para orientar o Codex a transformar telas de um link do Figma em protótipo HTML navegável, ou usar HTML existente, e construir o sistema completo de teste de usabilidade no celular: participante, recebimento de respostas, armazenamento, painel privado, mapas de cliques e replay visual.

A entrega padrão ao usar a skill é um link hospedado com coleta centralizada e painel funcionando. A prévia local serve para conferir o estudo. A skill inclui instruções, contratos e uma base executável reutilizável para construir, conectar e publicar os componentes; instalar a skill não cria acesso a contas, serviços ou credenciais.

## Base funcional incluída

O pacote reúne instruções de implementação e [um projeto de referência completo](usability-test-runner/assets/starter/README.md), com:

- Orientação para entrada por link do Figma, leitura do design, implementação HTML e integração ao estudo.
- Participante com consentimento, tarefas, perguntas, pausa e retomada.
- Recebimento com confirmação, reenvios sem duplicação e banco SQLite persistente.
- Painel privado com resultados, avaliação humana, paginação, exclusão e exportação CSV/JSON.
- Mapas por tarefa, tela, participação e visualização compatível.
- Replay isolado com reprodução, pausa, velocidade e linha do tempo.
- Tags estruturais preservadas e imagens/fontes aprovadas incorporadas por revisão.
- Janela original, posição e área visível registradas separadamente para mapas e replay.
- Estilos do estudo limitados aos controles, com estilos próprios do produto.
- Confirmação da quantidade e ordem dos eventos antes de aceitar respostas finais.
- Configuração e adaptador de produto separados do motor; reserva de salas como exemplo substituível.

A referência usa Node.js 24+, SQLite e bibliotecas de CSS com versões travadas; inclui migrações, configuração de ambiente e Dockerfile. Copie `usability-test-runner/assets/starter/` para seu projeto e siga seu README. Hospedagem do receptor requer servidor e armazenamento persistente; GitHub Pages sozinho não atende a coleta.

**Estado desta atualização: implementação preparada; execução e validação pendentes.** Por solicitação do usuário, não foram iniciados testes, servidor ou novo piloto. O código publicado não deve ser confundido com um estudo hospedado ou coleta verificada. Consulte a [lista pendente](usability-test-runner/assets/starter/docs/verification-pending.md).

O perfil inicial suporta uma variante fixa e uma instalação por estudo/revisão/ambiente. Imagens/fontes locais aprovadas e CSS com `url()`/`@import` estão incluídos. Randomização, conclusão automática, ponte entre origens e multiestudo exigem extensão explícita. O perfil atual é `starter-3`, com captura visual versão 3; veja [capacidades e limites](usability-test-runner/assets/starter/README.md#perfil-implementado-e-limites).

## Instalar no Codex

Peça ao Codex:

> Instale a skill deste diretório: https://github.com/cinthialemmi-design/usability-test-runner/tree/main/usability-test-runner

Para instalar manualmente, baixe o repositório e copie a pasta `usability-test-runner` que contém `SKILL.md` para sua pasta pessoal de skills do Codex, normalmente `~/.codex/skills/`.

## Usar

> Use $usability-test-runner com meu link do Figma para transformar as telas em protótipo HTML navegável e preparar o teste completo no celular, com tarefas, critérios, coleta, painel privado, mapas e replay.

Também funciona com HTML existente:

> Use $usability-test-runner com meu protótipo HTML para preparar o estudo completo, preservando sua interface e marca.

Forneça um link do Figma com acesso às telas, ou os arquivos HTML/projeto editável, além do objetivo da pesquisa e do público. Se o arquivo tiver muitos fluxos, indique os frames ou o percurso de interesse. A skill orienta o Codex a ler a fonte, construir as interações necessárias, propor tarefas/critérios e conectar a infraestrutura disponível.

## Partindo do Figma

O fluxo é: **link acessível → contexto das telas e recursos → HTML navegável → adaptador e configuração → participante, coleta, painel, mapas e replay**. A integração Figma disponível fornece a leitura do arquivo; instalar a skill não cria essa conexão ou permissão.

A conversão é realizada pelo Codex durante a implementação. O servidor do starter recebe HTML editável e não exige credenciais Figma no navegador. As imagens do design são referência visual; as telas do produto são construídas em HTML, com navegação e estados, em vez de usar screenshots como aplicativo.

Comportamentos ausentes no design são tratados como hipóteses identificadas. Origem das telas, nós usados, interações e pendências ficam em um registro de projeto fora da configuração pública. Se faltar acesso, a entrega indica a conexão/permissão ou link específico necessário e avança nas partes independentes.

O guia também cobre preservação de SVGs incompatíveis, mapeamento de faces/pesos estáticos e variáveis e acessibilidade do HTML gerado. Alternativas visuais dependem das permissões da fonte e da autorização do projeto; limitações do design ficam separadas de defeitos introduzidos na conversão. Essas instruções não equivalem a fidelidade ou acessibilidade verificadas em execução.

Leia o [fluxo Figma → HTML](usability-test-runner/references/figma-to-html.md). A base continua no perfil `starter-3`: esta atualização amplia a entrada e as instruções da skill, preservando o contrato do runtime. Como solicitado, essa ampliação não foi exercitada com um arquivo Figma, build ou teste de execução.

## Infraestrutura e entrega

O Codex deve procurar primeiro hospedagem, backend, banco e autenticação disponíveis no projeto ou nas contas conectadas e adaptar a implementação a eles. Sem infraestrutura acessível, recomenda uma opção compatível e conclui o trabalho que não depende da conexão ausente.

Antes de declarar a coleta pronta, deve confirmar uma sessão de piloto de ponta a ponta: abrir o link como o participante, consentir, concluir uma tarefa, enviar, recuperar o registro persistido e encontrá-lo no painel autorizado. O piloto permanece identificado e separado dos resultados reais.

Se faltar um serviço, permissão ou credencial, a entrega deve conter a implementação preparada até esse ponto e a pendência concreta para conectar/publicar. Pedidos de escopo local ou para não testar/publicar são respeitados, e a etapa fica explicitamente pendente.

Leia os guias de [infraestrutura](usability-test-runner/references/infrastructure.md) e [sistema conectado](usability-test-runner/references/connected-system.md).

## Capacidades

- Leitura de telas Figma acessíveis e construção de HTML com marca, navegação, estados e dados fictícios.
- Experiência do participante com consentimento, instruções, tarefas, pausa, respostas e encerramento.
- Marca, assets, telas, variantes, cenários, perguntas e critérios configuráveis por projeto.
- Separação entre conclusão observada, declaração do participante e avaliação humana.
- Página do participante, receptor, armazenamento persistente, painel privado e exportação conectados.
- Escolha de infraestrutura baseada nos serviços e acessos efetivamente disponíveis.
- Coleta com identificação de sessão, persistência, reenvio idempotente e confirmação durável de recebimento.
- Mapas por tarefa, tela e visualização compatível, considerando tamanho e rolagem.
- Replay por reconstrução de capturas sanitizadas, com controles de reprodução e bundles visuais versionados.
- Mascaramento de campos e conteúdo derivado, como resumos e atributos.
- Resultados por tarefa e participação, anotações autorizadas e exportação CSV/JSON.

O replay não é vídeo. Mapas de cliques não medem olhar ou atenção. Captura de outros aplicativos, áudio, câmera, recrutamento e testes de aplicativos nativos ficam fora do escopo padrão.

## Configuração de exemplo

O arquivo [`study.example.json`](usability-test-runner/assets/study.example.json) usa um estudo fictício de reserva de salas. Ele está em modo de prévia, com dados de piloto, porque não tem serviços conectados; isso não altera o padrão de entrega conectada. Os caminhos do protótipo são ilustrativos; a configuração isolada não contém um aplicativo implementado. O projeto executável e sua configuração completa ficam em `assets/starter/`.

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
│   ├── study.example.json
│   └── starter/              # implementação de referência
├── references/
└── scripts/
```

Comece por [`SKILL.md`](usability-test-runner/SKILL.md). As referências detalham conversão Figma → HTML, planejamento, integração HTML, configuração portátil, coleta, captura visual, mapas, replay e verificação antes da distribuição.

## Dados e serviços

Este repositório contém a skill, uma implementação de referência, exemplos neutros e verificadores. Hospedagem, armazenamento, credenciais, autorização, consentimento e retenção são configurados em cada projeto. Resultados de participantes e segredos de projetos não fazem parte do pacote.

## Origem e licença

A proposta de reutilizar um visualizador de protótipos como ponto de partida foi inspirada em [prototype-viewer / brand-prototype-viewer, de Apparicio Bueno](https://github.com/appariciojunior/prototype-viewer). O motor de pesquisa, receptor e painel incluídos aqui foram desenvolvidos para este projeto; a inspiração não indica autoria ou endosso da plataforma de pesquisa pelo projeto original.

Código e documentação deste repositório são distribuídos sob a [licença MIT](LICENSE). Veja os [créditos](THIRD_PARTY_NOTICES.md).
