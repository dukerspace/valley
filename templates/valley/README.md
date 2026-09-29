# Valley app

Bun + Turbo monorepo: Hono API, TanStack Start frontend + backoffice, Prisma.

## Setup

```bash
cp .env.example .env
bun run db:migrate
bun run dev
```

Edit `.env` first — set `DATABASE_URL` and a real `JWT_SECRET` (min 16 characters).

Requires [Bun](https://bun.sh) `>=1.3.0` and PostgreSQL.

## URLs

| App | URL |
| --- | --- |
| Frontend (user) | http://127.0.0.1:3000 |
| API | http://127.0.0.1:3001 |
| Backoffice (admin) | http://127.0.0.1:3002 |

## Scripts

| Command | Description |
| --- | --- |
| `bun run dev` | Start all apps |
| `bun run build` | Build all packages |
| `bun run test` | Run tests |
| `bun run db:migrate` | Prisma migrate |

## Auth

- **User** — HttpOnly cookies on the frontend
- **Admin** — Bearer tokens in backoffice `localStorage`
- API prefix: `/api/v1`

In development, password-reset emails are logged to the API stdout (no SMTP).

## Docs

Full bilingual guides: [create-valley docs](https://github.com/dukerspace/valley/tree/main/docs)
