---
name: usability-test-runner
description: Use when preparing an end-to-end usability study from a Figma design link or an editable HTML prototype, including interactive HTML implementation, participant tasks, centralized collection, private results, click maps and visual replay. Excludes native binaries and observation inside uninstrumented external embeds.
---

# Teste de usabilidade a partir de Figma ou HTML

A entrada pode ser **um link do Figma ou HTML editável**. Partindo de Figma, implemente primeiro as telas como produto HTML navegável, preserve a marca e conecte esse produto à pesquisa. O usuário não precisa fornecer HTML previamente.

**A entrega padrão é um sistema conectado:** link hospedado para o participante, serviço que recebe sessões/respostas, armazenamento persistente e painel privado com resultados e exportação. Mapas e replay visual fazem parte do escopo padrão para HTML editável. A prévia local é uma etapa de conferência, não o encerramento normal do trabalho.

Quando invocada para construir um estudo, implemente e conecte essas partes; não entregue apenas um protótipo, configuração ou plano. Planejamento, prévia local ou importação manual são entregas finais somente quando o usuário pedir esse escopo. Instalar a skill não concede acesso a contas, serviços ou credenciais.

## Base executável incluída

Use [assets/starter](assets/starter/README.md) como implementação de referência: participante, receptor, SQLite, painel privado, mapas e replay. Copie para um projeto próprio; não execute pesquisas dentro da pasta instalada da skill. Leia [starter.md](references/starter.md) para adaptar o código, conhecer as capacidades implementadas e escolher a integração com a infraestrutura disponível.

A referência separa `study.config.json` e `public/prototype/` dos componentes do motor. Ela usa Node.js 24+ e SQLite, com uma variante fixa e uma instalação por estudo/revisão/ambiente. O contrato portátil é mais amplo que este primeiro perfil: randomização, conclusão automática e recursos fora do subconjunto suportado precisam de extensão explícita. Imagens/fontes locais aprovadas já são incorporadas ao replay; leia [approved-assets.md](references/approved-assets.md) ao adaptar a marca. Não prometa uma capacidade apenas porque há um campo de configuração.

A referência inclui uma lista explícita de verificações de execução ainda pendentes nesta versão; a presença de código não equivale a coleta conectada verificada. Em cada tarefa, siga o escopo e as autorizações atuais do usuário.

## 0. Escolher a entrada

| Material recebido | Caminho |
|---|---|
| Link Figma com fonte acessível | Ler [figma-to-html.md](references/figma-to-html.md), obter contexto das telas e implementar o produto HTML antes de instrumentar |
| HTML/projeto editável, inclusive brand-prototype-viewer | Preservar a interface e integrar o estudo diretamente |
| Somente player/embed externo sem fonte | Identificar o acesso que falta e preparar as partes independentes; não prometer coleta interna desse embed |

Use primeiro objetivo, fluxo e dispositivo já informados. Para Figma, consulte as ferramentas disponíveis e o acesso real; siga a orientação de design-to-code da integração antes das chamadas que a exigem. Defina telas e interações a partir da fonte, registrando hipóteses quando o design não especificar o comportamento. A conversão não altera o arquivo Figma original.

## 1. Entender e configurar o estudo

Inspecione o projeto antes de perguntar. Reaproveite objetivo, público, audiência do link e serviços já informados; esclareça apenas o que muda a implementação ou depende da decisão do usuário.

Preserve o HTML original e sua marca. De **brand-prototype-viewer**, reaproveite tokens, assets, componentes, navegação e limpeza de telas. Retire da experiência de pesquisa as justificativas, dicas, seletor livre de versões e moldura de celular no aparelho real. Não herde quantidade de tarefas, regras de negócio ou cenários de outro projeto. O próprio HTML ou as telas Figma acessíveis podem fornecer a referência visual. Na entrada Figma, gere o adaptador e os catálogos do novo produto, sem conservar os do exemplo de salas.

Leia [project-contract.md](references/project-contract.md) para configuração/adaptador e [study-design.md](references/study-design.md) para tarefas e perguntas. Marca, telas, variantes, cenários, critérios, regras de tempo e limites visuais pertencem à configuração. O motor permanece independente do domínio.

O [exemplo JSON](assets/study.example.json) é fictício e está em prévia porque não possui serviços conectados; não define o padrão de entrega. O verificador em `scripts/validate_project.py` verifica consistência, não comprova funcionamento remoto.

## 2. Escolher e conectar a infraestrutura

