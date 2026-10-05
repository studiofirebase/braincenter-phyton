import {
  createCipheriv,
  createDecipheriv,
  createHash,
  createPublicKey,
  createPrivateKey,
  pbkdf2 as pbkdf2Callback,
  randomBytes,
  sign,
  timingSafeEqual,
  verify
} from 'node:crypto';
import { promisify } from 'node:util';
import type { JsonWebKey as NodeJsonWebKey } from 'node:crypto';
import type { Express, Request, Response } from 'express';
import { execFile as execFileCallback } from 'node:child_process';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const pbkdf2 = promisify(pbkdf2Callback);
const execFile = promisify(execFileCallback);

export type IntegrationProvider =
  | 'facebook'
  | 'instagram'
  | 'whatsapp'
  | 'onedrive'
  | 'apple'
  | 'google'
  | 'google-photos'
  | 'youtube'
  | 'twitter'
  | 'stripe'
  | 'mercado-pago'
  | 'paypal';

interface ProviderConfig {
  name: string;
  requiredEnv: string[];
  clientId?: string;
  clientSecret?: string;
  redirectUri?: string;
}

export async function registerD1Admin(input: {
  name: string;
  email: string;
  username: string;
  password: string;
}) {
  if (!hasD1Config()) throw new Error('D1 is not configured on this server.');
  await ensureSchema();

  const email = input.email.trim().toLowerCase();
  const username = input.username.trim().toLowerCase();
  const [existing] = await queryD1<{ id: string }>(
    `SELECT u.id
     FROM users u
     LEFT JOIN admins a ON a.user_id = u.id
     WHERE LOWER(u.email) = ? OR LOWER(a.username) = ?
     LIMIT 1`,
    [email, username]
  );
  if (existing) throw new Error('ADMIN_ACCOUNT_EXISTS');

  const id = randomBytes(16).toString('hex');
  const salt = randomBytes(16);
  const passwordHash = await pbkdf2(input.password, salt, 100_000, 32, 'sha256');
  const createdAt = Date.now().toString();
  const userValues = [
    id,
    email,
    input.name.trim(),
    passwordHash.toString('base64'),
    salt.toString('base64'),
    createdAt
  ];

  await queryD1(
    `INSERT INTO users (id, email, display_name, password_hash, salt, role, is_admin, created_at)
     VALUES (?, ?, ?, ?, ?, 'admin', 1, ?)`,
    userValues
  );
  try {
    await queryD1(
      `INSERT INTO admins (user_id, username, is_main_admin)
       VALUES (?, ?, 0)`,
      [id, username]
    );
  } catch (error) {
    await queryD1('DELETE FROM users WHERE id = ?', [id]);
    throw error;
  }

  return { id, email, name: input.name.trim(), username };
}

export async function createD1AdminPasswordReset(emailInput: string) {
  if (!hasD1Config()) throw new Error('D1 is not configured on this server.');
  await ensureSchema();
  const email = emailInput.trim().toLowerCase();
  const [user] = await queryD1<{ id: string }>(
    `SELECT u.id
     FROM users u
     INNER JOIN admins a ON a.user_id = u.id
     WHERE LOWER(u.email) = ?
       AND (a.is_main_admin = 1 OR u.is_admin = 1 OR LOWER(u.role) IN ('admin', 'superadmin', 'super_admin'))
     LIMIT 1`,
    [email]
  );
  if (!user) return null;

  const token = randomBytes(32).toString('base64url');
  const tokenHash = createHash('sha256').update(token).digest('hex');
  const expiresAt = Date.now() + 30 * 60 * 1000;
  await queryD1('DELETE FROM admin_password_resets WHERE user_id = ?', [user.id]);
  await queryD1(
    'INSERT INTO admin_password_resets (token_hash, user_id, expires_at) VALUES (?, ?, ?)',
    [tokenHash, user.id, expiresAt.toString()]
  );
  return token;
}

export async function resetD1AdminPassword(token: string, password: string) {
  if (!hasD1Config()) throw new Error('D1 is not configured on this server.');
  await ensureSchema();
  const tokenHash = createHash('sha256').update(token).digest('hex');
  const now = Date.now().toString();
  const [reset] = await queryD1<{ user_id: string }>(
    `UPDATE admin_password_resets
     SET used_at = ?
     WHERE token_hash = ? AND used_at IS NULL AND expires_at > ?
     RETURNING user_id`,
    [now, tokenHash, now]
  );
  if (!reset) return null;

  const salt = randomBytes(16);
  const passwordHash = await pbkdf2(password, salt, 100_000, 32, 'sha256');
  await queryD1(
    'UPDATE users SET password_hash = ?, salt = ? WHERE id = ?',
    [passwordHash.toString('base64'), salt.toString('base64'), reset.user_id]
  );
  return reset.user_id;
}

export async function createD1AdminEmailConfirmation(emailInput: string) {
  if (!hasD1Config()) throw new Error('D1 is not configured on this server.');
  await ensureSchema();
  const email = emailInput.trim().toLowerCase();
  const [user] = await queryD1<{ id: string; email: string; email_verified: number | null }>(
    `SELECT u.id, u.email, u.email_verified
     FROM users u
     INNER JOIN admins a ON a.user_id = u.id
     WHERE lower(u.email) = ?
     LIMIT 1`,
    [email]
  );
  if (!user || user.email_verified === 1) return null;
  const token = randomBytes(32).toString('base64url');
  const tokenHash = createHash('sha256').update(token).digest('hex');
  await queryD1(
    `INSERT INTO admin_email_confirmations (token_hash, user_id, expires_at, created_at)
     VALUES (?, ?, ?, ?)`,
    [tokenHash, user.id, String(Date.now() + 24 * 60 * 60 * 1000), new Date().toISOString()]
  );
  return { token, email: user.email };
}

export async function consumeD1AdminEmailConfirmation(token: string) {
  if (!hasD1Config()) throw new Error('D1 is not configured on this server.');
  await ensureSchema();
  const tokenHash = createHash('sha256').update(token).digest('hex');
  const [confirmation] = await queryD1<{ user_id: string; expires_at: number }>(
    `SELECT user_id, expires_at FROM admin_email_confirmations
     WHERE token_hash = ? AND used_at IS NULL LIMIT 1`,
    [tokenHash]
  );
  if (!confirmation || Number(confirmation.expires_at) <= Date.now()) return null;
  await queryD1(
    `UPDATE users SET email_verified = 1, updated_at = ?
     WHERE id = ? AND EXISTS (SELECT 1 FROM admins WHERE admins.user_id = users.id)`,
    [String(Math.floor(Date.now() / 1000)), confirmation.user_id]
  );
  await queryD1(
    `UPDATE admin_email_confirmations SET used_at = ?
     WHERE token_hash = ? AND used_at IS NULL`,
    [new Date().toISOString(), tokenHash]
  );
  return confirmation.user_id;
}

export async function getIntegrationAccount(userId: string, provider: IntegrationProvider) {
  await ensureSchema();
  const rows = await queryD1<{ account_json: string }>(
    'SELECT account_json FROM oauth_integrations WHERE user_id = ? AND provider = ?',
    [userId, provider]
  );
  return rows[0] ? JSON.parse(rows[0].account_json) as Record<string, unknown> : null;
}

interface OAuthState {
  provider: IntegrationProvider;
  userId: string;
  nonce: string;
  origin: string;
  expiresAt: number;
}

const graphVersion = process.env.META_GRAPH_API_VERSION || 'v23.0';
const appOrigin = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_SITE_URL || '';
const defaultOrigin = appOrigin ? new URL(appOrigin).origin : '';
const apiUrl = process.env.API_PUBLIC_URL || process.env.VITE_API_URL || process.env.NEXT_PUBLIC_API_URL || '';
const defaultApiOrigin = apiUrl ? new URL(apiUrl).origin : defaultOrigin;

function whatsAppEnvironmentToken() {
  return process.env.WHATSAPP_TOKEN?.trim() || process.env.WHATSAPP_ACCESS_TOKEN?.trim() || '';
}

function whatsAppEnvironmentPhoneId() {
  return process.env.WHATSAPP_PHONE_ID?.trim() || process.env.WHATSAPP_PHONE_NUMBER_ID?.trim() || '';
}

function whatsAppMetaAppId() {
  return process.env.FACEBOOK_APP_ID?.trim() || '685620304394048';
}

function whatsAppSignupConfigId() {
  return process.env.NEXT_PUBLIC_WHATSAPP_EMBEDDED_SIGNUP_CONFIG_ID?.trim() || '1592569108554775';
}

const providerConfigs: Record<IntegrationProvider, ProviderConfig> = {
  facebook: {
    name: 'Facebook',
    requiredEnv: ['FACEBOOK_APP_ID', 'FACEBOOK_APP_SECRET', 'FACEBOOK_CALLBACK_URL'],
    clientId: process.env.FACEBOOK_APP_ID,
    clientSecret: process.env.FACEBOOK_APP_SECRET,
    redirectUri: process.env.FACEBOOK_CALLBACK_URL
  },
  instagram: {
    name: 'Instagram',
    requiredEnv: ['INSTAGRAM_APP_SECRET'],
    clientId: process.env.INSTAGRAM_APP_ID || '4385098115083728',
    clientSecret: process.env.INSTAGRAM_APP_SECRET,
    redirectUri: process.env.INSTAGRAM_REDIRECT_URI ||
      (defaultOrigin ? `${defaultOrigin}/api/v1/integrations/instagram/callback` : undefined)
  },
  whatsapp: {
    name: 'WhatsApp',
    requiredEnv: ['WHATSAPP_TOKEN', 'WHATSAPP_PHONE_ID']
  },
  onedrive: {
    name: 'OneDrive',
    requiredEnv: ['MICROSOFT_CLIENT_ID', 'MICROSOFT_CLIENT_SECRET', 'MICROSOFT_CALLBACK_URL'],
    clientId: process.env.MICROSOFT_CLIENT_ID,
    clientSecret: process.env.MICROSOFT_CLIENT_SECRET,
    redirectUri: process.env.MICROSOFT_CALLBACK_URL
  },
  apple: {
    name: 'Apple',
    requiredEnv: ['CLOUDFLARE_AUTH_APPLE_CLIENT_ID'],
    clientId: process.env.CLOUDFLARE_AUTH_APPLE_CLIENT_ID,
    redirectUri: process.env.APPLE_CALLBACK_URL || (defaultApiOrigin ? `${defaultApiOrigin}/api/v1/integrations/apple/callback` : undefined)
  },
  google: {
    name: 'Google',
    requiredEnv: ['GOOGLE_CLIENT_ID', 'GOOGLE_CLIENT_SECRET', 'GOOGLE_REDIRECT_URI'],
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    redirectUri: process.env.GOOGLE_REDIRECT_URI
  },
  'google-photos': {
    name: 'Google Fotos',
    requiredEnv: ['GOOGLE_CLIENT_ID', 'GOOGLE_CLIENT_SECRET'],
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    redirectUri: process.env.GOOGLE_PHOTOS_REDIRECT_URI ||
      (defaultOrigin ? `${defaultOrigin}/api/v1/integrations/google-photos/callback` : undefined)
  },
  youtube: {
    name: 'YouTube',
    requiredEnv: ['GOOGLE_CLIENT_ID', 'GOOGLE_CLIENT_SECRET'],
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    redirectUri: process.env.GOOGLE_YOUTUBE_REDIRECT_URI ||
      (defaultOrigin ? `${defaultOrigin}/api/v1/integrations/youtube/callback` : undefined)
  },
  twitter: {
    name: 'X (Twitter)',
    requiredEnv: ['TWITTER_OAUTH_CLIENT_ID', 'TWITTER_OAUTH_CLIENT_SECRET', 'TWITTER_CALLBACK_URL'],
    clientId: process.env.TWITTER_OAUTH_CLIENT_ID,
    clientSecret: process.env.TWITTER_OAUTH_CLIENT_SECRET,
    redirectUri: process.env.TWITTER_CALLBACK_URL
  },
  stripe: {
    name: 'Stripe',
    requiredEnv: ['STRIPE_CLIENT_ID', 'STRIPE_SECRET_KEY'],
    clientId: process.env.STRIPE_CLIENT_ID,
    clientSecret: process.env.STRIPE_SECRET_KEY,
    redirectUri: process.env.STRIPE_OAUTH_REDIRECT_URI || (defaultOrigin ? `${defaultOrigin}/api/v1/integrations/stripe/callback` : undefined)
  },
  'mercado-pago': {
    name: 'Mercado Pago',
    requiredEnv: ['MERCADOPAGO_CLIENT_ID', 'MERCADOPAGO_CLIENT_SECRET', 'MERCADOPAGO_CALLBACK_URL'],
    clientId: process.env.MERCADOPAGO_CLIENT_ID,
    clientSecret: process.env.MERCADOPAGO_CLIENT_SECRET,
    redirectUri: process.env.MERCADOPAGO_CALLBACK_URL
  },
  paypal: {
    name: 'PayPal',
    requiredEnv: ['PAYPAL_CLIENT_ID', 'PAYPAL_CLIENT_SECRET', 'PAYPAL_ENVIRONMENT', 'PAYPAL_CALLBACK_URL'],
    clientId: process.env.PAYPAL_CLIENT_ID,
    clientSecret: process.env.PAYPAL_CLIENT_SECRET,
    redirectUri: process.env.PAYPAL_CALLBACK_URL
  }
};

