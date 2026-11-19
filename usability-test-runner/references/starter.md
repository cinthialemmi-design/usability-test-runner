# Implementação de referência reutilizável

Leia ao construir um estudo novo ou quando precisar de código para participante, recebimento, banco, painel, mapas e replay.

A base está em [assets/starter](../assets/starter/README.md). Copie-a para um projeto independente antes de adaptar; não grave dados de pesquisa dentro da skill. O exemplo de salas é substituível e não é o motor universal do produto.

Se a entrada for um link do Figma, siga [figma-to-html.md](figma-to-html.md) para obter a fonte e construir `public/prototype/`, seu adaptador e catálogos. A base não abre o player Figma como substituto do produto instrumentado.

## Escolher a integração

Se a infraestrutura disponível suporta um servidor Node.js com volume persistente, use a referência Node.js 24+ e SQLite. O empacotamento de CSS usa dependências com versões fixadas; prepare-as com `npm ci --ignore-scripts` quando a execução for autorizada. O [README da base](../assets/starter/README.md) contém inicialização, variáveis e empacotamento Docker. Se o projeto já usa outro receptor/banco/autenticação, adapte os componentes a ele; preserve os contratos e não imponha migração de infraestrutura sem necessidade.

O [perfil starter-3](../assets/starter/server/profile.mjs) explicita o subconjunto implementado do contrato v2: variante fixa, uma instalação por estudo/revisão/ambiente, conclusão pelo participante, estados/eventos booleanos, perguntas de texto/escala e captura de DOM/CSS com imagens/fontes locais aprovadas incorporadas por revisão. Leia [approved-assets.md](approved-assets.md) para registro e fidelidade. Randomização, encerramento automático, integração entre origens e multiestudo exigem extensão explícita. Configurar uma capacidade não a implementa; o perfil recusa escolhas incompatíveis.

## Separar configuração e domínio

- `study.config.json`: marca, revisões, consentimento, tarefas, perguntas, critérios, catálogos e limites.
- `public/prototype/`: telas, regras, fixtures, estilos e adaptador do projeto.
- `public/engine.mjs`, `capture.mjs`, `core.mjs`, `results.mjs`, `renderer.mjs`: componentes reutilizáveis.
- `server/` e `migrations/`: receptor, autorização, persistência e consulta.

O contrato concreto do adaptador é `createAdapter(root,{config})`, com `subscribe(listener)` para eventos e `prepare(task,assignment)` retornando `{assistedSetup}`. Inclui snapshot sanitizado para retomada; campos digitados do produto não são restaurados no exemplo. Para outro HTML, preserve o produto e implemente este adaptador em vez de inserir regras de negócio no motor.

As rotas do receptor estão em [server/api.mjs](../assets/starter/server/api.mjs). `/api/config` é público e omite critérios/rubricas; `/api/report`, `/api/export`, `/api/heatmap`, `/api/replay/:id`, `/api/notes` e `/api/participants/:id` exigem acesso da equipe. Escritas de eventos, visuais e respostas exigem a credencial da própria sessão. A chave administrativa fica no ambiente do servidor, não no projeto público.

O estudo de exemplo coleta em banco quando executado, mas começa no ambiente `pilot`. A pesquisa real usa `live` em outro banco/instalação, com responsável e contato revisados. O banco é vinculado à configuração para evitar misturar estudos ou reinterpretar dados antigos. O replay usa bundle versionado; preserve a implantação anterior enquanto mantiver seus dados.

Leia [viewport-and-css.md](viewport-and-css.md) para janela original, recorte, agrupamento dos mapas e isolamento de estilos. A geometria usa um módulo compartilhado por captura, receptor e renderizador. O iframe mantém a janela original; apenas a apresentação do recorte é reduzida no painel.

## Ordenação e versões

O participante esvazia novamente eventos depois de cada envio visual, sem perder pedidos de reenvio concorrentes. Respostas e encerramento incluem `eventBarrier: {count,lastSequence}`. O receptor verifica esse limite contra as evidências persistidas antes de avaliar/fechar; conflito não vira confirmação.

O perfil usa captura visual versão 3. Para migrar de perfis anteriores, preserve o projeto/banco anterior e prepare outra instalação/revisão com assets registrados; não basta editar o perfil de uma pesquisa existente. O contrato portátil principal continua versão 2.

## Entrega e evidências

Esta atualização distribui implementação, não um estudo hospedado e validado. As [verificações de execução](../assets/starter/docs/verification-pending.md) desta versão estão pendentes. Quando o usuário restringir testes, inicialização, piloto ou publicação, mantenha essas etapas pendentes e respeite o limite. Cada tarefa segue suas próprias autorizações e restrições. Publicação do **código** no GitHub é uma autorização diferente.

Quando testes forem autorizados, use o roteiro pendente e os critérios de [release-and-validation.md](release-and-validation.md). O verificador Python da skill e a checagem de configuração do servidor não provam que a coleta, o acesso e a privacidade funcionam em execução.
