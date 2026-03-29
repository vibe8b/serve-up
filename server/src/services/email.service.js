import transporter from '../config/email.js'
import { env } from '../config/env.js'

export async function sendBookingConfirmation(booking, merchant) {
  if (!booking.clientEmail) return

  try {
    await transporter.sendMail({
      from: env.emailFrom,
      to: booking.clientEmail,
      subject: `Your booking with ${merchant.businessName} is confirmed`,
      html: `
        <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
          <h2 style="color: #10b981;">Booking Confirmed</h2>
          <p>Hi ${booking.clientName},</p>
          <p>Your appointment is confirmed:</p>
          <div style="background: #f4f4f5; padding: 16px; border-radius: 12px; margin: 16px 0;">
            <p style="margin: 4px 0;"><strong>Service:</strong> ${booking.service?.name || 'Service'}</p>
            <p style="margin: 4px 0;"><strong>Date:</strong> ${booking.date}</p>
            <p style="margin: 4px 0;"><strong>Time:</strong> ${booking.time}</p>
            <p style="margin: 4px 0;"><strong>Amount:</strong> $${(Number(booking.servicePrice) + 0.5).toFixed(2)}</p>
            ${merchant.location ? `<p style="margin: 4px 0;"><strong>Location:</strong> ${merchant.location}</p>` : ''}
          </div>
          <p style="color: #71717a; font-size: 13px;">Powered by ServeUp</p>
        </div>
      `,
    })
  } catch (err) {
    console.error('Failed to send client confirmation:', err.message)
  }
}

export async function sendMerchantAlert(booking, merchant) {
  try {
    const earnings = (Number(booking.servicePrice) - 0.5).toFixed(2)
    await transporter.sendMail({
      from: env.emailFrom,
      to: merchant.email,
      subject: `New booking: ${booking.clientName} for ${booking.service?.name || 'Service'}`,
      html: `
        <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
          <h2 style="color: #10b981;">New Booking</h2>
          <div style="background: #f4f4f5; padding: 16px; border-radius: 12px; margin: 16px 0;">
            <p style="margin: 4px 0;"><strong>Client:</strong> ${booking.clientName}</p>
            ${booking.clientPhone ? `<p style="margin: 4px 0;"><strong>Phone:</strong> ${booking.clientPhone}</p>` : ''}
            <p style="margin: 4px 0;"><strong>Service:</strong> ${booking.service?.name || 'Service'}</p>
            <p style="margin: 4px 0;"><strong>Date:</strong> ${booking.date}</p>
            <p style="margin: 4px 0;"><strong>Time:</strong> ${booking.time}</p>
            <p style="margin: 4px 0;"><strong>Your earnings:</strong> $${earnings}</p>
          </div>
        </div>
      `,
    })
  } catch (err) {
    console.error('Failed to send merchant alert:', err.message)
  }
}
