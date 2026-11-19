# Publicação, piloto e verificação

Leia antes de distribuir links ou afirmar que a coleta funciona.

## Padrão de entrega e estados de conclusão

Coleta conectada é a entrega padrão: participante hospedado, receptor, armazenamento durável e painel privado integrados. Prévia local é etapa intermediária; somente vira entrega final se esse for o escopo solicitado. A escolha de infraestrutura segue [infrastructure.md](infrastructure.md), e a construção de cada componente segue [connected-system.md](connected-system.md).

Use estados que correspondem à evidência:

- **Implementação pronta; conexão pendente:** arquivos, componentes e instruções específicos preparados; nomear o serviço/credencial/permissão que falta e a próxima ação.
- **Publicado; verificação pendente:** existe publicação, mas o percurso ou a audiência prevista ainda não foi confirmado.
- **Coleta conectada verificada:** sessão piloto concluída, dados persistidos recuperados no painel autorizado e audiência confirmada.

Não chame armazenamento local, receptor simulado ou interface com dados fictícios de coleta centralizada funcionando. Se o usuário pediu para não testar/publicar, respeite e marque essa etapa como pendente.

## Quando a fonte é Figma

Registre quais telas e recursos foram efetivamente lidos e quais comportamentos foram implementados como hipótese. Obter contexto ou screenshot do design não comprova fidelidade da implementação. Quando a execução estiver autorizada, compare o HTML renderizado com a fonte no escopo/dispositivo pedido e percorra as tarefas instrumentadas. Sem autorização para testes, mantenha fidelidade visual e funcionamento do estudo como pendências, mesmo que os arquivos estejam implementados.

A publicação do código da skill no GitHub não implica publicação de um estudo nem autorização para modificar o arquivo Figma de origem. Fonte inacessível, HTML pendente e infraestrutura pendente são dependências distintas; indique cada uma concretamente.

## Percurso mínimo de prontidão

Antes de entregar o link como pronto para pesquisa, abrir como o público previsto, consentir, iniciar e concluir uma tarefa, enviar e receber confirmação, recuperar a mesma sessão/tentativa no armazenamento e encontrá-la no painel com uma identidade de pesquisador autorizada. Conferir a exportação correspondente e as capturas/mapas/replay habilitados. Uma mensagem de sucesso ou sessão aberta apenas pelo administrador não substitui essa evidência.

Identifique e isole esse piloto da pesquisa real no servidor e no painel. Informe exatamente quais partes foram verificadas e o que depende de aparelho, acesso ou decisão ainda ausente.

## Entregas e dependências

Uma estrutura possível, adaptável ao projeto existente:

```text
study.config.json          marca, catálogos, tarefas, cenários, critérios e captura
prototype/                 cópia instrumentada e assets do HTML
participant/               experiência do estudo
researcher/                consulta e exportação protegidas
server/                    receptor, persistência e autorização
visual/                    captura, renderer isolado, mapas e player reutilizáveis
dist/                      arquivos publicáveis
```

Não crie pastas vazias nem finja que essa árvore já implementa o sistema. Prefira a estrutura e o processo de build existentes quando adequados. Um HTML único é possível para a prévia; coleta centralizada requer armazenamento/receptor acessível. Documente como executar, configurar e publicar os arquivos realmente entregues.

Se faltam serviços, termine o que independe deles e marque o estado como **implementação pronta; conexão pendente** apenas se a implementação efetivamente estiver pronta. Inclua receptor, esquema/migrações, painel e configuração de publicação preparados até a fronteira do acesso ausente; não reduza a entrega a uma prévia ou lista de recomendações. Peça só a conexão/acesso necessário para o próximo passo. Não solicite chaves secretas em texto no chat; use mecanismos de conexão/configuração disponíveis. A skill não fixa provedor pago ou arquitetura que o usuário não escolheu.

## Hospedagem

Para HTML independente, uma hospedagem de teste com HTTPS e assets acessíveis é suficiente. Staging de um app completo é útil quando os fluxos dependem de serviços reais. Não crie contas, pagamentos ou publique para outra audiência implicitamente. Reutilize serviços autorizados e, quando aplicável, o fluxo de publicação instalado no ambiente.

Use dados e contas de teste quando o produto exigir operações. Confirme que ninguém precisa do login do pesquisador. Um link longo não é controle de acesso; um estudo não é privado apenas porque não está indexado. Relatório e API de leitura permanecem protegidos mesmo quando o link de participação é público.

Links de prévia/piloto e de coleta são distintos e o receptor separa seus dados. QR code é opcional para abrir o link existente no celular; não gera hospedagem e não substitui a verificação do destino. Não distribua links aos participantes por mensagens sem autorização para enviá-las.

## Verificação proporcional ao modo

Execute os casos pertinentes e registre resultado e lacunas. Use automação para fluxos e contrato de coleta, além de inspeção visual. Simulação mobile não comprova funcionamento em Safari/iOS ou Chrome/Android reais.

### Produto e participante

