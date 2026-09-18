import { spawnSync } from 'node:child_process'

export function hasBun(): boolean {
  const result = spawnSync('bun', ['--version'], { encoding: 'utf8' })
  return result.status === 0
}
