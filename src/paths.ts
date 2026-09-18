import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))

export const PACKAGE_ROOT = resolve(__dirname, '..')

/** App template copied into new projects (not the CLI package root). */
export const TEMPLATE_ROOT = join(PACKAGE_ROOT, 'templates', 'valley')
