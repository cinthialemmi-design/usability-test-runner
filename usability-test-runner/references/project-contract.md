# Contrato portátil de projeto — versão 2

Leia para gerar/adaptar um estudo sem incorporar regras de um produto no motor. O arquivo assets/study.example.json é configuração ilustrativa; a [base executável separada](starter.md) inclui sua própria configuração, protótipo e adaptador implementados. O validador usa somente Python padrão.

A execução padrão constrói o sistema conectado de [connected-system.md](connected-system.md), com infraestrutura escolhida conforme [infrastructure.md](infrastructure.md). O exemplo em modo preview é um apoio de configuração; esse modo não substitui o alvo de publicação/coleta quando o usuário não restringiu o escopo.

## Limite entre partes

| Parte reutilizável | Fornecida pelo projeto |
|---|---|
| Sessões, atribuição, tentativas, sequência e consentimento | Marca, idioma, textos e definição do público |
| Fila, envio, confirmação, autorização e exportação | Endpoints/serviços e política de dados configurados |
| Captura sanitizada, pontos, agrupamento e reprodução | Raiz capturável, políticas de mascaramento, estilos e assets |
| Avaliador declarativo e relatório | Catálogo de telas, ações, estados permitidos e critérios |
| Controles do participante e registros humanos | Tarefas, cenários, perguntas, ordem e rubricas |

Nenhuma regra do domínio deve entrar no coletor, renderizador ou agregador. Não copie IDs, credenciais de teste, saldos, categorias, estabelecimentos, pagamentos, regras de tempo ou sequência de cinco tarefas do projeto de origem. Um novo projeto pode usar qualquer quantidade pertinente de tarefas. Não reutilize IDs de hospedagem, segredos, pesquisas, sessões ou dados recebidos.

## Configuração e adaptador

`schemaVersion: "2"` identifica este contrato. `brand` referencia um bundle imutável de tokens, fontes, CSS e assets aprovados. A origem pode ser o próprio HTML existente ou recursos extraídos do design Figma acessível; não invente outra marca para aplicar o motor. O contrato atual usa `brand.source: "assets"` ou `"prototype"`; não adicione um valor `"figma"`. Links/nós de origem e hipóteses de interação ficam em registro de projeto fora do JSON público, conforme [figma-to-html.md](figma-to-html.md).

`prototype` contém `rootSelector`, caminho do adaptador e catálogo `{screenId, label}`. `allowedStateKeys`, `allowedActionIds` e `allowedEventFields` são listas explícitas de valores semânticos que podem participar de critérios e eventos. Permitir um campo no critério não autoriza capturar texto pessoal; o adaptador retorna somente valores aprovados e necessários.

`variants` contém layouts/propostas; `assignment` define `fixed`, `random` ou `balanced`. A distribuição deve ser implementada, registrada e persistida; o campo sozinho não a executa. `persistOnResume` tem padrão `true` e não pode desativar a persistência. Cada item de `scenarios` exige `scenarioId` e `fixtureKey`, referência de preparação implementada pelo adaptador. Alternativas de cenário não são automaticamente variantes de design.

Cada tarefa define `entry: {screenId, scenarioId, continuity}`. `reset` prepara a fixture. `preserve` mantém estado legítimo de uma tarefa anterior e exige `carryFromTaskId`; o adaptador valida a continuidade e informa quando precisou preparar uma fixture substituta. Isso não transforma uma tarefa anterior falhada em sucesso.

`timing.excludeScreens` permite excluir preparação artificial específica da medição ativa. A lista começa vazia; não exclua leitura/digitação normal do usuário nem herde exceções do estudo de origem. Tempo total permanece separado. IDs e textos de perguntas vêm da configuração, inclusive escala e obrigatoriedade.

O adaptador implementa `prepare/start/getState/subscribe/stop/reset` descritos em [html-integration.md](html-integration.md). O backend valida o catálogo do mesmo projeto/revisão; não confia em listas alteradas pelo participante.

## Critérios declarativos

Uma expressão tem exatamente um operador:

| Forma | Significado |
|---|---|
| `{"event":{"type":"screen_view","screenId":"details"}}` | Tela efetivamente exibida durante a tentativa |
| `{"event":{"type":"action","actionId":"save","where":{"ok":true}}}` | Ação registrada com campos permitidos iguais aos esperados |
| `{"state":{"saved":true}}` | Estado permitido observado depois do início |
| `{"answer":{"questionId":"understanding","equals":"expected"}}` | Resposta explícita; não prova comportamento por si só |
| `{"all":[expressão, expressão]}` / `{"any":[expressão, expressão]}` | Composição sem exigir um único caminho |
| `{"manual":true}` | Avaliação humana; exige `manualReview: true` |

Exemplos acima mostram a gramática, não dados do cliente. `where` e `state` usam igualdade de valores escalares, incluindo tipo; não executam JavaScript, strings de função, SQL ou `eval`. Um `all` pode reunir eventos distintos da mesma tentativa; a ordem não é implícita. Quando a decisão depende de ordem/contagem, implemente um avaliador específico no adaptador/servidor, com teste e `criterionVersion`, sem inserir o domínio no motor genérico.

Na avaliação, filtre estudo, revisões, variante, sessão e tentativa, use eventos posteriores ao início e estado confirmado do adaptador. Uma mesma tarefa em outra tentativa não satisfaz o critério. Resultado deve guardar versão do critério e IDs das evidências.

`completionMode: "observed"` encerra quando o critério observável é atingido; só use quando isso não interrompe a observação necessária. `"participant"` espera a declaração e as perguntas configuradas para fechar a tentativa; registrar a evidência antes disso não encerra a tarefa. Critério com `answer` requer `participant`. Não exponha resposta esperada ou rubrica interna na interface do participante.

`manualReview: true` exige `moderatorRubric` e mantém parecer humano separado de resultado automático e declaração. Ajudou, concluiu com ajuda, não concluiu e não avaliável são registros humanos com autor e data. Uma decisão consciente de interromper pode ser adequada conforme a rubrica; não associe sucesso universalmente a finalizar uma operação.

## Configuração visual

`visual` habilita captura, mapas e replay, define `captureSchemaVersion`, `rendererBundleId`, limites e política de texto/mascaramento. Os bundles de marca e renderização precisam corresponder à `prototypeRevision`. Detalhes em [visual-capture-and-replay.md](visual-capture-and-replay.md).

A política padrão é `static-allowlist`: somente textos estáticos/fixtures não pessoais aprovados podem entrar na árvore. `maskSelectors` marca conteúdo digitado ou derivado e `excludeSelectors` remove controles/áreas externas. Regex de seletor ou a configuração sozinha não provam que todos os estados foram mascarados; isso exige teste de execução.

No modo conectado, consentimento e responsável/retenção/destino precisam estar definidos, e a captura requer versão própria de aceite. O relatório pode usar login do responsável e permissões da equipe por estudo. Links reservados usam credenciais com escopo explícito; leitura, anotações e administração são permissões separadas.

## Verificar e evoluir

Execute `python3 <pasta-da-skill>/scripts/validate_project.py estudo.config.json`. Ele verifica catálogos, referências, tarefas, critérios suportados, continuidade, configuração visual e dependências do modo conectado. Não verifica existência dos arquivos do protótipo, eficácia dos seletores, serviços remotos ou adequação do consentimento.

Configurações antigas da versão 1 exigem migração explícita: cadastre marca/bundles, telas, cenários, `entry`, gramática dos critérios e política visual. Não ative captura em uma pesquisa existente nem altere revisões ao apenas atualizar a skill. Preserve os dados antigos; sessões sem captura continuam sem replay.
