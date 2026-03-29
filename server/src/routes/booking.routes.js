import { Router } from 'express'
import { auth } from '../middleware/auth.js'
import * as bookingService from '../services/booking.service.js'

const router = Router()

router.get('/', auth, async (req, res, next) => {
  try {
    const bookings = await bookingService.getMerchantBookings(req.merchantId, {
      date: req.query.date,
      status: req.query.status,
    })
    res.json(bookings)
  } catch (err) { next(err) }
})

router.get('/:id', auth, async (req, res, next) => {
  try {
    const { default: prisma } = await import('../config/db.js')
    const booking = await prisma.booking.findFirst({
      where: { id: req.params.id, merchantId: req.merchantId },
      include: { service: true },
    })
    if (!booking) return res.status(404).json({ error: 'Not found' })
    res.json(booking)
  } catch (err) { next(err) }
})

router.patch('/:id/cancel', auth, async (req, res, next) => {
  try {
    const booking = await bookingService.cancelBooking(req.params.id, req.merchantId)
    res.json(booking)
  } catch (err) { next(err) }
})

export default router
