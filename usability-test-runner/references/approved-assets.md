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

SVG é carregado como imagem, nunca como markup ativo. O subconjunto recusa scripts, eventos, referências, estilos internos e elementos ativos/animados; SVG incompatível deve ser simplificado ou convertido para PNG/WebP. SVG inline, sprites com `use`, filtros referenciados e canvas exigem outra integração.

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
