# NEXPHONE — API Implementation Plan (Phase 1 Audit)

> **Status (updated 2026-10-12):** Phase 1 audit approved. **A0 (Foundation) and A1 (Auth) are implemented and verified**
> (78 passing tests, typecheck and build green). A2 is next. See `REFACTORING_PROGRESS.md` for results and **known gaps**,
> `API_DOCUMENTATION.md` for the migrated endpoints, and `API_TEST_COVERAGE.md`. Sections 1–9 below are the original
> audit and are intentionally left as the baseline; the checklist in §9 is **not** updated line by line, so use
> `REFACTORING_PROGRESS.md` as the source of truth for current status.
> Audit date: 2026-10-12. Scope: `nexphone-api`, plus API usage in `nexphone-admin` and `nexphone-web`.

Legend: ✅ working · 🟡 partial / mock-backed · ⚠️ risky or insecure · ❌ missing · ❓ not verified

---

## 1. Executive Summary

The most important finding changes the shape of the whole project:

> **The backend is not backed by MongoDB. Every endpoint reads and writes in-memory JavaScript arrays inside `app.ts`.**
> `mongoose` is only used in `config/database.ts` to open a connection. There are **zero Mongoose schemas or models**.
> If the DB connection fails, the API logs "running in standalone mock mode" and keeps serving seed data. All data is lost on every restart.

Consequences:

1. "Refactor into modules" is really **"build the persistence layer and modules at the same time"**. The existing code can't be moved as-is into a database.
2. Almost nothing has authentication or authorization. **Only `GET /api/auth/me` checks a token.** All admin routes are public.
3. The customer web app keeps cart, wishlist, addresses, notifications and orders in `localStorage`. It uses the API only for catalog, content, promotions, auth and (loosely) orders.
4. The admin app's login is purely client-side. `AuthContext` starts as authenticated with a hard-coded user.

Baseline results (measured):

| Check | Result |
|---|---|
| `npx tsc --noEmit` in `nexphone-api` | ✅ passes, 0 errors |
| `npm test` | ❌ no test script (`echo "Error: no test specified" && exit 1`); **0 tests exist** |
| `npm run build` | ❓ not executed, to avoid touching `dist/`; `tsc --noEmit` passes |
| Working tree | Clean (`git status` empty for `nexphone-api`) |
| Test framework / linter / validation library | None installed (no zod/joi, helmet, rate-limit, multer, supertest, vitest/jest) |

---

## 2. Current Backend Structure

```
nexphone-api/src/
  index.ts            33 lines   starts HTTP server first, connects DB async, graceful shutdown
  app.ts           7,299 lines   ALL routes, types, seed data, business logic
  config/env.ts      112 lines   flavor (dev/staging/prod) loader, typed config
  config/database.ts  22 lines   mongoose.connect only; falls back to "mock mode"
```

Dependencies: express 5, mongoose 9, jsonwebtoken, bcryptjs, cors, dotenv. TypeScript strict mode with `noUncheckedIndexedAccess`.

Rough `app.ts` layout (line ranges are approximate):

| Lines | Content |
|---|---|
| 1–230 | CORS, JSON parser, logger, `/`, `/api/health`, `/api/flavor`, `/api/devices`, `/api/dashboard/*` (static mock) |
| 320–700 | Products seed + CRUD |
| 700–940 | Brands seed + CRUD |
| 940–1385 | Inventory seed + adjust/threshold/movements |
| 1390–2400 | Orders seed + CRUD/status/cancel/metrics |
| ~2450–3630 | Customers seed + list/detail/status/metrics |
| 3635–4280 | Reviews seed + admin moderation |
| ~4280–4830 | Promotions seed + CRUD |
| ~4830–5650 | Homepage content (banners, featured, new arrivals, best sellers, promo sections) |
| ~5650–6140 | Notifications + order notification triggers |
| 6143–6530 | Admin profile / password / sessions / audit / cluster settings |
| 6531–7042 | Analytics (sales, revenue, best-sellers, customers, inventory, overview) |
| 7044–7299 | Customer auth (register, login, logout, forgot, reset, me) |

