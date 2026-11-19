# Verificação de execução pendente

Esta atualização foi feita com proibição explícita de retomar testes. Nenhuma caixa abaixo está concluída e não foi iniciado servidor, navegador ou piloto. Use esta lista quando a execução for autorizada.

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
