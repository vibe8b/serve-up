import nodemailer from 'nodemailer'
import { env } from './env.js'

const transporter = nodemailer.createTransport({
  host: env.smtpHost,
  port: env.smtpPort,
  auth: env.smtpUser ? { user: env.smtpUser, pass: env.smtpPass } : undefined,
})

export default transporter
