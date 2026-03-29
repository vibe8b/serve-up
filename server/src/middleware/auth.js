import jwt from 'jsonwebtoken'
import { env } from '../config/env.js'
import { AppError } from '../utils/errors.js'

export function auth(req, res, next) {
  const header = req.headers.authorization
  if (!header?.startsWith('Bearer ')) throw new AppError('Not authenticated', 401)

  try {
    const token = header.slice(7)
    const payload = jwt.verify(token, env.jwtSecret)
    req.merchantId = payload.sub
    next()
  } catch {
    throw new AppError('Invalid or expired token', 401)
  }
}
