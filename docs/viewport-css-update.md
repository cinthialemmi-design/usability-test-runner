# Janela original e CSS isolado

Escopo autorizado: registrar o tamanho da janela no replay, isolar o CSS da pesquisa e publicar a atualização no GitHub. Não executar testes, build, servidor ou piloto.

Mudanças preparadas:
- Geometria compartilhada de janela, área visual, posição da raiz e recorte; validação e recálculo no receptor.
- Identidade dos mapas inclui contexto da janela/recorte; pontos seguem coordenadas internas do produto.
- Iframe mantém a janela original e o painel exibe somente a interseção visível do produto.
- CSS do estudo restrito a `.utr-ui`, tokens `--utr-*` e slots estruturais sem tipografia herdada; produto fora dessas raízes.
- Exemplo com estilos próprios; bundle visual contém somente CSS do produto e placeholder reservado.
- Perfil starter-3/captura 3 e revisão própria do exemplo; perfis anteriores conservam banco/bundle em outra instalação.

Leitura de arquivos e revisão de alterações são as verificações autorizadas. Funcionamento em execução continua pendente na lista do starter.
