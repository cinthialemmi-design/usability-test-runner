# usability-test-runner

Skill para orientar o Codex a construir e conectar sistemas completos de testes de usabilidade de protótipos HTML no celular: participante, recebimento de respostas, armazenamento, painel privado, mapas de cliques e replay visual.

A entrega padrão ao usar a skill é um link hospedado com coleta centralizada e painel funcionando. A prévia local serve para conferir o estudo. A skill contém as instruções e contratos para construir, conectar e publicar os componentes; instalar a skill não cria acesso a contas, serviços ou credenciais.

## Instalar no Codex

Peça ao Codex:

> Instale a skill deste diretório: https://github.com/cinthialemmi-design/usability-test-runner/tree/main/usability-test-runner

Para instalar manualmente, baixe o repositório e copie a pasta `usability-test-runner` que contém `SKILL.md` para sua pasta pessoal de skills do Codex, normalmente `~/.codex/skills/`.

## Usar

> Use $usability-test-runner com meu protótipo HTML para preparar um teste no celular, incluindo tarefas, critérios configuráveis, coleta, mapas de cliques e replay visual.

Forneça o HTML ou seu projeto editável, o objetivo da pesquisa e o público. A skill ajuda a definir as tarefas e critérios e a identificar as conexões de hospedagem e armazenamento necessárias.

## Infraestrutura e entrega

O Codex deve procurar primeiro hospedagem, backend, banco e autenticação disponíveis no projeto ou nas contas conectadas e adaptar a implementação a eles. Sem infraestrutura acessível, recomenda uma opção compatível e conclui o trabalho que não depende da conexão ausente.

Antes de declarar a coleta pronta, deve confirmar uma sessão de piloto de ponta a ponta: abrir o link como o participante, consentir, concluir uma tarefa, enviar, recuperar o registro persistido e encontrá-lo no painel autorizado. O piloto permanece identificado e separado dos resultados reais.

Se faltar um serviço, permissão ou credencial, a entrega deve conter a implementação preparada até esse ponto e a pendência concreta para conectar/publicar. Pedidos de escopo local ou para não testar/publicar são respeitados, e a etapa fica explicitamente pendente.

Leia os guias de [infraestrutura](usability-test-runner/references/infrastructure.md) e [sistema conectado](usability-test-runner/references/connected-system.md).

## Capacidades

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

O arquivo [`study.example.json`](usability-test-runner/assets/study.example.json) usa um estudo fictício de reserva de salas. Ele está em modo de prévia, com dados de piloto, porque não tem serviços conectados; isso não altera o padrão de entrega conectada. Os caminhos do protótipo são ilustrativos; a configuração não contém um aplicativo implementado.

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
