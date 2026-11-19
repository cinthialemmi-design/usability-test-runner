# Verificação de execução pendente

Esta atualização foi feita com proibição explícita de retomar testes. Nenhuma caixa abaixo está concluída e não foi iniciado servidor, navegador ou piloto. Use esta lista quando a execução for autorizada.

- [ ] Entrada Figma, quando usada: acesso real, frames corretos, recursos locais e interações implementadas estão documentados; origem e hipóteses não aparecem no JSON público.
- [ ] Fidelidade Figma, quando usada: comparar HTML renderizado no dispositivo alvo e percorrer as tarefas, sem confundir screenshot do design com verificação do produto.
- [ ] Janela: produto de largura fixa em janela grande mantém os mesmos breakpoints e unidades `vw/vh` no replay.
- [ ] Recorte: rolagem da página, produto parcialmente visível, teclado e orientação preservam origem/área visível sem deslocar pontos.
- [ ] Agrupamento: mesma raiz/árvore com janelas ou recortes diferentes gera grupos visuais distintos; recorte informado pelo cliente é recalculado pelo servidor.
- [ ] CSS: botões, campos, títulos, tabelas e classes comuns do produto conservam seus estilos ao adicionar os controles do estudo.
- [ ] Isolamento: produto fora de `.utr-ui`, tokens separados e nenhum `runner.css` no bundle do replay; o exemplo funciona com seus próprios estilos.
- [ ] Ordenação: durante o envio de um frame, gerar nova ação, concluir e responder; conferir que a ação chega antes da resposta e que o critério recebe toda a evidência.
- [ ] Reentrada: pedidos de envio durante uma requisição são retomados; nenhum evento fica abandonado por `busy`.
- [ ] Barreira: respostas/encerramento com contagem ou última sequência divergente são recusados, e o reenvio correto libera a finalização sem duplicar.
- [ ] Formulários: conferir que os seletores CSS e as dimensões dos botões se mantêm no replay, sem submissão ou navegação.
- [ ] Assets: conferir SVG, imagem de fundo, fonte, `@font-face`, `@import` relativo e `image-set`, com os mesmos bytes da revisão no participante e no replay.
- [ ] Falhas: imagem/fonte ausente, tipo incompatível, importação circular, URL externa e arquivo não aprovado são recusados ou sinalizados sem reconstrução fictícia.
- [ ] Player: fonte/imagem com carregamento demorado e atualização de tempo contínua não deslocam pontos, não remontam a mesma árvore e não deixam uma renderização antiga sobrescrever a atual.
- [ ] Inicialização com Node.js 24+, migração e reinício preservando dados; configuração diferente recusa o banco antigo.
- [ ] Recusar consentimento não cria sessão nem envia interações; aceitar registra as versões corretas.
- [ ] Uma sessão completa abre tarefa, interage no produto, responde, recebe confirmação durável e aparece no painel.
- [ ] Queda de rede, resposta perdida e reabertura no mesmo navegador preservam tentativa e reenviam sem duplicar.
- [ ] Reenvio exato confirma o registro; mesmo ID com outro conteúdo retorna conflito; tentativas encerradas não aceitam novas evidências.
- [ ] Pausa, segundo plano, perguntas e telas excluídas não entram no tempo ativo; tarefas incompletas entram no denominador.
- [ ] Critérios são avaliados na tentativa correta; declaração e avaliação humana não viram sucesso automático.
- [ ] Perguntas obrigatórias e escalas inválidas são verificadas no navegador e no servidor.
- [ ] Chave ausente, cookie expirado, cabeçalhos falsos e token de participante não acessam relatório, mapas, replay, notas, exportação ou exclusão.
- [ ] Escritas vindas de outra origem são rejeitadas; sair limpa a visão privada do navegador.
- [ ] Texto sentinela digitado não aparece em árvores, atributos, fila visual, banco visual ou replay; respostas voluntárias ficam separadas.
- [ ] Cliques não são duplicados em touch; coordenadas, dimensões e rolagens correspondem ao frame e não são misturados entre layouts.
- [ ] Player preserva intervalos/segmentos, pausa, velocidade, tarefa e controles; não executa scripts ou operações do produto.
- [ ] Limites de frames/pontos/bytes, fila cheia e árvore incompatível mostram captura parcial sem inventar registros.
- [ ] Mais de 50 participações usa paginação e exporta todas; mapas com mais de 3.000 pontos declaram a amostra e preservam totais.
- [ ] CSV não executa fórmulas em campos livres e não inclui credenciais.
- [ ] Exclusão/retencão removem todas as tabelas relacionadas; cópias e backups têm descarte definido.
- [ ] Celular real: Safari/Chrome, teclado, rolagem, orientação, foco, retorno e conexão intermitente.
- [ ] HTTPS público, proxy, volume persistente, chave privada e política de acesso foram confirmados na hospedagem escolhida.

Depois da execução, registre ambiente, data, evidências e falhas encontradas. Corrija antes de declarar coleta conectada verificada. Publicar o código no GitHub não preenche nenhuma destas verificações.
