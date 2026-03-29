import { Router } from 'express'
import { z } from 'zod'
import { validate } from '../middleware/validate.js'
import * as authService from '../services/auth.service.js'

const router = Router()

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(1),
  businessName: z.string().min(1),
  category: z.string().min(1),
})

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

router.post('/register', validate(registerSchema), async (req, res, next) => {
  try {
    const result = await authService.register(req.body)
    res.status(201).json(result)
  } catch (err) { next(err) }
})

router.post('/login', validate(loginSchema), async (req, res, next) => {
  try {
    const result = await authService.login(req.body)
    res.json(result)
  } catch (err) { next(err) }
})

router.post('/refresh', async (req, res, next) => {
  try {
    const { refreshToken } = req.body
    const result = await authService.refresh(refreshToken)
    res.json(result)
  } catch (err) { next(err) }
})

export default router
