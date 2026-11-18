---
name: usability-test-runner
description: Use when a user wants an end-to-end hosted usability study for editable HTML prototypes on mobile, with tasks, reliable response collection, centralized storage, private results, click heatmaps or participant-only visual replay. Applies to brand-prototype-viewer output and other editable web prototypes; excludes native app binaries and uninstrumented external embeds.
---

# Sistema de testes de usabilidade HTML no celular

**A entrega padrão é um sistema conectado:** link hospedado para o participante, serviço que recebe sessões/respostas, armazenamento persistente e painel privado com resultados e exportação. Mapas e replay visual fazem parte do escopo padrão para HTML editável. A prévia local é uma etapa de conferência, não o encerramento normal do trabalho.

Quando invocada para construir um estudo, implemente e conecte essas partes; não entregue apenas um protótipo, configuração ou plano. Planejamento, prévia local ou importação manual são entregas finais somente quando o usuário pedir esse escopo. Instalar a skill não concede acesso a contas, serviços ou credenciais.

## 1. Entender e configurar o estudo

Inspecione o projeto antes de perguntar. Reaproveite objetivo, público, audiência do link e serviços já informados; esclareça apenas o que muda a implementação ou depende da decisão do usuário.

Preserve o HTML original e sua marca. De **brand-prototype-viewer**, reaproveite tokens, assets, componentes, navegação e limpeza de telas. Retire da experiência de pesquisa as justificativas, dicas, seletor livre de versões e moldura de celular no aparelho real. Não herde quantidade de tarefas, regras de negócio ou cenários de outro projeto. O próprio HTML pode fornecer a referência visual.

Leia [project-contract.md](references/project-contract.md) para configuração/adaptador e [study-design.md](references/study-design.md) para tarefas e perguntas. Marca, telas, variantes, cenários, critérios, regras de tempo e limites visuais pertencem à configuração. O motor permanece independente do domínio.

O [exemplo JSON](assets/study.example.json) é fictício e está em prévia porque não possui serviços conectados; não define o padrão de entrega. O verificador em `scripts/validate_project.py` verifica consistência, não comprova funcionamento remoto.

## 2. Escolher e conectar a infraestrutura

Leia [infrastructure.md](references/infrastructure.md) antes de definir hospedagem, API, banco e acesso. Procure primeiro serviços e ferramentas já disponíveis no projeto e nas contas conectadas. Verifique suas capacidades e permissões reais; adapte a solução a eles em vez de impor uma pilha ou fornecedor.

Defina onde cada componente roda, onde os dados ficam e como participantes e pesquisadores acessam. Não trate hospedagem estática, autenticação e banco como uma capacidade única. Se nada acessível atender, recomende uma opção compatível, explique por quê e indique a conexão/provisionamento que falta. Continue tudo o que independe desse acesso.

## 3. Construir o sistema completo

Leia [connected-system.md](references/connected-system.md) para interfaces, persistência, painel e ordem de integração.

| Parte | Implementar |
|---|---|
| Participante | Boas-vindas, consentimento, tarefas, instruções, pausa/saída, respostas e estado de envio |
| Sessões e envio | Identidade de tentativa, retomada, fila durável, reenvio idempotente e confirmação real |
| Serviço receptor | Validação, autorização, avaliação de critérios e persistência antes do aceite de recebimento |
| Armazenamento | Estudos/revisões, sessões, eventos, respostas, avaliações, frames/pontos e política de retenção |
| Painel privado | Consulta por tarefa/participação, métricas com denominadores, avaliação humana e filtros |
| Exportação | CSV/JSON autorizados, com metadados e sem segredos |
| Publicação | URLs funcionais para o estudo e o painel, com audiência e acessos adequados |

Leia [html-integration.md](references/html-integration.md) para instrumentar o produto e [data-and-results.md](references/data-and-results.md) para dados e métricas. Conclusão observada, declaração e parecer humano são separados. Sem dados reais, use estado vazio; pilotos ficam identificados e isolados da coleta real.

Consentimento precede interações coletadas. Credenciais administrativas ficam no servidor. Autenticação não basta: autorize o pesquisador para o estudo e impeça leitura cruzada entre sessões. O link do participante não concede acesso ao relatório.

## 4. Construir mapas e replay

Leia [visual-capture-and-replay.md](references/visual-capture-and-replay.md). Capture somente a raiz configurada do produto, com árvores sanitizadas, geometria, rolagem e pontos vinculados. Mascare campos e conteúdo derivado, inclusive resumos/atributos, antes da fila.

Preserve os estilos/assets de cada revisão. Agrupe mapas por visualização compatível. O player reconstrói capturas em ambiente inerte, com pausa, velocidade e linha do tempo; não executa operações do produto. Proteja também seus endpoints e exportações. Sessões sem captura mostram indisponibilidade, sem replay inventado.

## 5. Demonstrar prontidão e entregar

Leia [release-and-validation.md](references/release-and-validation.md). Antes de declarar a coleta pronta, confirme uma participação de piloto de ponta a ponta: abrir o link como o público previsto, consentir, concluir uma tarefa, enviar, verificar o registro persistido e encontrá-lo no painel autorizado. Conferir só a aparência ou uma mensagem de sucesso não comprova coleta centralizada.

Entregue o link de participação, o acesso ao painel, a localização dos dados, instruções de operação/exportação e o que foi verificado. Respeite pedidos para não executar testes ou publicar; nesses casos, registre a verificação/publicação pendente sem afirmar que foi feita.

Se faltar hospedagem, banco, credencial ou permissão, conclua a implementação até essa fronteira e entregue uma pendência concreta: componente afetado, acesso necessário, arquivos/comando preparados e próximo passo. Não substitua coleta conectada por localStorage ou encerre em uma recomendação genérica. Use status honestos: **implementação pronta; conexão pendente**, **publicado; verificação pendente** ou **coleta conectada verificada**.

## Limites

A skill orienta construção e conexão, mas não cria autorização ou credenciais indisponíveis. Vídeo/áudio/câmera, captura de outros aplicativos, app nativo, Figma sem ponte de eventos, recrutamento e inferência estatística exigem outro escopo. Mapas não medem olhar/atenção; replay não comprova compreensão.
