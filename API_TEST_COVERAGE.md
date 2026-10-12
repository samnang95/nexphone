# NEXPHONE — API Test Coverage

Last updated: 2026-10-12. Run: `cd nexphone-api && npm test` (vitest + supertest + an in-memory MongoDB, so no real database is touched; the first run downloads a `mongod` binary).

**Totals: 78 tests, 4 files, all passing** (measured). Modules covered: Foundation + Auth only. Every other endpoint has **0 tests**.

| File | Tests | Focus |
|---|---|---|
| `auth.test.ts` | 61 | Behaviour, validation, token security, authorization, regression |
| `auth.ratelimit.test.ts` | 6 | 429 behaviour (limit set to 3) |
| `auth.reset-no-expose.test.ts` | 3 | Password recovery with code exposure disabled |
| `config.test.ts` | 8 | JWT secret policy, database fail-fast policy |

## Endpoint coverage (migrated modules)

| Endpoint | Success | Validation | AuthN/AuthZ | Security / edge | Rate limit |
|---|---|---|---|---|---|
| `POST /api/auth/register` | ✅ shape, hashed password, enterprise tier, legacy `/auth` alias | ✅ missing fields, short/long password, bad email, malformed JSON | n/a | ✅ role/tier/status/tokenVersion injection ignored; ✅ case-insensitive duplicate 409 | ✅ |
| `POST /api/auth/login` | ✅ incl. phone login | ✅ missing fields | ✅ staff rejected on customer endpoint | ✅ wrong pw = unknown email (same response); ✅ `Password123!` rejected; ✅ disabled → 403 only after correct pw; ✅ ambiguous phone refused | ✅ failures only; success doesn't count; per-client |
| `POST /api/auth/admin/login` | ✅ | n/a | ✅ customer rejected with generic 401; ✅ disabled admin 403 | n/a | ✅ separate counter |
| `POST /api/auth/logout` | ✅ | n/a | ✅ revokes only the presented token; other session survives; works with no/garbage token | n/a | n/a |
| `POST /api/auth/forgot-password` | ✅ | n/a | n/a | ✅ identical for known/unknown; ✅ no fixed demo code; ✅ code hashed at rest; ✅ not issued to staff; ✅ prod-like: never in response, warning logged | ✅ |
| `POST /api/auth/reset-password` | ✅ + single-use | ✅ short password, malformed code, missing fields | n/a | ✅ `849201` rejected (with and without a pending code); ✅ expired code; ✅ 5-guess lockout (right code afterwards still fails); ✅ all sessions revoked | ✅ |
| `GET /api/auth/me` | ✅ | n/a | ✅ none/malformed/forged-secret/expired/`alg:none`/legacy-claims/non-ObjectId `sub`/deleted user → 401; ✅ disabled → 403 | ✅ | n/a |
| `POST /api/auth/change-password` | ✅ old pw dead, new works, fresh token works, old token revoked | ✅ wrong current, same password, mismatched confirm, short | ✅ requires token | n/a | n/a |

### Middleware / foundation

| Area | Covered |
|---|---|
| `authenticate` + `requireAdmin` | ✅ 401 none, 403 customer, 200 admin & super_admin, role read from DB (demoted admin loses access with the same token) |
| Error handler | ✅ JSON 404 for unknown routes, `INVALID_JSON`, validation shape. ⚠️ Not individually unit-tested: 413, Mongoose CastError, duplicate-key mapping (the latter exercised only indirectly) |
| `requireDatabase` | ✅ 503 `DB_UNAVAILABLE` when disconnected |
| Security headers | ✅ `nosniff`, no `x-powered-by` |
| `resolveJwtSecret` | ✅ staging/prod throw when missing/blank; dev fallback; configured value used; placeholder warns |
| `connectDatabase` | ✅ rejects in prod, warns in dev, honours `ALLOW_STANDALONE_MODE` |
| Untouched legacy endpoints | ✅ `/api/products` and `/api/health` still respond (regression smoke only) |
| Old vs new contract | ✅ `user` fields the web app reads exist on register/login/me (and on `/auth/*` alias) |

## Verified manually, outside the automated suite

Scripts live in the session scratch directory (not in the repo):
- Real-process startup: prod without DB exits 1; opt-out stays up; dev stays up; staging without `JWT_SECRET` exits 1.
- `seed:admin`: missing/weak/invalid input rejected; creation; non-overwrite on re-run; no-DB failure; password never printed.

## Not covered (honest list)

- **Concurrency:** the atomic reset-attempt counter and single-use code are designed for races but only tested sequentially.
- **Timing side channels** (dummy bcrypt on unknown users) are not measured.
- **Token lifetime configuration** (`JWT_EXPIRES_IN`) beyond the expired-token case.
- **TTL cleanup of revoked tokens** (relies on MongoDB's TTL monitor, which runs about every 60s; not asserted).
- **Frontend flows** (web login/forgot/reset pages, admin login): no browser or component tests; only `tsc`.
- **Automated test for the seed script and the startup policy through a real process** (manual only, see above).
- **All other modules** (products, brands, inventory, orders, customers admin, reviews, promotions, content, notifications, analytics, admin profile/settings): 0 tests. They are still unauthenticated mock endpoints.

## Baseline for comparison
Before this work: `npm test` was `echo "Error: no test specified" && exit 1`. There were 0 tests.
