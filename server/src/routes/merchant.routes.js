import { Router } from 'express'
import { auth } from '../middleware/auth.js'
import prisma from '../config/db.js'

const router = Router()

router.get('/', auth, async (req, res, next) => {
  try {
    const merchant = await prisma.merchant.findUnique({
      where: { id: req.merchantId },
      include: { services: { where: { active: true } }, availability: true, bookings: { include: { service: true }, orderBy: [{ date: 'asc' }, { time: 'asc' }] } },
    })
    if (!merchant) return res.status(404).json({ error: 'Not found' })
    const { passwordHash, ...data } = merchant
    res.json(data)
  } catch (err) { next(err) }
})

router.patch('/', auth, async (req, res, next) => {
  try {
    const allowed = ['name', 'businessName', 'category', 'slug', 'photo', 'bio', 'location', 'onboarded', 'goLiveSeen']
    const data = {}
    for (const key of allowed) {
      if (req.body[key] !== undefined) data[key] = req.body[key]
    }
    const merchant = await prisma.merchant.update({
      where: { id: req.merchantId },
      data,
      include: { services: { where: { active: true } }, availability: true },
    })
    const { passwordHash, ...rest } = merchant
    res.json(rest)
  } catch (err) { next(err) }
})

export default router
