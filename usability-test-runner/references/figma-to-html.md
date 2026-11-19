# Do link do Figma ao protótipo HTML de pesquisa

Leia quando a entrada for um link do Figma e ainda não houver HTML editável. O objetivo é construir o produto navegável e conectá-lo ao estudo completo, sem exigir que o usuário forneça o HTML previamente.

## 1. Acessar a fonte e delimitar as telas

Use a integração Figma já disponível e autorizada. Identifique arquivo, branch quando houver, página, seleção/frame e acesso real ao conteúdo. Prefira as ferramentas próprias da integração ao navegador. Não transforme um endereço acessível do player em uma suposição de acesso ao arquivo de design.

Para a integração oficial, descubra e siga as ferramentas atuais. Antes de `get_design_context`, carregue a orientação `figma-design-to-code` fornecida pela integração, quando disponível; siga também as instruções obrigatórias expostas pela ferramenta. Ela orienta sessão, screenshot de referência, contexto detalhado, recursos locais e componentes existentes. Não fixe caminhos pessoais de instalação nesta skill.

- Quando a ferramenta exigir sessão, crie-a para a tarefa assim que o arquivo for identificado e reutilize o identificador retornado nas leituras seguintes.
- Extraia `fileKey` e `node-id` do link quando existirem. Em links de branch, use a chave indicada pela integração. Normalize o formato do node ID somente conforme o contrato da ferramenta.
- Sem nó na URL, consulte páginas/seleção por uma ferramenta estrutural que permita omitir esse campo. Use IDs reais retornados, sem inventar IDs ou assumir `0:1`. Quando a ferramenta exigir link específico, ou o fluxo permanecer ambíguo, peça o link do frame/fluxo relevante em uma pergunta curta.
- Use o fluxo indicado pelo usuário e suas telas/estados relacionados. Um arquivo inteiro não autoriza implementar todas as páginas, versões e estudos encontrados nele.
- Links Design, player/protótipo, Make, FigJam e Slides não têm as mesmas capacidades. Para telas de produto, trabalhe com a fonte Design ou código editável equivalente; outro tipo de arquivo exige verificar o conteúdo e as capacidades disponíveis antes de prometer conversão.

Obtenha contexto detalhado das telas e uma imagem de referência do design. A imagem serve para orientar a aparência; não vira o aplicativo nem um fundo com hotspots. Se a resposta estiver esparsa, recupere os nós filhos relevantes a partir dos IDs reais e peça seus contextos detalhados. Não implemente apenas a partir de nomes de camadas e retângulos de metadata.

Sem acesso à fonte, informe a pendência concreta: conexão da integração, permissão de leitura ou link de frame. Prepare motor, configuração preliminar, receptor e painel que independem dela; mantenha a implementação visual como pendente. Não invente telas lidas, ativos exportados, estados, navegação ou fidelidade. Capturas fornecidas pelo usuário podem orientar uma reconstrução explicitamente limitada, sem descrevê-la como leitura completa do arquivo Figma.

## 2. Levantar aparência, fluxo e lacunas de interação

Inspecione o projeto existente antes de escrever componentes. Reaproveite stack, tokens, componentes, assets e mapeamentos Code Connect disponíveis e adequados. Quando a integração retornar um componente conectado, respeite o mapeamento no nó correspondente. Não crie ou altere mapeamentos no arquivo Figma para fazer a implementação funcionar.

Extraia cores, fontes/pesos, espaçamentos, tamanhos, hierarquia, Auto Layout/constraints, estados de componentes e recursos estáticos. Preserve a condição visual de pesquisa; não redesenhe ou simplifique o produto por preferência estética durante a conversão.

Leia as conexões de protótipo quando a ferramenta as fornecer. Se não houver acesso a elas, registre essa limitação. Telas estáticas não definem sozinhas validação de campos, estados intermediários, persistência, retorno, cancelamento ou todos os caminhos alternativos. Defina os comportamentos necessários ao objetivo; distinga os que vieram do arquivo dos que foram implementados como hipótese. Pergunte somente quando uma lacuna mudar a tarefa, a interpretação dos resultados ou uma decisão do produto.

Guarde no projeto um registro curto, por exemplo `design-source.local.json`, **fora de `public/` e dos manifestos públicos**:

| Registro | Conteúdo |
|---|---|
| Origem | Link recebido, arquivo/branch e nós efetivamente consultados; data ou versão quando disponível |
| Telas | `screenId` estável, nó Figma correspondente, componente/arquivo HTML de destino e estados necessários |
| Interações | Ação, origem/destino, mudança de estado e indicação de fonte Figma ou hipótese de implementação |
| Recursos | Asset/nó de origem, arquivo local, `assetId` e fonte de tipografia |
| Pendências | Acesso, comportamento não definido, asset/fonte ausente e verificação não executada |

