# NEXPHONE — Refactoring Progress

Last updated: 2026-10-12. Plan: `API_IMPLEMENTATION_PLAN.md`. API reference: `API_DOCUMENTATION.md`. Tests: `API_TEST_COVERAGE.md`.

## Status at a glance

| Step | Scope | Status |
|---|---|---|
| **A0** | Foundation: test harness, central error handling, validation, rate limiting, security headers, DB policy, config hardening | ✅ Done and verified |
| **A1** | Auth module (customer + admin login, RBAC middleware, token revocation, secure reset, change-password, admin seed) | ✅ Done and verified, **with known gaps below** |
| A2 | Users/profile/addresses; admin customer management | ⏳ Next |
| B–E | Everything else | ⏳ Not started. Still the original in-memory mock code |

## Verification results (measured, not assumed)

| Check | Result |
|---|---|
| `npm run typecheck` (API, includes tests) | ✅ exit 0 |
| `npm test` | ✅ **78 / 78 passed**, 4 files (baseline before this work: no tests existed) |
| `npm run build` | ✅ exit 0; tests are excluded from `dist/` (`tsconfig.build.json`) |
| Web `tsc --noEmit` after editing `auth.service.ts` | ✅ exit 0 |
| Real server process, prod flavor, no DB | ✅ logs the fatal error and **exits with code 1** |
| Real server, prod flavor + `ALLOW_STANDALONE_MODE=true` | ✅ stays up; `/api/products` 200, `/api/auth/login` 503 |
| Real server, dev flavor, no DB (normal local experience) | ✅ stays up; same behaviour as above |
| Real server, staging without `JWT_SECRET` | ✅ throws at startup, exit 1 |
| `npm run seed:admin` against a throwaway in-memory MongoDB | ✅ rejects missing/weak/invalid input; creates `super_admin` with a bcrypt hash; re-run does **not** overwrite the password; fails safely without DB; password never printed |

The three "real server" checks and the seed check were run with throwaway scripts (kept outside the repo); they are **not** part of the automated suite.

## Files changed

**Modified**
- `nexphone-api/src/app.ts`: removed the legacy in-memory auth block (old lines ≈7043–7300) and the then-unused `jsonwebtoken`/`bcryptjs` imports; added `helmet`, optional `TRUST_PROXY`, the auth router mount (`/api/auth` + legacy `/auth`), and the JSON 404 + error handler at the end. **Everything else in the file is untouched.** A pre-change copy is in git history (`git show HEAD:nexphone-api/src/app.ts`).
- `nexphone-api/src/config/env.ts`: `JWT_SECRET` required outside dev, new auth settings, exported `resolveJwtSecret`.
- `nexphone-api/src/config/database.ts`: DB required in staging/prod, `isDatabaseConnected()`.
- `nexphone-api/src/index.ts`: exit when a required database is unavailable.
- `nexphone-api/package.json` / `package-lock.json`: deps and scripts (`test`, `test:watch`, `typecheck`, `build` now uses `tsconfig.build.json`, `seed:admin`).
- `nexphone-web/services/auth.service.ts`: see "Frontend change" below.

**Added**
- `middleware/`: `auth.ts` (authenticate/authorize/requireAdmin), `errorHandler.ts`, `validate.ts`, `rateLimit.ts`, `requireDatabase.ts`
- `modules/auth/`: `auth.routes.ts`, `auth.controller.ts`, `auth.service.ts`, `auth.schemas.ts`, `token.service.ts`, `revokedToken.model.ts`
- `modules/users/user.model.ts`
- `utils/`: `httpError.ts`, `password.ts` · `types/express.d.ts` · `scripts/seedAdmin.ts`
- `tests/`: `setup.ts`, `helpers/db.ts`, `auth.test.ts`, `auth.ratelimit.test.ts`, `auth.reset-no-expose.test.ts`, `config.test.ts`
- `tsconfig.build.json`, `vitest.config.ts`
- New dependencies: `zod`, `helmet`, `express-rate-limit`; dev: `vitest`, `supertest`, `@types/supertest`, `mongodb-memory-server`

## Frontend change (needed so the backend fixes are not hidden)

`nexphone-web/services/auth.service.ts` previously caught **every** error, including API rejections, and then:
logged in demo emails with a fake token after a 401; showed "password reset successful" for any 6-digit code after a 400; and returned a fake recovery code. That would have masked all of the security fixes. Now offline fallbacks run only for genuine network failures (`TypeError`), the fake recovery/reset successes are replaced by a clear "unable to reach the server" error, logout sends the bearer token so it can be revoked, and `getMe()` clears the local session on 401/403. No markup or styling changed. **Not browser-tested**; only type-checked.

