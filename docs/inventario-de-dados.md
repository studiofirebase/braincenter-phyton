# Inventário de dados e nomenclatura

## Escopo e confiabilidade

Este documento organiza o inventário informado para o projeto. Ele descreve
estruturas declaradas ou usadas no código, não o conteúdo de um banco em
execução. Os schemas e migrações citados no inventário original não estão
presentes neste workspace; portanto, os nomes e colunas abaixo não foram
revalidados diretamente aqui.

O projeto não tem um catálogo único de dados. O inventário informado abrange
Cloudflare D1, dois schemas Prisma de PostgreSQL e registros JSON. Os dois
schemas Prisma usam configurações de conexão diferentes (`DATABASE_URL` e
`POSTGRES_URL`) e devem ser considerados fontes separadas até que a implantação
confirme o contrário.

## Cloudflare D1

| Tabela | Colunas informadas | Finalidade |
| --- | --- | --- |
| `admin` | `id`, `admin_uid`, `user_id`, `status`, `type`, `source`, `payload`, `created_at`, `updated_at` | Registros administrativos; `payload` contém dados JSON. |
| `settings` | `id`, `admin_uid`, `user_id`, `status`, `type`, `source`, `payload`, `created_at`, `updated_at` | Configurações e documentos serializados em JSON. |
| `users` | **Definições conflitantes:** formato genérico igual a `admin`; ou `id`, `email`, `password_hash`, `salt`, `created_at`. | O formato depende do schema ou da migração aplicada. |
| `refresh_tokens` | `token_hash`, `user_id`, `expires_at` | Tokens de renovação; a migração informada referencia `users(id)`. |
| `channel_messages` | `id`, `admin_uid`, `channel`, `external_id`, `sender`, `recipient`, `conversation_id`, `text`, `read`, `timestamp`, `metadata`, `created_at`, `updated_at` | Mensagens de canais sociais e conversas. Há índices informados por administrador, canal, conversa e horário. |
| `channel_contacts` | `admin_uid`, `channel`, `conversation_id`, `chat_id`, `name`, `avatar_url`, `is_group`, `is_muted`, `unread_count`, `last_message`, `last_timestamp`, `metadata`, `updated_at` | Contatos e resumo de conversas. Chave primária composta por administrador, canal e conversa. |
| `secret_chats` | `id`, `admin_uid`, `user_uid`, `user_email`, `user_display_name`, `created_at`, `last_activity`, `last_message`, `admin_unread_count`, `user_unread_count` | Conversas privadas e contadores de mensagens não lidas. |
| `secret_chat_messages` | `id`, `chat_id`, `sender_id`, `recipient_id`, `text`, `timestamp`, `read`, `admin_uid`, `user_uid`, `user_email`, `user_display_name`, `image_url`, `video_url`, `audio_url`, `audio_mime_type`, `is_location`, `metadata` | Mensagens privadas, incluindo anexos e localização; referencia `secret_chats(id)` com exclusão em cascata. |
| `stability_ai_credentials` | `admin_uid`, `provider`, `schema_version`, `api_key_ciphertext`, `api_key_iv`, `api_key_auth_tag`, `created_at`, `updated_at` | Credenciais Stability AI por administrador; a chave é armazenada criptografada. |
| `media_collection` | `id`, `collection`, `document_id`, `admin_uid`, `payload`, `storage_type`, `storage_path`, `media_url`, `created_at`, `updated_at` | Armazenamento genérico de documentos e itens de mídia. As colunas foram encontradas em usos do código, mas a definição completa de criação não foi localizada no schema consultado. |

### Ambiguidade de `users`

O inventário aponta duas definições incompatíveis para `users`:

- `cloudflare/schema.sql`: registro genérico com `payload`;
- `scripts/migrations/create_d1_users.sql`: campos de autenticação (`email`,
  `password_hash` e `salt`).

Não se deve tratar uma delas como definitiva sem verificar a migração aplicada
no banco de destino. `refresh_tokens` também depende da forma de `users(id)`.

## PostgreSQL via Prisma

Os modelos Prisma são apresentados separadamente porque usam variáveis de
conexão diferentes. Os nomes abaixo são os nomes dos modelos informados; o nome
físico da tabela pode depender de mapeamentos Prisma não verificados neste
workspace.

### Schema associado a `src/prisma/schema.prisma`

| Modelo | Dados e relações informados |
| --- | --- |
| `User` | Nome, e-mail, imagem e papel (`USER`, `ADMIN`, `SELLER`); pode ter um `Seller` e possui contas e sessões. |
| `Seller` | Nome da loja, usuário e identificadores/credenciais de pagamentos; relaciona-se a `User`, `SocialConnection`, `Conversation` e `Product`. |
| `Account` | Conta de autenticação social e tokens do provedor; pertence a `User`, com unicidade por provedor e ID externo. |
| `Session` | Token de sessão, usuário e expiração; pertence a `User`. |
| `SocialConnection` | Provedor, tokens e ID da conta/página social; pertence a `Seller`, com unicidade por vendedor e provedor. |
| `Conversation` | Plataforma, ID externo do chat e nome do cliente; pertence a `Seller` e agrupa mensagens. |
| `Message` | Conversa, conteúdo, direção e data; pertence a `Conversation`. |
| `Product` | Nome, descrição, preço e vendedor; pertence a `Seller` e pode aparecer em itens de pedidos. |
| `OrderItem` | Pedido, produto, quantidade e preço; relaciona-se a `Order` e `Product`. |
| `Order` | Usuário, total e itens; agrupa `OrderItem`. |

Enums informados: `Role` e `SocialProvider`.

### Schema associado a `prisma/schema.prisma`

