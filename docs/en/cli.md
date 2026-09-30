# CLI reference

```text
valley new <name> [options]
valley add <pkg> [pkg...] [options]
```

Also available as `npx valley-cli`, `bunx valley-cli`, or `bun run valley --` from this repository.

## Commands

| Command | Description |
| --- | --- |
| `new <name>` | Scaffold a project directory. Must be a lowercase npm slug (for example `my-app`). |
| `add <pkg...>` | Add optional packages (`ai`, `stripe`, `email`, `storage`) to the **current** project directory. |

## Options

| Flag | Description |
| --- | --- |
| `--packages <list>` | (`new`) Optional packages to include. Comma-separated. Skips the interactive picker. |
| `--no-install` | Skip `bun install` |
| `--no-git` | (`new`) Skip `git init` |
| `--dry-run` | Print actions without writing files |
| `-v`, `--version` | Show CLI version |
| `-h`, `--help` | Show help |

## Package selection (`new`)

Valid optional ids: `ai`, `stripe`, `email`, `storage`.

| Mode | Behavior |
| --- | --- |
| `--packages ai,stripe` | Include only those packages; skip the picker. |
| `--packages` with an empty list | Include none. |
| No `--packages` + TTY | Interactive multiselect (none selected by default). Cancel exits with code 1. |
| No `--packages` + non-TTY | Include none (no prompt). |

Core packages (`database`, `shared`, `ui`, `locale`) are always included. Unselected optional package directories are removed from the new project, and matching blocks are pruned from `.env.example`. Selected packages are linked into `apps/api`.

## Adding packages later (`add`)

Run inside an existing valley project:

```bash
cd my-app
valley add ai
valley add ai stripe --no-install
```

| Mode | Behavior |
| --- | --- |
| `valley add ai stripe` | Add those packages (space- or comma-separated). |
| `valley add` + TTY | Interactive multiselect (already-installed packages hidden). |
| `valley add` + non-TTY | Error — package ids required. |

For each package, the CLI copies from the valley package sources, renames `@valley` to the project scope, links into `apps/api`, appends missing `.env.example` sections, and runs `bun install` (unless `--no-install`). Fails if `packages/<id>` already exists.

## What scaffolding does (`new`)

1. Copy `templates/valley` into `./<name>` (skips `node_modules`, build caches, `.env` files except `.env.example`).
2. Copy shared packages from `templates/valley/packages/` and CLI playbooks (`.agents`, `.skills`, `.cursor/rules`).
3. Apply optional package selection.
4. Rename the `@valley` scope to `@<name>`.
5. Optionally `git init` and `bun install`.

## Examples

```bash
npx valley-cli new my-app
bunx valley-cli new my-app --packages ai,stripe
bun run valley -- new my-app --no-install --no-git
bunx valley-cli new my-app --dry-run
cd my-app && valley add email storage
```

## Local development of the CLI

From this repository:

```bash
bun run valley -- new my-app
# or
bun link
valley new my-app
valley add ai
```