## Security issues from the audit: current state

| # | Issue | State |
|---|---|---|
| S3 | `Password123!` login backdoor | ✅ Fixed (test: `no longer accepts the old demo password`) |
| S4 | Reset code `849201` / code returned in response | ✅ Fixed (tests incl. production-like mode) |
| S8 | Hard-coded JWT fallback secret | ✅ Fixed for staging/prod; ⚠️ your `.env.prod` secret looks like a placeholder, so it now logs a warning. **Rotate it** |
| S10 | CORS rejection surfaced as 500 | ✅ now 403 JSON |
| S11 | helmet / rate limiting / central error handler | ✅ for auth; ⏳ rate limiting for other modules as they migrate |
| **S1** | **No auth on admin/customer-scoped routes** | ❌ **Still open.** The middleware exists and is tested, but it is applied to each module as it is migrated *together with* the frontend wiring; applying it now would break the admin dashboard, which sends no token |
| S2 | `passwordHash` leaked by `GET /api/customers` | ❌ Open (A2). The leaked hashes belong to the old in-memory seed accounts, not the new `users` collection |
| S5 | `GET /api/admin/profile` returns `apiKeyFull` | ❌ Open (E) |
| S6 | Admin change-password is fake | ❌ Open (E). Real `/api/auth/change-password` now exists |
| S7 | Orders trust client prices / mark paid | ❌ Open (D) |
| S9 | `.env.dev/.staging/.prod` tracked in git | ❌ Open: waiting for your decision |
| S12 | Mass assignment on product create/update | ❌ Open (B) |

## ⚠️ Known gaps and limitations (please read)

1. **Two customer stores now exist.** Auth uses the MongoDB `users` collection; the admin Customers pages still read the old in-memory `customersStore`. Consequences until **A2**: newly registered users do **not** appear in admin → Customers, and disabling a customer there does **not** block their login. Orders also still carry in-memory customer emails.
2. **Demo accounts no longer log in through the API.** The in-memory seed customers (e.g. `a.vance@blackmesa.io`) have no password in MongoDB and the `Password123!` backdoor is gone. Register a new account, or use the admin seed. A2 will add a proper dev seed for customers.
3. **Password reset cannot be completed by real users in staging/prod**: no email provider is configured, so the code is generated but never delivered (documented; the server logs this).
4. **No refresh tokens** (awaiting your decision). Sessions last `JWT_EXPIRES_IN` (7d) unless logged out.
5. **The admin dashboard is not wired to `/api/auth/admin/login`**, and its login is still client-side (Phase 5). An admin account can be created and used via the API, but the UI does not use it yet.
6. **Previously issued customer tokens are invalid**; everyone signs in once more.
7. **The web profile page's "change password" is still `localStorage`-only** and does not call `/api/auth/change-password` yet (A2/Phase 5).
8. **Rate-limit counters are per-process memory** (fine for one instance; use a shared store before scaling out).
9. **Mongoose `autoIndex`** creates the unique indexes on connect; fine now, revisit for large production collections.
10. `bufferCommands` is intentionally *not* disabled globally (it is import-order dependent). DB-backed routes use `requireDatabase` (503).
11. No browser/E2E testing of the web login flow was performed.

## Decisions I made without being asked (please confirm or correct)

- **Kept `index.ts` as the entry point** instead of renaming it to `server.ts` (scripts and docs reference it).
- **Treated "yes" as approval of plan §8**, i.e. removing the backdoor/demo code and the reset-code-in-response (kept only for the dev flavor behind a flag).
- **Did not** untrack the `.env.*` files, rotate secrets, remove aliases, or touch legacy VoIP endpoints. Those were open questions.
- **Token strategy:** kept a single access token (no refresh) with per-session revocation instead.

## Next steps

1. Your answers to the open questions (esp. payment methods, token strategy, `.env` handling).
2. **A2:** migrate customers to the `users` collection (admin list/detail/status with pagination, strip `passwordHash`), add `GET/PUT /me/profile` and address CRUD, add the customer dev seed, and protect those routes with `authenticate` + `requireAdmin`, wiring the admin dashboard login at the same time so nothing breaks.
3. Then B1 (brands) onward, per `API_IMPLEMENTATION_PLAN.md` §7.