let schemaReady: Promise<void> | null = null;

function missingEnv(provider: IntegrationProvider) {
  if (provider === 'whatsapp') {
    const missing: string[] = [];
    if (!process.env.FACEBOOK_APP_SECRET?.trim()) {
      missing.push('FACEBOOK_APP_SECRET');
    }
    return missing;
  }
  const required = providerConfigs[provider].requiredEnv;
  const missing = required.filter((key) => !process.env[key]?.trim());
  if (provider === 'apple' && !getAppleClientSecret()) {
    missing.push('APPLE_CLIENT_SECRET or APPLE_TEAM_ID + APPLE_KEY_ID + APPLE_PRIVATE_KEY');
  }
  if (!providerConfigs[provider].redirectUri) {
    missing.push(provider === 'apple' ? 'APPLE_CALLBACK_URL or NEXT_PUBLIC_APP_URL' : 'OAuth callback URL');
  }
  return missing;
}

function base64urlJson(value: Record<string, string | number>) {
  return Buffer.from(JSON.stringify(value)).toString('base64url');
}

function getAppleClientSecret() {
  const teamId = process.env.APPLE_TEAM_ID;
  const keyId = process.env.APPLE_KEY_ID;
  const privateKey = process.env.APPLE_PRIVATE_KEY;
  const clientId = providerConfigs.apple.clientId;
  if (teamId && keyId && privateKey && clientId) {
    const now = Math.floor(Date.now() / 1000);
    const header = base64urlJson({ alg: 'ES256', kid: keyId, typ: 'JWT' });
    const claims = base64urlJson({
      iss: teamId,
      iat: now,
      exp: now + 60 * 60 * 24 * 150,
      aud: 'https://appleid.apple.com',
      sub: clientId
    });
    const content = `${header}.${claims}`;
    const signature = sign('sha256', Buffer.from(content), {
      key: createPrivateKey(privateKey.replaceAll('\\n', '\n')),
      dsaEncoding: 'ieee-p1363'
    }).toString('base64url');
    return `${content}.${signature}`;
  }
  return process.env.APPLE_CLIENT_SECRET || process.env.CLOUDFLARE_AUTH_APPLE_CLIENT_SECRET || '';
}

function hasD1Config() {
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID?.trim();
  const databaseId = process.env.CLOUDFLARE_D1_DATABASE_ID?.trim();
  const apiToken = process.env.CLOUDFLARE_API_TOKEN?.trim();
  if (!accountId || !databaseId || /(your_|placeholder|change_me|example|insert_)/i.test(accountId + databaseId)) {
    return false;
  }
  return !!apiToken || process.env.NODE_ENV !== 'production';
}

function paypalApiBase() {
  const environment = process.env.PAYPAL_ENVIRONMENT?.trim().toLowerCase();
  if (environment === 'production' || environment === 'live') return 'https://api-m.paypal.com';
  if (environment === 'sandbox' || environment === 'test') return 'https://api-m.sandbox.paypal.com';
  throw new Error('PAYPAL_ENVIRONMENT must be production/live or sandbox/test.');
}

function paypalAuthorizationBase() {
  const environment = process.env.PAYPAL_ENVIRONMENT?.trim().toLowerCase();
  if (environment === 'production' || environment === 'live') return 'https://www.paypal.com';
  if (environment === 'sandbox' || environment === 'test') return 'https://www.sandbox.paypal.com';
  throw new Error('PAYPAL_ENVIRONMENT must be production/live or sandbox/test.');
}

export function isD1AuthConfigured() {
  return hasD1Config();
}

export async function queryCerebroD1<T extends Record<string, unknown> = Record<string, unknown>>(
  sql: string,
  params: string[] = []
): Promise<T[]> {
  if (!hasD1Config()) throw new Error('D1 is not configured on this server.');

  if (!process.env.CLOUDFLARE_API_TOKEN?.trim()) {
    const directory = await mkdtemp(join(tmpdir(), 'cc-d1-query-'));
    const sqlFile = join(directory, 'query.sql');
    try {
      let parameterIndex = 0;
      const boundSql = sql.replace(/\?/g, () => {
        const value = params[parameterIndex++];
        if (typeof value !== 'string') throw new Error('D1 query parameters must be strings.');
        return `'${value.replaceAll("'", "''")}'`;
      });
      if (parameterIndex !== params.length) {
        throw new Error('D1 query parameter count does not match the placeholders.');
      }
      const isReadQuery = /^\s*(SELECT|PRAGMA|WITH|EXPLAIN)\b/i.test(boundSql);
      const args = [
        '--yes',
        'wrangler',
        'd1',
        'execute',
        process.env.CLOUDFLARE_D1_DATABASE_ID!,
        '--remote',
        '--json'
      ];
      if (isReadQuery) args.push('--command', boundSql);
      else {
        await writeFile(sqlFile, boundSql, { encoding: 'utf8', mode: 0o600 });
        args.push('--file', sqlFile);
      }

      const { stdout } = await execFile('npx', args, {
        cwd: process.cwd(),
        timeout: 60_000,
        maxBuffer: 10 * 1024 * 1024
      });
      const jsonStart = stdout.lastIndexOf('\n[') + 1;
      const output = JSON.parse(stdout.slice(jsonStart || stdout.indexOf('['))) as {
        results?: T[];
        success?: boolean;
      }[];
      const result = output[0];
      if (!result?.success) throw new Error('Wrangler reported a failed D1 query.');
      return result.results ?? [];
    } finally {
      await rm(directory, { recursive: true, force: true });
    }
  }

  const url = `https://api.cloudflare.com/client/v4/accounts/${process.env.CLOUDFLARE_ACCOUNT_ID}/d1/database/${process.env.CLOUDFLARE_D1_DATABASE_ID}/query`;
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.CLOUDFLARE_API_TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ sql, params })
  });
  const payload = await response.json() as {
    success?: boolean;
    errors?: { code?: number; message?: string }[];
    result?: { success?: boolean; results?: T[] }[];
  };
  if (!response.ok || !payload.success || payload.result?.[0]?.success === false) {
    throw new Error('Cloudflare D1 request failed.');
  }
  return payload.result?.[0]?.results ?? [];
}

const queryD1 = queryCerebroD1;

export async function authenticateD1Admin(emailOrUsername: string, password: string) {
  if (!hasD1Config()) return undefined;

  const [user] = await queryD1<{
    id: string;
    email: string;
    display_name: string | null;
    photo_url: string | null;
    password_hash: string | null;
    salt: string | null;
    role: string;
    is_main_admin: number;
    created_at: number | string | null;
  }>(
    `SELECT u.id, u.email, u.display_name, u.photo_url, u.password_hash, u.salt,
            u.role, u.created_at, a.is_main_admin
     FROM users u
     INNER JOIN admins a ON a.user_id = u.id
     WHERE (LOWER(u.email) = ? OR LOWER(a.username) = ?)
       AND (a.is_main_admin = 1 OR u.is_admin = 1 OR LOWER(u.role) IN ('admin', 'superadmin', 'super_admin'))
     ORDER BY a.is_main_admin DESC
     LIMIT 1`,
    [emailOrUsername.trim().toLowerCase(), emailOrUsername.trim().toLowerCase()]
  );

  if (!user?.password_hash || !user.salt) return null;

  const suppliedHash = await pbkdf2(
    password,
    Buffer.from(user.salt, 'base64'),
    100_000,
    32,
    'sha256'
  );
  const storedHash = Buffer.from(user.password_hash, 'base64');
  if (storedHash.length !== suppliedHash.length || !timingSafeEqual(storedHash, suppliedHash)) {
    return null;
  }

  return {
    id: user.id,
    email: user.email,
    name: user.display_name || user.email,
    avatar_url: user.photo_url || '',
    role: user.is_main_admin === 1 ? 'superadmin' as const : 'admin' as const,
    created_at: user.created_at
      ? new Date(
          typeof user.created_at === 'number' || /^\d+$/.test(user.created_at)
            ? Number(user.created_at)
            : user.created_at
        ).toISOString()
      : new Date().toISOString()
  };
}

export async function listD1AdminAccounts() {
  if (!hasD1Config()) throw new Error('D1 is not configured on this server.');
  await ensureSchema();
  const rows = await queryD1<{
    id: string;
    email: string;
    display_name: string | null;
    created_at: number | string | null;
  }>(
    `SELECT u.id, u.email, u.display_name, u.created_at
     FROM users u
     INNER JOIN admins a ON a.user_id = u.id
     WHERE a.is_main_admin = 0
       AND (u.is_admin = 1 OR LOWER(u.role) = 'admin')
       AND LOWER(COALESCE(u.role, '')) NOT IN ('superadmin', 'super_admin')
     ORDER BY u.created_at DESC, LOWER(u.email) ASC`
  );
  return rows.map((user) => ({
    id: user.id,
    email: user.email,
    name: user.display_name || user.email,
    created_at: user.created_at
      ? new Date(
          typeof user.created_at === 'number' || /^\d+$/.test(user.created_at)
            ? Number(user.created_at)
            : user.created_at
        ).toISOString()
      : null
  }));
}

async function verifyD1AdminPassword(userId: string, password: string) {
  if (!hasD1Config()) throw new Error('D1 is not configured on this server.');
  const [user] = await queryD1<{ password_hash: string | null; salt: string | null }>(
    `SELECT u.password_hash, u.salt
     FROM users u
     INNER JOIN admins a ON a.user_id = u.id
     WHERE u.id = ?
       AND (a.is_main_admin = 1 OR u.is_admin = 1 OR LOWER(u.role) IN ('admin', 'superadmin', 'super_admin'))
     LIMIT 1`,
    [userId]
  );
  if (!user?.password_hash || !user.salt) return false;
  const suppliedHash = await pbkdf2(password, Buffer.from(user.salt, 'base64'), 100_000, 32, 'sha256');
  const storedHash = Buffer.from(user.password_hash, 'base64');
  return storedHash.length === suppliedHash.length && timingSafeEqual(storedHash, suppliedHash);
}

export async function verifyD1AdminCurrentPassword(userId: string, password: string) {
  await ensureSchema();
  return verifyD1AdminPassword(userId, password);
}

export async function updateD1AdminPassword(userId: string, currentPassword: string, newPassword: string) {
  await ensureSchema();
  if (!await verifyD1AdminPassword(userId, currentPassword)) return false;
  const salt = randomBytes(16);
  const passwordHash = await pbkdf2(newPassword, salt, 100_000, 32, 'sha256');
  await queryD1(
    'UPDATE users SET password_hash = ?, salt = ? WHERE id = ?',
    [passwordHash.toString('base64'), salt.toString('base64'), userId]
  );
  return true;
}

