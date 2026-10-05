# Importacao de conversas e midias

O painel importa conteudo de contas realmente conectadas. Tokens OAuth ficam
criptografados no Cloudflare D1 e sao usados somente pelo backend. Configure
`OAUTH_TOKEN_ENCRYPTION_KEY` com 32 bytes codificados em Base64 (por exemplo,
gerados com `openssl rand -base64 32`) e os dados de cliente nos segredos do
servidor; nunca exponha credenciais em variaveis `NEXT_PUBLIC_*`.
Para consultar e persistir conexoes, configure tambem um token da API Cloudflare
com permissao de leitura e escrita em D1, `CLOUDFLARE_ACCOUNT_ID` e
`CLOUDFLARE_D1_DATABASE_ID`. Um ID de conta ou token de outro servico Cloudflare
nao substitui `CLOUDFLARE_API_TOKEN`; o endpoint de integracoes retorna erro se
o D1 nao puder ser acessado.

O dominio principal configurado e `cerebrocentral.com`. Cadastre estes mesmos
redirect URIs nos consoles OAuth dos provedores:

- Facebook: `https://cerebrocentral.com/api/v1/integrations/facebook/callback`
- Instagram: `https://cerebrocentral.com/api/v1/integrations/instagram/callback`
- Google Drive: `https://cerebrocentral.com/api/v1/integrations/google/callback`
- Google Fotos: `https://cerebrocentral.com/api/v1/integrations/google-photos/callback`
- YouTube: `https://cerebrocentral.com/api/v1/integrations/youtube/callback`
- OneDrive: `https://cerebrocentral.com/api/v1/integrations/onedrive/callback`
- X (Twitter): `https://cerebrocentral.com/api/v1/integrations/twitter/callback`
- Mercado Pago: `https://cerebrocentral.com/api/v1/integrations/mercado-pago/callback`
- PayPal: `https://cerebrocentral.com/api/v1/integrations/paypal/callback`

Em desenvolvimento, quando o painel estiver aberto em `localhost` ou
`127.0.0.1`, todos os provedores OAuth usam exatamente o callback configurado
acima e cadastrado no console do provedor. O callback valida o `state`, salva
a conexao e retorna o resultado ao popup que abriu o fluxo no localhost.

## Conectar provedores

- **Facebook Pages:** configure `FACEBOOK_APP_ID`, `FACEBOOK_APP_SECRET` e
  `FACEBOOK_CALLBACK_URL`. A autorizacao solicita `pages_show_list`,
  `pages_read_engagement` e `pages_messaging`. O importador usa a primeira pagina
  disponivel nessa conta.
- **Instagram:** configure `INSTAGRAM_APP_ID`, `INSTAGRAM_APP_SECRET` e
  `INSTAGRAM_REDIRECT_URI`. O fluxo Instagram Login aceita os escopos
  `instagram_business_basic`, `instagram_business_content_publish`,
  `instagram_business_manage_messages` e `instagram_business_manage_comments`;
  `instagram_business_manage_insights` nao e suportado por esse fluxo.
- **Stripe Connect:** configure `STRIPE_CLIENT_ID` e `STRIPE_SECRET_KEY`, e
  cadastre exatamente o `STRIPE_OAUTH_REDIRECT_URI` nas configuracoes OAuth da
  plataforma Stripe.
- **PayPal:** configure `PAYPAL_CLIENT_ID`, `PAYPAL_CLIENT_SECRET`,
  `PAYPAL_ENVIRONMENT` e `PAYPAL_CALLBACK_URL`. Os escopos OAuth devem ser
  separados por espacos ou virgulas.
- **Google Drive:** configure `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` e
  `GOOGLE_REDIRECT_URI`. O escopo padrao e `drive.readonly`.
- **Google Fotos:** usa `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` e
  `GOOGLE_PHOTOS_REDIRECT_URI`; habilite a Google Photos Picker API. Pela API
  atual, o usuario seleciona fotos/videos numa janela do Google antes da
  importacao. Os itens selecionados sao exibidos por proxy autenticado.
- **YouTube:** usa as credenciais OAuth do Google e
  `GOOGLE_YOUTUBE_REDIRECT_URI`; o escopo e `youtube.readonly`. Importa videos
  publicados no canal conectado e suas miniaturas.
