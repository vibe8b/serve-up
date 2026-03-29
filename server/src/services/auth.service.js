import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import prisma from '../config/db.js'
import { env } from '../config/env.js'
import { AppError } from '../utils/errors.js'

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

function generateSlug(businessName) {
  return businessName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
}

function signTokens(merchantId) {
  const accessToken = jwt.sign({ sub: merchantId }, env.jwtSecret, { expiresIn: '15m' })
  const refreshToken = jwt.sign({ sub: merchantId }, env.jwtRefreshSecret, { expiresIn: '7d' })
  return { accessToken, refreshToken }
}

export async function register({ email, password, name, businessName, category }) {
  const exists = await prisma.merchant.findUnique({ where: { email } })
  if (exists) throw new AppError('Email already registered', 409)

  let slug = generateSlug(businessName)
  const slugExists = await prisma.merchant.findUnique({ where: { slug } })
  if (slugExists) slug = `${slug}-${Date.now().toString(36)}`

  const passwordHash = await bcrypt.hash(password, 12)

  const merchant = await prisma.merchant.create({
    data: {
      email,
      passwordHash,
      name,
      businessName,
      category,
      slug,
      onboarded: true,
      availability: {
        create: DAYS.map((day) => ({
          day,
          enabled: day !== 'Sun',
          open: '09:00',
          close: '17:00',
        })),
      },
      services: {
        create: [{ name: 'Haircut', price: 35, duration: 30 }],
      },
    },
    include: { services: true, availability: true },
  })

  const tokens = signTokens(merchant.id)
  return { ...tokens, merchant: sanitize(merchant) }
}

export async function login({ email, password }) {
  const merchant = await prisma.merchant.findUnique({
    where: { email },
    include: { services: true, availability: true, bookings: { include: { service: true } } },
  })
  if (!merchant) throw new AppError('Invalid credentials', 401)

  const valid = await bcrypt.compare(password, merchant.passwordHash)
  if (!valid) throw new AppError('Invalid credentials', 401)

  const tokens = signTokens(merchant.id)
  return { ...tokens, merchant: sanitize(merchant) }
}

export async function refresh(refreshToken) {
  try {
    const payload = jwt.verify(refreshToken, env.jwtRefreshSecret)
    const tokens = signTokens(payload.sub)
    return tokens
  } catch {
    throw new AppError('Invalid refresh token', 401)
  }
}

function sanitize(merchant) {
  const { passwordHash, ...rest } = merchant
  return rest
}
