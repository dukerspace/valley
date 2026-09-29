export const HELP = `valley

  Create a Bun + Turbo app from the valley template
  (Hono API, TanStack Start, Prisma).

Usage
  npx valley-cli new <name> [options]
  bunx valley-cli new <name> [options]
  bun run valley -- new <name> [options]
  valley add <pkg> [pkg...] [options]

Commands
  new <name>      Scaffold a project directory (lowercase slug, e.g. my-app)
  add <pkg...>    Add optional packages to the current project
                  (ai, stripe, email, storage)

Options
  --packages <list>
                  (new) Optional packages to include. Comma-separated.
                  Skips the interactive picker.
  --no-install    Skip bun install
  --no-git        (new) Skip git init
  --dry-run       Print actions without writing files
  -v, --version   Show version
  -h, --help      Show this help

Examples
  npx valley-cli new my-app
  bunx valley-cli new my-app --packages ai,stripe
  bun run valley -- new my-app --no-install --no-git
  valley add ai
  valley add ai stripe --no-install
`

export function printHelp(out: (...args: unknown[]) => void = console.log): void {
  out(HELP)
}
