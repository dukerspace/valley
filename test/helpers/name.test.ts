import { describe, expect, test } from 'bun:test'
import { isValidProjectName } from '../../src/helpers/name.ts'

describe('isValidProjectName', () => {
  test('accepts lowercase npm slugs', () => {
    expect(isValidProjectName('rezerch')).toBe(true)
    expect(isValidProjectName('my-app')).toBe(true)
  })

  test('rejects invalid names', () => {
    expect(isValidProjectName('My App')).toBe(false)
    expect(isValidProjectName('-bad')).toBe(false)
  })
})
