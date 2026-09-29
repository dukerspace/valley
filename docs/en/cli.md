# CLI reference

```text
create-valley <name> [options]
```

Also available as `npx create-valley`, `bunx create-valley`, or `bun run create-valley` from this repository.

## Arguments

| Argument | Description |
| --- | --- |
| `name` | Directory to create. Must be a lowercase npm slug (for example `my-app`). |

## Options

| Flag | Description |
| --- | --- |
| `--packages <list>` | Optional packages to include (`ai`, `stripe`, `email`, `storage`). Comma-separated. Skips the interactive picker. |
| `--no-install` | Skip `bun install` |
| `--no-git` | Skip `git init` |
| `--dry-run` | Print actions without writing files |
| `-v`, `--version` | Show CLI version |
| `-h`, `--help` | Show help |

## Package selection

Valid optional ids: `ai`, `stripe`, `email`, `storage`.

| Mode | Behavior |
| --- | --- |
| `--packages ai,stripe` | Include only those packages; skip the picker. |
| `--packages` with an empty list | Include none. |
| No `--packages` + TTY | Interactive multiselect (none selected by default). Cancel exits with code 1. |
| No `--packages` + non-TTY | Include none (no prompt). |

Core packages (`database`, `shared`, `ui`, `locale`) are always included. Unselected optional package directories are removed from the new project, and matching blocks are pruned from `.env.example`. Selected packages are linked into `apps/api`.

## What scaffolding does

1. Copy `templates/valley` into `./<name>` (skips `node_modules`, build caches, `.env` files except `.env.example`).
2. Apply optional package selection.
3. Rename the `@valley` scope to `@<name>`.
4. Optionally `git init` and `bun install`.

## Examples

```bash
npx create-valley my-app
bunx create-valley my-app --packages ai,stripe
bun run create-valley my-app --no-install --no-git
bunx create-valley my-app --dry-run
```

## Local development of the CLI

From the create-valley repository:

```bash
bun run create-valley my-app
# or
bun link
create-valley my-app
```
