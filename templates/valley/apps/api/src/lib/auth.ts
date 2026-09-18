import type { JWTPayload } from '@valley/shared'
import { sign, verify } from 'hono/jwt'

const ACCESS_TTL_SECONDS = 60 * 60 // 1 hour
const REFRESH_TTL_SECONDS = 60 * 60 * 24 * 7 // 7 days

export type TokenScope = 'user' | 'admin'
export type TokenType = 'access' | 'refresh'

export type IssueTokenInput = {
  userId: string
  username: string
  scope: TokenScope
  role?: string
}

export async function hashPassword(password: string): Promise<string> {
  return Bun.password.hash(password, { algorithm: 'bcrypt', cost: 10 })
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return Bun.password.verify(password, hash)
}

function nowSeconds() {
  return Math.floor(Date.now() / 1000)
}

export async function issueTokens(
  secret: string,
  input: IssueTokenInput
): Promise<{ accessToken: string; refreshToken: string }> {
  const iat = nowSeconds()
  const base = {
    userId: input.userId,
    username: input.username,
    sub: input.userId,
    scope: input.scope,
    role: input.role,
    iat,
  }

  const accessToken = await sign(
    { ...base, tokenType: 'access' as const, exp: iat + ACCESS_TTL_SECONDS },
    secret,
    'HS256'
  )
  const refreshToken = await sign(
    { ...base, tokenType: 'refresh' as const, exp: iat + REFRESH_TTL_SECONDS },
    secret,
    'HS256'
  )

  return { accessToken, refreshToken }
}

export async function verifyTypedToken(
  token: string,
  secret: string,
  tokenType: TokenType,
  scope?: TokenScope
): Promise<JWTPayload> {
  const payload = (await verify(token, secret, 'HS256')) as unknown as JWTPayload
  if (payload.tokenType !== tokenType) {
    throw new Error('Invalid token type')
  }
  if (scope && payload.scope !== scope) {
    throw new Error('Invalid token scope')
  }
  return payload
}

export function createResetToken(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(32))
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('')
}

export function resetExpiresAt(hours = 1): Date {
  return new Date(Date.now() + hours * 60 * 60 * 1000)
}