---

## 3. Endpoint Inventory (99 route handlers)

12 handlers (all `/api/analytics/*` and `/api/auth/*`) are also mounted a second time **without** the `/api` prefix.
Auth column = what the code enforces **today**.

### 3.1 System / legacy

| Method | Path | Auth today | Notes |
|---|---|---|---|
| GET | `/` | none | root banner |
| GET | `/api/health` | none | ✅ no DB status |
| GET | `/api/flavor` | none | exposes `corsOrigins`, port, flavor |
| GET | `/api/devices` | none | 🟡 static mock, VoIP-era leftover |
| GET | `/api/dashboard/metrics` | none | 🟡 static mock |
| GET | `/api/dashboard/revenue` | none | 🟡 static mock |
| GET | `/api/dashboard/orders` | none | 🟡 static mock, separate "orders" shape from `/api/orders` |

### 3.2 Auth (customer)

| Method | Path | Notes |
|---|---|---|
| POST | `/api/auth/register` (+alias) | 🟡 bcrypt OK; no format validation; no rate limit; hard-coded SF address and phone defaults; `emailVerified: true` is faked |
| POST | `/api/auth/login` (+alias) | ⚠️ **backdoor:** any seeded customer without `passwordHash` accepts `Password123!`. Also accepts phone as a login ID. No rate limit |
| POST | `/api/auth/logout` (+alias) | 🟡 no-op, no token revocation |
| POST | `/api/auth/forgot-password` (+alias) | ⚠️ **returns the reset code in the response body.** Unknown emails get the fixed code `849201` |
| POST | `/api/auth/reset-password` (+alias) | ⚠️ **code `849201` always resets the password** for any existing email, so this is full account takeover. In-memory code map |
| GET | `/api/auth/me` (+alias) | ✅ only route that verifies a JWT. Does not check `disabled` status |

### 3.3 Products

| Method | Path | Notes |
|---|---|---|
| GET | `/api/products` | 🟡 returns a bare array. Filters: `series`, `status`, `search`. **No pagination, sort, price/brand/spec filters, availability.** Returns drafts to the public |
| GET | `/api/products/:id` | ✅ by id or slug. Also returns unpublished and `costPrice` to the public ⚠️ |
| POST | `/api/products` | ⚠️ no auth, no validation, spreads the raw body into the record |
| PUT | `/api/products/:id` | ⚠️ no auth, no validation, id lookup by id only |
| DELETE | `/api/products/:id` | ⚠️ no auth, no referential checks |

Product shape (preserve): `colors[]`, `storageOptions[]` (capacity, ram, price, comparePrice, stock, sku), `specifications{display,processor,camera,battery,connectivity,dimensions}`, `model3D{modelUrl,…}`, `basePrice`, `costPrice`, `status`, `isFeatured`.

### 3.4 Brands

| Method | Path | Notes |
|---|---|---|
| GET | `/api/brands`, `/api/brands/:id` | 🟡 bare array; no associated-products endpoint |
| POST / PUT | `/api/brands`, `/api/brands/:id` | ⚠️ no auth |
| DELETE | `/api/brands/:id` | ⚠️ no auth, **no check for products referencing the brand** |

### 3.5 Inventory

| Method | Path | Notes |
|---|---|---|
| GET | `/api/inventory`, `/api/inventory/:id` | 🟡 filters: search, status, warehouse, onlyAlerts |
| POST | `/api/inventory/adjust` | ⚠️ no auth. Non-atomic read-modify-write; invalid `type` silently becomes a no-op; clamps negatives to 0 instead of rejecting |
| PUT | `/api/inventory/:id/threshold` | ⚠️ bug: `Number(x) ?? fallback` never falls back (NaN is not nullish) |
| GET | `/api/inventory-movements` | ✅ history, filter by `itemId`; no pagination |

Data duplication: **stock lives in two places.** `productsCatalog[].storageOptions[].stock` and `inventoryCatalog[].stockQuantity` are unrelated.

