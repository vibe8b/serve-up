import { AppError } from '../utils/errors.js'

export function errorHandler(err, req, res, next) {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({ error: err.message })
  }

  // Prisma unique constraint violation
  if (err.code === 'P2002') {
    return res.status(409).json({ error: 'Already exists' })
  }

  console.error(err)
  res.status(500).json({ error: 'Internal server error' })
}