- **OneDrive:** configure `MICROSOFT_CLIENT_ID`, `MICROSOFT_CLIENT_SECRET` e
  `MICROSOFT_CALLBACK_URL`. O escopo de arquivos e somente leitura.
- **X (Twitter):** configure `TWITTER_OAUTH_CLIENT_ID`,
  `TWITTER_OAUTH_CLIENT_SECRET` e `TWITTER_CALLBACK_URL`. O OAuth 2.0 usa PKCE
  com `tweet.read users.read offline.access` e importa midias acessiveis dos
  posts da conta conectada.
- **WhatsApp Cloud API:** configure `WHATSAPP_PHONE_ID` (ou
  `WHATSAPP_PHONE_NUMBER_ID`) e `WHATSAPP_TOKEN` (ou `WHATSAPP_ACCESS_TOKEN`).
  O token do ambiente fica sob controle do servidor e nao pode ser desconectado
  pelo painel. A Cloud API nao oferece busca retroativa de conversas: mensagens
  antigas sao carregadas do historico salvo no D1; novas mensagens chegam por
  webhook. Em producao, configure tambem o segredo Meta para validar a assinatura
  dos webhooks recebidos.

Facebook, Instagram, Google Drive, Google Fotos, YouTube, X e OneDrive usam o
fluxo OAuth do painel. Os tokens de atualizacao precisam poder renovar o acesso
quando o token expirar. D1 e necessario para persistir conexoes criptografadas.

## Importar

Use **Importar mensagens** na secao Chat e **Importar midias conectadas** na
biblioteca. O backend verifica a sessao administrativa e importa somente de
provedores conectados: Google Fotos, Google Drive, YouTube, OneDrive, X,
Facebook e Instagram. Para Google Fotos, selecione os itens autorizados no
Picker; os demais provedores importam os itens autorizados pela conta conectada.
O estado importado fica na tela atual; ao recarregar, use novamente o botao
para sincronizar. Itens duplicados nao sao adicionados de novo.

O WhatsApp Cloud API nao permite buscar o historico antigo da caixa de entrada.
O chat exibe apenas mensagens recebidas por webhook enquanto o servidor estiver
ativo; imagens sao buscadas por um proxy autenticado. A API nao envia respostas
para os provedores, portanto o envio fica desativado nas conversas importadas.
Google Drive e OneDrive exibem imagens e videos por um proxy autenticado, com
limite de 10 MB por arquivo. Nenhuma midia e copiada para o R2.

## Home publica e avaliacao

A Home consulta `/api/v1/public/home`: o perfil principal vem do campo
`users.photo_url` do superadmin principal no D1; publicacoes sao buscadas em
tempo real nas contas Facebook e Instagram conectadas a esse superadmin. Somente
campos publicos da conta e das publicacoes sao retornados; tokens nunca sao
enviados ao navegador. Avaliacoes enviadas pela Home ficam pendentes no D1 e so
aparecem publicamente depois da aprovacao no painel administrativo.

## Historico do WhatsApp Web

Quando uma sessao WhatsApp Web autorizada por QR esta conectada, o servidor
solicita a sincronizacao de historico suportada pelo dispositivo e armazena
mensagens textuais cifradas no D1, associadas ao usuario administrador. O painel
carrega esse historico ao abrir o Chat. Mensagens de midia sem texto sao
identificadas pelo tipo; os arquivos em si nao sao copiados nem exibidos. A
importacao via WhatsApp Cloud API continua limitada as mensagens recebidas por
webhook; esse produto nao disponibiliza uma consulta retroativa da caixa de
entrada.

## Perfis e dados sociais

O login administrativo usa a tabela `users` junto de `admins` no D1 e valida
`password_hash` com PBKDF2-SHA-256 (100.000 iteracoes), usando o `salt` armazenado.
Perfis, capas, amizades, seguidores e assinaturas sem dados reais nao recebem
imagens, nomes ou contagens de demonstracao. O atalho do WhatsApp so aparece
quando `VITE_WHATSAPP_NUMBER` esta configurado com um numero publico real,
incluindo codigo do pais. A pagina de ajuda exibe somente `VITE_PUBLIC_SUPPORT_EMAIL`
ou WhatsApp quando esses contatos publicos estao configurados; nao ha chat local
que simule respostas.