export async function requestD1AdminEmailChange(userId: string, newEmail: string, currentPassword: string) {
  await ensureSchema();
  if (!await verifyD1AdminPassword(userId, currentPassword)) return null;
  const normalizedEmail = newEmail.trim().toLowerCase();
  const [existing] = await queryD1<{ id: string }>(
    'SELECT id FROM users WHERE LOWER(email) = ? AND id != ? LIMIT 1',
    [normalizedEmail, userId]
  );
  if (existing) throw new Error('ADMIN_EMAIL_EXISTS');

  const token = randomBytes(32).toString('base64url');
  const tokenHash = createHash('sha256').update(token).digest('hex');
  const expiresAt = Date.now() + 24 * 60 * 60 * 1000;
  await queryD1('DELETE FROM admin_email_change_requests WHERE user_id = ?', [userId]);
  await queryD1(
    `INSERT INTO admin_email_change_requests (token_hash, user_id, new_email, expires_at)
     VALUES (?, ?, ?, ?)`,
    [tokenHash, userId, normalizedEmail, expiresAt.toString()]
  );
  return { token, email: normalizedEmail };
}

export async function confirmD1AdminEmailChange(token: string) {
  if (!hasD1Config()) throw new Error('D1 is not configured on this server.');
  await ensureSchema();
  const tokenHash = createHash('sha256').update(token).digest('hex');
  const now = Date.now().toString();
  const [request] = await queryD1<{ user_id: string; new_email: string }>(
    `UPDATE admin_email_change_requests
     SET used_at = ?
     WHERE token_hash = ? AND used_at IS NULL AND expires_at > ?
     RETURNING user_id, new_email`,
    [now, tokenHash, now]
  );
  if (!request) return null;
  const [existing] = await queryD1<{ id: string }>(
    'SELECT id FROM users WHERE LOWER(email) = ? AND id != ? LIMIT 1',
    [request.new_email.toLowerCase(), request.user_id]
  );
  if (existing) throw new Error('ADMIN_EMAIL_EXISTS');
  await queryD1('UPDATE users SET email = ? WHERE id = ?', [request.new_email, request.user_id]);
  return { userId: request.user_id, email: request.new_email };
}

async function ensureSchema() {
  if (!schemaReady) {
    schemaReady = (async () => {
      await queryD1(`
        CREATE TABLE IF NOT EXISTS oauth_integrations (
          user_id TEXT NOT NULL,
          provider TEXT NOT NULL,
          encrypted_tokens TEXT NOT NULL,
          account_json TEXT NOT NULL,
          connected_at TEXT NOT NULL,
          updated_at TEXT NOT NULL,
          PRIMARY KEY (user_id, provider)
        );
        CREATE TABLE IF NOT EXISTS oauth_states (
          state_hash TEXT PRIMARY KEY,
          provider TEXT NOT NULL,
          user_id TEXT NOT NULL,
          nonce TEXT NOT NULL,
          origin TEXT NOT NULL,
          expires_at INTEGER NOT NULL
        );
        CREATE TABLE IF NOT EXISTS whatsapp_web_auth (
          user_id TEXT NOT NULL,
          key_type TEXT NOT NULL,
          key_id TEXT NOT NULL,
          encrypted_value TEXT NOT NULL,
          updated_at TEXT NOT NULL,
          PRIMARY KEY (user_id, key_type, key_id)
        );
        CREATE TABLE IF NOT EXISTS whatsapp_web_messages (
          user_id TEXT NOT NULL,
          message_hash TEXT NOT NULL,
          conversation_hash TEXT NOT NULL,
          encrypted_payload TEXT NOT NULL,
          message_timestamp TEXT NOT NULL,
          PRIMARY KEY (user_id, message_hash)
        );
        CREATE TABLE IF NOT EXISTS site_reviews (
          id TEXT PRIMARY KEY,
          user_id TEXT,
          name TEXT NOT NULL,
          rating INTEGER NOT NULL,
          comment TEXT NOT NULL,
          status TEXT NOT NULL DEFAULT 'pending',
          created_at TEXT NOT NULL
        );
        CREATE TABLE IF NOT EXISTS profile_settings (
          id TEXT PRIMARY KEY,
          target_type TEXT NOT NULL,
          target_id TEXT NOT NULL,
          payload TEXT NOT NULL,
          updated_at TEXT NOT NULL
        );
        CREATE TABLE IF NOT EXISTS admin_password_resets (
          token_hash TEXT PRIMARY KEY,
          user_id TEXT NOT NULL,
          expires_at INTEGER NOT NULL,
          used_at INTEGER
        );
        CREATE TABLE IF NOT EXISTS admin_email_change_requests (
          token_hash TEXT PRIMARY KEY,
          user_id TEXT NOT NULL,
          new_email TEXT NOT NULL,
          expires_at INTEGER NOT NULL,
          used_at INTEGER
        );
        CREATE TABLE IF NOT EXISTS admin_email_confirmations (
          token_hash TEXT PRIMARY KEY,
          user_id TEXT NOT NULL,
          expires_at INTEGER NOT NULL,
          used_at TEXT,
          created_at TEXT NOT NULL
        );
        CREATE TABLE IF NOT EXISTS cerebro_subscriptions (
          id TEXT PRIMARY KEY,
          admin_uid TEXT NOT NULL,
          user_uid TEXT NOT NULL,
          user_email TEXT NOT NULL,
          status TEXT NOT NULL DEFAULT 'active',
          expires_at TEXT NOT NULL,
          gifted_days INTEGER NOT NULL DEFAULT 0,
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL
        );
        CREATE INDEX IF NOT EXISTS idx_cerebro_subscriptions_admin_email
          ON cerebro_subscriptions(admin_uid, user_email, status);
        CREATE TABLE IF NOT EXISTS cerebro_scheduled_actions (
          id TEXT PRIMARY KEY,
          admin_uid TEXT NOT NULL,
          service_id TEXT NOT NULL,
          payload TEXT NOT NULL,
          run_at TEXT NOT NULL,
          status TEXT NOT NULL DEFAULT 'pending',
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL
        );
        CREATE INDEX IF NOT EXISTS idx_cerebro_scheduled_actions_due
          ON cerebro_scheduled_actions(status, run_at);
        CREATE TABLE IF NOT EXISTS cerebro_identity_reviews (
          id TEXT PRIMARY KEY,
          admin_uid TEXT NOT NULL,
          subject_user_id TEXT NOT NULL,
          media_url TEXT NOT NULL,
          media_type TEXT NOT NULL,
          status TEXT NOT NULL DEFAULT 'pending',
          created_at TEXT NOT NULL
        );
        CREATE INDEX IF NOT EXISTS idx_oauth_states_expiry ON oauth_states(expires_at);
        CREATE INDEX IF NOT EXISTS idx_site_reviews_status_created ON site_reviews(status, created_at);
        CREATE INDEX IF NOT EXISTS idx_admin_password_resets_expiry ON admin_password_resets(expires_at);
        CREATE INDEX IF NOT EXISTS idx_admin_email_change_requests_expiry ON admin_email_change_requests(expires_at);
      `);
    })().catch((error: unknown) => {
      schemaReady = null;
      throw error;
    });
  }
  await schemaReady;
}

