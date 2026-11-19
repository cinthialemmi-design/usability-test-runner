# Coleta, persistência e resultados

Leia ao implementar armazenamento, envio, retomada, exportação e análise. Escolha serviços disponíveis no projeto; este contrato não presume provedor, API ou banco já criados.

## Identidade e isolamento

Separe `studyId`, `studyRevision`, `prototypeRevision`, `variantId`, `sessionId`, `taskId` e `attemptId`. Use um ID aleatório de sessão; não faça fingerprinting. Retomada preserva sessão/atribuição, e uma nova tentativa tem outro `attemptId` com vínculo à anterior.

Uma sessão corresponde a uma participação técnica, não comprova uma pessoa única. Não prometa bloquear múltiplas participações entre aparelhos sem uma identificação adicional explicitamente definida. Identificadores não carregam nome, e-mail ou outros dados pessoais em URL.

Piloto e prévia usam namespace/ambiente separado. O servidor valida modo e atribuição; um parâmetro na URL não transforma piloto em dado real nem concede acesso ao relatório. Revisões publicadas e regras de análise ficam registradas e não mudam retrospectivamente.

## Consentimento e minimização

Apresente antes da coleta comportamental quais eventos e respostas serão enviados, a finalidade, responsável, acesso, retenção e forma de sair. Registre aceitação e versão do texto. Recusa encerra sem eventos comportamentais; solicitações técnicas normais de hospedagem podem ocorrer e não devem ser descritas como ausência absoluta de dados.

Sem configuração real de responsável/destino/retenção, prepare a prévia e explicite a pendência. Não substitua essas informações por texto inventado nem exiba campos técnicos ao participante.

Armazene somente campos permitidos. Não capture automaticamente texto digitado, DOM bruto/completo, senhas, áudio, câmera ou vídeo da tela. A captura visual usa apenas a raiz do produto sanitizada e consentida, conforme [visual-capture-and-replay.md](visual-capture-and-replay.md), incluindo mascaramento de conteúdo derivado. Revogar/sair interrompe novos eventos; não prometa apagar dados recebidos sem fluxo real de exclusão. Retenção e acesso abrangem também frames, pontos e bundles.

## Envelope de evento

Cada evento inclui:

| Campo | Uso |
|---|---|
| `schemaVersion`, `eventId` | Evolução e ID único persistido antes do primeiro envio |
| IDs de estudo, revisão, versão e sessão | Rastrear a condição realmente testada |
| `taskId`, `attemptId` | Contexto de tarefa; nulos em eventos gerais do estudo |
| `sequence` | Ordem crescente por sessão, mantida em retomadas |
| `type` | Evento em uma lista permitida |
| `occurredAt`, `receivedAt` | Hora do aparelho e hora de recebimento atribuída pelo servidor |
| `payload` | Dados permitidos pelo esquema do tipo |

Tipos base: `consent_accepted`, `study_started`, `task_started`, `screen_view`, `action`, `state_change`, `visibility_changed`, `task_ended`, `answer_submitted`, `study_ended`. Início, fim e resposta são idempotentes; uma tentativa tem no máximo um encerramento aceito. Reenvios preservam `eventId`, conteúdo e sequência. IDs opacos não são segredos nem autorização.

Use uma tabela única de eventos ou tabelas derivadas, mantendo a fonte de evidência. Se usar tabelas de sessões/tentativas/respostas, imponha chaves únicas que impeçam contar o mesmo evento/fim duas vezes.

## Envio e confirmação

Na coleta conectada, implemente receptor no servidor com HTTPS, validação de esquema/tamanho, sessão autorizada para escrever somente seus dados e deduplicação por `eventId`. Crie credenciais de sessão com escopo e expiração adequados; o endpoint público não deve permitir ler resultados, enumerar sessões ou alterar atribuições de terceiros. A consulta/exportação do pesquisador exige autenticação e autorização reais. Esconder a rota ou usar um parâmetro `admin=1` não controla acesso.

Confirme cada lote somente depois da gravação durável. Retorne IDs aceitos, inclusive duplicados já persistidos, e erros permanentes identificáveis. Na retomada, sincronize o último estado aceito e reconcilie encerramentos para não criar outra tentativa por acidente.

Mantenha fila local durável, por exemplo em IndexedDB, após consentimento, quando disponível. Se armazenamento falhar, mostre a limitação e ofereça recuperação; não garanta preservação em navegação privada, limpeza do navegador ou troca de aparelho. Armazene tokens de retomada com escopo adequado, sem credenciais de administração.

Reenvie com espera progressiva limitada, por exemplo até cinco tentativas consecutivas por lote. Depois, mantenha a fila e ofereça “Tentar enviar novamente”; não continue em loop nem descarte dados. Erro de validação/autorização exige correção ou renovação do acesso, sem reenvio cego. Não dependa exclusivamente do fechamento da aba, `unload` ou `sendBeacon`.

Antes de enviar uma resposta final ou encerrar, esvazie novamente as filas após cada requisição visual; novas ações podem ter chegado durante o envio. No starter-2, o servidor verifica `eventBarrier: {count,lastSequence}` contra eventos persistidos. A resposta não pode ultrapassar sua evidência e chamadas de envio concorrentes não podem ser descartadas.

