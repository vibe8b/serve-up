import { Router } from 'express'
import { z } from 'zod'
import { auth } from '../middleware/auth.js'
import { validate } from '../middleware/validate.js'
import prisma from '../config/db.js'

const router = Router()

const serviceSchema = z.object({
  name: z.string().min(1),
  price: z.number().positive(),
  duration: z.number().int().positive(),
})

router.get('/', auth, async (req, res, next) => {
  try {
    const services = await prisma.service.findMany({
      where: { merchantId: req.merchantId, active: true },
    })
    res.json(services)
  } catch (err) { next(err) }
})

router.post('/', auth, validate(serviceSchema), async (req, res, next) => {
  try {
    const service = await prisma.service.create({
      data: { ...req.body, merchantId: req.merchantId },
    })
    res.status(201).json(service)
  } catch (err) { next(err) }
})

router.patch('/:id', auth, async (req, res, next) => {
  try {
    const service = await prisma.service.findFirst({
      where: { id: req.params.id, merchantId: req.merchantId },
    })
    if (!service) return res.status(404).json({ error: 'Not found' })

    const updated = await prisma.service.update({
      where: { id: req.params.id },
      data: {
        name: req.body.name ?? service.name,
        price: req.body.price ?? service.price,
        duration: req.body.duration ?? service.duration,
      },
    })
    res.json(updated)
  } catch (err) { next(err) }
})

router.delete('/:id', auth, async (req, res, next) => {
  try {
    const service = await prisma.service.findFirst({
      where: { id: req.params.id, merchantId: req.merchantId },
    })
    if (!service) return res.status(404).json({ error: 'Not found' })

    await prisma.service.update({
      where: { id: req.params.id },
      data: { active: false },
    })
    res.json({ ok: true })
  } catch (err) { next(err) }
})

export default router
