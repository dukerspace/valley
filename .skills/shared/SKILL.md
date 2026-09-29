---
name: shared
description: Shared-package playbook for Zod DTOs, response envelopes, constants, and package exports. Use when changing packages/shared schemas, types, or contracts consumed by API and UI apps.
paths:
  - '**/packages/shared/**'
  - '**/schemas/**/*.ts'
---

# Shared (`packages/shared`)

Canonical request/response contracts for the monorepo. API handlers parse with these Zod schemas; frontends import the inferred DTO types. No OpenAPI in the template.

## Package layout

Under `packages/shared/src/`:

| Area | Path |
| --- | --- |
| Zod DTOs | `schemas/` (`user.ts`, `admin.ts`, `password.ts`, `health.ts`, `common.ts`) |
| Schema barrel | `schemas/index.ts` |
| Auth / misc types | `types/` |
| Envelopes, HTTP, constants | `utils/` (`response.ts`, `http.ts`, `message.ts`, `constant.ts`, `role.ts`) |
| Env parsers | `env.ts` |
| Root barrel | `index.ts` |

Package exports (see `package.json`): `.`, `./schemas`, `./utils`, `./types`, `./env`.

## Schema conventions

- Define a Zod schema and export an inferred DTO: `createUserSchema` → `type CreateUserDto = z.infer<typeof createUserSchema>`.
- Re-export new schemas from `schemas/index.ts` (and the root barrel when needed).
- Reuse `paginationQuerySchema`, `idParamSchema`, and other helpers in `schemas/common.ts` before inventing parallel shapes.
- Do not put Prisma models or `packages/database` imports in shared.
- Do not put user-facing copy here — that belongs in `packages/locale`.

## Response envelopes

Reuse types in `utils/response.ts` — do not invent a parallel envelope:

- `IResponseData`
- `IResponsePaginate`
- `IErrorResponse` / `IErrorMessage`
- `IApiResponse` (legacy/generic)

API response helpers in `apps/api` map onto these shapes.

## Workflow

1. Confirm the contract change (request, response, or both).
2. Add or extend Zod schemas and DTO types in `schemas/`.
3. Export from `schemas/index.ts`.
4. Consume from API handlers (`.parse`) and UI apps (types / occasional client parse).
5. Run focused shared package tests when schemas change (`bun test` in `packages/shared`).

## Handoffs

- Handler / routing wiring → `backend`
- UI consumption → `frontend`
- Persistence / Prisma → `database`
- Placement / multi-app → `project-structure`
- Display catalogs → `locale-translator`
