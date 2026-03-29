import { AppError } from '../utils/errors.js'

export function validate(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.body)
    if (!result.success) {
      const messages = result.error.issues.map((i) => i.message).join(', ')
      throw new AppError(messages, 400)
    }
    req.body = result.data
    next()
  }
}
