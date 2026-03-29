import { Router } from 'express'
import { auth } from '../middleware/auth.js'
import * as paymentService from '../services/payment.service.js'
import stripe from '../config/stripe.js'
import { env } from '../config/env.js'

const router = Router()

// Merchant: Start Stripe Connect onboarding
router.post('/connect-onboard', auth, async (req, res, next) => {
  try {
    const result = await paymentService.createConnectAccount(req.merchantId)
    res.json(result)
  } catch (err) { next(err) }
})

// Merchant: Check Stripe Connect status
router.get('/connect-status', auth, async (req, res, next) => {
  try {
    const result = await paymentService.getConnectStatus(req.merchantId)
    res.json(result)
  } catch (err) { next(err) }
})

// Public: Create payment intent for a booking
router.post('/create-intent', async (req, res, next) => {
  try {
    const { bookingId } = req.body
    const result = await paymentService.createPaymentIntent(bookingId)
    res.json(result)
  } catch (err) { next(err) }
})

export default router

// Webhook handler — exported separately because it needs raw body
export async function webhookHandler(req, res) {
  const sig = req.headers['stripe-signature']
  let event

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, env.stripeWebhookSecret)
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message)
    return res.status(400).send(`Webhook Error: ${err.message}`)
  }

  try {
    await paymentService.handleWebhook(event)
    res.json({ received: true })
  } catch (err) {
    console.error('Webhook processing error:', err)
    res.status(500).json({ error: 'Webhook processing failed' })
  }
}
