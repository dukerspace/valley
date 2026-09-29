# Environment variables

All apps and packages load a **single root** `.env` file. Copy the example and edit values before running the API:

```bash
cp .env.example .env
```

## Required

| Variable | Purpose |
| --- | --- |
| `DATABASE_URL` | PostgreSQL connection string for Prisma |
| `JWT_SECRET` | JWT signing secret (use a long random string in production; min 16 characters) |

## Apps and URLs

| Variable | Default | Purpose |
| --- | --- | --- |
| `API_HOST` / `API_PORT` / `API_URL` | `127.0.0.1` / `3001` / `http://127.0.0.1:3001` | Hono API bind and public URL |
| `FRONTEND_HOST` / `FRONTEND_PORT` / `FRONTEND_URL` | `127.0.0.1` / `3000` / `http://127.0.0.1:3000` | User app |
| `BACKOFFICE_HOST` / `BACKOFFICE_PORT` / `BACKOFFICE_URL` | `127.0.0.1` / `3002` / `http://127.0.0.1:3002` | Admin app |
| `VITE_API_URL` | `http://127.0.0.1:3001` | Browser-exposed API base (must use the `VITE_` prefix) |
| `CORS_ORIGIN` | frontend + backoffice origins | Comma-separated origins allowed by the API |
| `NODE_ENV` | `development` | Runtime mode |

## Optional packages

Blocks appear in `.env.example` only for packages selected at create time. Unselected `# --- Optional: <id> ---` sections are pruned during scaffold.

| Package | Variables |
| --- | --- |
| `ai` | `AI_PROVIDER`, `AI_MODEL`, `AI_BASE_URL`, plus provider keys (`OPENAI_API_KEY`, `ANTHROPIC_API_KEY`, `GOOGLE_GENERATIVE_AI_API_KEY`, `OPENROUTER_API_KEY`) |
| `stripe` | `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` |
| `email` | `RESEND_API_KEY`, `EMAIL_FROM` |
| `storage` | `S3_BUCKET`, `S3_REGION`, `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY` |

`AI_PROVIDER` accepts: `openai` | `anthropic` | `google` | `openrouter`.

## Tips

- Do not commit `.env`. Only `.env.example` is scaffolded (without secrets).
- Keep `VITE_API_URL` and `CORS_ORIGIN` aligned with how you run the apps locally or in deployment.
- See [Optional packages](optional-packages.md) for what each package exports.