### 3.6 Orders

| Method | Path | Notes |
|---|---|---|
| GET | `/api/orders` | ⚠️ **no auth, returns every customer's orders** (the web app calls it for "my orders"). No pagination, no per-user scoping |
| POST | `/api/orders` | ⚠️ **trusts client-sent items, subtotal, discount, shipping, tax, total.** Defaults `payment.status: "paid"` with a fake transaction ID. No stock check or decrement. No coupon check. No auth. Falls back to a fake customer |
| GET | `/api/orders/:id` | ⚠️ no auth, no ownership check |
| POST | `/api/orders/:id/confirm` | ⚠️ no auth; no transition validation |
| PUT | `/api/orders/:id/status` | ⚠️ no auth; **accepts any status string**, no state machine. Called from the customer web app |
| POST | `/api/orders/:id/cancel` | ⚠️ no auth; cancels in any state, even delivered; auto-marks payment `refunded` (fake refund) |
| GET | `/api/orders-metrics` | ⚠️ bug: reads `o.totalAmount`, but `POST /api/orders` writes `total`, so revenue becomes `NaN` for new orders |

### 3.7 Customers (admin)

| Method | Path | Notes |
|---|---|---|
| GET | `/api/customers`, `/api/customers/:id` | ⚠️ **public; spreads the whole record, so `passwordHash` is leaked** (confirmed: `{...c}`). No pagination |
| PATCH + PUT | `/api/customers/:id/status` | ⚠️ no auth; **duplicate handlers** with identical bodies. Disabling is not enforced on already-issued tokens |
| GET | `/api/customers-metrics` | 🟡 |

### 3.8 Reviews

| Method | Path | Notes |
|---|---|---|
| GET | `/api/reviews`, `/:id`, `/api/reviews-metrics` | 🟡 admin-oriented. ❓ unverified whether the list is limited to approved reviews for the public |
| DELETE | `/api/reviews/:id` | ⚠️ no auth |
| PATCH | `/api/reviews/:id/status` | ⚠️ no auth (moderation) |
| POST | `/api/reviews/:id/dismiss-report` | ⚠️ no auth |
| — | create / update own / report review | ❌ missing |

### 3.9 Promotions

| Method | Path | Notes |
|---|---|---|
| GET | `/api/promotions`, `/:id`, `/api/promotions-metrics` | 🟡 public GET exposes all promotions (incl. inactive) ❓ |
| POST / PUT / DELETE / PATCH `:id/status` | `/api/promotions…` | ⚠️ no auth |
| — | validate coupon / calculate discount / usage tracking | ❌ missing. The web CartContext has no matching promo/coupon logic, so the discount source is ❓ unverified |

### 3.10 Homepage content

`GET/POST/PUT/DELETE` for each of `banners`, `featured`, `new-arrivals`, `best-sellers`, `promo-sections` (20 handlers) plus `GET /api/content/metrics`.
🟡 Working CRUD used by both frontends. Writes are ⚠️ unauthenticated, with no URL validation. There is no dedicated reorder or publish endpoint (order is a `displayOrder` field set through PUT).

### 3.11 Notifications

| Method | Path | Notes |
|---|---|---|
| GET | `/api/notifications` | 🟡 admin-style "all notifications" list; **no per-user recipient scoping** |
| POST | `/api/notifications/send` | ⚠️ no auth; admin broadcast |
| PUT / DELETE | `/api/notifications/:id` | ⚠️ no auth |
| POST | `/api/notifications/:id/resend` | ⚠️ no auth |
| GET / PUT | `/api/notifications/triggers[/:id]` | 🟡 |
| GET | `/api/notifications/metrics` | 🟡 |

The customer web app does **not** use these. It generates notifications in `localStorage`.

### 3.12 Admin profile / settings

