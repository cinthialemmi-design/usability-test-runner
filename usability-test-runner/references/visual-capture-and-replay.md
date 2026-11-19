# Captura visual, mapas de cliques e replay

Leia antes de implementar captura, endpoints visuais, mapas ou reprodução. A técnica registra árvores sanitizadas da raiz do produto e pontos associados, como na implementação que originou esta evolução. O contrato é independente da marca e do domínio. Esta referência não é um SDK executável.

## Módulos substituíveis

Separe `VisualCapture`, transporte/armazenamento, `VisualRenderer`, `HeatmapView` e `ReplayPlayer`. Injete configuração, raiz do produto, estado de autorização/atividade, contexto da tentativa, registro de assets, fila e callback de erro. O capturador não conhece nomes de tarefas, rotas, estados de negócio ou credenciais. O painel usa os catálogos do projeto para seus filtros, sem arrays de IDs embutidos.

O bundle do renderizador inclui CSS, fontes, tokens e assets aprovados da revisão do protótipo. Preserve o bundle usado na coleta para que uma mudança futura de marca/layout não altere o passado. Os IDs `brand.bundleId`, `rendererBundleId`, `prototypeRevision` e `captureSchemaVersion` são parte da identidade visual gravada.

## Consentimento e estados de captura

O aviso informa reconstrução de telas, dimensões da janela, área visível e rolagem do protótipo, pontos de toque/clique, respostas, acesso e retenção. Não descreva isso como gravação de vídeo nem como ausência de captura visual. Não registre árvore/ponto antes de aceite explícito da versão visual; uma sessão antiga deve aceitar a mudança antes de começar capturas novas.

Capture somente durante execução da tentativa ativa, com página visível, sem pausa, diálogo de instruções/perguntas ou encerramento. A saída voluntária interrompe novos registros. Não grave o roteiro do moderador, notas, respostas livres, toolbars do estudo, outros aplicativos, área de trabalho ou permissões de câmera/microfone/localização.

## Contrato de captura

Todo item tem IDs de estudo/revisões/variante/sessão/tarefa/tentativa, `captureSchemaVersion`, `sequence`, `occurredAt`, `timelineMs` e `segmentId`. A sequência é persistida e desempata timestamps; `receivedAt` do servidor não substitui ordem nem duração.

**Frame:** `frameId`, `screenId`, IDs dos bundles, `width`/`height` da área interna do produto, `viewport` da janela original (incluindo área visual), `region` com a posição da raiz, `crop` com o trecho visível, árvore sanitizada e `layoutKey` calculada pelo servidor. A referência atual usa captura versão 3; veja [viewport-and-css.md](viewport-and-css.md). A árvore armazena tag permitida, atributos aprovados, filhos e `scrollTop/scrollLeft` de cada container rolável. A rolagem da raiz também é registrada. Informe quando viewport visual/teclado alterar o enquadramento.

**Point:** `pointId`, `frameId`, `screenId`, `x`, `y`, `kind: click|tap` e contexto/tempo da tentativa. Coordenadas são relativas ao viewport da raiz do frame. Para uma escala uniforme de prévia, `x = (clientX - rect.left) * frame.width / rect.width`, equivalente para y; capture/normalize no viewport de conteúdo, descontando borda quando existir. Rotação, skew ou transformações não uniformes exigem conversão inversa validada; não aplique essa fórmula silenciosamente.

Cada ponto referencia uma captura anterior ou do mesmo lote, do mesmo estudo, sessão, tentativa, tela e bundles. Valide x/y finitos dentro da geometria; rejeite ponto órfão, de outra sessão ou com metadados incompatíveis. Não acrescente scroll ao ponto: o frame já contém a rolagem; misturar coordenadas de documento com viewport desloca o mapa.

Capture o frame e o ponto na fase de captura de um único evento de clique confiável, antes do handler que navega/modifica a tela. Registre cliques sem ação, mas não em campos mascarados/excluídos. Interações de teclado continuam como eventos semânticos, sem inventar coordenadas. Não conte o toque e seu clique sintetizado como dois pontos. Capture alterações posteriores, rolagem e resize com debounce configurado; use captura inicial ao começar/retomar.

