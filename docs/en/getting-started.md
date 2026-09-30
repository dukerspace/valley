# Getting started

Scaffold a Bun + Turbo monorepo (Hono API, TanStack Start frontend + backoffice, Prisma) with **valley**.

## Requirements

- [Bun](https://bun.sh) `>=1.3.0`
- PostgreSQL

## Create a project

```bash
npx valley-cli new my-app
# or
bunx valley-cli new my-app
```

That merges `templates/valley` (apps, config, and `packages/`) with CLI playbooks (`.agents`, `.skills`, `.cursor/rules`) into `./my-app`, then runs `git init` and `bun install`.

The project name must be a lowercase npm slug (for example `my-app`).

## First run

```bash
cd my-app
cp .env.example .env
bun run db:migrate
bun run dev
```

Edit `.env` before starting the API — at least set a real `JWT_SECRET` and a working `DATABASE_URL`.

## Default URLs

| App | URL |
| --- | --- |
| Frontend (user) | http://127.0.0.1:3000 |
| API | http://127.0.0.1:3001 |
| Backoffice (admin) | http://127.0.0.1:3002 |

## Optional packages

During create (in a TTY), you can multiselect `ai`, `stripe`, `email`, and `storage`. Or pass them up front:

```bash
bunx valley-cli new my-app --packages ai,stripe
```

See [CLI reference](cli.md) and [Optional packages](optional-packages.md).

## Next steps

- [Environment variables](environment.md)
- [Authentication](authentication.md)
- [Project structure](project-structure.md)
- [Development scripts](development.md)