export async function initializeCerebroActionSchema() {
  await ensureSchema();
}

  export async function getMainAdminPublicProfile() {
    await ensureSchema();
    const rows = await queryD1<{
      id: string;
      display_name: string | null;
      photo_url: string | null;
    }>(
      `SELECT u.id, u.display_name, u.photo_url
       FROM users u
       INNER JOIN admins a ON a.user_id = u.id
       WHERE a.is_main_admin = 1
       LIMIT 1`
    );
    const profile = rows[0];
    if (!profile) return null;
    const settings = await getAdminProfileSettings(profile.id);
    const contactSettings = typeof settings.contactSettings === 'object' &&
      settings.contactSettings !== null && !Array.isArray(settings.contactSettings)
      ? settings.contactSettings as Record<string, unknown>
      : {};
    const configuredAddress = settings.publicAddress || settings.public_address || contactSettings.address;
    const publicAddress = typeof configuredAddress === 'string' && configuredAddress.trim().length <= 250
      ? configuredAddress.trim()
      : '';
    const configuredPhone = settings.phone || contactSettings.phone;
    const publicPhone = typeof configuredPhone === 'string' && configuredPhone.trim().length <= 60
      ? configuredPhone.trim()
      : '';
    const paymentSettings = typeof settings.payment_settings === 'object' && settings.payment_settings !== null
      ? settings.payment_settings as Record<string, unknown>
      : {};
    const monthlyPriceValue = paymentSettings.subscriptionMonthlyPrice ??
      paymentSettings.monthlyPrice ??
      paymentSettings.pixValue;
    const monthlyPrice = typeof monthlyPriceValue === 'number'
      ? monthlyPriceValue
      : typeof monthlyPriceValue === 'string' && monthlyPriceValue.trim()
        ? Number(monthlyPriceValue)
        : null;
    const currencyValue = paymentSettings.defaultCurrency;
    const currency = typeof currencyValue === 'string' && /^[A-Z]{3}$/i.test(currencyValue)
      ? currencyValue.toUpperCase()
      : 'BRL';
    const marqueeTexts = Array.isArray(settings.marquee_texts)
      ? settings.marquee_texts.filter((value): value is string =>
        typeof value === 'string' && value.trim().length > 0
      ).map((value) => value.trim().slice(0, 180)).slice(0, 12)
      : [];
    const configuredAbout = settings.about_text || settings.aboutText || contactSettings.description || settings.description;
    const configuredName = settings.name || contactSettings.displayName;
    const configuredProfession = settings.profession || contactSettings.profession;
    const configuredRelationship = settings.relationship || contactSettings.relationship;
    const configuredSign = settings.sign || contactSettings.sign;
    const personalizationSettings = typeof settings.personalizationSettings === 'object' &&
      settings.personalizationSettings !== null && !Array.isArray(settings.personalizationSettings)
      ? settings.personalizationSettings as Record<string, unknown>
      : {};
    const showWhatsAppButton = typeof settings.show_whatsapp_button === 'boolean'
      ? settings.show_whatsapp_button
      : typeof personalizationSettings.whatsappBubbleEnabled === 'boolean'
        ? personalizationSettings.whatsappBubbleEnabled
        : true;
    const showLiveChatButton = typeof settings.show_live_chat_button === 'boolean'
      ? settings.show_live_chat_button
      : typeof personalizationSettings.secretChatEnabled === 'boolean'
        ? personalizationSettings.secretChatEnabled
        : true;
    let photoUrl = safePublicMediaUrl(settings.profile_picture_url) || safePublicMediaUrl(profile.photo_url);
    if (!photoUrl) {
      const photos = await queryD1<{ payload: string; media_url: string | null }>(
        `SELECT payload, media_url
         FROM media_collection
         WHERE collection = 'photos'
           AND admin_uid = ?
           AND json_valid(payload)
           AND lower(COALESCE(json_extract(payload, '$.visibility'), '')) = 'public'
           AND COALESCE(json_extract(payload, '$.imageUrl'), json_extract(payload, '$.photoUrl'), json_extract(payload, '$.url'), media_url) IS NOT NULL
         ORDER BY CASE WHEN lower(COALESCE(json_extract(payload, '$.title'), '')) = 'cc' THEN 0 ELSE 1 END, created_at DESC
         LIMIT 1`,
        [profile.id]
      );
      if (photos[0]) {
        const payload = JSON.parse(photos[0].payload) as Record<string, unknown>;
        const storedUrl = payload.photoUrl || payload.imageUrl || payload.url || photos[0].media_url;
        photoUrl = safePublicMediaUrl(storedUrl);
      }
    }
    return {
      userId: profile.id,
      name: typeof configuredName === 'string' && configuredName.trim()
        ? configuredName.trim().slice(0, 120)
        : profile.display_name || '',
      photoUrl,
      phone: publicPhone,
      address: publicAddress,
      profession: typeof configuredProfession === 'string' ? configuredProfession.trim().slice(0, 120) : '',
      relationship: typeof configuredRelationship === 'string' ? configuredRelationship.trim().slice(0, 120) : '',
      sign: typeof configuredSign === 'string' ? configuredSign.trim().slice(0, 120) : '',
      showWhatsAppButton,
      showLiveChatButton,
      coverPhotoUrl: safePublicMediaUrl(settings.cover_photo_url),
      aboutText: toPublicProfileText(configuredAbout),
      marqueeTexts,
      monthlyPrice: typeof monthlyPrice === 'number' && Number.isFinite(monthlyPrice) &&
        monthlyPrice >= 0 && monthlyPrice <= 1_000_000
        ? monthlyPrice
        : null,
      currency: currency,
      paymentDescription: typeof paymentSettings.subscriptionDescription === 'string'
        ? paymentSettings.subscriptionDescription.trim().slice(0, 300)
        : ''
    };
  }

  export interface CerebroAdminSettings {
    services: Record<string, boolean>;
    conversation: {
      autoReplyEnabled: boolean;
      defaultVoiceEnabled: boolean;
      responseStyle: string;
    };
  }

  type CerebroSettingsRecord =
    | { table: 'profile_settings'; id: string; payload: string }
    | { table: 'settings'; id: string; payload: string };

  async function getCerebroSettingsRecord(adminUid: string): Promise<CerebroSettingsRecord | undefined> {
    const profileSettings = await queryD1<{ id: string; payload: string }>(
      `SELECT id, payload
       FROM profile_settings
       WHERE target_type = 'admin'
         AND target_id = ?
         AND json_valid(payload)
       ORDER BY updated_at DESC
       LIMIT 1`,
      [adminUid]
    );
    if (profileSettings[0]) return { ...profileSettings[0], table: 'profile_settings' };

    const legacySettings = await queryD1<{ id: string; payload: string }>(
      `SELECT id, payload
       FROM settings
       WHERE admin_uid = ?
         AND source = 'admin/profileSettings'
         AND json_valid(payload)
       ORDER BY updated_at DESC
       LIMIT 1`,
      [adminUid]
    );
    if (legacySettings[0]) return { ...legacySettings[0], table: 'settings' };
    return undefined;
  }

  export async function getAdminProfileSettings(adminUid: string): Promise<Record<string, unknown>> {
    await ensureSchema();
    const record = await getCerebroSettingsRecord(adminUid);
    const globalRows = await queryD1<{ payload: string }>(
      `SELECT payload FROM profile_settings
       WHERE target_type = 'global' AND json_valid(payload)
       ORDER BY updated_at DESC
       LIMIT 1`
    );
    const globalPayload = globalRows[0] ? JSON.parse(globalRows[0].payload) as unknown : {};
    const adminPayload = record ? JSON.parse(record.payload) as unknown : {};
    if (
      !globalPayload || typeof globalPayload !== 'object' || Array.isArray(globalPayload) ||
      !adminPayload || typeof adminPayload !== 'object' || Array.isArray(adminPayload)
    ) {
      throw new Error('As configurações do perfil possuem formato inválido.');
    }
    const merged = { ...(globalPayload as Record<string, unknown>), ...(adminPayload as Record<string, unknown>) };
    const contactSettings = merged.contactSettings && typeof merged.contactSettings === 'object' &&
      !Array.isArray(merged.contactSettings)
      ? merged.contactSettings as Record<string, unknown>
      : {};
    const firstConfiguredText = (...values: unknown[]) => values.find(
      (value): value is string => typeof value === 'string' && value.trim().length > 0
    )?.trim();
    const description = firstConfiguredText(
      merged.about_text,
      merged.aboutText,
      contactSettings.description,
      merged.description
    );
    const publicAddress = firstConfiguredText(
      merged.publicAddress,
      merged.public_address,
      contactSettings.address
    );
    if (description) merged.about_text = description;
    if (publicAddress) merged.publicAddress = publicAddress;
    for (const key of [
      'payment_settings',
      'paymentSettings',
      'socialMedia',
      'appearance_settings',
      'privacy_settings',
      'review_settings',
      'translation_settings'
    ]) {
      const globalSettings = globalPayload as Record<string, unknown>;
      const adminSettings = adminPayload as Record<string, unknown>;
      const globalValue = globalSettings[key];
      const adminValue = adminSettings[key];
      if (
        globalValue && typeof globalValue === 'object' && !Array.isArray(globalValue) &&
        adminValue && typeof adminValue === 'object' && !Array.isArray(adminValue)
      ) {
        merged[key] = { ...(globalValue as Record<string, unknown>), ...(adminValue as Record<string, unknown>) };
      }
    }
    for (const key of ['payment_settings', 'paymentSettings']) {
      const payment = merged[key];
      if (payment && typeof payment === 'object' && !Array.isArray(payment)) {
        const { pixKey: _pixKey, ...safePayment } = payment as Record<string, unknown>;
        merged[key] = safePayment;
      }
    }
    return merged;
  }

  export async function updateAdminProfileSettings(
    adminUid: string,
    patch: Record<string, unknown>
  ): Promise<Record<string, unknown>> {
    await ensureSchema();
    let record = await getCerebroSettingsRecord(adminUid);
    if (!record) {
      const id = `profileSettings:admin:${adminUid}`;
      await queryD1(
        `INSERT OR IGNORE INTO profile_settings (id, target_type, target_id, payload, updated_at)
         VALUES (?, 'admin', ?, '{}', CAST(unixepoch() AS TEXT))`,
        [id, adminUid]
      );
      record = await getCerebroSettingsRecord(adminUid);
      if (!record) throw new Error('Não foi possível criar as configurações deste administrador.');
    }

    const current = JSON.parse(record.payload) as Record<string, unknown>;
    const updated = { ...current };
    for (const [key, value] of Object.entries(patch)) {
      const existing = updated[key];
      updated[key] = existing && typeof existing === 'object' && !Array.isArray(existing) &&
        value && typeof value === 'object' && !Array.isArray(value)
        ? { ...(existing as Record<string, unknown>), ...(value as Record<string, unknown>) }
        : value;
    }
    if (record.table === 'profile_settings') {
      await queryD1(
        `UPDATE profile_settings
         SET payload = ?, updated_at = CAST(unixepoch() AS TEXT)
         WHERE id = ? AND target_type = 'admin' AND target_id = ?`,
        [JSON.stringify(updated), record.id, adminUid]
      );
    } else {
      await queryD1(
        `UPDATE settings
         SET payload = ?, updated_at = datetime('now')
         WHERE id = ? AND admin_uid = ? AND source = 'admin/profileSettings'`,
        [JSON.stringify(updated), record.id, adminUid]
      );
    }
    return getAdminProfileSettings(adminUid);
  }

  export async function getCerebroAdminSettings(adminUid: string): Promise<CerebroAdminSettings> {
    await ensureSchema();
    const record = await getCerebroSettingsRecord(adminUid);
    const payload = record
      ? JSON.parse(record.payload) as Record<string, unknown>
      : {};
    const storedServices = typeof payload.cerebroCentralServices === 'object' &&
      payload.cerebroCentralServices !== null
      ? payload.cerebroCentralServices as Record<string, unknown>
      : {};
    const storedConversation = typeof payload.cerebroCentralConversationSettings === 'object' &&
      payload.cerebroCentralConversationSettings !== null
      ? payload.cerebroCentralConversationSettings as Record<string, unknown>
      : {};
    return {
      services: Object.fromEntries(
        Object.entries(storedServices).filter((entry): entry is [string, boolean] =>
          typeof entry[1] === 'boolean'
        )
      ),
      conversation: {
        autoReplyEnabled: storedConversation.autoReplyEnabled === true,
        defaultVoiceEnabled: storedConversation.defaultVoiceEnabled === true,
        responseStyle: typeof storedConversation.responseStyle === 'string'
          ? storedConversation.responseStyle
          : 'balanced'
      }
    };
  }

  export async function updateCerebroAdminSettings(
    adminUid: string,
    patch: {
      services?: Record<string, boolean>;
      conversation?: Partial<CerebroAdminSettings['conversation']>;
    }
  ): Promise<CerebroAdminSettings> {
    await ensureSchema();
    let record = await getCerebroSettingsRecord(adminUid);
    if (!record) {
      const id = `profileSettings:admin:${adminUid}`;
      await queryD1(
        `INSERT OR IGNORE INTO profile_settings (id, target_type, target_id, payload, updated_at)
         VALUES (?, 'admin', ?, '{}', CAST(unixepoch() AS TEXT))`,
        [id, adminUid]
      );
      record = await getCerebroSettingsRecord(adminUid);
      if (!record) throw new Error('Não foi possível criar as configurações deste administrador.');
    }
    const payload = JSON.parse(record.payload) as Record<string, unknown>;
    if (patch.services) {
      const existingServices = typeof payload.cerebroCentralServices === 'object' &&
        payload.cerebroCentralServices !== null
        ? payload.cerebroCentralServices as Record<string, unknown>
        : {};
      payload.cerebroCentralServices = { ...existingServices, ...patch.services };
    }
    if (patch.conversation) {
      const existingConversation = typeof payload.cerebroCentralConversationSettings === 'object' &&
        payload.cerebroCentralConversationSettings !== null
        ? payload.cerebroCentralConversationSettings as Record<string, unknown>
        : {};
      payload.cerebroCentralConversationSettings = {
        ...existingConversation,
        ...patch.conversation
      };
    }
    if (record.table === 'profile_settings') {
      await queryD1(
        `UPDATE profile_settings
         SET payload = ?, updated_at = unixepoch()
         WHERE id = ? AND target_type = 'admin' AND target_id = ?`,
        [JSON.stringify(payload), record.id, adminUid]
      );
    } else {
      await queryD1(
        `UPDATE settings
         SET payload = ?, updated_at = datetime('now')
         WHERE id = ? AND admin_uid = ? AND source = 'admin/profileSettings'`,
        [JSON.stringify(payload), record.id, adminUid]
      );
    }
    return getCerebroAdminSettings(adminUid);
  }

  function safePublicMediaUrl(value: unknown) {
    if (typeof value !== 'string' || !value) return '';
    let url: URL;
    try {
      url = new URL(value);
    } catch {
      return '';
    }
    if (url.protocol !== 'https:' || url.username || url.password) return '';
    let decodedUrl = url.href;
    for (let pass = 0; pass < 3; pass += 1) {
      try {
        decodedUrl = decodeURIComponent(decodedUrl);
      } catch {
        break;
      }
    }
    if (/(?:access|refresh|temp)?[_-]?(?:auth|token|signature|credential|secret|code)\s*=/i.test(decodedUrl)) {
      return '';
    }
    return url.href;
  }

  function toPublicProfileText(value: unknown) {
    if (typeof value !== 'string') return '';
    const decodeNumericEntity = (code: string, radix: number) => {
      const point = parseInt(code, radix);
      return Number.isInteger(point) && point >= 0 && point <= 0x10ffff
        ? String.fromCodePoint(point)
        : '';
    };
    return value
      .replace(/<(script|style|iframe|object)\b[^>]*>[\s\S]*?<\/\1\s*>/gi, '')
      .replace(/<br\s*\/?>|<\/(?:p|div|li|h[1-6])\s*>/gi, '\n')
      .replace(/<[^>]*>/g, '')
      .replace(/&nbsp;|&#160;|&#xA0;/gi, ' ')
      .replace(/&amp;/gi, '&')
      .replace(/&lt;/gi, '<')
      .replace(/&gt;/gi, '>')
      .replace(/&quot;/gi, '"')
      .replace(/&#39;|&apos;/gi, "'")
      .replace(/&#(\d+);/g, (_match, code: string) => decodeNumericEntity(code, 10))
      .replace(/&#x([0-9a-f]+);/gi, (_match, code: string) => decodeNumericEntity(code, 16))
      .split('\n')
      .filter((line) => !/(?:login\s*:|senha\s*:|password\s*:)/i.test(line))
      .join('\n')
      .replace(/[ \t]+\n/g, '\n')
      .replace(/\n{3,}/g, '\n\n')
      .trim()
      .slice(0, 5000);
  }

  export async function listPublicFeedPosts(userId: string) {
    await ensureSchema();
    const [posts, photos] = await Promise.all([
      queryD1<{
        document_id: string;
        payload: string;
        media_url: string | null;
        created_at: string;
      }>(
        `SELECT document_id, payload, media_url, created_at
         FROM media_collection
         WHERE collection = 'posts'
           AND json_valid(payload)
           AND (admin_uid = ? OR json_extract(payload, '$.userId') = ?)
           AND lower(COALESCE(json_extract(payload, '$.visibility'), '')) = 'public'
           AND json_extract(payload, '$.published') = 1
           ORDER BY created_at DESC
           LIMIT 50`,
        [userId, userId]
      ),
      queryD1<{
        document_id: string;
        payload: string;
        media_url: string | null;
        created_at: string;
      }>(
        `SELECT document_id, payload, media_url, created_at
         FROM media_collection
         WHERE collection = 'photos'
           AND (admin_uid = ? OR json_extract(payload, '$.userId') = ?)
           AND json_valid(payload)
           AND lower(COALESCE(json_extract(payload, '$.visibility'), '')) = 'public'
         ORDER BY created_at DESC
         LIMIT 50`,
        [userId, userId]
      )
    ]);
    const postItems = posts.flatMap((row) => {
      const payload = JSON.parse(row.payload) as Record<string, any>;
      const firstMedia = Array.isArray(payload.media) ? payload.media[0] : payload.media;
      const caption = String(payload.text || payload.description || payload.title || '');
      if (/^\s*(?:teste|test)\s*[.!?]*$/i.test(caption)) return [];
      const mediaUrl = safePublicMediaUrl(payload.mediaUrl || firstMedia?.url || firstMedia?.src || row.media_url);
      if (!mediaUrl) return [];
      return [{
        id: row.document_id,
        provider: 'Cérebro Central',
        caption,
        media_type: String(firstMedia?.type || payload.category || 'IMAGE').toUpperCase(),
        media_url: mediaUrl,
        thumbnail_url: safePublicMediaUrl(firstMedia?.thumbnailUrl || firstMedia?.url || row.media_url),
        permalink: '',
        timestamp: typeof payload.createdAt === 'string' ? payload.createdAt : row.created_at || ''
      }];
    });
    const photoItems = photos.flatMap((row) => {
      const payload = JSON.parse(row.payload) as Record<string, any>;
      const firstMedia = Array.isArray(payload.media) ? payload.media[0] : payload.media;
      const caption = String(payload.caption || payload.description || payload.title || '');
      const mediaUrl = safePublicMediaUrl(
        payload.imageUrl || payload.photoUrl || payload.mediaUrl || firstMedia?.url || firstMedia?.src || row.media_url
      );
      if (!mediaUrl || /^\s*(?:teste|test)\s*[.!?]*$/i.test(caption)) return [];
      return [{
        id: `photo_${row.document_id}`,
        provider: 'Cérebro Central',
        caption,
        media_type: 'IMAGE',
        media_url: mediaUrl,
        thumbnail_url: safePublicMediaUrl(payload.thumbnailUrl || firstMedia?.thumbnailUrl || mediaUrl) || mediaUrl,
        permalink: '',
        timestamp: typeof payload.createdAt === 'string' ? payload.createdAt : row.created_at || ''
      }];
    });
    return [...postItems, ...photoItems]
      .sort((left, right) => Date.parse(right.timestamp) - Date.parse(left.timestamp))
      .slice(0, 50);
  }

  export async function createSiteReview(name: string, rating: number, comment: string) {
    await ensureSchema();
    const id = randomBytes(16).toString('hex');
    const createdAt = new Date().toISOString();
    await queryD1(
      'INSERT INTO site_reviews (id, name, rating, comment, status, created_at) VALUES (?, ?, ?, ?, ?, ?)',
      [id, name, String(rating), comment, 'pending', createdAt]
    );
    return { id, name, rating, comment, status: 'pending', created_at: createdAt };
  }

  export async function listSiteReviews(
    status?: 'pending' | 'approved' | 'rejected',
    adminUid?: string
  ) {
    await ensureSchema();
    const legacyConditions = [
      `collection = 'reviews'`,
      `(admin_uid = ? OR COALESCE(admin_uid, '') = '' OR json_extract(payload, '$.adminUid') = ?)`
    ];
    const legacyParams = [adminUid || '', adminUid || ''];
    if (status) {
      legacyConditions.push(`lower(COALESCE(json_extract(payload, '$.status'), 'pending')) = ?`);
      legacyParams.push(status);
    }
    const [siteRows, legacyRows] = await Promise.all([
      queryD1<{
        id: string;
        name: string;
        rating: number;
        comment: string;
        status: string;
        created_at: string;
      }>(
        `SELECT id, name, rating, comment, status, created_at
         FROM site_reviews${status ? ' WHERE status = ?' : ''}
         ORDER BY created_at DESC
         LIMIT 200`,
        status ? [status] : []
      ),
      queryD1<{
        document_id: string;
        payload: string;
        created_at: string;
      }>(
        `SELECT document_id, payload, created_at
         FROM media_collection
         WHERE ${legacyConditions.join(' AND ')}
         ORDER BY created_at DESC
         LIMIT 200`,
        legacyParams
      )
    ]);
    const mappedLegacy = legacyRows.flatMap((row) => {
      const payload = JSON.parse(row.payload) as Record<string, unknown>;
      const name = String(payload.author || '');
      const comment = String(payload.text || '');
      if (/^\s*(?:teste|test)\s*[.!?]*$/i.test(name) ||
        /avaliação de teste operacional|operational test review/i.test(`${name} ${comment}`)) return [];
      return [{
        id: row.document_id,
        name,
        rating: Number(payload.rating) || 0,
        comment,
        status: String(payload.status || 'pending'),
        created_at: typeof payload.createdAt === 'string' ? payload.createdAt : row.created_at
      }];
    });
    return [...siteRows, ...mappedLegacy].sort((left, right) =>
      Date.parse(right.created_at) - Date.parse(left.created_at)
    );
  }

  export async function updateSiteReviewStatus(id: string, status: 'pending' | 'approved' | 'rejected') {
    await ensureSchema();
    await queryD1('UPDATE site_reviews SET status = ? WHERE id = ?', [status, id]);
    const rows = await queryD1<{ id: string }>('SELECT id FROM site_reviews WHERE id = ?', [id]);
    if (rows.length) return true;
    await queryD1(
      `UPDATE media_collection
       SET payload = json_set(payload, '$.status', ?), updated_at = CURRENT_TIMESTAMP
       WHERE collection = 'reviews' AND document_id = ?`,
      [status, id]
    );
    const legacyRows = await queryD1<{ document_id: string }>(
      `SELECT document_id FROM media_collection WHERE collection = 'reviews' AND document_id = ?`,
      [id]
    );
    return legacyRows.length > 0;
  }

  export async function listAdminChatHistory(adminUid: string) {
    await ensureSchema();
    const [channelMessages, secretMessages] = await Promise.all([
      queryD1<{
        id: string;
        channel: string;
        conversation_id: string;
        sender: string | null;
        recipient: string | null;
        text: string | null;
        timestamp: string;
        metadata: string | null;
        image_url: string | null;
        video_url: string | null;
        contact_name: string | null;
      }>(
        `SELECT m.id, m.channel, m.conversation_id, m.sender, m.recipient, m.text,
                m.timestamp, m.metadata, c.name AS contact_name,
                CASE WHEN json_valid(m.metadata) THEN
                  COALESCE(json_extract(m.metadata, '$.image_url'), json_extract(m.metadata, '$.imageUrl'))
                END AS image_url,
                CASE WHEN json_valid(m.metadata) THEN
                  COALESCE(json_extract(m.metadata, '$.video_url'), json_extract(m.metadata, '$.videoUrl'))
                END AS video_url
         FROM channel_messages m
         LEFT JOIN channel_contacts c
           ON c.admin_uid = m.admin_uid AND c.channel = m.channel
          AND c.conversation_id = m.conversation_id
         WHERE m.admin_uid = ?
         ORDER BY m.timestamp DESC
         LIMIT 2000`,
        [adminUid]
      ),
      queryD1<{
        id: string;
        chat_id: string;
        sender_id: string;
        recipient_id: string | null;
        text: string | null;
        timestamp: string;
        image_url: string | null;
        video_url: string | null;
        audio_url: string | null;
        user_display_name: string | null;
        user_email: string | null;
      }>(
        `SELECT m.id, m.chat_id, m.sender_id, m.recipient_id, m.text, m.timestamp,
                m.image_url, m.video_url, m.audio_url, c.user_display_name, c.user_email
         FROM secret_chat_messages m
         LEFT JOIN secret_chats c ON c.admin_uid = m.admin_uid AND c.id = m.chat_id
         WHERE m.admin_uid = ?
         ORDER BY m.timestamp DESC
         LIMIT 2000`,
        [adminUid]
      )
    ]);
    return {
      messages: channelMessages.reverse().map((message) => ({
        id: message.id,
        provider: message.channel,
        conversationId: message.conversation_id,
        contact: message.contact_name || message.recipient || message.sender || message.conversation_id,
        fromMe: message.sender === adminUid || message.sender === 'admin',
        text: message.text || (message.image_url ? '[Imagem]' : message.video_url ? '[Vídeo]' : ''),
        timestamp: message.timestamp,
        imageUrl: message.image_url || undefined,
        videoUrl: message.video_url || undefined
      })),
      secretMessages: secretMessages.reverse().map((message) => ({
        id: message.id,
        provider: 'Chat Secreto',
        conversationId: message.chat_id,
        contact: message.user_display_name || message.user_email || message.sender_id,
        fromMe: message.sender_id === adminUid || message.sender_id === 'admin',
        text: message.text || (
          message.image_url ? '[Imagem]' :
            message.video_url ? '[Vídeo]' :
              message.audio_url ? '[Áudio]' : ''
        ),
        timestamp: message.timestamp,
        imageUrl: message.image_url || undefined,
        videoUrl: message.video_url || undefined,
        audioUrl: message.audio_url || undefined
      }))
    };
  }

  export interface WhatsAppWebStoredMessage {
    id: string;
    conversationId: string;
    contactName: string;
    fromMe: boolean;
    text: string;
    timestamp: string;
  }

  export async function saveWhatsAppWebMessages(userId: string, messages: WhatsAppWebStoredMessage[]) {
    if (!messages.length) return;
    await ensureSchema();
    const normalized = messages.filter((message) =>
      message.id && message.conversationId && message.timestamp && message.text.trim()
    );
    for (let start = 0; start < normalized.length; start += 10) {
      const batch = normalized.slice(start, start + 10);
      const values = batch.map(() => '(?, ?, ?, ?, ?)').join(', ');
      const params = batch.flatMap((message) => [
        userId,
        createHash('sha256').update(`${message.conversationId}:${message.id}`).digest('hex'),
        createHash('sha256').update(`${userId}:${message.conversationId}`).digest('hex'),
        encryptTokens({
          id: message.id,
          conversationId: message.conversationId,
          contactName: message.contactName,
          fromMe: message.fromMe,
          text: message.text
        }),
        message.timestamp
      ]);
      await queryD1(
        `INSERT OR IGNORE INTO whatsapp_web_messages
         (user_id, message_hash, conversation_hash, encrypted_payload, message_timestamp)
         VALUES ${values}`,
        params
      );
    }
  }

  export async function listWhatsAppWebMessages(userId: string, limit = 2000) {
    await ensureSchema();
    const columns = await queryD1<{ name: string }>(
      "SELECT name FROM pragma_table_info('whatsapp_web_messages')"
    );
    if (!columns.some((column) => column.name === 'encrypted_payload')) {
      const [count] = await queryD1<{ message_count: number }>(
        'SELECT COUNT(*) AS message_count FROM whatsapp_web_messages WHERE user_id = ?',
        [userId]
      );
      if (count?.message_count) {
        throw new Error('WhatsApp Web history exists in an unsupported D1 schema.');
      }
      return [];
    }
    const rows = await queryD1<{
      encrypted_payload: string;
      message_timestamp: string;
    }>(
      `SELECT encrypted_payload, message_timestamp
       FROM whatsapp_web_messages
       WHERE user_id = ?
       ORDER BY message_timestamp DESC
       LIMIT ?`,
      [userId, String(Math.min(Math.max(limit, 1), 5000))]
    );
    return rows.map((row) => {
      const payload = decryptTokens(row.encrypted_payload);
      return {
        id: String(payload.id || ''),
        conversationId: String(payload.conversationId || ''),
        contactName: String(payload.contactName || ''),
        fromMe: payload.fromMe === true,
        text: String(payload.text || ''),
        timestamp: row.message_timestamp
      };
    }).reverse();
  }

function encryptionKey() {
  const value = process.env.OAUTH_TOKEN_ENCRYPTION_KEY;
  if (!value) throw new Error('OAuth token encryption is not configured.');
  const key = Buffer.from(value, 'base64');
  if (key.length !== 32) throw new Error('OAuth token encryption key must be 32 bytes encoded as base64.');
  return key;
}

function encryptTokens(tokens: Record<string, unknown>) {
  const iv = randomBytes(12);
  const cipher = createCipheriv('aes-256-gcm', encryptionKey(), iv);
  const encrypted = Buffer.concat([cipher.update(JSON.stringify(tokens), 'utf8'), cipher.final()]);
  return [iv, cipher.getAuthTag(), encrypted].map((part) => part.toString('base64url')).join('.');
}

function decryptTokens(value: string) {
  const [iv, tag, encrypted] = value.split('.').map((part) => Buffer.from(part, 'base64url'));
  if (!iv || !tag || !encrypted) throw new Error('Stored OAuth token data is invalid.');
  const decipher = createDecipheriv('aes-256-gcm', encryptionKey(), iv);
  decipher.setAuthTag(tag);
  return JSON.parse(Buffer.concat([decipher.update(encrypted), decipher.final()]).toString('utf8')) as Record<string, unknown>;
}

export async function loadWhatsAppWebAuth(userId: string) {
  await ensureSchema();
  const rows = await queryD1<{ key_type: string; key_id: string; encrypted_value: string }>(
    'SELECT key_type, key_id, encrypted_value FROM whatsapp_web_auth WHERE user_id = ?',
    [userId]
  );
  return rows.map((row) => ({
    keyType: row.key_type,
    keyId: row.key_id,
    serialized: decryptTokens(row.encrypted_value).serialized as string
  }));
}

export async function saveWhatsAppWebAuth(
  userId: string,
  keyType: string,
  keyId: string,
  serialized: string | null
) {
  await ensureSchema();
  if (serialized === null) {
    await queryD1('DELETE FROM whatsapp_web_auth WHERE user_id = ? AND key_type = ? AND key_id = ?', [
      userId,
      keyType,
      keyId
    ]);
    return;
  }
  await queryD1(
    `INSERT INTO whatsapp_web_auth (user_id, key_type, key_id, encrypted_value, updated_at)
     VALUES (?, ?, ?, ?, ?)
     ON CONFLICT(user_id, key_type, key_id) DO UPDATE SET
       encrypted_value = excluded.encrypted_value,
       updated_at = excluded.updated_at`,
    [userId, keyType, keyId, encryptTokens({ serialized }), new Date().toISOString()]
  );
}

export async function clearWhatsAppWebAuth(userId: string) {
  await ensureSchema();
  await queryD1('DELETE FROM whatsapp_web_auth WHERE user_id = ?', [userId]);
}

export async function listWhatsAppWebAuthUsers() {
  await ensureSchema();
  const rows = await queryD1<{ user_id: string }>(
    "SELECT DISTINCT user_id FROM whatsapp_web_auth WHERE key_type = 'creds' AND key_id = 'creds'"
  );
  return rows.map((row) => row.user_id);
}

function encodeState(state: string) {
  return createHash('sha256').update(state).digest('hex');
}

async function saveConnection(
  userId: string,
  provider: IntegrationProvider,
  tokens: Record<string, unknown>,
  account: Record<string, unknown>
) {
  const now = new Date().toISOString();
  const storedTokens = { ...tokens };
  if (typeof storedTokens.expires_in === 'number') {
    storedTokens.expires_at = Date.now() + storedTokens.expires_in * 1000;
  }
  await queryD1(
    `INSERT INTO oauth_integrations (user_id, provider, encrypted_tokens, account_json, connected_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?)
     ON CONFLICT(user_id, provider) DO UPDATE SET
       encrypted_tokens = excluded.encrypted_tokens,
       account_json = excluded.account_json,
       updated_at = excluded.updated_at`,
    [userId, provider, encryptTokens(storedTokens), JSON.stringify(account), now, now]
  );
}

function redirectUri(provider: IntegrationProvider) {
  const uri = providerConfigs[provider].redirectUri;
  if (!uri) throw new Error('OAuth callback URL is not configured.');
  const parsed = new URL(uri);
  if (process.env.NODE_ENV === 'production' && parsed.protocol !== 'https:') {
    throw new Error('OAuth callback must use HTTPS in production.');
  }
  return parsed.toString();
}

function callbackUriForProvider(provider: IntegrationProvider) {
  return redirectUri(provider);
}

function callbackPage(origin: string, provider: IntegrationProvider, error?: string) {
  const message = JSON.stringify({ type: 'integration-oauth-result', provider, error: error || null })
    .replaceAll('<', '\\u003c');
  const targetOrigin = JSON.stringify(origin).replaceAll('<', '\\u003c');
  return `<!doctype html><html><head><meta charset="utf-8"><title>Integração</title></head>
    <body><p>Autorização processada. Esta janela será fechada.</p>
    <script>if(window.opener){window.opener.postMessage(${message},${targetOrigin});window.close();}</script></body></html>`;
}

async function tokenRequest(
  url: string,
  values: Record<string, string>,
  basicAuth?: string,
  emptyBasicPassword = false
) {
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Accept: 'application/json',
      ...(basicAuth
        ? { Authorization: `Basic ${Buffer.from(`${basicAuth}${emptyBasicPassword ? ':' : ''}`).toString('base64')}` }
        : {})
    },
    body: new URLSearchParams(values)
  });
  const data = await response.json() as Record<string, unknown>;
  if (!response.ok || data.error) throw new Error('Provider token exchange failed.');
  return data;
}

async function providerProfile(
  provider: IntegrationProvider,
  accessToken: string
): Promise<Record<string, unknown>> {
  let url: string | null = null;
  if (provider === 'google') url = 'https://www.googleapis.com/oauth2/v3/userinfo';
  if (provider === 'youtube') url = 'https://www.googleapis.com/youtube/v3/channels?part=id,snippet&mine=true';
  if (provider === 'twitter') url = 'https://api.x.com/2/users/me?user.fields=name,username,profile_image_url';
  if (provider === 'facebook') url = `https://graph.facebook.com/${graphVersion}/me?fields=id,name,email`;
  if (provider === 'instagram') url = 'https://graph.instagram.com/me?fields=user_id,username';
  if (provider === 'onedrive') url = 'https://graph.microsoft.com/v1.0/me?$select=id,displayName,userPrincipalName';
  if (!url) return {};
  const response = await fetch(url, { headers: { Authorization: `Bearer ${accessToken}` } });
  const data = await response.json() as Record<string, unknown>;
  if (!response.ok || data.error) throw new Error('Provider profile lookup failed.');
  if (provider === 'youtube') {
    const channel = (data.items as Record<string, unknown>[] | undefined)?.[0];
    const snippet = channel?.snippet as Record<string, unknown> | undefined;
    return { channel_id: channel?.id, name: snippet?.title };
  }
  if (provider === 'twitter') {
    const account = data.data;
    return typeof account === 'object' && account !== null
      ? account as Record<string, unknown>
      : {};
  }
  return data;
}

async function verifyAppleIdentity(identityToken: string, clientId: string, nonce: string) {
  const parts = identityToken.split('.');
  if (parts.length !== 3) throw new Error('Apple returned an invalid identity token.');
  const header = JSON.parse(Buffer.from(parts[0], 'base64url').toString('utf8')) as { alg?: string; kid?: string };
  const claims = JSON.parse(Buffer.from(parts[1], 'base64url').toString('utf8')) as {
    iss?: string; aud?: string; exp?: number; nonce?: string; sub?: string; email?: string;
  };
  if (header.alg !== 'RS256' || !header.kid || claims.iss !== 'https://appleid.apple.com' ||
    claims.aud !== clientId || !claims.exp || claims.exp <= Date.now() / 1000 ||
    claims.nonce !== nonce || !claims.sub) {
    throw new Error('Apple identity token validation failed.');
  }
  const jwksResponse = await fetch('https://appleid.apple.com/auth/keys');
  if (!jwksResponse.ok) throw new Error('Apple signing keys are unavailable.');
  const jwks = await jwksResponse.json() as { keys?: (NodeJsonWebKey & { kid?: string })[] };
  const jwk = jwks.keys?.find((key) => key.kid === header.kid);
  if (!jwk) throw new Error('Apple signing key was not found.');
  const valid = verify(
    'RSA-SHA256',
    Buffer.from(`${parts[0]}.${parts[1]}`),
    createPublicKey({ key: jwk, format: 'jwk' }),
    Buffer.from(parts[2], 'base64url')
  );
  if (!valid) throw new Error('Apple identity token signature is invalid.');
  return { id: claims.sub, email: claims.email || null };
}

function authorizationUrl(provider: IntegrationProvider, state: string, nonce: string, callback: string) {
  const config = providerConfigs[provider];
  const params = new URLSearchParams({ client_id: config.clientId!, redirect_uri: callback, state });
  if (provider === 'google') {
    params.set('response_type', 'code');
    params.set('scope', process.env.GOOGLE_SCOPE || 'openid email profile https://www.googleapis.com/auth/drive.readonly');
    params.set('access_type', 'offline');
    params.set('prompt', 'consent');
    return `https://accounts.google.com/o/oauth2/v2/auth?${params}`;
  }
  if (provider === 'google-photos' || provider === 'youtube') {
    params.set('response_type', 'code');
    params.set(
      'scope',
      provider === 'google-photos'
        ? 'https://www.googleapis.com/auth/photospicker.mediaitems.readonly'
        : 'https://www.googleapis.com/auth/youtube.readonly'
    );
    params.set('access_type', 'offline');
    params.set('prompt', 'consent');
    return `https://accounts.google.com/o/oauth2/v2/auth?${params}`;
  }
  if (provider === 'twitter') {
    params.set('response_type', 'code');
    params.set('scope', process.env.TWITTER_OAUTH_SCOPES || 'tweet.read users.read offline.access');
    params.set('code_challenge', createHash('sha256').update(nonce).digest('base64url'));
    params.set('code_challenge_method', 'S256');
    return `https://twitter.com/i/oauth2/authorize?${params}`;
  }
  if (provider === 'onedrive') {
    params.set('response_type', 'code');
    params.set('response_mode', 'query');
    params.set('scope', 'offline_access User.Read Files.Read');
    return `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?${params}`;
  }
  if (provider === 'facebook') {
    params.set('response_type', 'code');
    params.set('scope', process.env.FACEBOOK_OAUTH_SCOPES || 'public_profile,email,pages_show_list,pages_read_engagement,pages_messaging');
    return `https://www.facebook.com/${graphVersion}/dialog/oauth?${params}`;
  }
  if (provider === 'instagram') {
    params.set('response_type', 'code');
    params.set('force_reauth', 'true');
    const supportedScopes = new Set([
      'instagram_business_basic',
      'instagram_business_content_publish',
      'instagram_business_manage_messages',
      'instagram_business_manage_comments',
      'instagram_business_manage_insights'
    ]);
    const configuredScopes = (process.env.INSTAGRAM_SCOPES ||
      'instagram_business_basic,instagram_business_manage_messages,instagram_business_manage_comments,instagram_business_content_publish,instagram_business_manage_insights')
      .split(/[,\s]+/)
      .filter(Boolean);
    const unsupportedScopes = configuredScopes.filter((scope) => !supportedScopes.has(scope));
    if (unsupportedScopes.length) {
      throw new Error(`Unsupported Instagram OAuth permissions: ${unsupportedScopes.join(', ')}`);
    }
    if (!configuredScopes.length) {
      throw new Error('Instagram OAuth requires at least one supported Instagram Business permission.');
    }
    params.set('scope', configuredScopes.join(','));
    return `https://www.instagram.com/oauth/authorize?${params}`;
  }
  if (provider === 'apple') {
    params.set('response_type', 'code id_token');
    params.set('response_mode', 'form_post');
    params.set('scope', 'name email');
    params.set('nonce', nonce);
    return `https://appleid.apple.com/auth/authorize?${params}`;
  }
  if (provider === 'mercado-pago') {
    params.set('response_type', 'code');
    params.set('platform_id', 'mp');
    return `https://auth.mercadopago.com/authorization?${params}`;
  }
  if (provider === 'stripe') {
    params.set('response_type', 'code');
    params.set('scope', 'read_write');
    return `https://connect.stripe.com/oauth/authorize?${params}`;
  }
  if (provider === 'paypal') {
    params.set('response_type', 'code');
    params.set(
      'scope',
      (process.env.PAYPAL_OAUTH_SCOPES || 'openid profile email')
        .split(/[,\s]+/)
        .filter(Boolean)
        .join(' ')
    );
    return `${paypalAuthorizationBase()}/signin/authorize?${params}`;
  }
  throw new Error('Unsupported OAuth provider.');
}

export async function listIntegrations(userId: string) {
  await ensureSchema();
  const rows = await queryD1<{ provider: string; account_json: string; connected_at: string }>(
    'SELECT provider, account_json, connected_at FROM oauth_integrations WHERE user_id = ?',
    [userId]
  );
  const connections = new Map(rows.map((row) => [row.provider, row]));
  return Object.entries(providerConfigs).map(([provider, config]) => {
    const connection = connections.get(provider);
    const missing = missingEnv(provider as IntegrationProvider);
    const configuredInEnvironment = provider === 'whatsapp' && Boolean(whatsAppEnvironmentToken());
    return {
      id: provider,
      provider,
      name: config.name,
      status: connection || configuredInEnvironment
        ? 'connected'
        : missing.length ? 'not_configured' : 'disconnected',
      auth_source: connection ? 'oauth' : configuredInEnvironment ? 'environment' : null,
      account: connection
        ? JSON.parse(connection.account_json)
        : configuredInEnvironment ? { phone_number_id: whatsAppEnvironmentPhoneId() } : null,
      connected_at: connection?.connected_at ?? null,
      missing_env: connection || configuredInEnvironment ? [] : missing
    };
  });
}

export async function beginIntegration(
  provider: IntegrationProvider,
  userId: string,
  origin: string
) {
  if (!(provider in providerConfigs)) throw new Error('Unknown integration provider.');
  const missing = missingEnv(provider);
  if (missing.length) throw new Error(`Missing provider configuration: ${missing.join(', ')}`);
  const requestOrigin = new URL(origin);
  if (!['http:', 'https:'].includes(requestOrigin.protocol) || origin !== requestOrigin.origin) {
    throw new Error('Admin origin is invalid.');
  }
  if (process.env.NODE_ENV === 'production' && requestOrigin.protocol !== 'https:') {
    throw new Error('Admin origin must use HTTPS in production.');
  }
  if (process.env.NODE_ENV === 'production' && defaultOrigin && requestOrigin.origin !== defaultOrigin) {
    throw new Error('Admin origin does not match the configured application URL.');
  }
  const callbackUri = provider === 'whatsapp'
    ? requestOrigin.origin
    : callbackUriForProvider(provider);
  const callbackOrigin = new URL(callbackUri).origin;
  await ensureSchema();

  if (provider === 'whatsapp') {
    const state = randomBytes(32).toString('base64url');
    const nonce = randomBytes(32).toString('base64url');
    const expiresAt = Date.now() + 10 * 60 * 1000;
    await queryD1('DELETE FROM oauth_states WHERE expires_at <= ?', [String(Date.now())]);
    await queryD1(
      'INSERT INTO oauth_states (state_hash, provider, user_id, nonce, origin, expires_at) VALUES (?, ?, ?, ?, ?, ?)',
      [encodeState(state), provider, userId, nonce, origin, String(expiresAt)]
    );
    return {
      embedded_signup: {
        app_id: whatsAppMetaAppId(),
        config_id: whatsAppSignupConfigId(),
        state,
        graph_version: graphVersion,
        expires_at: expiresAt
      }
    };
  }

  const state = randomBytes(32).toString('base64url');
  const nonce = randomBytes(32).toString('base64url');
  const expiresAt = Date.now() + 10 * 60 * 1000;
  await queryD1('DELETE FROM oauth_states WHERE expires_at <= ?', [String(Date.now())]);
  await queryD1(
    'INSERT INTO oauth_states (state_hash, provider, user_id, nonce, origin, expires_at) VALUES (?, ?, ?, ?, ?, ?)',
    [encodeState(state), provider, userId, nonce, origin, String(expiresAt)]
  );
  return {
    authorization_url: authorizationUrl(provider, state, nonce, callbackUri),
    callback_origin: callbackOrigin
  };
}

export async function completeWhatsAppSignup(
  userId: string,
  stateValue: string,
  code: string,
  wabaId: string,
  phoneNumberId: string,
  registrationPin: string
) {
  const state = await consumeState(stateValue);
  if (!state || state.provider !== 'whatsapp' || state.userId !== userId) {
    throw new Error('WhatsApp authorization state is invalid or expired.');
  }
  if (!/^\d+$/.test(wabaId) || !/^\d+$/.test(phoneNumberId)) {
    throw new Error('WhatsApp returned invalid account identifiers.');
  }
  if (!/^\d{6}$/.test(registrationPin)) {
    throw new Error('WhatsApp phone registration requires a six-digit PIN.');
  }

  const params = new URLSearchParams({
    client_id: whatsAppMetaAppId(),
    client_secret: process.env.FACEBOOK_APP_SECRET!,
    code
  });
  const exchange = await fetch(`https://graph.facebook.com/${graphVersion}/oauth/access_token?${params}`);
  let tokens = await exchange.json() as Record<string, unknown>;
  if (!exchange.ok || tokens.error || typeof tokens.access_token !== 'string') {
    throw new Error('WhatsApp authorization code exchange failed.');
  }

  const extendedParams = new URLSearchParams({
    grant_type: 'fb_exchange_token',
    client_id: whatsAppMetaAppId(),
    client_secret: process.env.FACEBOOK_APP_SECRET!,
    fb_exchange_token: tokens.access_token
  });
  const extended = await fetch(`https://graph.facebook.com/${graphVersion}/oauth/access_token?${extendedParams}`);
  const extendedTokens = await extended.json() as Record<string, unknown>;
  if (!extended.ok || extendedTokens.error || typeof extendedTokens.access_token !== 'string') {
    throw new Error('WhatsApp access token extension failed.');
  }
  tokens = extendedTokens;

  const accessToken = String(tokens.access_token);
  const headers = { Authorization: `Bearer ${accessToken}` };
  const [phoneResponse, wabaResponse] = await Promise.all([
    fetch(`https://graph.facebook.com/${graphVersion}/${encodeURIComponent(phoneNumberId)}?fields=id,display_phone_number,verified_name`, { headers }),
    fetch(`https://graph.facebook.com/${graphVersion}/${encodeURIComponent(wabaId)}?fields=id,name`, { headers })
  ]);
  const [phone, business] = await Promise.all([
    phoneResponse.json() as Promise<Record<string, unknown>>,
    wabaResponse.json() as Promise<Record<string, unknown>>
  ]);
  if (!phoneResponse.ok || !wabaResponse.ok || phone.error || business.error) {
    throw new Error('Could not verify the WhatsApp business assets.');
  }

  const registration = await fetch(`https://graph.facebook.com/${graphVersion}/${encodeURIComponent(phoneNumberId)}/register`, {
    method: 'POST',
    headers: { ...headers, 'Content-Type': 'application/json' },
    body: JSON.stringify({ messaging_product: 'whatsapp', pin: registrationPin })
  });
  const registrationResult = await registration.json() as Record<string, unknown>;
  if (!registration.ok || registrationResult.error) {
    throw new Error('Could not register the WhatsApp business phone number.');
  }

  const subscribe = await fetch(`https://graph.facebook.com/${graphVersion}/${encodeURIComponent(wabaId)}/subscribed_apps`, {
    method: 'POST',
    headers: { ...headers, 'Content-Type': 'application/json' },
    body: '{}'
  });
  const subscription = await subscribe.json() as Record<string, unknown>;
  if (!subscribe.ok || subscription.error) {
    throw new Error('Could not subscribe the app to WhatsApp webhooks.');
  }

  await saveConnection(userId, 'whatsapp', tokens, {
    waba_id: wabaId,
    phone_number_id: phoneNumberId,
    ...phone,
    business
  });
}

async function consumeState(state: string): Promise<OAuthState | null> {
  const hashed = encodeState(state);
  const rows = await queryD1<{
    provider: IntegrationProvider; user_id: string; nonce: string; origin: string; expires_at: number
  }>(
    'DELETE FROM oauth_states WHERE state_hash = ? RETURNING provider, user_id, nonce, origin, expires_at',
    [hashed]
  );
  const row = rows[0];
  if (!row || Number(row.expires_at) <= Date.now()) return null;
  return {
    provider: row.provider,
    userId: row.user_id,
    nonce: row.nonce,
    origin: row.origin,
    expiresAt: Number(row.expires_at)
  };
}

async function exchangeCode(provider: IntegrationProvider, code: string, nonce: string, callback: string) {
  const config = providerConfigs[provider];
  if (provider === 'google' || provider === 'google-photos' || provider === 'youtube') {
    const tokens = await tokenRequest('https://oauth2.googleapis.com/token', {
      code, client_id: config.clientId!, client_secret: config.clientSecret!,
      redirect_uri: callback, grant_type: 'authorization_code'
    });
    const account = await providerProfile(provider, String(tokens.access_token || ''));
    return { tokens, account };
  }
  if (provider === 'onedrive') {
    const tokens = await tokenRequest('https://login.microsoftonline.com/common/oauth2/v2.0/token', {
      code, client_id: config.clientId!, client_secret: config.clientSecret!,
      redirect_uri: callback, grant_type: 'authorization_code', scope: 'offline_access User.Read Files.Read'
    });
    const account = await providerProfile(provider, String(tokens.access_token || ''));
    return { tokens, account };
  }
  if (provider === 'facebook') {
    const params = new URLSearchParams({
      client_id: config.clientId!, client_secret: config.clientSecret!,
      redirect_uri: callback, code
    });
    const response = await fetch(`https://graph.facebook.com/${graphVersion}/oauth/access_token?${params}`);
    let tokens = await response.json() as Record<string, unknown>;
    if (!response.ok || tokens.error) throw new Error('Facebook token exchange failed.');
    if (typeof tokens.access_token === 'string') {
      const longLivedParams = new URLSearchParams({
        grant_type: 'fb_exchange_token',
        client_id: config.clientId!,
        client_secret: config.clientSecret!,
        fb_exchange_token: tokens.access_token
      });
      const longLivedResponse = await fetch(
        `https://graph.facebook.com/${graphVersion}/oauth/access_token?${longLivedParams}`
      );
      const longLivedTokens = await longLivedResponse.json() as Record<string, unknown>;
      if (!longLivedResponse.ok || longLivedTokens.error) throw new Error('Facebook token extension failed.');
      tokens = longLivedTokens;
    }
    const account = await providerProfile(provider, String(tokens.access_token || ''));
    return { tokens, account };
  }
  if (provider === 'instagram') {
    let tokens = await tokenRequest('https://api.instagram.com/oauth/access_token', {
      client_id: config.clientId!, client_secret: config.clientSecret!,
      grant_type: 'authorization_code', redirect_uri: callback, code
    });
    const accessToken = typeof tokens.access_token === 'string' ? tokens.access_token : '';
    if (!accessToken) throw new Error('Instagram did not return an access token.');
    const longLivedResponse = await fetch(
      `https://graph.instagram.com/access_token?${new URLSearchParams({
        grant_type: 'ig_exchange',
        client_secret: config.clientSecret!,
        access_token: accessToken
      })}`
    );
    const longLivedTokens = await longLivedResponse.json() as Record<string, unknown>;
    if (!longLivedResponse.ok || longLivedTokens.error) throw new Error('Instagram token extension failed.');
    tokens = longLivedTokens;
    const account = await providerProfile(provider, String(tokens.access_token || ''));
    return { tokens, account };
  }
  if (provider === 'twitter') {
    const tokens = await tokenRequest(
      'https://api.x.com/2/oauth2/token',
      {
        code,
        grant_type: 'authorization_code',
        client_id: config.clientId!,
        redirect_uri: callback,
        code_verifier: nonce
      },
      `${config.clientId}:${config.clientSecret}`
    );
    const accessToken = typeof tokens.access_token === 'string' ? tokens.access_token : '';
    if (!accessToken) throw new Error('X did not return an access token.');
    const account = await providerProfile(provider, accessToken);
    return { tokens, account };
  }
  if (provider === 'mercado-pago') {
    const tokens = await tokenRequest('https://api.mercadopago.com/oauth/token', {
      client_id: config.clientId!, client_secret: config.clientSecret!,
      grant_type: 'authorization_code', redirect_uri: callback, code
    });
    const account = {
      user_id: tokens.user_id,
      public_key: tokens.public_key,
      site_id: tokens.site_id
    };
    return { tokens, account };
  }
  if (provider === 'stripe') {
    const tokens = await tokenRequest('https://connect.stripe.com/oauth/token', {
      client_secret: config.clientSecret!,
      code,
      grant_type: 'authorization_code'
    });
    return {
      tokens,
      account: { stripe_user_id: tokens.stripe_user_id, scope: tokens.scope }
    };
  }
  if (provider === 'paypal') {
    const tokens = await tokenRequest(
      `${paypalApiBase()}/v1/oauth2/token`,
      { code, grant_type: 'authorization_code' },
      `${config.clientId}:${config.clientSecret}`
    );
    const accessToken = typeof tokens.access_token === 'string' ? tokens.access_token : '';
    if (!accessToken) throw new Error('PayPal did not return an access token.');
    const response = await fetch(
      `${paypalApiBase()}/v1/identity/openidconnect/userinfo/?schema=openid`,
      { headers: { Authorization: `Bearer ${accessToken}`, Accept: 'application/json' } }
    );
    const account = await response.json() as Record<string, unknown>;
    if (!response.ok || account.error) throw new Error('PayPal account lookup failed.');
    return { tokens, account };
  }
  if (provider === 'apple') {
    const tokens = await tokenRequest('https://appleid.apple.com/auth/token', {
      client_id: config.clientId!, client_secret: getAppleClientSecret(),
      code, grant_type: 'authorization_code', redirect_uri: callback
    });
    const identityToken = typeof tokens.id_token === 'string' ? tokens.id_token : '';
    if (!identityToken) throw new Error('Apple did not return an identity token.');
    const account = await verifyAppleIdentity(identityToken, config.clientId!, nonce);
    return { tokens, account };
  }
  throw new Error('Unsupported provider callback.');
}

export function registerIntegrationCallbacks(app: Express) {
  const paths = new Map<string, IntegrationProvider>();
  for (const provider of Object.keys(providerConfigs) as IntegrationProvider[]) {
    if (provider === 'whatsapp') continue;
    const uri = providerConfigs[provider].redirectUri;
    if (!uri) continue;
    const path = new URL(uri).pathname;
    if (path === '/') throw new Error(`OAuth callback path is invalid for ${provider}.`);
    const previous = paths.get(path);
    if (previous && previous !== provider) throw new Error('OAuth callback paths must be unique by provider.');
    paths.set(path, provider);
  }

  const callbackHandler = async (req: Request, res: Response) => {
    const provider = paths.get(req.path);
    if (!provider) {
      res.status(404).send('Unknown OAuth callback.');
      return;
    }
    res.set({
      'Cache-Control': 'no-store',
      'Referrer-Policy': 'no-referrer',
      'X-Content-Type-Options': 'nosniff'
    });

    let state: OAuthState | null = null;
    try {
      const error = typeof req.body?.error === 'string' ? req.body.error :
        typeof req.query.error === 'string' ? req.query.error : '';
      const stateValue = typeof req.body?.state === 'string' ? req.body.state :
        typeof req.query.state === 'string' ? req.query.state : '';
      if (stateValue) state = await consumeState(stateValue);
      if (!state || state.provider !== provider) throw new Error('Authorization state is invalid or expired.');
      if (error) throw new Error('Provider authorization was declined.');
      const code = typeof req.body?.code === 'string' ? req.body.code :
        typeof req.query.code === 'string' ? req.query.code : '';
      if (!code) throw new Error('Provider did not return an authorization code.');
      const result = await exchangeCode(
        provider,
        code,
        state.nonce,
        callbackUriForProvider(provider)
      );
      await saveConnection(state.userId, provider, result.tokens, result.account);
      res.type('html').send(callbackPage(state.origin, provider));
    } catch (error) {
      console.error(
        `OAuth callback failed for ${provider}:`,
        error instanceof Error ? error.message : 'Unknown callback error.'
      );
      const origin = state?.origin || appOrigin || 'http://localhost:3000';
      res.type('html').send(callbackPage(origin, provider, 'Não foi possível concluir a autorização. Confira a configuração e tente novamente.'));
    }
  };

  for (const path of paths.keys()) {
    app.get(path, callbackHandler);
    app.post(path, callbackHandler);
  }
}

export async function disconnectIntegration(userId: string, provider: IntegrationProvider) {
  await ensureSchema();
  await queryD1('DELETE FROM oauth_states WHERE user_id = ? AND provider = ?', [userId, provider]);
  const rows = await queryD1<{ encrypted_tokens: string }>(
    'SELECT encrypted_tokens FROM oauth_integrations WHERE user_id = ? AND provider = ?',
    [userId, provider]
  );
  const row = rows[0];
  if (row) {
    const tokens = decryptTokens(row.encrypted_tokens);
    if (provider === 'google' && typeof tokens.access_token === 'string') {
      const response = await fetch(`https://oauth2.googleapis.com/revoke?token=${encodeURIComponent(tokens.refresh_token as string || tokens.access_token)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      });
      if (!response.ok) throw new Error('Google did not revoke the connection.');
    }
    if (provider === 'stripe' && typeof tokens.stripe_user_id === 'string') {
      await tokenRequest(
        'https://connect.stripe.com/oauth/deauthorize',
        { client_id: providerConfigs.stripe.clientId!, stripe_user_id: tokens.stripe_user_id },
        providerConfigs.stripe.clientSecret!,
        true
      );
    }
    if (['facebook', 'instagram'].includes(provider) && typeof tokens.access_token === 'string') {
      const endpoint = provider === 'facebook'
        ? `https://graph.facebook.com/${graphVersion}/me/permissions`
        : 'https://graph.instagram.com/me/permissions';
      const response = await fetch(endpoint, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${tokens.access_token}` }
      });
      if (!response.ok) throw new Error('Provider did not revoke the connection.');
    }
    if (provider === 'apple' && typeof tokens.refresh_token === 'string') {
      const response = await fetch('https://appleid.apple.com/auth/revoke', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          client_id: providerConfigs.apple.clientId!,
          client_secret: getAppleClientSecret(),
          token: tokens.refresh_token,
          token_type_hint: 'refresh_token'
        })
      });
      if (!response.ok) throw new Error('Apple did not revoke the connection.');
    }
    if (provider === 'paypal' && typeof tokens.access_token === 'string') {
      await tokenRequest(
        `${paypalApiBase()}/v1/oauth2/token/terminate`,
        { token: tokens.access_token, token_type_hint: 'access_token' },
        `${providerConfigs.paypal.clientId}:${providerConfigs.paypal.clientSecret}`
      );
    }
  }
  await queryD1('DELETE FROM oauth_integrations WHERE user_id = ? AND provider = ?', [userId, provider]);
}

export async function getIntegrationAccessToken(userId: string, provider: IntegrationProvider) {
  await ensureSchema();
  const rows = await queryD1<{ encrypted_tokens: string; account_json: string }>(
    'SELECT encrypted_tokens, account_json FROM oauth_integrations WHERE user_id = ? AND provider = ?',
    [userId, provider]
  );
  const connection = rows[0];
  if (!connection) return provider === 'whatsapp' ? whatsAppEnvironmentToken() || null : null;

  const tokens = decryptTokens(connection.encrypted_tokens);
  const expiresAt = typeof tokens.expires_at === 'number' ? tokens.expires_at : null;
  if (!expiresAt || expiresAt > Date.now() + 60_000) {
    return typeof tokens.access_token === 'string' ? tokens.access_token : null;
  }

  let refreshed: Record<string, unknown> | null = null;
  if (
    (provider === 'google' || provider === 'google-photos' || provider === 'youtube') &&
    typeof tokens.refresh_token === 'string'
  ) {
    refreshed = await tokenRequest('https://oauth2.googleapis.com/token', {
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      refresh_token: tokens.refresh_token,
      grant_type: 'refresh_token'
    });
  } else if (provider === 'onedrive' && typeof tokens.refresh_token === 'string') {
    refreshed = await tokenRequest('https://login.microsoftonline.com/common/oauth2/v2.0/token', {
      client_id: process.env.MICROSOFT_CLIENT_ID!,
      client_secret: process.env.MICROSOFT_CLIENT_SECRET!,
      refresh_token: tokens.refresh_token,
      grant_type: 'refresh_token',
      scope: 'offline_access User.Read Files.Read'
    });
  } else if (provider === 'twitter' && typeof tokens.refresh_token === 'string') {
    refreshed = await tokenRequest(
      'https://api.x.com/2/oauth2/token',
      {
        refresh_token: tokens.refresh_token,
        grant_type: 'refresh_token',
        client_id: process.env.TWITTER_OAUTH_CLIENT_ID!
      },
      `${process.env.TWITTER_OAUTH_CLIENT_ID}:${process.env.TWITTER_OAUTH_CLIENT_SECRET}`
    );
  } else if (provider === 'mercado-pago' && typeof tokens.refresh_token === 'string') {
    refreshed = await tokenRequest('https://api.mercadopago.com/oauth/token', {
      client_id: process.env.MERCADOPAGO_CLIENT_ID!,
      client_secret: process.env.MERCADOPAGO_CLIENT_SECRET!,
      grant_type: 'refresh_token',
      refresh_token: tokens.refresh_token
    });
  } else if (provider === 'facebook' && typeof tokens.access_token === 'string') {
    const params = new URLSearchParams({
      grant_type: 'fb_exchange_token',
      client_id: process.env.FACEBOOK_APP_ID!,
      client_secret: process.env.FACEBOOK_APP_SECRET!,
      fb_exchange_token: tokens.access_token
    });
    const response = await fetch(`https://graph.facebook.com/${graphVersion}/oauth/access_token?${params}`);
    const data = await response.json() as Record<string, unknown>;
    if (!response.ok || data.error) throw new Error('Facebook token refresh failed.');
    refreshed = data;
  } else if (provider === 'instagram' && typeof tokens.access_token === 'string') {
    const response = await fetch(
      `https://graph.instagram.com/refresh_access_token?${new URLSearchParams({
        grant_type: 'ig_refresh_token',
        access_token: tokens.access_token
      })}`
    );
    const data = await response.json() as Record<string, unknown>;
    if (!response.ok || data.error) throw new Error('Instagram token refresh failed.');
    refreshed = data;
  }

  if (!refreshed) return null;
  const nextTokens: Record<string, unknown> = {
    ...tokens,
    ...refreshed,
    refresh_token: refreshed.refresh_token || tokens.refresh_token
  };
  await saveConnection(userId, provider, nextTokens, JSON.parse(connection.account_json) as Record<string, unknown>);
  return typeof nextTokens.access_token === 'string' ? nextTokens.access_token : null;
}

export function isIntegrationProvider(value: string): value is IntegrationProvider {
  return Object.hasOwn(providerConfigs, value);
}
