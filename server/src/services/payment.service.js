import stripe from '../config/stripe.js'
import { env } from '../config/env.js'
import prisma from '../config/db.js'
import { AppError } from '../utils/errors.js'

const PLATFORM_FEE_CENTS = 50 // $0.50

export async function createConnectAccount(merchantId) {
  const merchant = await prisma.merchant.findUnique({ where: { id: merchantId } })
  if (!merchant) throw new AppError('Merchant not found', 404)

  if (merchant.stripeAccountId) {
    // Already has account, create new onboarding link
    const link = await stripe.accountLinks.create({
      account: merchant.stripeAccountId,
      refresh_url: `${env.clientUrl}/settings?stripe=refresh`,
      return_url: `${env.clientUrl}/settings?stripe=complete`,
      type: 'account_onboarding',
    })
    return { url: link.url }
  }

  const account = await stripe.accounts.create({
    type: 'express',
    email: merchant.email,
    business_type: 'individual',
    metadata: { merchantId: merchant.id },
  })

  await prisma.merchant.update({
    where: { id: merchantId },
    data: { stripeAccountId: account.id },
  })

  const link = await stripe.accountLinks.create({
    account: account.id,
    refresh_url: `${env.clientUrl}/settings?stripe=refresh`,
    return_url: `${env.clientUrl}/settings?stripe=complete`,
    type: 'account_onboarding',
  })

  return { url: link.url }
}

export async function getConnectStatus(merchantId) {
  const merchant = await prisma.merchant.findUnique({ where: { id: merchantId } })
  if (!merchant?.stripeAccountId) return { connected: false }

  const account = await stripe.accounts.retrieve(merchant.stripeAccountId)
  const connected = account.charges_enabled && account.payouts_enabled

  if (connected !== merchant.stripeOnboarded) {
    await prisma.merchant.update({
      where: { id: merchantId },
      data: { stripeOnboarded: connected },
    })
  }

  return { connected, accountId: merchant.stripeAccountId }
}

export async function createPaymentIntent(bookingId) {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { merchant: true },
  })
  if (!booking) throw new AppError('Booking not found', 404)

  const totalCents = Math.round(Number(booking.servicePrice) * 100) + PLATFORM_FEE_CENTS

  const params = {
    amount: totalCents,
    currency: 'usd',
    metadata: { bookingId: booking.id, merchantId: booking.merchantId },
  }

  // If merchant has Stripe Connect, route payment to them
  if (booking.merchant.stripeAccountId && booking.merchant.stripeOnboarded) {
    params.application_fee_amount = PLATFORM_FEE_CENTS
    params.transfer_data = { destination: booking.merchant.stripeAccountId }
  }

  const paymentIntent = await stripe.paymentIntents.create(params)

  await prisma.booking.update({
    where: { id: bookingId },
    data: { stripePaymentId: paymentIntent.id },
  })

  return { clientSecret: paymentIntent.client_secret, bookingId }
}

export async function handleWebhook(event) {
  switch (event.type) {
    case 'payment_intent.succeeded': {
      const { bookingId } = event.data.object.metadata
      if (bookingId) {
        await prisma.booking.update({
          where: { id: bookingId },
          data: { status: 'confirmed', paid: true },
        })
      }
      break
    }
    case 'payment_intent.payment_failed': {
      const { bookingId } = event.data.object.metadata
      if (bookingId) {
        await prisma.booking.update({
          where: { id: bookingId },
          data: { status: 'cancelled' },
        })
      }
      break
    }
  }
}
