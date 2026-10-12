# NEXPHONE API Documentation

> Only **migrated and verified** modules are documented here. Everything else in `nexphone-api` is still the
> original in-memory mock implementation (see `API_IMPLEMENTATION_PLAN.md` for its inventory and risks).
> Documented so far: **Foundation** (conventions) and **Auth**.

Base URL: `http://localhost:4000` (dev). The frontends use `NEXT_PUBLIC_API_URL` (which ends in `/api`).

---

## 1. Conventions

### Errors
All errors from migrated modules are JSON:

```json
{ "error": "Human readable message", "code": "MACHINE_CODE", "details": [ { "path": "email", "message": "..." } ] }
```

`error` is always present (the existing frontends read `data.error`). `code` and `details` are optional.
Unexpected failures return `500 { "error": "Internal server error.", "code": "INTERNAL_ERROR" }` (a `detail` field is added in the dev flavor only). Stack traces are never returned.

| Status | Meaning | Typical `code` |
|---|---|---|
| 400 | Validation failed / malformed JSON / business rule | `VALIDATION_ERROR`, `INVALID_JSON`, `INVALID_RESET_CODE`, `INVALID_CURRENT_PASSWORD`, `PASSWORD_MISMATCH`, `PASSWORD_UNCHANGED` |
| 401 | Missing/invalid/expired/revoked token, or bad credentials | `TOKEN_REQUIRED`, `TOKEN_INVALID`, `INVALID_CREDENTIALS` |
| 403 | Authenticated but not allowed (role, suspended account, CORS) | `FORBIDDEN`, `ACCOUNT_DISABLED`, `CORS_BLOCKED` |
| 404 | Unknown route (JSON, not HTML) | `ROUTE_NOT_FOUND` |
| 409 | Conflict | `EMAIL_TAKEN`, `DUPLICATE` |
| 413 | Body too large | `PAYLOAD_TOO_LARGE` |
| 429 | Rate limited | `RATE_LIMITED` |
| 503 | Database not connected (DB-backed routes only) | `DB_UNAVAILABLE` |