- Percurso completo: consentir, começar, usar produto, reabrir instruções, concluir/desistir, responder e finalizar.
- Recusar consentimento e sair: nenhum evento comportamental depois da recusa/saída.
- Critério positivo e negativo: a ação correta conclui; tela parecida, tarefa anterior e botão de autorrelato não geram falso sucesso.
- Estado inicial e reset: tarefa seguinte não herda dados indevidos; perguntas anteriores persistem.
- Toque único e reabertura: nenhum listener duplicado, fim repetido ou toque contado duas vezes.
- Sem painel de justificativas, atalhos de troca de versão ou dicas do caminho acessíveis ao participante.
- Telas estreitas usuais, teclado aberto, rolagem, barras do navegador, foco, leitura por tecnologia assistiva e movimento reduzido.
- Navegador/aparelho permitido e dispositivo incompatível: orientação clara sem simular que a pesquisa foi validada em outro dispositivo.

### Coleta conectada

- Fazer uma sessão de piloto identificada, enviar e confirmar o mesmo `sessionId`/`eventId` no armazenamento e no relatório.
- Reenviar o mesmo lote e conferir que números, respostas e encerramentos não duplicam.
- Interromper rede antes/depois da gravação e antes da resposta: fila pendente, reenvio e confirmação reconciliados.
- Receber erro de autenticação/validação e verificar parada dos retries automáticos e recuperação clara.
- Recarregar/retomar durante tarefa, após conclusão e antes do envio final: atribuição, consentimento e tentativa mantidos, sem tempo de ausência contado como execução visível.
- Deixar página em segundo plano: tempo separado; fechamento sem retorno não vira desistência explícita.
- Testar armazenamento indisponível e informar risco de perda sem declarar envio recebido.
- Sessão A não lê nem altera sessão B; visitante anônimo não lê resultados; pesquisador autenticado acessa apenas estudos autorizados.
- Piloto excluído das métricas reais no servidor e no relatório; estado vazio real sem estatísticas fictícias.
- Conferir manualmente contagens, denominadores e exportações com uma amostra sintética conhecida, claramente identificada.

### Portabilidade e captura visual

- Validar a configuração com `python3 <pasta-da-skill>/scripts/validate_project.py estudo.config.json` e os testes do validador com `python3 <pasta-da-skill>/scripts/test_validate_project.py`. Isso não substitui testes do estudo gerado.
- Aplicar o motor a dois produtos com catálogos, marca e quantidade de tarefas diferentes; mudar somente configuração/adaptador/bundles, sem editar o coletor genérico. Procurar IDs, textos, regras e assets herdados indevidamente.
- Comparar captura e replay com a revisão original, incluindo fontes, imagens, elementos fixos, scroll interno e resize/teclado. Declarar recursos visuais não suportados.
- Usar texto sentinela digitado que também apareça em resumo, erro e atributo; verificar que ele não chega à árvore, fila, rede, banco, exportação ou replay. Excluir áreas do estudo/moderador e campos de entrada.
- Confirmar nenhum frame/ponto antes do aceite visual, durante pausa, instruções, perguntas, aba oculta ou após saída. Sessão antiga exige novo aceite, sem inventar capturas retroativas.
- Confirmar ponto antes da navegação na tela correta, coordenadas em CSS pixels, prévia escalada e mudanças de rolagem/tamanho em grupos separados. Cliques e toques não duplicam.
- Reenvio exato não duplica frames/pontos; mesmo ID com conteúdo diferente, referência cruzada e ponto órfão são rejeitados. Limites e gravação de lote são atômicos.
- Medir fila cheia, orçamento visual e falha permanente: aviso de captura incompleta, nenhum descarte silencioso, tarefas/respostas ainda utilizáveis e encerramento sem espera infinita.
- Token do participante e usuário de outro estudo não leem mapas/replay; iframe não recebe segredos, não faz rede, não navega, não envia formulários nem executa operações do produto.
- Player: play/pause, velocidade, slider, anterior/próximo, filtro de tarefa, intervalos/lacunas e ausência de dados. Mapas: totais exatos, grupos limitados/paginados e aviso de truncamento.
- Modificar marca/estilos do projeto atual não altera replay antigo: cada captura resolve seu bundle imutável. Não usar aparência atual como substituição silenciosa.

### Aparelhos reais

Quando iOS e Android estiverem em escopo, pilotar nos dois. Se só houver simulação ou um aparelho disponível, entregue o que foi verificado e marque os demais como pendentes; não invente testes físicos. Antes da distribuição real, execute pelo menos o percurso completo no dispositivo alvo disponível, incluindo carregamento e envio. Quando isso depender do usuário, forneça um roteiro curto e mantenha a validação como pendência explícita.

## Handover

Informe em linguagem simples:

1. O que foi construído: modo, protótipo/revisão, tarefas, versões e dispositivos.
2. O que é prévia, o que recebe dados reais e quais links existem.
3. O que é observado automaticamente e o que é declaração/resposta.
4. Onde ficam os dados, como o pesquisador acessa/exporta e a retenção configurada.
5. O que foi verificado, especialmente aparelhos reais, persistência, duplicação, acesso e eficácia do mascaramento/replay.
6. Conexões ou verificações pendentes e a ação concreta para concluí-las.

Ao criar apenas esta skill, entregue a skill e explique sua capacidade de gerar esses componentes futuramente. Não afirme que um estudo, link, banco ou dashboard de pesquisa já foi criado.
