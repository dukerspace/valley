# Optional packages

At create time you can include `ai`, `stripe`, `email`, and `storage`. Core packages (`database`, `shared`, `ui`, `locale`) are always present.

```bash
bunx create-valley my-app --packages ai,email
```

Selected packages are linked into `apps/api`. Unselected directories are removed and matching `.env.example` blocks are pruned. See [CLI reference](cli.md).

## `@valley/ai` (or `@<name>/ai`)

Multi-provider AI adapter (OpenAI, Anthropic/Claude, Google Gemini, OpenRouter).

**Exports:** `createAiClient`, `createAiClientFromEnv`, provider helpers and types (`AiProvider`, `AiClient`, …).

**Env:** `AI_PROVIDER`, `AI_MODEL`, `AI_BASE_URL`, plus the key for the chosen provider (`OPENAI_API_KEY`, `ANTHROPIC_API_KEY`, `GOOGLE_GENERATIVE_AI_API_KEY`, or `OPENROUTER_API_KEY`).

## `@valley/stripe`

Stripe client stub for the API layer.

**Exports:** `createStripeClient` (includes a `ping()` stub).

**Env:** `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`.

## `@valley/email`

Resend-oriented email stub. In development, `sendEmail` logs to the console instead of calling Resend.

**Exports:** `createEmailClient`.

**Env:** `RESEND_API_KEY`, `EMAIL_FROM`.

## `@valley/storage`

S3-oriented storage stub (`upload`, `getUrl`).

**Exports:** `createStorageClient`.

**Env:** `S3_BUCKET`, `S3_REGION`, `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY`.

## Notes

- Package scope is renamed from `@valley` to `@<project-name>` during scaffold.
- Stubs are starting points — wire real SDKs in the API when you need production behavior.
- Configure env vars as described in [Environment](environment.md).
