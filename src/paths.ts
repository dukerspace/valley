import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))

export const PACKAGE_ROOT = resolve(__dirname, '..')

/** App template copied into new projects (not the CLI package root). */
export const TEMPLATE_ROOT = join(PACKAGE_ROOT, 'templates', 'valley')

/** Shared workspace packages merged into new projects at create time. */
export const SHARED_PACKAGES_ROOT = join(PACKAGE_ROOT, 'packages')

/**
 * CLI-repo roots merged into new projects (agent playbooks + cursor rules).
 * Relative paths under PACKAGE_ROOT.
 */
export const CLI_PLAYBOOK_PATHS = ['.agents', '.skills', '.cursor/rules'] as const