Estados mostrados ao participante: **salvo neste aparelho**, **envio pendente**, **recebido**, **falha no envio**. “Recebido” depende de confirmação durável. Estudo concluído e envio concluído são estados diferentes. Offline pode preservar eventos; não garante que assets externos carreguem. Cache offline/PWA é extensão solicitada, com testes próprios.

## Resultado da tarefa

| Estado | Evidência |
|---|---|
| `not_started` | Nenhum início registrado |
| `in_progress` | Tentativa ativa sem encerramento |
| `observed_success` | Critério definido satisfeito por evidência válida depois do início |
| `self_reported` | Participante declarou conclusão sem confirmação observável |
| `gave_up` | Desistência explícita |
| `technical_failure` | Falha técnica documentada impediu executar ou medir a tarefa |
| `interrupted` | Sessão sem encerramento ao fechar a coleta ou após regra de inatividade previamente definida |

Fechar a aba não comprova desistência. Atraso de envio sozinho não prova falha da tarefa; reconcilie a fila. Mantenha o autorrelato separado do estado observado. Não invente “sucesso parcial” sem critérios intermediários definidos antes do teste. Uma tarefa sem detector é `self_reported`, nunca `observed_success` baseado no botão “terminei”.

Registre regra, versão do critério e evidência do resultado conforme [project-contract.md](project-contract.md). Respostas posteriores não sobrescrevem duração nem declaração; quando uma resposta integra o critério, o avaliador calcula a evidência após recebê-la. Avaliação humana permanece em campo separado com autor/data/rubrica, sem sobrescrever eventos ou respostas. Reinícios e segundas tentativas são preservados e analisados separadamente.

## Tempo

Meça `elapsedMs` e `visibleExecutionMs` separadamente. A primeira começa quando a tarefa está pronta e o participante inicia, e termina no encerramento. A segunda soma intervalos visíveis de execução, excluindo instrução inicial, perguntas posteriores, pausas explícitas e período em segundo plano.

Use relógio monotônico dentro de cada carregamento e persista intervalos/checkpoints. Retomadas criam segmentos; lacunas sem observação não são tempo medido. Marque duração incompleta em vez de inventar precisão ou reconstruir pelo horário de recebimento do lote. Relate tempo visível como tempo de execução visível, não atenção ou engajamento.

## Métricas e denominadores

Unidade padrão: primeira tentativa iniciada de cada sessão em cada tarefa. Mostre separadamente novas tentativas, tarefas não iniciadas e sessões distintas; não chame sessões de pessoas verificadas.

- Sucesso observado: `observed_success / tentativas iniciadas`. Mostrar contagem e denominador, inclusive falhas técnicas/interrupções no denominador principal.
- Autorrelato, desistência, falha técnica e interrupção: cada estado dividido pelo mesmo total iniciado; não somar autorrelato a sucesso observado.
- Taxa ajustada opcional: explicitar exclusões e quantidades; nunca substituir silenciosamente a taxa principal.
- Tempo: mediana de `visibleExecutionMs` das tentativas com sucesso observado e duração completa, indicando seu N. Demais estados têm resumo separado. Com zero casos elegíveis, “sem dados”.
- Facilidade: distribuição e resumo das respostas válidas; informar N respondido e N ausente. Não preencher ausente como zero.

Exemplo sintético para conferir cálculo, não resultado de pesquisa: em 12 primeiras tentativas iniciadas, com 4 sucessos observados, 3 autorrelatos, 2 desistências, 1 falha técnica e 2 interrupções, a taxa principal é 4/12 (33,3%). Se apresentar uma taxa que exclui falha técnica, ela é 4/11 (36,4%), rotulada como ajustada. Três tarefas não iniciadas adicionais não entram no denominador iniciado.

Percurso vem de telas realmente montadas, ordenadas por sequência da sessão. “Cliques errados” exige definição prévia e mapa confiável de ações válidas; toque sem transição, voltar, rolar ou explorar não é erro automaticamente. Heatmaps usam pontos e frames do contrato visual, não contagens de ações semânticas. Mostre conclusões automáticas e pareceres humanos em dimensões separadas; as contagens podem se sobrepor e não são categorias exclusivas para somar numa única taxa.

## Relatório e exportação

Mostre filtros por estudo/revisão/versão, tarefa, sessão e piloto. Produza tabela por tarefa, detalhe por sessão, registros humanos e linha do tempo de eventos. Mapas e replay visual são painéis próprios, carregados sob demanda com suas autorizações; linha de eventos sozinha não é replay visual.

Exporte JSON com metadados, eventos, resultados, respostas e regras de cálculo. Exporte CSV tabular de tentativas/respostas com IDs, status, tempos e contexto; separe tabelas quando necessário. Preserve Unicode, escape aspas/quebras e neutralize fórmulas em células de texto para abertura segura em planilhas. Não exporte segredos nem contatos não necessários.

Síntese liga cada achado a tarefas, contagens/denominadores e evidências disponíveis. Texto de participante só pode ser citado se recebido. Ausência de cliques, comentário ou vídeo não autoriza inventar motivação. Comparações de versões são descritivas por padrão, com amostra e ordem de exposição visíveis; não inferir significância sem método e dados adequados.
