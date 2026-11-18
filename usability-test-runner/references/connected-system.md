# Construir o sistema conectado

Leia ao executar o escopo padrão da skill. Entregue participante, receptor, armazenamento e área privada de resultados conectados entre si. Este documento orienta implementação; não presume serviços ou software já provisionados.

## 1. Contratos e ordem de integração

Primeiro estabeleça a configuração do estudo, o adaptador do produto, a fonte de identidade e o armazenamento escolhidos em [infrastructure.md](infrastructure.md). Implemente o esquema/migrações e um percurso de escrita/consulta real. Conecte a experiência do participante a esse receptor e o painel à mesma base. Amplie para as demais tarefas, visualização e exportação mantendo o contrato comum.

Uma organização possível, ajustável ao projeto, é `participant`, `server`, `storage`, `researcher`, `visual` e `prototype-adapter`. As fronteiras importam mais que os nomes de pastas. Não crie telas que aparentem integração apoiadas apenas em arrays ou localStorage.

## 2. Interface do participante

Implemente boas-vindas, informação/consentimento versionados, contexto da tarefa, início explícito, instruções recolhíveis, pausa, saída voluntária, conclusão declarada/desistência, perguntas posteriores e encerramento.

Só libere interação coletada após aceite e preparação da tentativa. Ao retomar, bloqueie o produto até consultar/reconciliar a sessão e restaurar seu estado em pausa; não registre a tela inicial errada nem sobrescreva o snapshot salvo enquanto espera a resposta.

Informe estados de envio na própria experiência, inclusive em diálogos de espera: salvo neste aparelho, pendente, recebido ou falha recuperável. Distinga conclusão de tarefa, envio da resposta e encerramento da sessão. Não deixe a pessoa presa a uma espera sem reenvio ou saída explicados.

## 3. Receptor e API

Adapte nomes de rotas ao serviço existente, preservando estas responsabilidades:

| Operação | Implementação |
|---|---|
| Consultar estudo | Configuração pública necessária ao participante, revisão e disponibilidade; sem segredos ou acesso aos resultados |
| Criar sessão | Aceite explícito, revisão/variante, identidade e credencial de escrita restrita à própria sessão |
| Retomar sessão | Verificação da credencial, estado aceito pelo servidor e reconciliação de pendências |
| Receber eventos | Lista permitida, contexto válido, ordem, limites e escrita idempotente |
| Receber respostas | Perguntas/escala válidas, tentativa iniciada e resultado baseado em critério versionado |
| Receber capturas/pontos | Aceite visual, sanitização, vínculos/limites e persistência atômica |
| Finalizar/encerrar | Regras de estado, confirmação durável e repetição segura após perda de resposta |
| Consultar painel/exportar | Autenticação e autorização por estudo/papel; dados filtrados e paginados |
| Registrar avaliação humana | Autorização de anotação, tarefa/sessão do estudo, autor/data e preservação da evidência original |

Criação e finalização também precisam ser idempotentes. Persista uma intenção de criação e credencial de sessão antes do primeiro envio; repetir a mesma intenção após confirmação perdida retorna a mesma participação. Nunca use uma chave administrativa para isso.

Confirme recebimento depois de gravar de forma durável. O navegador só remove itens confirmados da fila. Um identificador repetido com conteúdo diferente é conflito; uma repetição exata não duplica. Limite payload, lotes, tentativas automáticas e estados aceitos. Quando a infraestrutura exige, valide origem/CORS sem confundir isso com autorização.

Reconcile o encerramento em separado: confirmar a última resposta não significa que a sessão foi finalizada. Mantenha uma intenção de finalização/saída até o servidor confirmá-la, inclusive após reload. Não permita que falha de rede faça o cliente avançar para uma tarefa inexistente ou crie uma nova participação sem necessidade.

Os detalhes de envelope, tempos, filas, estados e métricas estão em [data-and-results.md](data-and-results.md). Os contratos visuais estão em [visual-capture-and-replay.md](visual-capture-and-replay.md).