Esse registro é rastreabilidade de projeto, não configuração do participante. Não acrescente links privados, chaves de acesso ou respostas esperadas ao JSON público do estudo. A base ignora `design-source.local.json` no Git por padrão; a equipe decide seu armazenamento conforme a audiência do projeto.

## 3. Construir o produto HTML navegável

Copie a base para o projeto ou integre ao código já existente, conforme [starter.md](starter.md). Implemente as telas e os estados necessários em `public/prototype/` ou localização equivalente. O produto usa HTML/CSS/JavaScript editáveis; código retornado pelo Figma é referência a adaptar à arquitetura, não uma aplicação interativa já concluída.

- Use elementos reais: botões, links, campos, listas, diálogos e estados visíveis. Não entregue screenshots como telas com áreas clicáveis por cima.
- Implemente navegação, voltar, entradas, validações e consequências das ações necessárias às tarefas. Use dados/fixtures fictícios e operações simuladas do produto, com estado consistente entre telas. Uma tarefa de compreensão pode exigir avaliação humana; apenas exibir sua tela não comprova compreensão.
- Traduza Auto Layout/constraints para layout apropriado no projeto; não imponha posicionamento absoluto a todo o fluxo quando o design for responsivo.
- Preserve os recursos estáticos fornecidos pela fonte, nos locais e proporções correspondentes. Faça downloads pelo procedimento indicado pela integração e substitua URLs temporárias por arquivos locais aprovados, conforme [approved-assets.md](approved-assets.md). Não reilustre logos ou troque imagens por similares para esconder uma incompatibilidade.
- Se um asset original exigir capacidade ausente no renderer, adapte a integração com segurança ou declare a pendência específica, continuando as partes independentes. Não altere silenciosamente o formato/visual nem diga que o replay está fiel. Fontes indisponíveis também precisam de pendência ou substituição explicitamente identificada.
- Mantenha CSS, tokens e controles do produto isolados dos controles da pesquisa, conforme [viewport-and-css.md](viewport-and-css.md). O celular real usa o conteúdo do aplicativo; moldura de aparelho e justificativas de design não entram na tarefa.
- Não edite nem publique alterações no arquivo Figma de origem como efeito colateral da conversão.

## 4. Conectar ao contrato de pesquisa

Implemente o adaptador de [html-integration.md](html-integration.md): preparação de fixtures, início/parada, estado permitido, tela atual, eventos e retomada com snapshot sanitizado. Registre ações depois de sua consequência implementada, sem chamar toda intenção de clique de sucesso.

Preencha catálogos e critérios de [project-contract.md](project-contract.md) com os IDs do produto recém-construído. Remova regras, telas, nomes de ações, fixtures e tarefas do exemplo de salas. A origem da marca no contrato atual continua `brand.source: "assets"` para arquivos extraídos ou `"prototype"` para um produto HTML existente; não invente `"figma"`, que o verificador não aceita. A origem Figma fica no registro privado de rastreabilidade.

Proponha tarefas e perguntas pelo objetivo/público, conforme [study-design.md](study-design.md). O número de frames não define o número de tarefas. Instruções e critérios internos não devem revelar o caminho ao participante. Se houver versões de design, respeite a capacidade do perfil: a referência atual usa uma variante fixa; comparação/randomização exige extensão ou outro planejamento explícito, sem misturar versões num único resultado.

Conecte participante, recebimento, armazenamento, painel privado, mapas, replay e exportação conforme os demais passos da skill. O link Figma é entrada de design; a coleta observa o HTML implementado. Um iframe do player Figma não substitui a instrumentação do produto nem fornece suas interações internas automaticamente.

## 5. Entrega, limites e verificação

Entregue os arquivos do produto, configuração/adaptador e componentes do estudo, registro de origem e hipóteses, recursos locais e instruções de operação. Quando a infraestrutura estiver disponível e a publicação estiver autorizada, entregue os links de participante/painel com os estados de prontidão de [release-and-validation.md](release-and-validation.md).

Ler o design e sua screenshot de referência é obtenção de fonte. Abrir o HTML, comparar renderizações, percorrer tarefas e conferir o banco são verificações de execução. **Quando o usuário suspender testes, não execute essas verificações nem um estudo piloto.** Continue a implementação e declare separadamente: leitura do Figma realizada ou pendente; HTML implementado; conexão/publicação; fidelidade visual e coleta verificadas ou pendentes. Não afirme conversão fiel ou teste funcionando apenas por ter gerado arquivos.

A instalação da skill não concede acesso ao Figma, não converte qualquer URL por conta própria e não provisiona hospedagem. A conversão é trabalho do Codex com a fonte acessível e suas ferramentas; o runtime do estudo recebe o HTML pronto e não precisa de credenciais Figma no navegador.
