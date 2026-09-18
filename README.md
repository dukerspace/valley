# create-valley

CLI that scaffolds a Bun + Turbo app from [`templates/valley`](templates/valley): Hono API, TanStack Start frontend + backoffice, and Prisma.

## Create a project

```bash
npx create-valley my-app
bunx create-valley my-app
bun run create-valley my-app
```

That copies `templates/valley` into `./my-app`, runs `git init`, and `bun install`. Then:

```bash
cd my-app
cp .env.example .env
bun run db:migrate
bun run dev
```

Requires [Bun](https://bun.sh) `>=1.3.0` (for the CLI and generated apps) and PostgreSQL.

### Options

| Flag | Description |
|---|---|
| `--no-install` | Skip `bun install` |
| `--no-git` | Skip `git init` |
| `--dry-run` | Print actions without writing files |
| `-v, --version` | Show CLI version |
| `-h, --help` | Show help |

The project name must be a lowercase npm slug (`my-app`).

## Generated app

| Path | Role |
|---|---|
| `apps/api` | Hono API (`http://127.0.0.1:3001`) |
| `apps/frontend` | User app — TanStack Start (`http://127.0.0.1:3000`) |
| `apps/backoffice` | Admin app — TanStack Start (`http://127.0.0.1:3002`) |
| `packages/database` | Prisma + PostgreSQL |
| `packages/ui` | Shared UI |
| `packages/shared` | Shared schemas, response envelopes, constants |
| `packages/locale` | i18n (`en`, `th`) |
| `.agents` | Agent role playbooks (backend, frontend, database, …) |
| `.skills` | Skill playbooks for AI-assisted development |

| Command | Description |
|---|---|
| `bun run dev` | Start all apps |
| `bun run build` | Build all packages |
| `bun run test` | Run tests |
| `bun run db:migrate` | Prisma migrate |

### Auth (included)

- Dual auth: **User** (cookies) and **Admin** (Bearer / localStorage)
- API prefix: `/api/v1`
- User register / login / me / forgot / reset / change password
- Admin init (first run) / login / forgot / reset / user CRUD
- Shared `IResponseData` / `IResponsePaginate` envelopes

In development, password-reset emails are **logged to the API stdout** (no SMTP). Copy the URL from the console.

Copy `.env.example` to `.env` and set `JWT_SECRET` before running the API.

## This repository

To try the scaffolder against the local template:

```bash
bun run create-valley my-app
# or
bun link
create-valley my-app
```
