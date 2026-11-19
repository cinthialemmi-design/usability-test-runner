# Janela original e isolamento dos estilos

Leia ao adaptar o HTML do participante, estilos do produto ou a geometria de mapas/replay. A referência usa `runtimeProfile: "starter-3"` e `captureSchemaVersion: "3"`, mantendo o contrato portátil `schemaVersion: "2"`.

## Três espaços diferentes

O tamanho do produto não define o tamanho da janela. Um produto de 430 px pode estar dentro de uma janela de 1280 px. Redimensionar o iframe do replay para 430 px altera media queries, unidades relativas à janela e, potencialmente, a posição dos pontos.

A base registra por captura, em pixels CSS:

| Campo | Significado |
|---|---|
| `width`, `height` | Dimensões da caixa interna da raiz do produto, sem bordas ou barras de rolagem |
| `viewport.width`, `viewport.height` | `window.innerWidth` e `window.innerHeight` da janela original |
| `viewport.visual` | Área visual disponível, com deslocamentos, dimensões e escala quando VisualViewport existe |
| `region.left`, `region.top` | Origem da área do produto em relação à janela original, incluindo efeitos da rolagem da página |
| `crop` | Interseção visível entre produto e janela visual, expressa nas coordenadas internas do produto |

O módulo [geometry.mjs](../assets/starter/public/geometry.mjs) mede e normaliza esses dados. O receptor valida as dimensões e recalcula o recorte; não aceita o recorte do cliente como autoridade. Pontos permanecem nas coordenadas internas do produto e precisam estar no trecho capturado. Não há coordenadas geográficas nem registro da tela física.

Mudanças de janela, rolagem da página e eventos de VisualViewport geram nova oportunidade de captura, além de mudanças do produto. A identidade dos grupos de mapas inclui janela, área visual, posição e recorte, junto de árvore, revisões e bundles. Visualizações incompatíveis ficam separadas mesmo quando o produto tem o mesmo tamanho.

## Reprodução e recorte

O iframe tem as dimensões da janela original. A raiz do produto é reconstruída na posição registrada. O painel desloca e recorta esse iframe para exibir somente o trecho visível do produto; pode reduzir sua apresentação sem mudar o tamanho interno usado pelo CSS.

Assim, uma janela original de 1280 px continua sendo uma janela de 1280 px para as regras responsivas, mesmo quando o painel mostra apenas 430 px do produto. As barras da raiz ficam ocultas no renderer, pois a área registrada já exclui sua largura/altura. Os pontos são desenhados na origem registrada do produto e seguem a mesma escala/recorte do iframe.

A captura permanece restrita à raiz aprovada: registrar geometria da janela não captura cabeçalho, tarefas ou outros aplicativos. Produto fora da área visual não produz uma captura inventada. O player mostra capturas recebidas, não vídeo contínuo.

Limites deste perfil: produto entre 160–2048 px de largura e 160–4096 px de altura; janela entre 160–7680 px em cada eixo. Há precisão de duas casas decimais para posições/recortes. A reprodução preserva esse contexto geométrico; não emula o navegador original, densidade física, preferências do sistema, ancestrais externos ao produto, containers externos, nem todos os comportamentos de teclado/zoom/unidades dinâmicas. A raiz deve ser autocontida e não transformada; integrações fora desse modelo exigem adaptação e verificação explícitas.

## Estilos do estudo e do produto

`public/runner.css` pertence à interface da pesquisa. Ele usa `.utr-ui` em raízes específicas: cabeçalho, instruções laterais, controles, status, diálogo e painel de resultados. **Nunca envolva o produto vivo com `.utr-ui`.** O carregamento da referência verifica essa separação antes de iniciar.

Os seletores de botões, campos, títulos, tabelas, estados e resets do estudo ficam dentro dessas raízes. As variáveis usam o prefixo `--utr-` e também ficam nessas raízes. Não adicione regras globais como `button`, `h1`, `.primary`, `*` ou tokens em `:root` para estilizar os controles da pesquisa.

As classes `.utr-layout`, `.utr-stage` e `.utr-product-slot` organizam os espaços da página; elas não definem fonte, cor ou tokens herdados pelo produto. `body.utr-page` ajusta somente margem/fundo da página de pesquisa. O adaptador continua responsável por preservar as condições visuais do HTML incorporado.

`brand.stylesheets` lista somente folhas do produto; `/runner.css` não entra nessa lista nem no bundle do replay. O exemplo de salas define seus próprios tokens, resets e controles em `.prototype-root` dentro de `public/prototype/style.css`. Ao substituir o exemplo, use os estilos do novo projeto; não transporte a identidade ou as regras de salas para o motor.

O placeholder de privacidade `.utr-masked` é reservado ao renderizador e possui estilo mínimo no próprio bundle. O replay recebe o CSS do produto e essa regra interna, sem depender do tema dos controles da pesquisa.

## Migração e estado da entrega

Preserve a instalação, o banco e o bundle dos perfis anteriores. Para usar a geometria nova, crie outra revisão/instalação e outro `DATA_DIR`; frames antigos não recebem dimensões de janela retroativamente. A atualização da skill não altera estudos hospedados existentes.

Os ajustes foram preparados sem executar testes. Quando houver autorização, conferir especialmente: produto de largura fixa em janela grande; regras `@media` e `vw/vh`; raiz parcialmente fora da janela após rolagem; teclado/orientação; alinhamento de pontos; e HTML com botões, títulos, tabelas e classes comuns que não dependam dos estilos do estudo.
