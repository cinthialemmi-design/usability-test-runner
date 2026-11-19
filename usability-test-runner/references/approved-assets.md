# Imagens, fontes e fidelidade visual

Leia ao adaptar a base para uma marca que use imagens, logotipo ou fontes próprias. A implementação está em `assets/starter/server/assets.mjs`, `public/capture.mjs`, `public/core.mjs` e `public/renderer.mjs`.

## Registrar os arquivos do projeto

Copie somente os arquivos aprovados para `public/` e declare-os em `brand.assets`:

```json
{
  "brand": {
    "stylesheets": ["/prototype/style.css"],
    "assets": [
      {"assetId": "logo", "kind": "image", "path": "/prototype/assets/logo.svg"},
      {"assetId": "brand-regular", "kind": "font", "path": "/prototype/assets/brand-regular.woff2"}
    ]
  }
}
```

O trecho mostra apenas a configuração de recursos, não um estudo completo. Arquivos e IDs precisam existir no projeto. Use caminhos URL locais simples, sem espaços, parâmetros ou `..`. Imagens pessoais, avatars, uploads e URLs temporárias não entram automaticamente no registro.

O exemplo incluído já contém uma marca SVG e fontes Atkinson Hyperlegible com sua licença OFL. Substitua esses recursos pela marca do projeto, mantendo as permissões e os avisos das fontes/imagens distribuídas.

## Empacotamento implementado

O perfil `starter-3` exige Node.js 24+ e dependências travadas em `package-lock.json`. Instale com `npm ci --ignore-scripts` antes de iniciar ou gerar o pacote. PostCSS e postcss-value-parser leem a estrutura do CSS; nenhum plugin configurado pelo protótipo é executado.

- Imagens: PNG, JPEG, WebP, GIF, AVIF e um subconjunto conservador de arquivos SVG estáticos. O navegador alvo também precisa decodificar o formato. Imagens animadas não têm seu instante de animação reconstruído.
- Fontes: WOFF, WOFF2, TTF e OTF aprovadas. O empacotamento verifica extensão/assinatura, calcula SHA-256 e incorpora os bytes no bundle da revisão.
- CSS: `url()` resolve arquivos registrados em relação à folha de origem. `image-set()` admite imagens aprovadas; `@font-face` incorpora fontes e remove alternativas `local()` para evitar usar outra versão instalada no aparelho.
- `@import`: somente arquivos CSS locais dentro de `public/`, incorporados recursivamente. Ciclos são recusados; condições de mídia e wrappers `layer`/`supports` são preservados.
- URLs externas não são baixadas pelo build. Converta a dependência em arquivo local aprovado antes de gerar o pacote. Um `data:` fornecido no CSS só é aceito quando coincide com bytes do registro.
- Orçamentos: 4 MiB por imagem/fonte, 16 MiB de assets no total, 2 MiB de CSS fonte e até 64 folhas; o CSS incorporado tem limite de 32 MiB por bundle e 64 MiB somando folhas compiladas. Esses limites são técnicos deste perfil, não regras de pesquisa.

SVG é carregado como imagem, nunca como markup ativo. O subconjunto recusa scripts, eventos, referências, estilos internos e elementos ativos/animados. SVG inline, sprites com `use`, filtros referenciados e canvas exigem outra integração. Essa limitação não autoriza alterar o recurso de origem.

### Preservar SVGs e tratar incompatibilidades

Preserve o arquivo original, suas dimensões/proporções e sua posição no design. Não remova atributos, estilos ou partes do desenho, não extraia paths e não rasterize automaticamente para passar pelo empacotador. Quando a integração de origem exigir uso sem alterações, essa exigência também vale aqui.

Se um SVG não couber no subconjunto, mantenha a recusa e registre o arquivo, o recurso incompatível e o efeito no participante/replay. Não desative a validação, a sanitização ou o isolamento para aceitá-lo. Prepare uma integração compatível e segura quando estiver no escopo; caso contrário, declare a pendência e avance nas partes independentes. Não distribua um SVG recusado por outra rota para contornar a proteção.

Uma versão alternativa só pode ser usada quando permitida pela fonte e autorizada no projeto. Preserve o original fora dos arquivos públicos caso ele tenha sido recusado; registre a derivação, a decisão e as diferenças esperadas. Se a origem proibir alterações, peça um recurso alternativo aprovado ou mantenha a pendência. A existência de PNG/WebP no perfil não autoriza converter um SVG Figma. Fidelidade da alternativa, quando admitida, continua pendente até comparação autorizada.

### Aplicar as fontes corretamente

O registro em `brand.assets` incorpora os arquivos, mas não escolhe sua família, peso ou estilo. Faça esse mapeamento no CSS do produto:

- Para fontes estáticas, declare uma face por combinação real de família, peso e estilo. Um arquivo Regular corresponde ao peso que ele contém; não o declare como intervalo para simular uma família completa. Bold e Italic exigem seus arquivos correspondentes quando não estiverem em uma fonte variável.
- Para fontes variáveis, declare somente o intervalo de `font-weight` efetivamente suportado pelo arquivo. Preserve os eixos e valores usados pelo design, quando disponíveis; não presuma que todo arquivo cobre `100 900` ou possui itálico. Estilos e larguras precisam corresponder às faces/eixos reais.
- Faça os valores de `font-family`, `font-weight`, `font-style`, tamanho e altura de linha dos componentes corresponderem à fonte. Evite negrito/itálico sintetizados pelo navegador; use `font-synthesis: none` no escopo do produto quando compatível com o navegador alvo, sem tratar essa regra como substituta dos arquivos corretos.
- Use arquivos locais aprovados e licenciados, com caminhos relativos à folha de origem e registro de todos eles em `brand.assets`. Não deixe dependência de Google Fonts, URLs temporárias ou uma instalação de fonte do aparelho. Preserve os mesmos arquivos e declarações no participante e no bundle imutável do replay.
- Se faltar uma face, peso ou licença, registre a pendência. Uma substituição precisa ser identificada, com seus possíveis efeitos em quebras de linha, alturas e alvos de toque; não descreva uma fonte alternativa como a tipografia original. Não troque a fonte silenciosamente para concluir a conversão.

Exemplo ilustrativo para uma família estática com arquivos reais Regular e Bold; os dois caminhos também precisam estar registrados em `brand.assets`:

```css
@font-face {
  font-family: "Marca";
  src: url("./assets/marca-regular.woff2") format("woff2");
  font-weight: 400;
  font-style: normal;
}
@font-face {
  font-family: "Marca";
  src: url("./assets/marca-bold.woff2") format("woff2");
  font-weight: 700;
  font-style: normal;
}
.prototype-root {
  font-family: "Marca", sans-serif;
  font-synthesis: none;
}
```

Uma fonte variável substitui essas faces apenas se contiver os pesos/estilos necessários; por exemplo, `font-weight: 300 700` somente para um arquivo cujo intervalo real seja esse. O empacotador verifica assinatura/bytes, não comprova que as declarações CSS correspondem às faces nem que não houve fallback. Quando os testes forem autorizados, confira as faces efetivamente renderizadas, pesos/estilos, quebras de linha e posições no participante e replay após o carregamento.

O CSS da pesquisa em `runner.css` fica fora do bundle do produto. Consulte [viewport-and-css.md](viewport-and-css.md) para janela original e escopos de estilo.

## Captura e reconstrução

A árvore contém somente `assetId` de imagens aprovadas. Não envia `src`, `srcset`, URL de avatar ou bytes de upload. O servidor e o renderer verificam novamente o ID. Imagem não registrada vira uma área mascarada, preservando dimensões aproximadas. Textos alternativos seguem a lista de texto estático aprovada.

Classes, IDs e atributos estruturais precisam estar permitidos quando o CSS depende deles. `visual.privacy.allowedAttributes` aceita pares de nome e valores estáticos, por exemplo `{"data-state":["empty","saved"],"type":["submit","button"]}`. Handlers, URLs, valores de campos e estilos arbitrários continuam bloqueados.

Preserve tags estruturais, inclusive `form` e `a`. O replay bloqueia interação por `inert`, prevenção de eventos e CSP, sem trocar essas tags por `div`. O iframe permanece com origem opaca, sem rede, navegação ou envio de formulários; apenas imagens/fontes incorporadas são permitidas.

Captura e player aguardam recursos carregados. O player aguarda decodificação de imagens, fontes e layout antes de restaurar rolagens/desenhar pontos. Não remonta a mesma árvore a cada atualização do relógio. Falha de recurso mostra indisponibilidade/captura parcial, não uma reconstrução assumida como fiel.

Isso corrige dependências de tags e recursos estáticos; não garante igualdade de pixels para qualquer HTML. Estilos inline dinâmicos, pseudoestados de interação, mídia animada, transformações complexas e elementos fora do subconjunto exigem adaptação. Os mapas devem representar apenas capturas compatíveis e revisadas no projeto.

## Versão e verificação

Este perfil usa `captureSchemaVersion: "3"`. Mantenha o contrato portátil `schemaVersion: "2"`; são versões de camadas diferentes. Para migrar de perfis anteriores, prepare outra instalação/revisão e outro banco, registre os assets e preserve o pacote antigo com seus dados. Não reinterprete árvores antigas nem ative captura retroativa.

Os ajustes foram preparados sem executar testes. Quando a execução for autorizada, verificar imagem, fonte, importação CSS, formulário, rolagem, mascaramento e posições dos pontos no aparelho alvo, conforme a lista pendente da base.