## 4. Armazenamento durável

Prepare esquema/migrações para estudos/revisões, sessões, tentativas, eventos, respostas, avaliações humanas e capturas/pontos. Um modelo documental ou de eventos pode ser equivalente, desde que preserve os mesmos vínculos e evidências.

Inclua chaves únicas para deduplicação, vínculos ao estudo/sessão/tentativa/revisão, índices de consulta e metadados de consentimento/recebimento. Use transações ou mecanismo equivalente para operações que não podem ficar pela metade, especialmente limites visuais e encerramentos. Não execute alterações de esquema improvisadas a cada visita.

Pilotos ficam identificados e isolados no receptor e na consulta, por namespace, ambiente ou estudo próprio. Filtro visual sozinho não impede contaminar métricas reais. Retenção e exclusão abrangem respostas, eventos, frames/pontos, filas e conteúdo local do produto; implemente a política configurada e explique quando a limpeza ocorre.

Mantenha credenciais do banco e de administração no ambiente do servidor. Credenciais do participante, se usadas no navegador, têm somente o escopo necessário para sua própria sessão. Persista hashes quando a estratégia permitir; não inclua tokens nas respostas de consulta, logs ou exportações.

## 5. Área privada de resultados

Implemente uma página/rota da equipe ligada à base real: lista de estudos e participações autorizadas, visão por tarefa, detalhe da sessão, conclusão observada/declarada, tempos com definição, respostas, notas de facilidade, evidências e avaliações humanas.

Os filtros seguem catálogos do projeto/revisão. Mostre estado vazio sem estatísticas fictícias. Informe recorte/paginação e mantenha totais/denominadores coerentes; não apresente métricas de uma página limitada como se cobrissem toda a pesquisa.

Carregue mapas e replay sob demanda, com autorização equivalente à do relatório. Não exponha capturas a quem tem somente link de participação ou credencial de escrita de uma sessão. Avaliações humanas não sobrescrevem respostas nem eventos; podem complementar ou discordar da evidência automática com autoria explícita.

Autentique a identidade no servidor e verifique que ela pode ler/anotar aquele estudo. Não autorize toda conta autenticada apenas por estar autenticada. Se a política da plataforma restringe o site ao único responsável, registre essa dependência e implemente papéis antes de ampliar a audiência para participantes. Link reservado, quando escolhido, deve ter escopo/expiração/revogação coerentes; não o publique na página do participante.

## 6. Exportação CSV/JSON

CSV apresenta tentativas/respostas e contexto suficiente para analisar os resultados; JSON preserva metadados, regras de cálculo e referências às evidências. A exportação respeita os mesmos estudos/papéis autorizados, inclui denominadores e informa se contém apenas uma página ou o conjunto completo. Escape texto e neutralize fórmulas em planilhas.

Não exporte credenciais nem dados pessoais desnecessários. Árvores/pontos completos são uma exportação explícita e protegida; não entram automaticamente no relatório geral. Confira se os filtros e o conjunto exportado correspondem ao que a interface promete.

## 7. Critério mínimo de entrega

O sistema conectado só está demonstrado quando uma sessão de piloto consegue: abrir o estudo no link destinado ao participante, consentir, iniciar/concluir tarefa, enviar, receber confirmação durável, recuperar o mesmo registro por sessão/tentativa e visualizá-lo no painel autorizado. Verifique também a exportação correspondente e mapas/replay quando habilitados.

Use identidade/audiência representativa: abrir tudo como administrador não comprova o acesso dos participantes nem a restrição dos resultados. Dados de piloto permanecem separados da coleta real. Registre evidência e lacunas de acordo com [release-and-validation.md](release-and-validation.md).

Se o usuário limitar testes ou publicação, respeite a instrução e entregue o restante com esse critério pendente. Não transforme a limitação em alegação de funcionamento e não encerre o trabalho independente da conexão que falta.