Unmatched routes now answer a JSON 404 (previously Express's default HTML 404).

### Authentication
Send `Authorization: Bearer <token>`. Tokens are HS256 JWTs (issuer `nexphone-api`) with claims `sub` (user id), `role`, `ver` (token version), `jti`, `iat`, `exp`. Lifetime = `JWT_EXPIRES_IN` (default `7d`).

The server **re-loads the user on every authenticated request**, so these take effect immediately:
- logging out (that one token is revoked),
- changing or resetting the password (every other session is revoked),
- disabling the account (`403 ACCOUNT_DISABLED`),
- a role change (the role is read from the database, not trusted from the token).

Tokens issued by the old implementation (claims `id`/`email`/`tier`, no issuer) are **not accepted**. Users must sign in again once.

> **Not implemented:** refresh tokens. Pending your decision (plan, Open Question 3).

### Roles
`customer` · `admin` · `super_admin`. Roles can never be set through a public endpoint.

### Rate limiting
Per client IP, per endpoint. Defaults: **10 attempts / 15 min** (`AUTH_RATE_LIMIT_MAX`, `AUTH_RATE_LIMIT_WINDOW_MS`). Successful logins do not count. Responses include standard `RateLimit*` headers. In-memory counters: set `TRUST_PROXY` behind a reverse proxy; use a shared store before running multiple instances.

### Security headers
`helmet` is enabled (cross-origin resource policy relaxed to `cross-origin` so the web/admin apps can load media from the API).

---

## 2. Auth module

Mounted at `/api/auth` **and** the legacy alias `/auth` (kept for compatibility).
All routes answer `503 DB_UNAVAILABLE` if MongoDB is not connected.

User object returned by auth endpoints (no secrets, ever):

```json
{
  "id": "665f...", "customerNumber": "CUST-1A2B3C", "name": "Ada Lovelace",
  "email": "ada@example.com", "phone": "+1 555 010 2030", "company": "Acme",
  "tier": "Regular", "status": "active", "role": "customer",
  "avatarUrl": null, "createdAt": "2026-10-12T05:00:00.000Z"
}
```
Fields without a value are omitted. `role` is new (additive).

### POST `/api/auth/register`  · public · rate-limited

| Field | Type | Rules |
|---|---|---|
| `name` | string | required, 1–100 |
| `email` | string | required, valid email, stored lowercased |
| `password` | string | required, 8–72 chars (bcrypt limit) |
| `phone` | string | optional, 6–32 chars, digits/`+()-. ` |
| `accountType` | string | optional; `"enterprise"` ⇒ tier `Enterprise`, anything else ⇒ `Regular` |
| `company` | string | optional, ≤120 |

Unknown fields (`role`, `tier`, `status`, …) are **ignored**. Always creates `role: customer`, `status: active`.

- `201 { "token": "...", "user": { ... } }`
- `400` validation (`Full name, email, and password are required.` / `Password must be at least 8 characters long.` / …)
- `409 EMAIL_TAKEN` duplicate email (case-insensitive)

### POST `/api/auth/login`  · public · rate-limited (failures only)
Body: `{ "email": "<email or phone number>", "password": "..." }`. Phone login only works if exactly one customer has that number.
Customers only. Staff accounts receive the same generic 401 and must use `/admin/login`.

- `200 { "token", "user" }`
- `400` missing fields
- `401 INVALID_CREDENTIALS` identical for unknown email, wrong password, or wrong account type
- `403 ACCOUNT_DISABLED` `Account suspended: <reason>`, only revealed after the correct password

### POST `/api/auth/admin/login`  · public · rate-limited (failures only)  *(new)*
Same body and responses as `/login`, but accepts only `admin` / `super_admin`. Customers receive the generic 401.
> The admin dashboard UI is **not yet wired to this endpoint** (Phase 5).

### POST `/api/auth/logout`  · token optional
Revokes the presented token only (other sessions stay valid). Always `200 { "success": true, "message": "Logged out successfully" }`, even without or with an invalid token.

### POST `/api/auth/forgot-password`  · public · rate-limited
Body: `{ "email": "..." }`. Customers only.
Response is **identical whether or not the account exists**: `200 { "success": true, "message": "If an account matches this email, a 6-digit recovery code has been issued." }`.

> ⚠️ **No email provider is configured, so recovery codes are NOT delivered.**
> - **dev flavor:** the code is added to the response as `code` so the flow can be tested (disable with `EXPOSE_RESET_CODE_IN_DEV=false`). This makes known/unknown emails distinguishable in dev only.
> - **staging/prod:** the code is never returned; the server logs a warning that it was not delivered. **Password reset cannot be completed by end users until an email provider is integrated.**
>
> Codes: 6 digits, valid `RESET_CODE_TTL_MINUTES` (15), stored only as an HMAC, single-use, invalidated after 5 wrong guesses.

### POST `/api/auth/reset-password`  · public · rate-limited
Body: `{ "email", "code", "newPassword" }` (`newPassword` 8–72).

- `200 { "success": true, "message": "..." }`. Signs out every existing session.
- `400` `Invalid or expired recovery code. Please request a new code.` (unknown email, wrong/expired/used code, too many attempts. All indistinguishable)
- The previous hard-coded demo code (`849201`) **no longer works**.

### GET `/api/auth/me`  · authenticated
`200 { "user": { ... } }` · `401 TOKEN_REQUIRED | TOKEN_INVALID` · `403 ACCOUNT_DISABLED`

### POST `/api/auth/change-password`  · authenticated · rate-limited (failures only)  *(new)*
Body: `{ "currentPassword", "newPassword", "confirmPassword"? }`

- `200 { "success": true, "message": "...", "token": "<fresh token>" }`. All other sessions are revoked, so the client must store the returned `token`.
- `400` wrong current password / mismatch / same as current / invalid new password

---

## 3. Behaviour changes vs. the previous implementation (approved in plan §8)

| Before | Now |
|---|---|
| Seeded accounts accepted password `Password123!` | Removed |
| Reset code `849201` always valid; code returned in the response | Removed; random hashed single-use code; returned only in dev |
| `forgot-password` revealed whether an email exists (different message) | Identical response |
| Register hard-coded address/phone/`emailVerified: true`; fake "Enterprise Partner" company | No fabricated values; `emailVerified` is `false` |
| Disabled status revealed before the password was checked | Revealed only after the correct password |
| Logout was a no-op | Revokes the token |
| Tokens: 7 days hard-coded, claims `id/email/tier` | `JWT_EXPIRES_IN`, claims `sub/role/ver/jti`, algorithm and issuer pinned |
| No password max length | 72 max |
| Accounts lived in the in-memory customer list | Stored in MongoDB (`users`). **See known gap in `REFACTORING_PROGRESS.md`** |

---

## 4. Configuration reference (auth/foundation)

| Variable | Default | Notes |
|---|---|---|
| `JWT_SECRET` | dev only: built-in fallback | **Required** in staging/prod (process refuses to start). A value starting with `change`/`your_`/`replace` logs a warning |
| `JWT_EXPIRES_IN` | `7d` | |
| `BCRYPT_ROUNDS` | `12` | |
| `AUTH_RATE_LIMIT_MAX` / `AUTH_RATE_LIMIT_WINDOW_MS` | `10` / `900000` | |
| `RESET_CODE_TTL_MINUTES` | `15` | |
| `EXPOSE_RESET_CODE_IN_DEV` | `true` (dev only) | Ignored outside dev |
| `ALLOW_STANDALONE_MODE` | `false` | Lets staging/prod start without MongoDB (serves un-migrated in-memory modules). Not recommended |
| `TRUST_PROXY` | unset | e.g. `1` behind one proxy |

Startup: in **staging/prod** the process exits if MongoDB is unreachable (unless `ALLOW_STANDALONE_MODE=true`). In **dev** it only warns.

### Provisioning the first administrator

```bash
cd nexphone-api
ADMIN_SEED_EMAIL=owner@example.com \
ADMIN_SEED_PASSWORD='<at least 12 characters>' \
ADMIN_SEED_NAME='Owner' \
npm run seed:admin -- --flavor=dev
```

Creates a `super_admin`. Credentials are read only from the environment and never printed. Idempotent: an existing account is never modified (its password is not overwritten). Exits non-zero on invalid input or no database. Add `DEBUG_SEED=1` for a stack trace on failure.
