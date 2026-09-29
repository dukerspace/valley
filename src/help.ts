export const HELP = `create-valley

  Create a Bun + Turbo app from the valley template
  (Hono API, TanStack Start, Prisma).

Usage
  npx create-valley <name> [options]
  bunx create-valley <name> [options]
  bun run create-valley <name> [options]

Arguments
  name            Directory to create (lowercase slug, e.g. my-app)

Options
  --packages <list>
                  Optional packages to include (ai, stripe, email, storage).
                  Comma-separated. Skips the interactive picker.
  --no-install    Skip bun install
  --no-git        Skip git init
  --dry-run       Print actions without writing files
  -v, --version   Show version
  -h, --help      Show this help

Examples
  npx create-valley my-app
  bunx create-valley my-app --packages ai,stripe
  bun run create-valley my-app --no-install --no-git
`

export function printHelp(out: (...args: unknown[]) => void = console.log): void {
  out(HELP)
}