| Method | Path | Notes |
|---|---|---|
| GET | `/api/admin/profile` | ⚠️ **public; returns `apiKeyFull`** (a live-looking secret), sessions, audit logs, settings |
| PUT | `/api/admin/profile` | ⚠️ no auth; single global profile object |
| POST | `/api/admin/change-password` | ⚠️ **never verifies the current password and never stores the new one**; only updates a timestamp |
| POST | `/api/admin/rotate-token` | ⚠️ `Math.random()` token, public |
| GET / DELETE / POST | `/api/admin/sessions…` | 🟡 fake session list (hard-coded devices) |
| GET | `/api/admin/audit-logs` | 🟡 hard-coded IP `192.168.1.104` in all entries |
| GET / PUT | `/api/admin/settings` | 🟡 "cluster/VoIP" settings (heartbeat, media ingestion), **not store/shipping/payment settings** |
| POST | `/api/admin/logout` | 🟡 audit entry only |
| — | admin login, admin CRUD, roles | ❌ missing |

### 3.13 Analytics

`GET /api/analytics/{sales,revenue,best-sellers,customers,inventory,overview}` (+ non-`/api` aliases). 🟡 Not yet read in detail. Handlers are ~100–160 lines each. ❓ Whether they compute from `ordersStore` or return static mock data, and how they define revenue, still has to be verified before the analytics module is touched. No auth.

---

## 4. Feature-Group Gap Analysis (all 20)

| # | Group | Status | What exists | Main gaps |
|---|---|---|---|---|
| 1 | Authentication | 🟡/⚠️ | register, login, logout, forgot, reset, me (customer) | No middleware/RBAC; no refresh tokens; no rate limiting; **backdoor password and reset code**; reset code returned in the response; no change-password; no admin login/seed; no `role` in the model (`tier` only) |
| 2 | Users & profile | ❌/⚠️ | admin customer list/detail/status | No own-profile GET/PUT; **no address CRUD (web uses localStorage)**; no pagination; passwordHash leak |
| 3 | Products | 🟡 | CRUD, search, series/status filter | No pagination, sorting, price/brand/spec/availability filters, featured/new/best-seller endpoints, publish/unpublish endpoint; drafts and cost price exposed publicly; no validation |
| 4 | Brands | 🟡 | CRUD | No brand→products endpoint; delete is not guarded |
| 5 | Variants & specs | 🟡 | Embedded colors/storage/RAM/specs/model3D inside the product | No variant validation; no variant-level stock linkage; no image-upload handling; `model3D.modelUrl` is a string (OK) |
| 6 | Inventory | 🟡/⚠️ | list, adjust, threshold, movements | Not atomic; stock not linked to products/orders; no customer availability endpoint; no restock/low-stock dedicated endpoint (filter only); no reservation |
| 7 | Cart | ❌ | — | Client-only (`localStorage` in `CartContext`). No server cart, price recalculation or stock validation |
| 8 | Wishlist | ❌ | — | Client-only (`WishlistContext`) |
| 9 | Comparison | ❌ (OK) | — | Client-only (`CompareContext`). Recommend a **stateless `POST /compare`** over product IDs, no persistence |
| 10 | Promotions/coupons | 🟡/⚠️ | admin CRUD + list | No validate-coupon or eligible-discount calculation; no usage limits tracking or per-user usage; public exposure of inactive promos ❓ |
| 11 | Checkout & payment | ❌/⚠️ | `POST /api/orders` fakes it | No checkout validation; no server-side totals; no payment provider; no webhooks; payment defaults to "paid". **Payment methods "actually selected for the project" are unknown, see Open Question 1** |
| 12 | Orders | 🟡/⚠️ | CRUD-ish, status, cancel, metrics | No auth/ownership; no state machine; no stock effect; fake refund; revenue bug (`totalAmount` vs `total`); no pagination; web app mixes local and remote orders |
| 13 | Reviews | 🟡 | admin moderation | No customer create/update/delete-own/report; no verified-purchase check; no auth |
| 14 | Notifications | 🟡 | admin broadcast/list/triggers | No per-user inbox, mark-read, or customer delete; web generates its own locally; no real delivery (must be documented as not delivered) |
| 15 | Dashboard analytics | 🟡 ❓ | `/api/dashboard/*` static mock + `/api/analytics/*` | Dashboard endpoints are static mock; analytics derivation unverified; revenue definition needed |
| 16 | Homepage content | 🟡 | full CRUD for 5 section types | No auth; no URL validation; no dedicated reorder/publish; public GET returns inactive items ❓ |
| 17 | Reports | ❌ | `/api/analytics/*` partly overlaps | No CSV export; no order/customer/inventory reports as specified; admin `reports` page exists |
| 18 | Admin management | ❌/⚠️ | single hard-coded profile object | No admin accounts collection, roles, create/disable, last-admin guard; change-password is fake |
| 19 | File upload | ❌ | — | No multer/storage. All image/3D URLs are plain strings (`/models/*.glb` served by the web app) |
| 20 | Settings & health | 🟡 | `/api/health`, `/api/flavor`, `/api/admin/settings` | Health has no DB status; settings are VoIP/cluster ones, not store/shipping/payment; `incidentWebhookUrl` is seeded with a Slack-style URL |

