import prisma from '../config/db.js'
import { AppError } from '../utils/errors.js'
import { addMinutes, hasOverlap } from '../utils/slots.js'

export async function createBooking({ merchantId, serviceId, clientName, clientPhone, clientEmail, date, time }) {
  const service = await prisma.service.findFirst({
    where: { id: serviceId, merchantId, active: true },
  })
  if (!service) throw new AppError('Service not found', 404)

  const endTime = addMinutes(time, service.duration)

  // Check day availability
  const dayOfWeek = new Date(date).toLocaleDateString('en-US', { weekday: 'short' })
  const dayAvail = await prisma.availability.findFirst({
    where: { merchantId, day: dayOfWeek, enabled: true },
  })
  if (!dayAvail) throw new AppError('Not available on this day', 400)

  // Check time within hours
  if (time < dayAvail.open || endTime > dayAvail.close) {
    throw new AppError('Time outside business hours', 400)
  }

  // Check for overlapping bookings
  const existing = await prisma.booking.findMany({
    where: { merchantId, date, status: { not: 'cancelled' } },
  })
  if (hasOverlap(time, endTime, existing)) {
    throw new AppError('Time slot not available', 409)
  }

  const booking = await prisma.booking.create({
    data: {
      merchantId,
      serviceId,
      clientName,
      clientPhone,
      clientEmail,
      date,
      time,
      endTime,
      servicePrice: service.price,
      status: 'pending',
      paid: false,
    },
    include: { service: true },
  })

  return booking
}

export async function confirmBooking(bookingId, stripePaymentId) {
  return prisma.booking.update({
    where: { id: bookingId },
    data: { status: 'confirmed', paid: true, stripePaymentId },
    include: { service: true, merchant: true },
  })
}

export async function cancelBooking(bookingId, merchantId) {
  const booking = await prisma.booking.findFirst({
    where: { id: bookingId, merchantId },
  })
  if (!booking) throw new AppError('Booking not found', 404)
  if (booking.status === 'cancelled') throw new AppError('Already cancelled', 400)

  return prisma.booking.update({
    where: { id: bookingId },
    data: { status: 'cancelled' },
  })
}

export async function getMerchantBookings(merchantId, { date, status } = {}) {
  const where = { merchantId }
  if (date) where.date = date
  if (status) where.status = status

  return prisma.booking.findMany({
    where,
    include: { service: true },
    orderBy: [{ date: 'asc' }, { time: 'asc' }],
  })
}
