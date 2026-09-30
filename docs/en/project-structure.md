# Project structure

Generated apps are a Bun + Turbo monorepo.

In the valley CLI repo, apps and shared packages live under `templates/valley/` (`apps/`, `packages/`), and agent playbooks live at repo-root `.agents` / `.skills` / `.cursor/rules`; `valley new` merges all of these into the new project. A repo-root `packages` symlink points at `templates/valley/packages` for convenience.

## Workspace map

| Path | Role |
| --- | --- |
| `apps/api` | Hono API — `/api/v1`, port `3001` |
| `apps/frontend` | User app — TanStack Start, cookie auth, port `3000` |
| `apps/backoffice` | Admin app — TanStack Start, Bearer auth, port `3002` |
| `packages/database` | Prisma + PostgreSQL |
| `packages/shared` | Zod DTOs, response envelopes (`IResponseData`, `IResponsePaginate`, `IErrorResponse`), constants |
| `packages/ui` | Shared UI components and tokens |
| `packages/locale` | i18n catalogs (`en`, `th`) |
| `packages/ai` | Optional — multi-provider AI adapter |
| `packages/stripe` | Optional — Stripe client stub |
| `packages/email` | Optional — Resend email stub |
| `packages/storage` | Optional — S3 storage stub |

Optional packages exist only when selected at create time.

## Placement rules

- Put new product code in an existing app or package — do not invent a parallel top-level tree.
- UI apps (`frontend`, `backoffice`) must not import Prisma or `packages/database` directly.
- Shared request/response types and Zod schemas live in `packages/shared`.
- User-facing strings live in `packages/locale` — never hard-code copy in apps.
- Prefer surgical edits in the owning package over cross-cutting moves.

## Where to look first

| Need | Start here |
| --- | --- |
| HTTP routes / services | `apps/api` |
| User UI | `apps/frontend` |
| Admin UI | `apps/backoffice` |
| Schema / migrations | `packages/database` |
| Contracts / envelopes | `packages/shared` |
| Copy / locales | `packages/locale` |

## Related

- [API](api.md)
- [Optional packages](optional-packages.md)
- [Localization](localization.md)