Summary: **0 of 20 groups are fully implemented and secure.** 12 are partial (mock-backed CRUD), 6 are missing or client-only, and 2 are partial with serious issues (auth, orders).

---

## 5. Duplicates, Inconsistencies, Risks

### 5.1 Security (must fix first)

| # | Issue | Location |
|---|---|---|
| S1 | No auth/RBAC on any admin or customer-scoped route | everywhere except `/auth/me` |
| S2 | `passwordHash` returned from `GET /api/customers[/:id]` | `app.ts` ~3524 |
| S3 | Login backdoor: `Password123!` for seeded accounts | ~7159 |
| S4 | Reset code `849201` always valid, and code returned in the response | ~7214, ~7247 |
| S5 | `GET /api/admin/profile` exposes `apiKeyFull` | ~6213, ~6315 |
| S6 | `PUT /api/admin/change-password` doesn't verify/store anything | ~6358 |
| S7 | Orders created with client-supplied prices/totals/payment status | ~2193 |
| S8 | `JWT_SECRET` falls back to a hard-coded string when unset (`nexphone_fallback_secret_<flavor>`), and dev/staging env files use `nexpho…` values; **prod value begins with `change…`, looks like a placeholder** | `config/env.ts` ~99, `.env.*` |
| S9 | `.env.dev/.staging/.prod` are **tracked in git** (only `.env.example` should be). Contents were not printed; only key names were inspected | git |
| S10 | CORS allows every origin in dev; unmatched-origin errors surface as 500 | `app.ts` ~10 |
| S11 | No `helmet`, rate limiting, body-size limit config, or central error handler | — |
| S12 | Mass assignment: product POST/PUT spreads the raw body | ~661–688 |

### 5.2 Correctness bugs

- `orders-metrics` revenue `NaN` (`totalAmount` vs `total`).
- `inventory threshold` `Number() ?? fallback` bug.
- Inventory adjust: invalid `type` silently no-ops.
- Customer status update ignores token invalidation; `/auth/me` and login checks differ.
- Order status accepts arbitrary strings.

### 5.3 Duplicates / inconsistent contracts

- `PATCH` and `PUT` `/api/customers/:id/status`: identical copies.
- `/analytics/*` and `/auth/*` mounted both with and without `/api`.
- Two "orders" shapes: `/api/dashboard/orders` (display strings like `"$5,495.00"`, `"12 mins ago"`) vs `/api/orders`.
- Two stock sources (products vs inventory).
- **List endpoints return bare arrays; no pagination envelope anywhere.** Errors are `{ error: string, ... }`, and success shapes vary (`{success:true,…}`, raw record, `{item,movement}`).
- **URL conventions differ between clients:** admin uses `appConfig.apiUrl` (which already includes `/api`) as `${apiUrl}/products` in some services but `${apiUrl}/api/notifications` in others (a doubled `/api/api/…` risk). Web strips `/api` from the base and re-adds it.
- `"-metrics"` sibling routes (`/orders-metrics`, `/customers-metrics`, …) vs nested `/notifications/metrics`, `/content/metrics`.
- Legacy VoIP/device concepts remain (`/api/devices`, cluster settings, "satellite VoIP" bio text).

