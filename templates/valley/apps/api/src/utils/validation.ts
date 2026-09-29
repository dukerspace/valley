import { zValidator as zv } from '@hono/zod-validator'
import { HTTP_STATUS } from '@valley/shared'
import type { ValidationTargets } from 'hono'

export const zValidator = <Target extends keyof ValidationTargets>(
  target: Target,
  schema: Parameters<typeof zv>[1]
) =>
  zv(target, schema, (result, c) => {
    if (!result.success) {
      const errors = result.error.issues.map((issue) => ({
        field: issue.path?.length ? issue.path.join('.') : undefined,
        message: issue.message,
      }))
      return c.json({ success: false, errors }, HTTP_STATUS.UNPROCESSABLE_ENTITY)
    }
  })
