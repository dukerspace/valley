---
name: backend
description: Backend playbook for API contracts, Hono module layout, trust-boundary validation, authorization, error/status mapping, and secret-safe logging. Use when working on server routes, services, handlers, auth, or API changes.
paths:
  - '**/apps/api/**'
  - '**/api/**'
  - '**/modules/**/{routers,handlers,services,repositories}/**'
  - '**/*.{service,controller,route,handler}.*'
---

# Backend

## Contract-first checklist

Before implementation, define:

- [ ] Method and path (or RPC name)
- [ ] Auth requirement (public / authenticated / role)
- [ ] Request shape and validation rules
- [ ] Success response shape and status
- [ ] Error statuses and client-safe messages
- [ ] Side effects (writes, emails, jobs)

Match existing routing, DTO, and error patterns in the repo.

## Hono — project structure

Applies to `apps/api`. Prefix: `/api/v1` via `appConfig.API_PREFIX` + `API_VERSION` in `apps/api/src/config/index.ts`. App wiring: `apps/api/src/app.ts`. Register new routers in `apps/api/src/routes/v1-routes.ts` — do not mount modules ad hoc elsewhere.

### Module layout

One folder under `apps/api/src/modules/<name>/`:

| Layer | Role |
| --- | --- |
| `routers/` | Thin Hono apps: paths, middleware, `zValidator`, handler refs |
| `handlers/` | Named `export async function` — read `c.req.valid(...)`, call service, map envelopes |
| `services/` | `class XService` + `export const xService = new XService()` |
| `repositories/` | `class XRepository` + `export const xRepository = new XRepository()` (Prisma via `packages/database`) |
| `utils/` | Optional module-local helpers |
| `index.ts` | Export `*Routes` only |

Match existing modules (`auth`, `user`, `admin`, `health`) before inventing a new shape.

- **Auth** — `modules/auth` exports `authRoutes` and `passwordRoutes`.
- **Admin** — `modules/admin/routers/index.ts` composes `adminRoutes` (nests `adminUsersRoutes` at `/users`).
- **Singletons** — no `create*Repository|Service|Router|Handlers` factories; services import repository singletons directly.

### Validation

Use `zValidator` from `apps/api/src/utils/validation.ts` on routers with Zod schemas from `@valley/shared`. Handlers read validated input via `c.req.valid('json' | 'query' | 'param')`.

### Responses

Use helpers in `apps/api/src/utils/response.ts`:

- `successResponse` → `IResponseData`
- `errorResponse` → `IErrorResponse`
- `paginatedResponse` → `IResponsePaginate`

Do not invent a parallel envelope. DTOs and Zod schemas come from `packages/shared` (see `.skills/shared/SKILL.md`).

### Auth middleware

- **User** — `middleware/auth.ts` (`authMiddleware`): cookie or Bearer; looks up `userRepository`.
- **Admin** — `middleware/admin-auth.ts` (`adminAuthMiddleware`, `requireAdminRole`): Bearer only; looks up `adminRepository`.

Never trust client-supplied ownership IDs; enforce authz in handlers/services before mutations.

### Tests

Service/unit tests live under `apps/api/tests/` mirroring `src/` (e.g. `tests/modules/auth/services/auth.service.test.ts`). Prefer `mock.module` on repositories, then dynamic-import the service.

## Workflow

1. Define the contract (checklist above).
2. Reuse or extend DTOs in `packages/shared`.
3. Trace the current handler → service → data access path; add or change repository → service → handler → router.
4. Export `*Routes` from the module `index.ts` and register in `v1-routes.ts` when adding a module.
5. Validate untrusted input on the router with `zValidator`.
6. Enforce authz before mutations or sensitive reads.
7. Map failures to stable statuses; do not leak internals.
8. Log for operators without secrets or PII dumps.
9. Verify with the smallest service or request test.
10. If responses expose user-facing copy, route keys through `locale-translator` and verify locale parity before done (or `Locale: N/A` with reason).

## Locale checklist (when copy changes)

- [ ] Client-safe display messages use locale keys, not hard-coded strings
- [ ] Keys exist in every active locale
- [ ] Locale parity test run when catalogs changed

## Validation and authz

- Reject malformed input early with clear field errors.
- Never trust client-supplied ownership IDs without a server check.
- Prefer deny-by-default for privileged operations.
- Keep authorization decisions close to the side effect.

## Error and status mapping

| Situation          | Typical status       |
| ------------------ | -------------------- |
| Bad input          | 400 / 422            |
| Unauthenticated    | 401                  |
| Forbidden          | 403                  |
| Missing resource   | 404                  |
| Conflict           | 409                  |
| Unexpected failure | 500 (opaque message) |

Reuse the project's error envelope if one exists.

## Logging without secrets

Never log passwords, tokens, API keys, raw auth headers, or full payment payloads. Redact or omit.

## Handoffs

- Schema / migrations / indexes → `database`
- DTOs / envelopes → `shared`
- UI consumption → `frontend`
- Placement / multi-app → `project-structure` / `senior-software-staff`
- User-facing catalogs → `locale-translator`
- Cross-cutting design → `senior-software-staff`
