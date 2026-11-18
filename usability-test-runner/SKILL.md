---
name: usability-test-runner
description: Use when a user wants usability tests of editable HTML prototypes on mobile, configurable tasks and success criteria, centralized results, click heatmaps or participant-only visual replay. Applies to brand-prototype-viewer output and other editable web prototypes; excludes native app binaries and uninstrumented external embeds.
---

# Teste de usabilidade de protótipos HTML no celular

Transforme um protótipo HTML em um estudo com tarefas, coleta, mapas de cliques e replay visual do produto. Suporte execução não moderada e acompanhamento por moderador, mantendo evidência automática e avaliação humana separadas. Não depende de plataforma externa de pesquisa.

Esta skill fornece instruções, contratos e validação de configuração para construir o estudo; não inclui um aplicativo, SDK de captura ou servidor pronto. Instalar a skill não publica um site nem cria armazenamento remoto.

## 1. Partir do que já existe

Reaproveite da **brand-prototype-viewer** os tokens, assets, componentes, navegação e montagem/limpeza das telas. Leia a skill original se estiver disponível e precisar interpretar sua estrutura; esta skill é autossuficiente para outros HTMLs. Trabalhe em uma cópia de teste e preserve o original.

| No viewer | No teste |
|---|---|
| Moldura de aparelho | Apenas na prévia desktop; no celular, área real disponível |
| Lista de fluxos | Sequência de tarefas definida pelo estudo |
| Seletor de versões | Atribuição persistida, controlada pelo estudo |
| Justificativas, personas, “Try this” | Material exclusivo do pesquisador |
| Tour do produto | Introdução curta aos controles do teste |
| Preferências visuais livres | Condição de teste fixa, preservando ajustes de acessibilidade |

Teste o design fornecido: não redesenhe componentes, corrija problemas de UX ou acrescente pistas sem solicitação. Não herde a obrigação de criar três direções, 4–7 fluxos ou novas telas. O próprio HTML pode ser a referência de marca; peça assets apenas se faltar algo necessário para construir conteúdo novo.

## 2. Definir o estudo

Inspecione os arquivos antes de perguntar. Reaproveite objetivo, público e serviços já informados. Confirme apenas lacunas que mudam o teste: protótipo/entrada, decisão de pesquisa, participantes, tarefas, critérios observáveis e onde receber resultados.

Leia [project-contract.md](references/project-contract.md) para separar motor, configuração e adaptador. Marca, assets, telas, variantes, cenários, tarefas, perguntas, critérios, regras de tempo e limites visuais pertencem ao projeto. O motor não contém regras de negócio, IDs de tarefas fixos ou quantidade obrigatória de etapas.

Leia [study-design.md](references/study-design.md) ao preparar a pesquisa. Use [study.example.json](assets/study.example.json), uma configuração fictícia de reserva de salas, como exemplo. Verifique-a com `python3 <pasta-da-skill>/scripts/validate_project.py <configuração.json>`. O script verifica consistência; não comprova funcionamento de captura, serviços ou privacidade.

Registre estudo, revisão imutável do protótipo, versão atribuída e critérios de conclusão. Comece com uma versão e poucas tarefas quando não houver comparação pedida. Uma alteração durante a coleta cria outra revisão; não misture seus resultados silenciosamente.

## 3. Construir a experiência do participante

Percurso: **boas-vindas → informação e consentimento → instruções → tarefa → protótipo → pergunta de facilidade/comentário → próxima tarefa → encerramento e estado de envio**.

- Tarefa com contexto e objetivo, sem revelar botões ou caminho.
- Iniciar somente quando o protótipo estiver pronto; instruções recolhíveis e reabríveis. Consentimento para captura visual precede qualquer snapshot ou ponto.
- Oferecer “Acredito que terminei”, “Não consegui concluir” e saída voluntária. Declaração não equivale a sucesso observado.
- Usar a tela do celular sem moldura interna, respeitando teclado, barras do navegador e áreas seguras. Fullscreen é melhoria opcional.
- Separar eventos dos controles do estudo das interações do produto. Navegação de pesquisa não altera o protótipo.
- Idioma do estudo em português por padrão; controles acessíveis, foco visível e movimento reduzido.

Leia [html-integration.md](references/html-integration.md) antes de instrumentar o HTML. Se só houver uma URL externa sem acesso ao código ou ponte de eventos, explicite quais medidas não podem ser observadas; não prometa rastrear seu conteúdo.

## 4. Mapas e replay

Inclua mapas e replay no escopo padrão de novos estudos HTML editáveis; permita desligá-los por configuração. Leia [visual-capture-and-replay.md](references/visual-capture-and-replay.md) antes de implementar qualquer captura, armazenamento ou reprodução visual.

Capture apenas a raiz configurada do produto, com árvores estruturadas sanitizadas, dimensões, rolagem e coordenadas. Preserve estilos, fontes e assets em bundles imutáveis por revisão. O replay reconstrói capturas em um ambiente sem interação; não é vídeo nem reexecução do aplicativo.

Mapas separam tarefa, revisão, variante, geometria e visualização exata. O painel oferece filtros, contagens e limites; replay tem reprodução/pausa, velocidade, linha do tempo e navegação por captura. Mascaramento cobre campos e conteúdo derivado de entradas, inclusive atributos e resumos. Sessões antigas sem capturas mostram indisponibilidade, sem reconstrução fictícia.

## 5. Escolher a entrega e conectar a coleta

| Modo | Entrega verificável |
|---|---|
| Prévia local | Estudo revisável com dados de piloto e exportação local; sem coleta centralizada |
| Coleta conectada | Link hospedado, receptor e armazenamento testados; resultados restritos ao pesquisador |
| Importação manual solicitada | Arquivos exportados pelos participantes e importados pelo pesquisador, com limitações explícitas |

A coleta conectada é o objetivo para distribuir um teste com resultados centralizados. Sem serviços disponíveis, conclua os arquivos e a prévia, liste as conexões pendentes e não apresente o estudo como pronto para receber participantes. Prefira hospedagem/conectores já disponíveis; siga suas instruções ao usá-los e respeite a autorização existente.

Leia [data-and-results.md](references/data-and-results.md) antes de implementar coleta, armazenamento ou análise. Consentimento precede eventos comportamentais. Reenvio deve ser idempotente, falha de conexão deve ficar visível e credenciais de administração ficam no servidor. Prévia/piloto nunca entram nas métricas reais.

## 6. Resultados e entrega

Produza visão por tarefa e participação, percurso, tempos, conclusão observada/declarada, desistências, problemas técnicos, respostas, avaliações do moderador, mapas e replay quando habilitados. Exporte CSV/JSON sem segredos; capturas completas são carregadas sob demanda. Compare versões apenas quando configuradas. Gere síntese com evidências e denominadores reais; sem participantes, mostre estado vazio.

Leia [release-and-validation.md](references/release-and-validation.md) para verificar comportamento, coleta e acesso antes de distribuir. Informe o que foi testado em aparelho real e o que foi apenas simulado.

Entregue arquivos, modo de coleta, tarefas e critérios, links que realmente existam, acesso aos resultados, verificações e pendências concretas. Publicação de protótipo, credenciais e serviços não são consequências automáticas da instalação desta skill. Não declare a página privada sem verificar sua configuração de acesso.

## Limites e extensões

A base cobre HTML mobile, eventos, respostas, mapas de cliques e reconstrução visual. Captura de outros aplicativos, vídeo/voz/câmera, aplicativos nativos, Figma sem ponte de eventos, recrutamento e inferência estatística exigem outro escopo. Mapas não medem olhar/atenção; replay não comprova compreensão.
