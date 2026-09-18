export interface JWTPayload {
  userId: string
  username: string
  sub?: string
  scope: 'user' | 'admin'
  tokenType: 'access' | 'refresh'
  role?: string
  iat: number
  exp: number
}
