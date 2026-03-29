import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import { env } from './config/env.js'
import { errorHandler } from './middleware/errorHandler.js'
import authRoutes from './routes/auth.routes.js'
import merchantRoutes from './routes/merchant.routes.js'
import serviceRoutes from './routes/service.routes.js'
import availabilityRoutes from './routes/availability.routes.js'
import bookingRoutes from './routes/booking.routes.js'
import storefrontRoutes from './routes/storefront.routes.js'
import paymentRoutes, { webhookHandler } from './routes/payment.routes.js'

const app = express()

// Stripe webhook needs raw body — must be before express.json()
app.post('/api/payments/webhook', express.raw({ type: 'application/json' }), webhookHandler)

// Global middleware
app.use(helmet())
app.use(cors({ origin: env.clientUrl, credentials: true }))
app.use(express.json({ limit: '10mb' })) // 10mb for photo base64

// Rate limiting
const authLimiter = rateLimit({ windowMs: 60_000, max: 10, message: { error: 'Too many requests' } })
const apiLimiter = rateLimit({ windowMs: 60_000, max: 100, message: { error: 'Too many requests' } })

// Routes
app.use('/api/auth', authLimiter, authRoutes)
app.use('/api/merchant', apiLimiter, merchantRoutes)
app.use('/api/services', apiLimiter, serviceRoutes)
app.use('/api/availability', apiLimiter, availabilityRoutes)
app.use('/api/bookings', apiLimiter, bookingRoutes)
app.use('/api/storefront', apiLimiter, storefrontRoutes)
app.use('/api/payments', apiLimiter, paymentRoutes)

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'ok' }))

// Error handler
app.use(errorHandler)

app.listen(env.port, () => {
  console.log(`ServeUp API running on port ${env.port}`)
})