### 5.4 Frontend integration findings

| Area | Admin (`nexphone-admin`) | Web (`nexphone-web`) |
|---|---|---|
| Auth | **Client-side only**; default user is authenticated with no API call; sends no `Authorization` header (not verified for every call) | Real: login/register/logout/forgot/reset/me; JWT in `localStorage` |
| Products/brands/inventory/orders/customers/reviews/promotions/content/notifications/analytics/profile | Real `fetch` calls to the API (services exist for each) | Products, brands, promotions, content: real |
| Cart, wishlist, compare | n/a | `localStorage` only |
| Addresses, password change, notification inbox | n/a | `localStorage` only |
| Orders | Real API | **Hybrid**: POST then mirrors to `localStorage`; falls back to local-only orders if the API fails; calls `PUT /orders/:id/status` and `/cancel` from the customer UI |
| Uploads / 3D | `Phone3DViewer`, `View3DModal`, `PhoneFormModal` (3D URL entry) ❓ not inspected | `viewer` page ❓ not inspected |

Adding auth will break both frontends' unauthenticated calls. Frontend changes must be coordinated per module (Phase 5).

### 5.5 Not yet verified (flagged honestly)

I have read in full: auth, orders, products, brands (delete), inventory, customers, admin profile/settings, `app.ts` header, `index.ts`, config.
I have **only scanned by route signature**: reviews, promotions, content, notifications, analytics handlers. Their business logic, validation and the `/api/dashboard/*` numbers are ❓ and will be read before each is refactored.
I did not run the server, so nothing here is a runtime-tested claim. Findings are from reading the code.

---

## 6. Recommended Architecture

### 6.1 Principle: persistence first, preserve contracts

Because there are no models today, the sequence per module is:

