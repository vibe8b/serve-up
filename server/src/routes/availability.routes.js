import { Router } from 'express'
import { auth } from '../middleware/auth.js'
import prisma from '../config/db.js'

const router = Router()

router.get('/', auth, async (req, res, next) => {
  try {
    const availability = await prisma.availability.findMany({
      where: { merchantId: req.merchantId },
      orderBy: { day: 'asc' },
    })
    res.json(availability)
  } catch (err) { next(err) }
})

router.put('/', auth, async (req, res, next) => {
  try {
    const days = req.body // array of { day, enabled, open, close }
    const updates = days.map((d) =>
      prisma.availability.upsert({
        where: { merchantId_day: { merchantId: req.merchantId, day: d.day } },
        update: { enabled: d.enabled, open: d.open, close: d.close },
        create: { merchantId: req.merchantId, day: d.day, enabled: d.enabled, open: d.open, close: d.close },
      })
    )
    await prisma.$transaction(updates)
    const availability = await prisma.availability.findMany({
      where: { merchantId: req.merchantId },
    })
    res.json(availability)
  } catch (err) { next(err) }
})

export default router
