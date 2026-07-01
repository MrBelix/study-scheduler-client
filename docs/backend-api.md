# Backend API

How this client talks to the StudyScheduler backend (a .NET Minimal API). The data layer in
`src/shared/api` already implements everything below — this documents the contract it mirrors.

## Base URL & environments

`VITE_API_URL` (build-time, baked into the bundle by Vite) selects where requests go:

| Environment | `VITE_API_URL` | How it reaches the API |
|---|---|---|
| Development | `/api` (`.env.development`) | Vite dev-server proxies `/api` → the local API (see `vite.config.ts`). No CORS, works over an https tunnel. |
| Production | the Azure App Service URL (`.env.production`) | The client calls the API **directly** (cross-origin). |

There is no route at `/` — endpoints live under `/students`, `/me`, etc.

> Vite env vars are **build-time**, so they must be set when the Static Web App builds (a committed
> `.env.*` file, or a GitHub Actions variable). Azure SWA "Application settings" do **not** reach the
> static bundle. Never put secrets here — the bundle is public.

## Authentication

The API has no login and no session. Every request carries the Telegram **init data**, signed by
Telegram at launch, in the `Authorization` header:

```
Authorization: tma <initData>
```

`shared/api/client.ts` attaches this automatically (via `getRawInitData()` from `shared/tg`). The
server re-validates the signature and freshness on every request.

## Error shapes

`ApiError` (`shared/api/errors.ts`) normalizes failures:

- **401 Unauthorized** — body `{ "error": "<code>" }`. Codes: `missing_data`, `invalid_signature`,
  `expired`, `unauthorized`. `expired` means the init data is stale → reopen the Mini App
  (`ApiError.isAuthExpired`).
- **400 Bad Request** — RFC 7807 ProblemDetails; per-field messages land in `ApiError.fields`, e.g.
  `{ "errors": { "Name": ["Name is required."] } }`.

## CORS (production)

In production the client and API are on different origins, so the **backend must allow this app's
origin**:

```
Cors__AllowedOrigins__0 = https://<this-static-web-app>.azurestaticapps.net
```

(Set in the API's App Service → Environment variables.) In development the proxy avoids CORS
entirely.

## Endpoint reference

The authoritative, always-current reference is the backend's **OpenAPI document** (Scalar UI at
`/scalar` on a Development instance) — it's generated from code, so it never drifts. All endpoints
require the `tma` auth header and are scoped to the current tutor automatically.