1. Define the Mongoose model + indexes (shape taken from the existing `*Record` interface, so response contracts don't change).
2. Move routes → `routes/controller/service`. Keep the same path and the same response JSON.
3. Add auth/validation behind the existing path (the only intentional behavior change, which needs your approval per module because it affects frontends).
4. Seed script reproduces the current mock data into MongoDB, so the UIs keep showing data.
5. Tests, then compare old and new responses.

The in-memory seed arrays stay in place until a module is migrated, so un-migrated modules keep working.

### 6.2 Module boundaries (adapted from your suggestion)

```
src/
  app.ts                 Express config, security middleware, route registration only
  server.ts              (rename of index.ts, only if you approve; otherwise keep index.ts)
  config/                env.ts (keep), database.ts (make DB required in staging/prod), constants
  middleware/            authenticate, authorize(roles), validate(schema), rateLimit, errorHandler, notFound, requestId
  modules/
    auth/                customer + admin login, refresh, reset, change-password
    users/               customer profile + addresses + admin customer management
    admins/              admin accounts, roles, last-admin guard (was "admin")
    catalog/             products + variants/specs (one module; variants are embedded, so no separate module)
    brands/
    inventory/           stock, movements (atomic updates)
    cart/   wishlist/   comparison/
    promotions/          includes coupon validation + usage
    checkout/            pricing engine (single source for totals)
    payments/            provider interface + webhook handler
    orders/              state machine
    reviews/   notifications/
    analytics/  reports/  content/  uploads/  settings/
  utils/  types/  tests/
```

Deliberate deviations from your list (to avoid unnecessary files):
- **`products` + variants stay one module** (`catalog`), since variants are embedded in the product document today.
- **`admin` is renamed `admins`** (accounts), with admin self-profile living there. Admin settings go to `settings`.
- **`comparison` has no model**, only a stateless service.
- `checkout` owns the pricing function, and `cart`/`orders` call it, to avoid the circular dependency cart↔orders↔promotions.

Dependency direction (no cycles): `auth → users`; `catalog → brands`; `inventory → catalog`; `promotions → catalog`; `checkout → cart, catalog, inventory, promotions`; `orders → checkout, inventory, payments`; `reviews → orders, catalog`; `notifications ← orders, promotions` (via a small event/service call); `analytics, reports → orders, catalog, users, inventory`.

---

## 7. Implementation Order (adjusted from yours)

The audit changes your suggested order in two places: **security middleware precedes everything**, and **inventory comes with catalog** because stock must be atomic before orders exist.

| Step | Work | Why here |
|---|---|---|
| **A0** | Test harness, `app.ts`/`server.ts` split, central error handler, `helmet`, rate-limit, validation lib, DB-required config | Nothing else can be verified without tests |
| **A1** | **Auth module** (see §8): User model, middleware, RBAC, remove backdoors, admin seed | Blocks protecting every other route |
| A2 | Users/profile/addresses; admin customer endpoints (strip `passwordHash`, pagination) | Fixes S2 |
| B1 | Brands | Small; first CRUD pattern for the others to copy |
| B2 | Catalog (products, variants, filters, pagination, publish) | |
| B3 | Uploads | Needed by products/brands/content |
| B4 | Inventory (atomic) | |
| C1 | Promotions + coupon validation | Needed by pricing |
| C2 | Cart, wishlist, comparison | |
| D1 | Checkout pricing + Orders state machine | |
| D2 | Payments (provider abstraction) | |
| D3 | Reviews, notifications | |
| E | Content, analytics, reports, admin management, settings | |

Per-module gate (your rule): TypeScript clean → tests pass → old/new response comparison → docs updated → then continue.

---

## 8. Recommended First Module: Foundation + Auth

**Why this and not brands:** every other route needs `authenticate`/`authorize`, and four of the twelve critical security issues (S1, S3, S4, S8) live here. The auth module is also a small slice of `app.ts` (lines ~7044–7299), so it's a contained first step.

Planned scope (**existing paths and response shapes preserved**):

- Paths kept: `/api/auth/register|login|logout|forgot-password|reset-password|me` (+ the non-`/api` aliases, kept until you approve removal).
- Response contracts kept: `{ token, user }`, `{ success, message }`, `{ error }`.
- New: `User` Mongoose model with `role` (`customer`, `admin`, `super_admin`), `passwordHash`, `status`, hashed reset token with expiry, refresh token store, `tokenVersion`.
- **Intentional behavior changes (need your approval):**
  1. Remove the `Password123!` backdoor. Seeded accounts get a real hash from the seed script (demo password configured through env, **never in code**).
  2. Remove the `849201` code. Forgot-password stops returning the code in the response (the web reset page currently relies on that; in dev only, it can be exposed under an explicit `EXPOSE_RESET_CODE_IN_DEV` flag until real email is configured).
  3. Rate limits on login/register/forgot/reset.
  4. Register can't set a role; `accountType: "enterprise"` is kept as tier only.
  5. Disabled accounts rejected at login **and** on every authenticated request.
  6. `JWT_SECRET` required (no fallback) in staging/prod; refuse to start otherwise.
- New endpoints: `POST /api/auth/change-password`, `POST /api/auth/refresh` (if you want refresh tokens, see Open Question 3), `POST /api/auth/admin/login`, a `seed:admin` script reading credentials from env.

### Tests needed for this module

Tooling: `vitest` + `supertest` + `mongodb-memory-server` (no real data touched).

| Area | Cases |
|---|---|
| Register | success; duplicate email 409; weak/short password 400; invalid email 400; **`role: "admin"` in the body is ignored**; password stored hashed, never returned |
| Login | success; wrong password 401; unknown user 401 with the same message; disabled user 403; **`Password123!` no longer works on a seeded account without that password**; rate limit returns 429 |
| Tokens | missing/malformed/expired/forged token → 401; token for a disabled/deleted user rejected; wrong secret rejected |
| Authorization | customer token on an admin route → 403; no token → 401; admin token → 200 |
| Forgot/reset | unknown email gives the same response as a known one; code not in the response (prod); expired code rejected; used code can't be reused; **`849201` rejected**; password actually changes |
| Change password | requires the current password; wrong current → 400/401; new password works, old doesn't |
| Logout/refresh | (if approved) refresh token rotated; revoked after logout |
| Regression | response shapes of `register/login/me` match the pre-refactor snapshots; `/auth/*` alias still works |
| Startup | missing `JWT_SECRET` in prod aborts; DB unreachable in staging/prod fails fast |

---

## 9. Endpoint Status Checklist (summary, updated as work proceeds)

| Group | Implemented | Partial | Missing | Verified by tests |
|---|---|---|---|---|
| 1 Auth | 0 | 6 | 4+ | 0 |
| 2 Users | 0 | 3 | 6+ | 0 |
| 3 Products | 0 | 5 | 6+ | 0 |
| 4 Brands | 0 | 5 | 1 | 0 |
| 5 Variants | 0 | embedded | validation | 0 |
| 6 Inventory | 0 | 5 | 3 | 0 |
| 7 Cart | 0 | 0 | 5 | 0 |
| 8 Wishlist | 0 | 0 | 4 | 0 |
| 9 Comparison | 0 | 0 | 1 | 0 |
| 10 Promotions | 0 | 7 | 2 | 0 |
| 11 Checkout/Payment | 0 | 0 | all | 0 |
| 12 Orders | 0 | 7 | state machine, ownership | 0 |
| 13 Reviews | 0 | 5 | 3 | 0 |
| 14 Notifications | 0 | 8 | customer inbox | 0 |
| 15 Dashboard | 0 | 3 + 6 | unverified | 0 |
| 16 Content | 0 | 21 | reorder/publish | 0 |
| 17 Reports | 0 | 0 | all | 0 |
| 18 Admin mgmt | 0 | 11 (fake) | accounts | 0 |
| 19 Uploads | 0 | 0 | all | 0 |
| 20 Settings/Health | 0 | 3 | store/shipping/payment | 0 |

"Implemented" is 0 everywhere, because without persistence, auth and tests nothing can yet be claimed complete.

---

## 10. Open Questions (need your decision before Phase 2)

1. **Payment methods:** which are actually in scope (e.g. card via Stripe, ABA/KHQR, COD, bank transfer)? Checkout UI currently offers some; I'll map to the chosen provider(s), implement the provider interface, and document setup. Without credentials, only COD or "manual/pending" can honestly be marked as working.
2. **Database:** is a MongoDB instance available for dev/staging (local `mongod`, Docker, or Atlas)? The plan assumes yes. Tests use an in-memory server.
3. **Token strategy:** keep the current single 7-day JWT, or move to short access token + refresh token (httpOnly cookie)? The latter is more secure but requires frontend changes.
4. **Behavior changes in auth (§8):** OK to remove the backdoor password and `849201` reset code, and stop returning the reset code, given that the web reset flow depends on it today?
5. **Alias routes** (`/auth/*`, `/analytics/*` without `/api`): do any clients still use them? I'd keep them until you confirm.
6. **`.env.*` tracked in git:** do you want them untracked (`git rm --cached`) and the secrets rotated? I will not do this without approval.
7. **Legacy VoIP endpoints** (`/api/devices`, cluster settings): remove, or keep until the admin UI pages (`devices`, `telemetry`, `firmware`) are retired?
8. **File storage:** local disk (dev) + S3-compatible / Cloudinary (prod)? Which provider?
9. **Email:** is there a provider (SMTP/SES/Resend) for password reset and notifications? If not, the docs will state that nothing is emailed.
10. **Response envelope:** keep bare arrays and ad-hoc shapes for existing endpoints (my recommendation, no breaking changes), and use `{ data, meta:{page,limit,total} }` only on **new or opt-in paginated** endpoints (e.g. `?page=` triggers the envelope)?

---

## 11. Next Steps

On approval I'll start with **A0 + A1** (test harness, structure split, Foundation + Auth), then update `API_DOCUMENTATION.md`, `REFACTORING_PROGRESS.md` and `API_TEST_COVERAGE.md` (to be created at that point; they don't exist yet and there's no prior convention besides `FLAVORS.md`).
