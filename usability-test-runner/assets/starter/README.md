# Base reutilizável de estudo HTML

Implementação de referência com participante, tarefas, receptor, SQLite, painel privado, mapas e replay. O produto de salas está separado em `public/prototype/`; as regras do estudo estão em `study.config.json`.

**Estado desta versão:** código preparado e revisado por leitura. Inicialização, testes automatizados, celular, privacidade em execução e piloto conectado não foram executados nesta atualização, conforme solicitado. Não há link hospedado criado por este pacote.

## Iniciar quando for usar

Requer Node.js 24 ou superior, com SQLite integrado. O empacotamento de CSS usa PostCSS e postcss-value-parser, com versões fixadas em `package-lock.json`.

1. Copie esta pasta para um projeto próprio. Não execute uma pesquisa dentro da pasta instalada da skill.
2. Copie `.env.example` para `.env`.
3. Gere uma chave privada:

   ```sh
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

4. Coloque o valor em `RESEARCHER_TOKEN` no `.env`. Não publique esse arquivo nem envie a chave aos participantes.
5. Instale as dependências sem scripts de instalação e inicie quando a execução estiver autorizada:

   ```sh
   npm ci --ignore-scripts
   npm start
   ```

O servidor prepara o pacote visual, aplica as migrações e cria o banco em `.data/study.sqlite`. O endereço local padrão é `http://127.0.0.1:4783/`; o painel fica em `/resultados.html`. O painel pede a chave e usa um cookie privado com duração de oito horas. Reiniciar o processo não apaga o banco. A chave não aparece na configuração pública nem nas exportações.

Esta inicialização futura não substitui a verificação de ponta a ponta. Consulte [as verificações pendentes](docs/verification-pending.md) antes de receber participantes reais.

## Adaptar para outro projeto

| Arquivo | O que mudar |
|---|---|
| `study.config.json` | Identidade, revisão, ambiente, marca, tarefas, cenários, perguntas, critérios, responsável, contato e retenção |
| `public/prototype/adapter.mjs` | Montagem do seu HTML, navegação, preparação de cenários e eventos semânticos |
| `public/prototype/rooms.mjs` | Exemplo de regras de salas; substituir pelo seu produto |
| `public/prototype/style.css` | Tokens e componentes visuais do produto |
| `public/runner.css` | Interface do estudo; não inserir regras de negócio aqui |

O adaptador exporta `createAdapter(root, {config})` e retorna `render`, `prepare`, `start`, `stop`, `reset`, `subscribe`, `getScreen`, `getState`, `getSnapshot` e `restore`. `subscribe` entrega eventos ao motor; `prepare` retorna `{assistedSetup}`. Não emita sucesso por apenas preparar uma fixture. O exemplo remove textos digitados do snapshot local de retomada e mascara seus resumos na captura.

O motor não conhece capacidades de salas, horários ou cancelamentos. Para outro produto, substitua o conteúdo de `public/prototype/` e seus catálogos/critérios na configuração. Trocar somente os textos do estudo não integra um aplicativo diferente.

`npm ci --ignore-scripts` prepara as dependências; `npm run build` gera `dist/files.json` e `dist/config.json`. O servidor também faz isso ao iniciar. O bundle do renderer recebe uma identificação derivada da configuração, CSS e código; mudanças não reutilizam silenciosamente o estilo anterior.

## Hospedar e compartilhar

Use um servidor ou contêiner com Node.js e **disco persistente**, além de HTTPS. Configure no ambiente da hospedagem:

```text
HOST=0.0.0.0
PORT=4783
PUBLIC_ORIGIN=https://seu-dominio.example
DATA_DIR=/data
RESEARCHER_TOKEN=<valor privado definido na hospedagem>
```

O `Dockerfile` é uma opção de empacotamento; a plataforma deve montar um volume persistente em `/data` e encaminhar HTTPS para a porta da aplicação. O endereço acima é ilustrativo. Este repositório não provisiona uma conta nem um domínio.

Use uma única instância gravadora por banco. Não coloque o SQLite em disco efêmero, não execute réplicas independentes com bancos separados e não exponha `.data`, `.env` ou `dist/config.json` como arquivos estáticos. GitHub Pages sozinho não executa este receptor nem armazena as respostas.

`PUBLIC_ORIGIN` é a origem pública exata, incluindo porta quando houver; o servidor verifica a origem das escritas e ignora cabeçalhos de identidade enviados pelo cliente. Atrás de um proxy, mantenha essa configuração no domínio HTTPS público. A chave administrativa pertence somente à equipe. Para equipes com contas individuais, substitua `server/auth.mjs` por autenticação com permissões por estudo.

## Piloto, revisão e dados

O exemplo usa `environment: "pilot"` e coleta conectada real no banco da instalação. Não contém registros de participantes pré-carregados. Para pesquisa real, revise o consentimento e informe `consent.contact`, `consent.readyForResearch: true` e `environment: "live"`. Essa confirmação de configuração não comprova adequação do aviso: a equipe deve revisá-lo.

Cada banco aceita uma configuração imutável. Para mudar estudo, revisão, ambiente, critérios ou estilos, preserve a instalação/banco anterior e use outro `DATA_DIR` e outra cópia/instalação do projeto. O servidor recusa reinterpretar um banco com uma configuração diferente. Mantenha o pacote visual antigo junto do banco enquanto houver dados a consultar.

O painel inclui métricas de todas as participações e detalhes paginados, respostas de qualquer pergunta configurada, avaliação humana, exclusão por participação e exportação de todas as páginas em CSV/JSON. O mapa possui filtros por tarefa/tela/participação e grupos de visualizações exatas; exibe até 3.000 pontos por grupo, declarando quando há amostragem. O replay carrega dados sob demanda e reconstrói árvores sanitizadas em um iframe sem acesso à origem do produto, rede ou formulários.

