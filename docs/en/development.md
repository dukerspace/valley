# Development

Day-to-day commands and ports for a generated valley app.

## Scripts (repo root)

| Command | Description |
| --- | --- |
| `bun run dev` | Start all apps via Turbo |
| `bun run build` | Build all packages |
| `bun run typecheck` | Typecheck workspace |
| `bun run test` | Run tests |
| `bun run lint` | Lint |
| `bun run format` | Prettier write |
| `bun run format:check` | Prettier check |
| `bun run db:generate` | Prisma generate |
| `bun run db:validate` | Prisma validate |
| `bun run db:migrate` | Prisma migrate (dev) |

Database scripts target `packages/database` (`@valley/database` or `@<name>/database`).

## Ports

| App | Default URL |
| --- | --- |
| Frontend | http://127.0.0.1:3000 |
| API | http://127.0.0.1:3001 |
| Backoffice | http://127.0.0.1:3002 |

Override via the root `.env` — see [Environment](environment.md).

## Typical loop

```bash
cp .env.example .env   # once
bun run db:migrate
bun run dev
```

1. Set `DATABASE_URL` and `JWT_SECRET`.
2. Migrate the schema.
3. Start the stack and open the frontend / backoffice URLs.

## Password reset emails

In development, reset emails are **logged to the API stdout** (no SMTP). Copy the reset URL from the console.

## First admin

Use `GET`/`POST` `/api/v1/admins/init` (or the backoffice init flow) to create the first super-admin. See [Authentication](authentication.md).

## Requirements

- Bun `>=1.3.0`
- PostgreSQL reachable at `DATABASE_URL`
