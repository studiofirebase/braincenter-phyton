# Cérebro Central service actions

Authenticated admins can execute enabled services with:

```http
POST /api/v1/admin/cerebro-services/{serviceId}/execute
Authorization: Bearer <admin-session>
Content-Type: application/json

{"args": {}, "confirm": false}
```

The caller must obtain explicit approval before setting `confirm` to `true`.
Invalid IDs and disabled services are rejected. Read-only operations do not need
confirmation; any write, destructive operation, message, e-mail, SMS, scheduled
action, or payment does. Payment calls require an idempotency key. PayPal orders
are created but never captured.

| Service | Arguments (`args`) | Execution |
| --- | --- | --- |
| `createAdminAccount` | `name`, `email`, `username`, `password` | Creates a D1 admin; superadmin only. |
| `manageContentMenu` | `action`: `list`, `create_theme`, `update_theme`, `delete_theme`, `create_item`, `update_item`, `delete_item`; action-specific `id`, `title`, `themeId`, `patch` | Stores admin menu data in `profile_settings.cerebroContentMenu`. |
| `manageFeedPosts` | `action`: `list`, `create`, `publish`, `update`, `unpublish`, `delete`; action-specific `id`, `caption`, `mediaUrl`, `patch` | Reads and writes this admin's D1 `media_collection` posts. |
| `manageAdminSettings` | `action`: `get` or `update`; `profilePatch`, `conversationPatch` | Reads or updates allowlisted admin profile and conversation settings. |
| `getUserInfo` | `userId` or `email` | Returns basic account information, never password hashes. |
| `checkSubscription` | `userId` or `email` | Reads the Cérebro Central entitlement ledger. |
| `giftSubscriptionDays` | `email`, `days` (1–365) | Creates or extends an entitlement for an existing D1 user. |
| `sendSecretChatTextMessage` | `chatId`, `text` | Persists a message in the admin's secret chat. |
| `deleteSubscriber` | `subscriptionId` | Cancels an active entitlement. |
| `cleanupExpiredSubscribers` | none | Marks expired active entitlements. |
| `purgeExpiredSubscribers` | optional `olderThanDays` (30–3650; default 90) | Permanently removes old expired entitlements. |
| `resendAccountConfirmationEmail` | `email` | Generates a 24-hour confirmation token and sends it through SMTP. |
| `resendMfaOtp` | none | Sends SMS using configured Twilio Verify to the authenticated admin's stored phone. |
| `sendMessage` | `channel`, `recipient`, `text` | Sends a text through a connected WhatsApp, Facebook Messenger, or Instagram account. |
| `broadcastMessage` | `channel`, `recipients` (1–50 explicit IDs), `text` | Sends individually to the explicitly supplied recipients. |
| `scheduleTask` | `taskType: "sendMessage"`, `channel`, `recipient`, `text`, future ISO `runAt` | Persists a task; the local server processes due tasks every 30 seconds. |
| `schedulePublication` | `postId`, future ISO `runAt` | Schedules an existing D1 feed post for public visibility. |
| `sendEmail` | `recipient`, `subject`, `text` | Sends through configured SMTP. |
| `createPixPayment` | `payerEmail`, `amount`, optional `currency: "BRL"`, `idempotencyKey` | Creates a PIX charge through connected Mercado Pago. |
| `createPayPalPayment` | `amount`, optional three-letter `currency`, `idempotencyKey` | Creates a PayPal checkout order without capture. |
| `getExclusiveContent` | none | Lists this admin's private/exclusive D1 media. |
| `getReviews` | optional `status`: `pending`, `approved`, or `rejected` | Lists reviews. |
| `getPlatformStats` | none | Returns aggregate user, post, review, entitlement, and message counts. |
| `getSystemStatus` | none | Returns D1, integration, queue, and automation status. |
| `sendPasswordReset` | `email` | Creates and e-mails a single-use reset link through SMTP. |
| `verifyAdminIdentityMedia` | `userId`, HTTPS `mediaUrl`, optional `mediaType: "photo" \| "video"` | Records media for manual review; it never approves identity. |

Subscription entitlements are stored in `cerebro_subscriptions`; this ledger is
scoped per admin and is not a replacement for a connected external billing
provider. The public authentication flow does not automatically grant access
from this ledger. MFA SMS requires Twilio Verify configuration; e-mail delivery
requires SMTP configuration.