Leia [infrastructure.md](references/infrastructure.md) antes de definir hospedagem, API, banco e acesso. Procure primeiro serviços e ferramentas já disponíveis no projeto e nas contas conectadas. Verifique suas capacidades e permissões reais; adapte a solução a eles em vez de impor uma pilha ou fornecedor.

Defina onde cada componente roda, onde os dados ficam e como participantes e pesquisadores acessam. Não trate hospedagem estática, autenticação e banco como uma capacidade única. Se nada acessível atender, recomende uma opção compatível, explique por quê e indique a conexão/provisionamento que falta. Continue tudo o que independe desse acesso.

## 3. Construir o sistema completo

Leia [connected-system.md](references/connected-system.md) para interfaces, persistência, painel e ordem de integração. Reaproveite os componentes da base incluída quando forem compatíveis com o projeto; adapte o receptor quando a infraestrutura existente exigir.

| Parte | Implementar |
|---|---|
| Participante | Boas-vindas, consentimento, tarefas, instruções, pausa/saída, respostas e estado de envio |
| Sessões e envio | Identidade de tentativa, retomada, fila durável, reenvio idempotente e confirmação real |
| Serviço receptor | Validação, autorização, avaliação de critérios e persistência antes do aceite de recebimento |
| Armazenamento | Estudos/revisões, sessões, eventos, respostas, avaliações, frames/pontos e política de retenção |
| Painel privado | Consulta por tarefa/participação, métricas com denominadores, avaliação humana e filtros |
| Exportação | CSV/JSON autorizados, com metadados e sem segredos |
| Publicação | URLs funcionais para o estudo e o painel, com audiência e acessos adequados |

Leia [html-integration.md](references/html-integration.md) para instrumentar o produto e [data-and-results.md](references/data-and-results.md) para dados e métricas. Conclusão observada, declaração e parecer humano são separados. Sem dados reais, use estado vazio; pilotos ficam identificados e isolados da coleta real.

Consentimento precede interações coletadas. Credenciais administrativas ficam no servidor. Autenticação não basta: autorize o pesquisador para o estudo e impeça leitura cruzada entre sessões. O link do participante não concede acesso ao relatório.

## 4. Construir mapas e replay

Leia [viewport-and-css.md](references/viewport-and-css.md) ao adaptar a apresentação. Registre janela original e área do produto separadamente, reproduza o iframe com a janela original e recorte somente a área capturada. Mantenha o produto fora das raízes `.utr-ui`; `brand.stylesheets` contém apenas CSS do produto, sem `runner.css`.

Leia [visual-capture-and-replay.md](references/visual-capture-and-replay.md). Capture somente a raiz configurada do produto, com árvores sanitizadas, geometria, rolagem e pontos vinculados. Mascare campos e conteúdo derivado, inclusive resumos/atributos, antes da fila.

Preserve os estilos/assets de cada revisão. Agrupe mapas por visualização compatível. O player reconstrói capturas em ambiente inerte, com pausa, velocidade e linha do tempo; não executa operações do produto. Proteja também seus endpoints e exportações. Sessões sem captura mostram indisponibilidade, sem replay inventado.

## 5. Demonstrar prontidão e entregar

Leia [release-and-validation.md](references/release-and-validation.md). Antes de declarar a coleta pronta, confirme uma participação de piloto de ponta a ponta: abrir o link como o público previsto, consentir, concluir uma tarefa, enviar, verificar o registro persistido e encontrá-lo no painel autorizado. Conferir só a aparência ou uma mensagem de sucesso não comprova coleta centralizada.

Entregue o link de participação, o acesso ao painel, a localização dos dados, instruções de operação/exportação e o que foi verificado. Respeite pedidos para não executar testes ou publicar; nesses casos, registre a verificação/publicação pendente sem afirmar que foi feita.

Se faltar hospedagem, banco, credencial ou permissão, conclua a implementação até essa fronteira e entregue uma pendência concreta: componente afetado, acesso necessário, arquivos/comando preparados e próximo passo. Não substitua coleta conectada por localStorage ou encerre em uma recomendação genérica. Use status honestos: **implementação pronta; conexão pendente**, **publicado; verificação pendente** ou **coleta conectada verificada**.

## Limites

A skill orienta construção e conexão, mas não cria autorização ou credenciais indisponíveis. Vídeo/áudio/câmera, captura de outros aplicativos, app nativo, recrutamento e inferência estatística exigem outro escopo. Links Figma com fonte acessível são entrada para construção HTML; observar dentro de um player/embed Figma sem instrumentação continua fora da coleta suportada. Mapas não medem olhar/atenção; replay não comprova compreensão.