| Modelo | Dados e finalidade informados |
| --- | --- |
| `Message` | Usuário, canal, remetente, destinatário, texto, horário, leitura e metadados; mensagens multicanal. |
| `SocialChannelBinding` | Usuário, canal, tokens, nome e IDs de página/telefone, além da expiração; vínculo com contas e canais sociais. |
| `Subscription` | Usuário, e-mail, Stripe, plano, status e período; assinaturas e ciclo de cobrança. |
| `YouTubePrivateVideoAccess` | E-mail, usuário, assinatura, nível de acesso e datas de concessão/revogação; controle de acesso a vídeos privados. |

### Modelos homônimos

Os dois schemas Prisma definem `Message`, mas com campos e finalidade
diferentes. O schema e a conexão usados por cada aplicação precisam ser
identificados antes de alterar consultas, migrações ou nomes físicos.

## Coleções e documentos JSON

Nomes de coleções lógicas ou caminhos de documentos — por exemplo,
`admins/...` — não implicam a existência de uma tabela SQL com o mesmo nome.
Segundo o inventário, o código pode mapear esses caminhos para tabelas
especializadas existentes ou armazená-los como registros genéricos em
`media_collection`. `payload` e `metadata` também são campos de dados
serializados, não tabelas ou coleções por si só.

## Feed local e feed de produção

O site de produção `italosantos.com` usa uma aplicação separada: as publicações
do feed vêm da coleção Firestore `posts`, exposta por `/api/publications` e
filtrada pelo `adminUid`. As páginas de galeria consultam `gallery_media` por
`/api/public-media`.

O workspace local continua usando D1 para perfil e avaliações, mas o endpoint
`/api/v1/public/home` agora busca as publicações pelo endpoint público
`https://italosantos.com/api/publications`, resolvendo o UID do perfil principal
por `/api/admin/lookup?identifier=severepics`. Essas requisições são somente
GET; não usam credenciais administrativas. Portanto, o feed local reflete as
publicações públicas de produção, mas a galeria local e os demais dados D1 não
são sincronizados por essa alteração. A leitura depende de conexão com o site
publicado e suas APIs públicas.

O nome, telefone e endereço públicos da Home são lidos das configurações de
contato salvas pelo painel em `/admin/settings/contato`. Esses dados ficam no
payload de `profile_settings` (ou no registro legado em `settings`) e são
retornados por `/api/v1/public/home`; nome e endereço aceitam também as chaves
legadas do perfil.

A consulta D1 de publicações locais também restringe os registros ao
administrador por `admin_uid` ou `payload.userId`; ela deixa de ser a fonte do
feed principal, mas mantém isolamento correto para usos locais futuros.

## Acesso administrativo

O cadastro administrativo local cria registros em `users` e `admins`; a senha
é derivada com PBKDF2-SHA-256 e salt aleatório, compatível com o login D1. O
cadastro exige `ADMIN_SIGNUP_CODE` (segredo aleatório de pelo menos 32
caracteres) e tem limitação de tentativas por IP. Antes de habilitar o
auto-cadastro, distribua o código somente a pessoas autorizadas.

A recuperação usa a tabela `admin_password_resets`, armazena somente o hash do
token, e os links expiram em 30 minutos e são de uso único. O envio depende de
`SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS` e `SMTP_FROM`; em produção,
configure também `ADMIN_PASSWORD_RESET_URL` com a origem HTTPS do painel e o
caminho `/admin`. A aplicação cria a tabela de tokens automaticamente em D1.

## Convenções observadas e recomendações

As convenções abaixo descrevem o padrão aparente do inventário e recomendações
para novas estruturas. Não implicam renomeação ou migração de estruturas já
existentes.

| Área | Padrão ou recomendação |
| --- | --- |
| Tabelas SQL | Usar `snake_case` e nomes descritivos no plural para novas tabelas (`channel_messages`, `refresh_tokens`). Preservar nomes atuais até haver migração planejada. |
| Colunas SQL | Usar `snake_case`; manter sufixos temporais consistentes, como `_at`, e sinalizadores booleanos legíveis, como `is_group` e `read`. |
| Modelos Prisma | Manter nomes de modelos em `PascalCase` (`SocialConnection`, `OrderItem`) e explicitar mapeamentos para tabelas/colunas SQL quando for necessário alinhar convenções. |
| Campos flexíveis | Documentar o formato esperado de `payload` e `metadata` por tipo de registro e versão; não usar campos JSON como substitutos implícitos de tabelas relacionais sem registrar essa decisão. |
| Identificadores | Documentar o significado e o escopo de IDs como `admin_uid`, `user_uid`, `user_id`, `conversation_id` e `document_id`; nomes parecidos não garantem que representem a mesma entidade. |
| Datas | Diferenciar `timestamp` de mensagens de colunas de auditoria (`created_at`, `updated_at`) e registrar formato/fuso esperado em cada sistema. |

## Pendências antes de mudanças de schema

1. Confirmar qual definição de `users` está aplicada em cada banco D1 e validar a
   chave estrangeira de `refresh_tokens`.
2. Confirmar se os dois schemas Prisma apontam para bancos distintos e quais
   aplicações usam cada variável de conexão.
3. Verificar `@@map`/`@map` nos schemas Prisma para obter os nomes físicos das
   tabelas e colunas.
4. Localizar a migração de criação de `media_collection` e registrar índices,
   restrições e tipos de dados.
5. Definir e versionar os contratos JSON de `payload` e `metadata`.
6. Consultar os schemas e migrações implantados antes de executar qualquer
   renomeação ou migração de dados.

Este inventário não confirma dados existentes em produção. O arquivo
`backup_data.sql` foi informado como vazio; ele não serve para validar o schema
ou os registros atuais.
