import { describe, expect, test } from 'bun:test'
import { paginationQuerySchema } from './common.ts'
import { resetPasswordSchema, updatePasswordSchema } from './password.ts'

describe('paginationQuerySchema', () => {
  test('applies defaults for page and limit', () => {
    expect(paginationQuerySchema.parse({})).toEqual({ page: 1, limit: 20 })
  })

  test('rejects limit above 100', () => {
    const result = paginationQuerySchema.safeParse({ page: 1, limit: 101 })
    expect(result.success).toBe(false)
  })

  test('accepts optional search query', () => {
    expect(paginationQuerySchema.parse({ page: 2, limit: 10, q: 'alice' })).toEqual({
      page: 2,
      limit: 10,
      q: 'alice',
    })
  })
})

describe('password schemas', () => {
  test('resetPasswordSchema requires matching passwords', () => {
    const result = resetPasswordSchema.safeParse({
      email: 'a@b.com',
      token: 'tok',
      newPassword: 'password1',
      confirmPassword: 'password2',
    })
    expect(result.success).toBe(false)
  })

  test('updatePasswordSchema accepts matching passwords', () => {
    const payload = {
      oldPassword: 'oldpass12',
      newPassword: 'newpass12',
      confirmPassword: 'newpass12',
    }
    expect(updatePasswordSchema.parse(payload)).toEqual(payload)
  })
})