Há limpeza por retenção ao iniciar, a cada hora enquanto o servidor está ativo e durante chamadas da API. Exclusão de uma sessão remove também eventos, respostas, notas, frames e pontos. O prazo conta da criação da sessão. Backups, exportações baixadas e arquivos já salvos no computador da equipe exigem política de descarte própria. Filas locais expiram ao reabrir o estudo após o prazo; um navegador que nunca mais abrir não pode ser limpo remotamente pelo servidor.

## Perfil implementado e limites

`runtimeProfile: "starter-2"` suporta:

- Um estudo/revisão/ambiente e uma variante fixa por instalação; primeira tentativa de cada tarefa por participação.
- Qualquer quantidade de tarefas configuradas, conclusão declarada pelo participante, desistência opcional, critérios `all`, `any`, `event`, `state`, `answer` e `manual`.
- Estados e campos de eventos booleanos; perguntas de texto e escalas inteiras de até 11 opções, incluindo obrigatoriedade.
- Consentimento, pausa, retomada no mesmo navegador, fila local, reenvios com IDs imutáveis e confirmação depois da transação no banco.
- Captura de HTML/CSS estático aprovado, imagens/fontes locais registradas, textos em lista explícita, campos ocultados, classes/IDs/atributos estáticos permitidos, limites e sinalização de captura parcial.

O perfil recusa atribuição aleatória/balanceada e conclusão automática `observed`; esses contratos exigem extensão do código. Também não implementa ponte entre origens, SVG inline, canvas, vídeo, Shadow DOM, estilos inline dinâmicos, pseudoestados de interação, transformações complexas, multiestudo ou contas individuais.

## Imagens e fontes aprovadas

Registre arquivos locais em `brand.assets`, com `assetId`, `kind: "image"` ou `"font"` e `path` absoluto dentro de `public/`. O exemplo inclui um SVG estático e Atkinson Hyperlegible regular/bold, com licença em `public/prototype/assets/OFL.txt`.

O empacotamento aceita imagens PNG/JPEG/WebP/GIF/AVIF e um subconjunto de arquivos SVG estáticos; fontes WOFF/WOFF2/TTF/OTF. O navegador precisa suportar o formato. Imagens animadas não têm o instante da animação reconstruído. Há limites de 4 MiB por arquivo e 16 MiB totais. SVG com scripts, estilos internos ou referências é recusado: simplifique ou converta para PNG/WebP.

`url()` e `@font-face` usam arquivos aprovados; `@import` incorpora CSS local recursivamente, até 64 folhas e 2 MiB de CSS fonte. Endereços externos não são baixados automaticamente. O pacote usa os mesmos bytes aprovados no participante e no replay, com hashes incluídos na identidade da revisão. A captura registra apenas IDs de imagem; imagens não aprovadas são mascaradas. Formulários conservam suas tags e estilos, com comportamento bloqueado separadamente no player.

Para um recurso próprio, adicione o arquivo ao registro e use seu caminho no CSS ou no `src` do produto. Registre classes/IDs necessários e, quando houver seletores por atributos, declare seus valores estáticos em `visual.privacy.allowedAttributes`. Nunca autorize URLs, valores digitados ou handlers por essa lista. Preserve avisos e licenças dos arquivos distribuídos.

O renderer aguarda imagens/fontes antes de restaurar rolagens e desenhar pontos. Não é uma promessa de igualdade de pixels para qualquer HTML; layouts fora do subconjunto continuam exigindo adaptação.

## Ordem de envio e migração

A fila volta a priorizar eventos após cada requisição visual. Chamadas feitas durante um envio ficam sinalizadas para nova passagem. A resposta final e o encerramento aguardam filas vazias e carregam `eventBarrier: {count,lastSequence}`; o servidor confere quantidade e última sequência persistida antes de fechar a tentativa/sessão. Isso impede aceitar uma resposta final com evidências ainda pendentes. Reenvios mantêm IDs e confirmação durável.

Esta versão usa captura visual `captureSchemaVersion: "2"` e perfil `starter-2`, mantendo o contrato portátil `schemaVersion: "2"`. Para migrar do perfil anterior, prepare outra cópia/revisão e outro `DATA_DIR`, registre os arquivos e mantenha a instalação anterior com seus dados. Atualizar a skill não migra estudos publicados nem reinterpreta frames antigos.


Mapas representam pontos recebidos, não olhar. Replay não é vídeo, não reproduz digitação e não prova compreensão. IDs de sessão reduzem identificação direta, mas não tornam comentários ou qualquer pesquisa automaticamente anônimos. A base exige revisão do mascaramento em cada produto; não é uma garantia de prontidão para produção.

## Componentes

```text
public/engine.mjs          participante, tarefas e envio
public/capture.mjs         captura sanitizada e pontos
public/core.mjs            critérios, sanitização e métricas
public/results.mjs         painel, exportação, mapas e player
public/renderer.mjs        reconstrução isolada
public/prototype/          produto de exemplo substituível
server/api.mjs             recebimento, autorização e consulta
server/auth.mjs            acesso de pesquisador
server/start.mjs           HTTP, persistência, retenção e limites
server/profile.mjs         capacidades implementadas e configuração pública
server/assets.mjs          registro, incorporação de CSS e recursos aprovados
migrations/               esquema do banco
build.mjs                  empacotamento visual versionado
```

Não há comando de testes do starter nesta versão. Os testes existentes da skill verificam apenas o verificador de configuração. A lista pendente não deve ser apresentada como validação executada.
