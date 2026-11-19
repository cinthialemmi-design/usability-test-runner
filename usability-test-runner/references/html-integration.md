# Integração com o protótipo HTML

Leia antes de adaptar telas, navegação e detecção de conclusão. Estes são contratos a implementar no projeto. A [base incluída](starter.md) fornece motor e um adaptador de salas como referência executável; substitua o adaptador para integrar outro HTML. O adaptador e os catálogos seguem [project-contract.md](project-contract.md).

## Inspecionar e escolher a integração

| Material disponível | Abordagem |
|---|---|
| Link Figma com acesso ao design | Seguir [figma-to-html.md](figma-to-html.md), construir o HTML navegável e então integrar os eventos |
| Fontes HTML/CSS/JS editáveis | Copiar para uma versão de pesquisa; instrumentar ações e montagem existentes |
| HTML único já compilado | Preservar o original e acrescentar uma camada de eventos na cópia; evitar reescrever a interface |
| URL própria com acesso ao código | Instalar adaptador no site e conectar ao estudo, na mesma origem ou por mensagens |
| URL externa sem acesso ao código | Não há observação interna garantida; oferecer tarefa e autorrelato com a limitação explícita |

Não contorne restrições de iframe ou autenticação. Um iframe externo, um player Figma ou outra origem não dá acesso livre ao DOM, aos cliques ou ao estado interno. Reconstrução visual depende de acesso à raiz e do contrato de captura; vídeo de tela não faz parte da base. A entrada por link de design Figma é convertida em HTML próprio antes dessa captura.

## Separar três camadas

1. **Produto:** marca, telas e interações existentes.
2. **Estudo:** instruções, sequência, consentimento, perguntas e encerramento.
3. **Coleta:** sessão, fila, transporte e confirmação remota.

O estudo não deve inserir controles ou CSS globais dentro do produto. Use raízes/CSS isolados. Na referência, `.utr-ui` envolve somente controles do estudo e nunca a raiz do produto; tokens usam `--utr-*`. O produto define seus próprios estilos e não depende de `runner.css`. Veja [viewport-and-css.md](viewport-and-css.md). O painel recolhível fica fora do viewport do produto ou reserva espaço próprio; seu botão de retorno não cobre tab bar, CTA ou campos. Não reduza o protótipo inteiro com `transform: scale()` para encaixar a moldura no celular: preserve legibilidade e tamanho de toque.

## Adaptador do protótipo

Defina no projeto um adaptador equivalente a este contrato, usando a arquitetura existente:

| Operação | Responsabilidade |
|---|---|
| `prepare(task, assignment)` | Aplicar revisão/versão e estado inicial; impedir exploração; indicar quando está pronto |
| `start(attemptId)` | Liberar interação e assinar os eventos da tentativa ativa |
| `getState()` | Ler somente os campos explicitamente permitidos para os critérios |
| `subscribe(listener)` | Emitir tela/ação/estado observável; retornar uma função de limpeza |
| `stop()` | Bloquear a tentativa encerrada, remover listeners e cancelar transições pendentes |
| `reset(task)` | Restaurar estado do produto para a próxima tarefa, preservando respostas já coletadas |

Início e parada são idempotentes. Eventos assíncronos carregam `attemptId` e são descartados se pertencerem a uma tentativa antiga. Preparar uma tela inicial não conta como o participante ter alcançado uma meta. Não permita critério trivial já satisfeito no estado inicial sem justificativa de pesquisa.

## Quando a origem é brand-prototype-viewer

- Preserve `kit.css/js`, tokens da `.ph`, assets e `screens/` necessários à tarefa.
- Envolva `ctx.go(flowId, versionIndex)` para registrar o destino efetivamente montado, sem duplicar o evento na intenção e no resultado. Se um fluxo contém várias telas, atribua IDs às telas internas; `flowId` sozinho não descreve o percurso.
- Mantenha navegação legítima de `TAB_ROUTES`, mas retire os atalhos do viewer para trocar direção/fluxo e o replay livre.
- Reaproveite as funções de limpeza em `render(root, ctx)` para que reabrir uma tarefa não duplique listeners.
- Mantenha o estado do produto separado do estado do estudo; um reset do produto não apaga consentimento, fila, atribuição ou respostas.
- Não replique barras de sistema, Dynamic Island ou home indicator dentro de um aparelho real. A prévia desktop pode usar moldura identificada como simulação.

## Eventos observáveis

Adote `screen_view`, `action` e `state_change` com IDs semânticos estáveis cadastrados pelo projeto, como `room-details` e `save-reservation`. IDs não podem depender de texto localizado, ordem visual ou coordenadas. Consuma o mesmo catálogo no coletor, servidor e painel; não replique listas por módulo.

Uma ação existe quando o handler legítimo foi executado; um toque bruto é apenas um toque. Em dispositivos touch, evite contar simultaneamente `touchend`, `pointerup` e o `click` correspondente. A implementação deve escolher uma única fonte por tipo de evento.

Critérios de tarefa usam evidência produzida depois do início, da tentativa, revisão e versão corretas: uma tela montada, uma ação confirmada ou um estado válido. “Clicou no botão enviar” não comprova que a operação terminou se houver validação ou processamento posterior.

Não capture valores de campos automaticamente. Exponha apenas estados permitidos, como `saved: true`, sem nomes, senhas ou texto digitado. Comentários são respostas voluntárias identificadas, separadas da telemetria. A árvore visual sanitizada da raiz, com textos/atributos aprovados e conteúdo derivado mascarado, segue [visual-capture-and-replay.md](visual-capture-and-replay.md); ela não é payload dos eventos semânticos.

## Mensagens entre origens

Quando o protótipo está em outro domínio e ambos os códigos são editáveis, use uma ponte `postMessage` implementada e testada. Valide origem exata, janela remetente, protocolo/versão, esquema, token de sessão e tentativa ativa. Use `targetOrigin` explícito, sem `*` para eventos de pesquisa. Trate as mensagens como entrada não confiável.

Se não houver confirmação `ready` e eventos da ponte, a tarefa não pode fingir sucesso observado. Mostre indisponibilidade, permita recuperação ou use autorrelato explicitamente configurado. Não ofereça navegação por `file://` como equivalente a uma integração HTTPS testada.

## Mobile e acessibilidade

Use viewport responsivo, `100dvh` com fallback e áreas seguras quando pertinentes. Teste teclado aberto, rolagem, retorno do navegador, orientação e reconexão. Não dependa de fullscreen, hover ou de esconder a barra do Safari.

Nos controles novos do estudo, use botões reais, alvos confortáveis, nomes acessíveis, contraste adequado e foco visível. Ao recolher/reabrir instruções ou fechar um diálogo, restaure o foco de forma previsível. Respeite `prefers-reduced-motion`. Problemas já existentes no protótipo são condições de pesquisa e devem ser registrados, sem correção silenciosa.
