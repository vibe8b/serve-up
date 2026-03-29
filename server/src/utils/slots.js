// Generate available time slots for a given date
export function generateSlots(openTime, closeTime, durationMinutes, existingBookings) {
  const slots = []
  const [openH, openM] = openTime.split(':').map(Number)
  const [closeH, closeM] = closeTime.split(':').map(Number)
  const openMin = openH * 60 + openM
  const closeMin = closeH * 60 + closeM

  for (let t = openMin; t + durationMinutes <= closeMin; t += 15) {
    const slotStart = t
    const slotEnd = t + durationMinutes

    const hasConflict = existingBookings.some((b) => {
      const [bH, bM] = b.time.split(':').map(Number)
      const [eH, eM] = b.endTime.split(':').map(Number)
      const bStart = bH * 60 + bM
      const bEnd = eH * 60 + eM
      return slotStart < bEnd && slotEnd > bStart
    })

    if (!hasConflict) {
      const h = Math.floor(t / 60)
      const m = t % 60
      slots.push(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`)
    }
  }

  return slots
}

// Add minutes to a time string
export function addMinutes(time, minutes) {
  const [h, m] = time.split(':').map(Number)
  const total = h * 60 + m + minutes
  const newH = Math.floor(total / 60)
  const newM = total % 60
  return `${String(newH).padStart(2, '0')}:${String(newM).padStart(2, '0')}`
}

// Check if a time slot overlaps with existing bookings
export function hasOverlap(time, endTime, existingBookings) {
  const [tH, tM] = time.split(':').map(Number)
  const [eH, eM] = endTime.split(':').map(Number)
  const start = tH * 60 + tM
  const end = eH * 60 + eM

  return existingBookings.some((b) => {
    const [bH, bM] = b.time.split(':').map(Number)
    const [beH, beM] = b.endTime.split(':').map(Number)
    const bStart = bH * 60 + bM
    const bEnd = beH * 60 + beM
    return start < bEnd && end > bStart
  })
}
