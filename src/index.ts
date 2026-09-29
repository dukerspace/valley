#!/usr/bin/env bun
/**
 * Scaffold a new project from templates/valley.
 *
 *   npx valley new <name>
 *   bunx valley new <name>
 *   bun run valley -- new <name>
 */

import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { main } from './cli.ts'

const isDirectRun =
  typeof process.argv[1] === 'string' && resolve(process.argv[1]) === fileURLToPath(import.meta.url)

if (isDirectRun) {
  main().then((code) => process.exit(code))
}

export { main } from './cli.ts'
export { addPackages } from './add.ts'
export { createProject } from './create.ts'
export { HELP, printHelp } from './help.ts'
export { getVersion, printVersion } from './version.ts'
export { TEMPLATE_ROOT, PACKAGE_ROOT } from './paths.ts'
export { isValidProjectName } from './helpers/name.ts'
export { copyTemplate, stripScaffolding } from './helpers/template.ts'