Snapshot não é gravação contínua: estados intermediários de animação podem não aparecer. Canvas, vídeo, iframes externos, shadow DOM e componentes não suportados exigem adaptador explícito ou aviso de captura parcial; não prometa fidelidade sem verificação.

## Sanitização e conteúdo derivado

Antes de persistir/enviar, serialize uma árvore estruturada aprovada; não use HTML bruto. Limite tags, atributos, tamanho, quantidade de nós e profundidade. Remova scripts, handlers `on*`, conteúdo executável, destinos de links, URLs de rede e edição. Preserve tags estruturais como `form` e `a`; impeça seu comportamento separadamente, sem quebrar seletores CSS. Atributos de estilo aceitam somente propriedades/valores previamente permitidos; não aceitam `url()`, `@import`, expressão ou CSS arbitrário.

Mascarar `input.value` não basta. O mesmo conteúdo pode aparecer em resumo, erro, título, `aria-label`, `title`, `data-*`, ID ou classe. Por padrão, inclua somente textos estáticos/fixtures não pessoais aprovados em `staticTextAllowlist`; todo outro texto fica oculto. Use `maskSelectors` para ocultar subárvores pessoais/derivadas e seus atributos, e `excludeSelectors` para omitir áreas. Marcação de exclusão prevalece sobre qualquer permissão de texto.

Campos de entrada são substituídos por elementos inertes com placeholder neutro, sem valor, seleção, opções pessoais, caracteres, comprimento ou estado revelador. Verifique textos derivados com um valor sentinela exclusivo em cada fluxo: ele não pode existir em árvore, atributos, fila, payload, banco, exportação nem replay. Não declare anonimização universal: esta política depende do conteúdo permitido no projeto.

Imagens/fontes usam registro de assets aprovados por chave; a árvore não envia `src`, `href`, dados pessoais ou URLs temporárias. O renderer resolve as chaves no bundle imutável. Assets pessoais carregados pelo participante não entram automaticamente no registro. Também avalie se imagens estáticas contêm dados pessoais antes de aprová-las.

Sanitize e valide novamente no servidor e no renderizador. Construção de DOM usa criação de elementos e `textContent`; nunca execute markup ou scripts enviados na captura.

A [referência starter-3](approved-assets.md) implementa registro de imagens/fontes, CSS local incorporado, preservação de tags e espera por recursos/layout. A árvore transmite IDs aprovados de imagem, nunca URLs de campos ou uploads.

## Persistência, limites e falhas

Configure limites por sessão de frames, pontos, bytes de árvores, lote, fila local, nós e profundidade. Como ponto de partida técnico, o exemplo usa 600 frames, 3.000 pontos e 8 MiB de árvores por sessão; são orçamentos ajustáveis, não regras de pesquisa nem garantia de suporte do provedor. Limites de corpo/lote também devem caber no serviço escolhido.

O servidor valida versão visual aceita, escopo da credencial, catálogos, sanitização, geometria e orçamento. IDs são imutáveis: repetição exata confirma o item existente sem duplicar; conteúdo diferente no mesmo ID é conflito. Grave lote e contabilização atomicamente. Confirme somente após persistência durável.

Uma interface reutilizável possível, relativa ao endpoint configurado:

| Operação | Contrato |
|---|---|
| `POST /sessions/:id/visuals` | Escrita da própria sessão; recebe `{frames, points}` e confirma IDs de ambos, incluindo duplicados exatos já recebidos; erro invalida o lote sem gravação parcial |
| `GET /sessions/:id/replay` | Leitura autorizada por estudo; retorna manifesto de bundles, frames/pontos ordenados, segmentos/lacunas e estado de disponibilidade/limites |
| `GET /studies/:id/heatmaps` | Leitura autorizada; filtros de tarefa/tela/revisão/variante e sessão opcional; lista grupos e totais; `layoutKey` seleciona frame e pontos daquele grupo |

Persista frames e pontos com chave única de estudo/sessão/ID, vínculo ao frame/contexto e contabilização de bytes; inclua índices para agrupamento/filtros. Implementações existentes podem manter suas rotas/tabelas, preservando estas responsabilidades. Um serviço próprio com banco transacional, inclusive Worker com D1 quando já disponível, atende ao contrato; não exige um fornecedor específico.

