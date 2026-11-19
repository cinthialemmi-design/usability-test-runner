# Atualização de envio e recursos visuais

Escopo autorizado: corrigir a ordem de envio, a fidelidade do replay e incluir suporte a imagens/fontes, sincronizar a skill e publicar o código no GitHub. Sem executar testes, iniciar o aplicativo ou abrir piloto.

Implementação:
- Fila única volta aos eventos após toda requisição visual; reentrada de envio é preservada.
- Respostas/encerramento exigem confirmação de quantidade e última sequência dos eventos no servidor.
- Tags estruturais são preservadas; interação é bloqueada por mecanismos separados.
- Registro de arquivos locais, CSS estruturado por PostCSS, hashes e bytes incorporados ao bundle; imagens/fontes aguardadas antes do desenho dos pontos.
- Perfil starter-2/captura 2, nova revisão do exemplo e migração explícita para outro banco/instalação.

Preparação de dependências limitada a metadados/lockfile, com scripts desativados. Fontes abertas copiadas com licença e origem fixada. Verificação de execução e de funcionamento segue pendente; leitura de arquivos e revisão de diff não equivalem a testes.
