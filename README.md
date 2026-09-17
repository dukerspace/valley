# @starter

Monorepo starter template ([dukerspace/starter](https://github.com/dukerspace/starter)) with Bun workspaces, Turbo, Hono API, TanStack Start frontend, and Prisma.

## Create a new project

```bash
git clone git@github.com:dukerspace/starter.git rezerch
cd rezerch
bun install
```

On first install (interactive TTY), you will be prompted:

```text
Project name [rezerch]:
```

Press Enter to accept the folder name, or type another lowercase slug. That rewrites:

- Root package `@starter` → `@rezerch`
- Workspaces `@starter/*` → `@rezerch/*`
- Related locale keys, DB name examples, and display titles

Then run `bun install` once more so workspace links match the new names.

### Rename later / non-interactive

```bash
bun run rename rezerch
bun install
```

### Keep the template name

Press Enter with name `starter`, or skip the prompt:

```bash
SKIP_STARTER_RENAME=1 bun install
```

CI and non-TTY installs skip the prompt automatically.

## Scripts

| Command | Description |
|---|---|
| `bun run dev` | Start all apps |
| `bun run build` | Build all packages |
| `bun run test` | Run tests |
| `bun run rename <name>` | Rename packages from `@starter` |
| `bun run db:migrate` | Prisma migrate |

Copy `.env.example` to `.env` and adjust values before running the API or database tools.
