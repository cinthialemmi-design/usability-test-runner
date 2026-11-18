# Planejamento do estudo

Leia ao transformar objetivo de pesquisa em tarefas, perguntas e comparação de versões.

## Contrato mínimo

Documente em uma configuração legível pelo projeto:

- `studyId`, `studyRevision` e `prototypeRevision`: identificadores estáveis; revisão publicada imutável.
- Título, idioma, público, objetivo, decisão a apoiar e dispositivo esperado.
- `collectionMode`: `preview`, `connected` ou `manual`; ambiente de piloto separado.
- Versões com ID estável e entrada do protótipo; método de atribuição.
- Consentimento: versão do texto, informação sobre eventos e respostas coletados, acesso e destino dos dados. Confirme responsável e prazo de retenção antes da coleta real; uma sugestão não é política aprovada.
- Tarefas ordenadas com `taskId`, cenário, objetivo, tela/estado inicial, estado a reiniciar, critério observável, encerramento declarado permitido e perguntas posteriores.
- Política de retomada e regra de análise dos tempos, resultados e denominadores.

O exemplo em `../assets/study.example.json` demonstra tarefas fictícias de reserva de salas no contrato 2 de [project-contract.md](project-contract.md). Não preenche as decisões da pesquisa real. Campos nulos de responsável/retenção/conexão são pendências deliberadas, que impedem tratar esse exemplo como coleta pronta. Não imponha cinco tarefas nem IDs herdados de outro estudo.

## Tarefas sem pistas

Escreva metas reais com contexto suficiente para agir. Não repita o nome exato de um menu como dica, nem diga a sequência de cliques.

Exemplo fictício: “Você precisa de um espaço para uma reunião da equipe amanhã. Encontre uma sala adequada e faça a reserva.”

A expressão “toque em Salas e depois em Reservar” revela o caminho. O critério interno pode combinar confirmação de reserva e estado salvo, mas o participante não recebe esse critério técnico. Se a decisão depende de compreensão, alcançar a tela é só evidência de navegação; acrescente uma pergunta de compreensão e analise-a separadamente.

Valide que cada tarefa é realizável no protótipo. Inclua estados alternativos legítimos na definição de sucesso. Não restrinja sucesso ao caminho imaginado pelo designer quando outro percurso atende ao objetivo.

## Início e encerramento

Mostre o cenário antes de “Iniciar tarefa”. Prepare o estado inicial e confirme o carregamento sem permitir exploração antecipada. O cronômetro começa com a execução disponível, após o início explícito, e termina no critério observado ou encerramento explícito.

Ao detectar o critério, registre a evidência. `completionMode: observed` pode encerrar nesse ponto; `participant` mantém a observação até a declaração. Use o segundo quando reconhecer o fim ou explicar uma decisão integra o estudo. “Acredito que terminei” é uma declaração: registre separadamente e verifique o critério se possível. “Não consegui concluir” encerra como desistência, sem orientar o caminho.

Evite mensagens que avaliem o participante (“você errou”, “acertou”). A apresentação explica que o produto está sendo avaliado e que é possível interromper. Não mostre taxa de sucesso ou performance durante o estudo.

## Perguntas

Por padrão, ofereça depois da tarefa:

- Facilidade de 1 a 7, com extremos “Muito difícil” e “Muito fácil”, sempre na mesma direção.
- Comentário opcional: “O que facilitou ou dificultou essa tarefa?”

Chame isso de pergunta de facilidade. Não apresente uma adaptação livre como instrumento padronizado ou score validado. Perguntas específicas podem testar compreensão, confiança ou expectativa, conforme o objetivo. Evite exigir texto longo no celular ou induzir uma avaliação positiva.

Respostas não preenchidas são ausentes, não nota zero. Escalas e textos mantêm `questionId`, versão, contexto da tarefa e sentido das opções no export.

## Acompanhamento por moderador

Roteiro, preparação de cenário e rubrica humana ficam fora da experiência do participante. Um roteiro local não controla outro aparelho nem recebe seus eventos por existir ao lado do protótipo. Quando houver acompanhamento, o painel central consulta a sessão recebida e permite anotações autorizadas, sem modificar respostas. Não presuma sincronização de cenário ou controle remoto sem implementá-los.

Mapas/replay ajudam a localizar comportamento; não provam entendimento, motivo ou ausência de ajuda. Registre intervenções do moderador separadamente. Consentimento cobre as capacidades realmente habilitadas, sem obrigar a pessoa a explorar o produto para recusar: sair/fechar continua possível.

## Versões e aprendizagem

Uma versão por participante é o ponto de partida para comparar alternativas com menor aprendizagem. Faça atribuição no início do estudo, registre o método e preserve-a em retomadas. Pesquisador pode fixar uma versão para piloto; participante real não pode alterá-la por seletor ou parâmetro não validado.

Se a mesma pessoa testar mais de uma versão, registre a decisão, alterne/contrabalanceie a ordem e agrupe os resultados por ordem de exposição. Não trate essas tentativas como participantes independentes.

Não fabrique personas ou segmentos. Colete apenas atributos pertinentes e voluntários necessários para a análise. Amostra e recrutamento dependem do objetivo; não fixe número universal nem prometa representatividade ou significância automaticamente.

## Preservação da condição testada

Mantenha navegação, textos, cores, alvos e comportamento do HTML original. Não conserte um problema encontrado durante a instrumentação sem registrar e autorizar essa mudança de escopo. Uma revisão posterior pode testar a correção separadamente.

Na conversão de `brand-prototype-viewer`, remova da experiência do participante o painel de justificativas, as personas, “Try this”, previews do caminho e teclas que mudam fluxos/versões. A navegação legítima do produto permanece. Tema, tamanho e plataforma definidos pelo estudo não devem mudar casualmente; ajustes de acessibilidade do aparelho permanecem disponíveis e suas limitações são descritas, sem capturar conteúdo pessoal.