Envie frames antes dos pontos dependentes. Separe o estado de envio visual do estado de respostas/eventos. Fila cheia pausa novas capturas e avisa; não sobrescreva pendências silenciosamente. Ao limite ou falha permanente, registre captura incompleta e permita continuar as tarefas. O fluxo de encerramento precisa resolver cada item como recebido ou não recebido com motivo explícito; não ficar bloqueado indefinidamente nem dizer “captura recebida” quando ela não foi persistida. Após encerrar, aceite apenas reenvios idempotentes já reconhecidos, sem permitir criar novos dados fora do intervalo autorizado.

## Mapa de cliques

`layoutKey` é hash canônico calculado pelo servidor sobre revisão, variante, tela, bundles, dimensões da raiz, janela original, área visual, posição, recorte e árvore sanitizada com todas as rolagens; exclua IDs/tempos da captura. Ordene chaves de objetos na serialização para que sua ordem não crie visualizações duplicadas. Não confie em hash do cliente para identidade/autorizações.

Agrupe apenas visualizações exatas compatíveis, com filtros por estudo/revisão/variante/tarefa/tela/sessão e seletor de grupo visual. Não sobreponha coordenadas de tamanhos, rolagens ou layouts distintos. Exiba frame original e densidade de pontos, quantidade de cliques e número de sessões consideradas. Isso mede pontos recebidos, não olhar, atenção ou erro.

Paginação/limites retornam totais exatos separadamente da amostra de pontos/grupos exibida. Avise truncamento. Zero pontos, dados antigos sem captura e captura parcial têm mensagens distintas; não desenhe manchas fictícias.

## Replay e isolamento

Carregue capturas somente ao abrir a reprodução autorizada. Ordene por sequência/segmento/tempo original, com pausa, velocidade, slider, seleção de tarefa e anterior/próxima captura. Conserve os intervalos observados; apresente pausas, lacunas e captura interrompida sem inventar movimento ou estados. A trilha visual pode usar tempo decorrido com lacunas explícitas; não a confunda com o tempo ativo da métrica de tarefa.

Use no iframe o tamanho da janela original e recorte sua apresentação até a área visível do produto; não use a largura da raiz como largura da janela. Reconstrua com o bundle correspondente, restaure scroll dos containers após layout/fonts/assets e desenhe os pontos no mesmo sistema de coordenadas. Renderize em iframe inerte e isolado, com ações, formulários, navegação e rede bloqueados; não monte o aplicativo executável, não reenvie ações e não repita operações de negócio.

Para iframe sandbox com origem opaca (`allow-scripts` sem `allow-same-origin`), `targetOrigin: "*"` pode ser necessário para enviar ao renderer. Nessa arquitetura, valide `event.source`, canal e nonce dedicado, esquema e contexto; envie somente capturas sanitizadas, nunca tokens, respostas ou credenciais. Isso é distinto da ponte entre site/protótipo com origens normais, que usa origem exata. Restrinja CSP: sem rede, formulários, navegação ou assets externos; fontes/imagens aprovadas incorporadas. Não conceda `allow-same-origin` para contornar a origem opaca.

## Acesso, retenção e exportação

O token de escrita do participante não permite ler replay/mapas ou respostas alheias. Endpoints de leitura visual usam autorização de pesquisador por estudo, igual ao relatório. Árvore e pontos não entram no relatório geral por padrão; acesso detalhado é sob demanda e limitado. A retenção/exclusão cobre frames, pontos, filas e bundles associados, além de respostas.

CSV contém métricas/referências e indica se há captura; JSON pode incluir manifestos/referências autorizadas. Exportação de árvores e pontos completos é uma ação específica, protegida e sujeita à mesma política de dados. Nunca exporte credenciais de escrita, administração ou links reservados.

Sessões anteriores não ganham replay retroativo. Quando o bundle da revisão não existe ou o tipo de nó é incompatível, mostre a limitação; usar o CSS mais novo sem aviso produz uma representação incorreta.
