# API

The Hono API mounts versioned routes under `/api/v1` (see `apps/api/src/routes/v1-routes.ts`). Default listen URL: `http://127.0.0.1:3001`.

Root `GET /` returns the API name and a health hint.

## Modules

| Prefix | Module |
| --- | --- |
| `/api/v1/health` | `modules/health` |
| `/api/v1/users` | `modules/user` |
| `/api/v1/auth`, `/api/v1/password` | `modules/auth` |
| `/api/v1/admins` | `modules/admin` (includes nested `/users`) |

## Health

| Method | Path |
| --- | --- |
| GET | `/api/v1/health` |

## Users (public + authenticated)

| Method | Path | Auth |
| --- | --- | --- |
| POST | `/api/v1/users` | Public — register |
| GET | `/api/v1/users/me` | User |
| PATCH | `/api/v1/users/me` | User |

## Auth and password

| Method | Path | Auth |
| --- | --- | --- |
| POST | `/api/v1/auth/login` | Public |
| POST | `/api/v1/auth/refresh` | Public |
| POST | `/api/v1/auth/logout` | Public |
| PUT | `/api/v1/password` | User |
| POST | `/api/v1/password/forgot` | Public |
| POST | `/api/v1/password/reset` | Public |

## Admins

| Method | Path | Auth |
| --- | --- | --- |
| GET / POST | `/api/v1/admins/init` | Public (bootstrap) |
| POST | `/api/v1/admins/login` | Public |
| POST | `/api/v1/admins/refresh` | Public |
| POST | `/api/v1/admins/forgot-password` | Public |
| POST | `/api/v1/admins/reset-password` | Public |
| GET | `/api/v1/admins/me` | Admin Bearer |
| GET / POST | `/api/v1/admins/` | Super-admin |
| PATCH / DELETE | `/api/v1/admins/:id` | Super-admin |

## Admin user management

Mounted at `/api/v1/admins/users`:

| Method | Path | Auth |
| --- | --- | --- |
| GET | `/api/v1/admins/users` | Admin Bearer |
| POST | `/api/v1/admins/users` | Admin Bearer |
| GET | `/api/v1/admins/users/:id` | Admin Bearer |
| PATCH | `/api/v1/admins/users/:id` | Admin Bearer |
| DELETE | `/api/v1/admins/users/:id` | Admin Bearer |

## Contracts

Request/response Zod schemas and envelopes live in `packages/shared`. Handlers validate with `zValidator` and return `IResponseData` / `IResponsePaginate` shapes.

## Related

- [Authentication](authentication.md)
- [Project structure](project-structure.md)
