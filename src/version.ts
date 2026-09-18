import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { PACKAGE_ROOT } from './paths.ts'

export function getVersion(): string {
  const pkg = JSON.parse(readFileSync(join(PACKAGE_ROOT, 'package.json'), 'utf8')) as {
    version?: string
  }
  return pkg.version ?? '0.0.0'
}

export function printVersion(out: (...args: unknown[]) => void = console.log): void {
  out(getVersion())
}
