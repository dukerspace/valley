---
name: project-structure
description: Monorepo map and placement rules for apps and packages. Use when deciding where new code belongs, navigating the Bun + Turbo workspace, or before multi-surface features.
paths:
  - '**/apps/**'
  - '**/packages/**'
---

# Project structure

## Workspace map

Bun + Turbo monorepo at the project root.

| Path | Role |
| --- | --- |
| `apps/api` | Hono API — `/api/v1`, port `3001` |
| `apps/frontend` | User app — TanStack Start, cookie auth, port `3000` |
| `apps/backoffice` | Admin app — TanStack Start, Bearer auth, port `3002` |
| `packages/database` | Prisma + PostgreSQL |
| `packages/shared` | Zod DTOs, response envelopes (`IResponseData`, `IResponsePaginate`, `IErrorResponse`), constants |
| `packages/ui` | Shared UI components and tokens |
| `packages/locale` | i18n catalogs (`en`, `th`) |
| `packages/ai` | Optional — multi-provider AI adapter (OpenAI, Claude, Gemini, OpenRouter; selected at create time) |
| `packages/stripe` | Optional — Stripe stub (selected at create time) |
| `packages/email` | Optional — Resend stub (selected at create time) |
| `packages/storage` | Optional — S3 stub (selected at create time) |

## Placement rules

- Put new product code in an existing app or package — do not invent a parallel top-level tree.
- UI apps (`frontend`, `backoffice`) must not import Prisma or `packages/database` directly.
- Shared request/response types and Zod schemas live in `packages/shared`.
- User-facing strings live in `packages/locale` — never hard-code copy in apps.
- Optional packages exist only when selected at scaffold time; do not assume they are present.
- Prefer surgical edits in the owning package over cross-cutting moves.

## Where to look first

| Need | Start here |
| --- | --- |
| HTTP routes / services | `apps/api` → `.skills/backend/SKILL.md` (Hono section) |
| User UI | `apps/frontend` → `.skills/frontend/SKILL.md` (TanStack Start section) |
| Admin UI | `apps/backoffice` → same frontend playbook |
| Schema / migrations | `packages/database` → `.skills/database/SKILL.md` |
| Contracts / envelopes | `packages/shared` → `.skills/shared/SKILL.md` |
| Copy / locales | `packages/locale` → `.skills/locale-translator/SKILL.md` |

## Handoffs

- Hono modules → `backend`
- DTOs / envelopes → `shared`
- Pages / components → `frontend`
- Prisma / SQL → `database`
- Keys / translations → `locale-translator`
- Multi-layer sequencing → `senior-software-staff`
