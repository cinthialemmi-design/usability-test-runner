# Base reutilizável — escopo e implementação

Pedido: incluir participante, coleta persistente, painel privado, mapas e replay no pacote e publicar o código no GitHub, sem retomar testes.

Decisão de implementação: reaproveitar os componentes do estudo de salas, separar o exemplo do motor e oferecer uma implementação de referência Node.js + SQLite sem serviços proprietários obrigatórios. Cada instalação atende um estudo/revisão/ambiente. Serviços existentes podem substituir o servidor preservando os contratos. Não copiar identificadores, credenciais, dados de participantes ou integrações de hospedagem dos projetos anteriores.

- [x] Empacotar motor, receptor, migração, painel e renderer isolado.
- [x] Isolar exemplo, configuração, marca, tarefas e critérios.
- [x] Substituir autenticação específica por acesso de pesquisador no servidor.
- [x] Documentar inicialização, hospedagem persistente, limites e verificações pendentes.
- [x] Revisar arquivos e alterações sem executar o sistema ou testes.
- [x] Sincronizar a skill instalada e o pacote compartilhável; preparar a atualização do GitHub.

Validação de execução, testes automatizados e piloto de ponta a ponta permanecem pendentes por solicitação explícita. Publicar o código não significa publicar um estudo hospedado ou declarar coleta verificada.
