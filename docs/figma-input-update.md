# Entrada Figma → HTML → estudo completo

Escopo autorizado: ampliar a usability-test-runner para aceitar link do Figma, orientar implementação HTML navegável e preparar todos os componentes do estudo, sincronizar o pacote e subir o código no GitHub. Sem executar testes, build, servidor ou piloto.

Mudanças de instrução:

- Descoberta da skill e mensagem inicial cobrem link Figma e HTML existente.
- Referência dedicada a acesso, frames, contexto detalhado, recursos e comportamentos ausentes no design.
- Integração ao contrato existente: adaptador, catálogos, fixtures, tarefas e critérios; sem regras herdadas de salas.
- Registro de origem/hipóteses fora do conteúdo público e instruções de continuidade quando faltar acesso.
- Distinção entre leitura da fonte, implementação, publicação e verificação em execução.

Não foi fornecido um link Figma para conversão nesta atualização. Nenhum arquivo de design foi aberto ou alterado. A nova orientação não foi exercitada com uma conversão real; o runtime permanece no perfil starter-3 e captura visual 3.

## Ajustes após comparação com a prototype-viewer

- SVGs: removida a recomendação automática de simplificação/rasterização. Fonte original e restrições da integração são preservadas; incompatibilidades continuam recusadas. Uma alternativa só cabe quando permitida pela fonte e autorizada no projeto. A mensagem de erro do empacotador passa a orientar esse mesmo procedimento; a regra de aceitação não mudou.
- Fontes: documentados faces estáticas por peso/estilo, intervalos/eixos reais de fontes variáveis, prevenção de síntese tipográfica, arquivos locais aprovados e equivalência de declarações no participante/replay. O empacotador não verifica a correspondência tipográfica dessas declarações.
- Acessibilidade: as orientações passam a abranger o produto gerado, com semântica, rótulos, teclado, foco, estados/erros, zoom, toque e movimento reduzido. Problemas da fonte, lacunas de comportamento e defeitos da conversão têm tratamento separado.

A lista de verificação futura foi ampliada, mantendo todos os itens pendentes. Não foram executados testes, build, servidor, navegador, piloto ou conversão real; não houve alteração no perfil ou esquema de captura.
