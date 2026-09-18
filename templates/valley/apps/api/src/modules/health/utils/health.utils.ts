import packageJson from '../../../../package.json'

export function getAppVersion(): string {
  return packageJson.version
}

export function getUptimeSeconds(): number {
  return process.uptime()
}

export function getRuntime(): string {
  return Bun.version
}

export function getTimestamp(): string {
  return new Date().toISOString()
}
