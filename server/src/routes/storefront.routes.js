import { Router } from 'express'
import { z } from 'zod'
import { validate } from '../middleware/validate.js'
import prisma from '../config/db.js'
import * as bookingService from '../services/booking.service.js'
import * as paymentService from '../services/payment.service.js'
import * as emailService from '../services/email.service.js'
import { generateSlots } from '../utils/slots.js'

const router = Router()

// Public: Get merchant storefront
router.get('/:slug', async (req, res, next) => {
  try {
    const merchant = await prisma.merchant.findUnique({
      where: { slug: req.params.slug },
      include: {
        services: { where: { active: true } },
        availability: true,
      },
    })
    if (!merchant) return res.status(404).json({ error: 'Not found' })

    const { passwordHash, email, stripeAccountId, ...data } = merchant
    res.json(data)
  } catch (err) { next(err) }
})

// Public: Get available time slots
router.get('/:slug/slots', async (req, res, next) => {
  try {
    const { date, serviceId } = req.query
    if (!date || !serviceId) return res.status(400).json({ error: 'date and serviceId required' })

    const merchant = await prisma.merchant.findUnique({ where: { slug: req.params.slug } })
    if (!merchant) return res.status(404).json({ error: 'Not found' })

    const service = await prisma.service.findFirst({
      where: { id: serviceId, merchantId: merchant.id, active: true },
    })
    if (!service) return res.status(404).json({ error: 'Service not found' })

    const dayOfWeek = new Date(date).toLocaleDateString('en-US', { weekday: 'short' })
    const dayAvail = await prisma.availability.findFirst({
      where: { merchantId: merchant.id, day: dayOfWeek, enabled: true },
    })
    if (!dayAvail) return res.json({ slots: [] })

    const existing = await prisma.booking.findMany({
      where: { merchantId: merchant.id, date, status: { not: 'cancelled' } },
    })

    const slots = generateSlots(dayAvail.open, dayAvail.close, service.duration, existing)
    res.json({ slots })
  } catch (err) { next(err) }
})

const bookSchema = z.object({
  serviceId: z.string().uuid(),
  clientName: z.string().min(1),
  clientPhone: z.string().optional(),
  clientEmail: z.string().email().optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  time: z.string().regex(/^\d{2}:\d{2}$/),
})

// Public: Create booking
router.post('/:slug/book', validate(bookSchema), async (req, res, next) => {
  try {
    const merchant = await prisma.merchant.findUnique({ where: { slug: req.params.slug } })
    if (!merchant) return res.status(404).json({ error: 'Not found' })

    const booking = await bookingService.createBooking({
      merchantId: merchant.id,
      ...req.body,
    })

    // If merchant has Stripe, create payment intent
    if (merchant.stripeAccountId && merchant.stripeOnboarded) {
      const payment = await paymentService.createPaymentIntent(booking.id)
      return res.status(201).json({ booking, ...payment })
    }

    // No Stripe — mark as confirmed directly (demo mode)
    const confirmed = await bookingService.confirmBooking(booking.id, null)

    // Send emails
    await emailService.sendBookingConfirmation(confirmed, merchant)
    await emailService.sendMerchantAlert(confirmed, merchant)

    res.status(201).json({ booking: confirmed })
  } catch (err) { next(err) }
})

export default router
