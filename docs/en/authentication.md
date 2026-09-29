# Authentication

Valley ships dual auth: **User** (cookies) for the frontend and **Admin** (Bearer) for the backoffice. Both use JWTs signed with `JWT_SECRET` under the `/api/v1` prefix.

## User (frontend) — cookies

Login and refresh set HttpOnly cookies `valley_access_token` and `valley_refresh_token`. The frontend calls the API with `credentials: 'include'` and does not store tokens in `localStorage`.

API middleware accepts **Bearer** or the access cookie; the JWT must be typed `access` + `user`.

| Method | Path | Notes |
| --- | --- | --- |
| POST | `/api/v1/users` | Register |
| POST | `/api/v1/auth/login` | Sets cookies |
| POST | `/api/v1/auth/refresh` | Refresh session |
| POST | `/api/v1/auth/logout` | Clears cookies |
| GET / PATCH | `/api/v1/users/me` | Current user (auth required) |
| PUT | `/api/v1/password` | Change password (auth required) |
| POST | `/api/v1/password/forgot` | Request reset |
| POST | `/api/v1/password/reset` | Complete reset |

Client helpers live under `apps/frontend/src/lib/auth.ts` and `apps/frontend/src/lib/api.ts`.

## Admin (backoffice) — Bearer

Login and init return tokens in the JSON body (no cookies). The backoffice stores `valley_admin_access_token` / `valley_admin_refresh_token` in `localStorage` and sends `Authorization: Bearer …`.

Middleware requires **Bearer only**; JWT typed `access` + `admin`. Admin CRUD requires the `SUPER_ADMIN` role.

| Method | Path | Notes |
| --- | --- | --- |
| GET / POST | `/api/v1/admins/init` | First-run super-admin bootstrap |
| POST | `/api/v1/admins/login` | Returns tokens |
| POST | `/api/v1/admins/refresh` | Refresh |
| POST | `/api/v1/admins/forgot-password` | Request reset |
| POST | `/api/v1/admins/reset-password` | Complete reset |
| GET | `/api/v1/admins/me` | Current admin (Bearer) |
| CRUD | `/api/v1/admins/` | Admin accounts (super-admin) |
| CRUD | `/api/v1/admins/users` | User management (Bearer) |

Client helpers: `apps/backoffice/src/lib/auth.ts` and `apps/backoffice/src/lib/api.ts`.

## Password reset in development

There is no SMTP by default. Reset links are **logged to the API stdout**. Copy the URL from the console.

## Response envelopes

Successful payloads use shared types from `packages/shared` (`IResponseData`, `IResponsePaginate`, `IErrorResponse`).

## Related

- [API](api.md)
- [Environment](environment.md)
