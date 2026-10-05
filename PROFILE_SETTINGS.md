# Configuracoes do perfil no D1

A tabela `profile_settings` deste projeto usa as colunas `id`, `target_type`,
`target_id`, `payload` e `updated_at`. Os campos do perfil ficam serializados
como JSON em `payload`; nao tente inserir as propriedades do perfil como
colunas individuais.

Use um `id` proprio para cada alvo. O registro global existente pode usar
`profileSettings`; para o administrador principal, use um identificador
namespaced, como `profileSettings:admin:<user_id>`, com `target_type = 'admin'`
e o UUID real do administrador em `target_id`. Assim, um `INSERT OR REPLACE`
nao sobrescreve as configuracoes globais.

O backend prioriza as configuracoes do administrador principal e usa as globais
como fallback. A Home publica o nome, URLs publicas de foto/capa, `about_text`
(ou `aboutText`) e `marquee_texts`. Se o texto Sobre nao estiver nesse payload,
a Home usa `description` do registro do administrador em `settings` (`source =
'admin/profileSettings'`). A descricao HTML e convertida para texto e blocos que
contenham credenciais (por exemplo, `Login:` ou `senha:`) sao excluidos antes de
serem publicados. O preco mensal vem de
`payment_settings.subscriptionMonthlyPrice`, depois `monthlyPrice` e, como
fallback, `pixValue`; a moeda vem de `defaultCurrency` (BRL quando ausente ou
invalida). O preco anual exibido e calculado com 20% de desconto sobre 12 meses.
Uma descricao opcional pode ser definida em
`payment_settings.subscriptionDescription`.

A API publica somente o preco, moeda e descricao selecionados; nunca retorna a
chave PIX nem o objeto completo de configuracoes de pagamento.

O painel administrativo carrega e salva as configuracoes autenticadas do
administrador em `/api/v1/admin/profile-settings` (GET/PUT). O endpoint persiste
os blocos `contactSettings`, `generalSettings`, `imageSettings`,
`paymentSettings`, `servicesSettings`, `personalizationSettings`,
`securitySettings` e `privacySettings` no payload por administrador.
Nome, endereco, descricao, fotos, galerias, preco/moeda e textos do banner
tambem sao gravados nas propriedades publicas compativeis (`name`,
`publicAddress`, `about_text`, `profile_picture_url`, `cover_photo_url`,
`galleries`, `payment_settings` e `marquee_texts`) consumidas pelo perfil
publico. Campos de senha nunca sao persistidos por esse endpoint.
As propriedades legadas de rodape, aparencia, visibilidade, avaliacoes e
traducao sao mantidas nos formatos `socialMedia`/`footerSocials`,
`appearance_settings`, `privacy_settings`/`review_settings` e
`translation_settings`. Ao salvar um objeto aninhado, o servidor mescla os
campos em vez de apagar propriedades preexistentes, inclusive configuracoes
de pagamento que nao sao editaveis nesta tela.

A secao Seguranca usa rotas separadas: troca de telefone e senha exige a senha
atual; a troca de e-mail exige reautenticacao e confirmacao por link. Senhas e
chaves PIX sao excluidas das respostas de leitura de configuracoes.

Exemplo estrutural:

```sql
INSERT INTO profile_settings (id, target_type, target_id, payload, updated_at)
VALUES (
  'profileSettings:admin:<user_id>',
  'admin',
  '<user_id>',
  '{"name":"Nome publico","profile_picture_url":"https://exemplo.com/foto.jpg"}',
  CAST(unixepoch() AS TEXT)
)
ON CONFLICT(id) DO UPDATE SET
  target_type = excluded.target_type,
  target_id = excluded.target_id,
  payload = excluded.payload,
  updated_at = excluded.updated_at
WHERE profile_settings.target_type = 'admin'
  AND profile_settings.target_id = excluded.target_id;
```
