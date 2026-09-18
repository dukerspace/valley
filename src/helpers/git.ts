import { spawnSync } from 'node:child_process'

/** Run `git init` in `cwd`. Returns false if git failed (caller may continue). */
export function initGit(cwd: string): boolean {
  const git = spawnSync('git', ['init'], {
    cwd,
    encoding: 'utf8',
    stdio: 'inherit',
  })
  return git.status === 0
}
