# Escolha e conexão da infraestrutura

Leia antes de escolher a implementação de um estudo conectado. A decisão deve produzir um caminho executável até hospedagem, recebimento, armazenamento e acesso aos resultados; não apenas uma lista de serviços sugeridos.

## 1. Descobrir o que já existe

Inspecione os arquivos do projeto: manifesto de publicação, comandos de build, funções/servidor, configuração do banco, migrações, identidade, regras de acesso e exemplos de variáveis de ambiente. Procure nomes de serviços e disponibilidade, sem imprimir valores secretos.

Consulte ferramentas, conexões e contas disponíveis antes de pedir dados ao usuário. Prefira a integração nativa do serviço quando ela cobre a tarefa. Verifique o projeto/conta corretos, permissões e recursos realmente acessíveis; uma ferramenta listada ou uma conta autenticada não comprova acesso a banco, publicação ou administração. Acesso ao repositório também não equivale a acesso à infraestrutura de execução.

Não reutilize IDs de site, banco, estudos ou credenciais de outro produto por conveniência. Reaproveitar uma conta/plataforma autorizada é diferente de misturar dados entre pesquisas.

## 2. Mapear capacidades para componentes

| Capacidade necessária | O que confirmar |
|---|---|
| Hospedagem do participante | HTTPS, assets/rotas acessíveis e audiência compatível com os participantes |
| Execução do receptor | Funções ou serviço de servidor, endpoints, limites de payload/tempo e configuração de segredos |
| Persistência | Banco ou armazenamento durável, migrações, transações, chaves únicas e consulta por estudo |
| Autenticação da equipe | Identidade verificável no servidor e autorização por estudo/papel |
| Capturas e replay | Orçamento de bytes, armazenamento, retenção e bundles visuais versionados |
| Operação | Publicação, variáveis de ambiente, diagnóstico de erros e caminho para exportação |

Somente hospedar HTML não fornece receptor nem banco. Um servidor que responde não comprova persistência. Login não define quem pode ler uma pesquisa. Arquivo salvo no navegador não é coleta centralizada.

## 3. Escolher a arquitetura compatível

- **Projeto com backend/banco/autenticação existentes:** integre os endpoints, migrações e painel à estrutura existente, isolando os estudos e suas permissões.
- **Plataforma conectada com hospedagem, funções e banco:** implemente com as capacidades suportadas e siga seu processo de publicação e configuração. Quando a plataforma oferecer Worker e D1, por exemplo, declare os vínculos e gere/aplique as migrações pelo fluxo nativo; não presuma que já existem.
- **Hospedagem estática disponível:** mantenha o participante nela e acrescente um receptor/backend com persistência e identidade compatíveis. Trate origem, CORS e autenticação explicitamente se os domínios forem diferentes.
- **Ambiente corporativo/staging:** verifique se os participantes conseguem acessá-lo sem as credenciais da equipe e se usa dados/operações de teste adequados.
- **Nenhuma infraestrutura acessível:** recomende uma opção concreta que cubra as capacidades faltantes, com motivo e dependências. Confira documentação oficial atual antes de assumir recursos, planos ou APIs. Não imponha fornecedor ou contratação desnecessários.

Faça um registro curto da escolha: componente, serviço/projeto de destino, capacidade disponível, acesso necessário e estado atual. Use nomes de variáveis ou bindings, nunca seus valores secretos. Reaproveite autorizações do usuário; solicite somente decisões/conexões ainda ausentes que alteram essa escolha ou permitem a próxima ação.

## 4. Conectar durante a construção

Defina contratos de envio/consulta e a estrutura persistente antes de implementar os formulários do estudo. Prepare e aplique migrações, implemente autenticação/autorização, configure segredos no servidor e conecte o participante ao receptor real. Depois conecte o painel às mesmas fontes. Não deixe essas partes como um “backend futuro” no escopo padrão.

Separe configuração pública, configuração do servidor e segredos. A URL do receptor pode ser pública; chaves administrativas e credenciais de banco não podem entrar no HTML, JavaScript entregue ao navegador, URL de convite, exportação ou repositório.

Confirme audiência do link de participação e papéis de quem consulta os resultados. Não altere o público de um serviço para contornar autenticação. Um site exclusivo do responsável pode servir à conferência técnica; se o público previsto ainda não consegue abrir o estudo, declare o acesso como pendência de distribuição.

## 5. Continuar quando faltar acesso

Sem uma conexão necessária, avance em todas as partes independentes: interface de tarefas, adaptador do protótipo, esquema/migrações, código do receptor, contratos de autorização, painel, exportações, build e instruções específicas de publicação. Use adapters/configuração para que a conexão posterior não exija reescrever o produto.

Simulações locais são instrumentos de desenvolvimento identificados, não prova de coleta remota. Não invente conta, URL publicada, banco, chave ou confirmação de recebimento.

Ao reportar a fronteira, seja específico, por exemplo: “Participante, API e painel implementados. Falta conectar o banco do projeto selecionado e configurar a variável de servidor indicada; a migração e o comando de publicação estão preparados.” Nomeie o acesso e a próxima ação reais do projeto. Não substitua por “precisa de um backend” nem repita pedidos para informações já disponíveis.

Se uma decisão exige o usuário, mantenha a pergunta pendente e conclua o trabalho que não depende dela. Se uma operação é negada, registre qual componente ficou impedido e preserve a implementação pronta, sem contornar a restrição.
