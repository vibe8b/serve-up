import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { isDemo } from '../api'

const PLATFORM_FEE = 0.5

function generateSlots(openTime, closeTime, duration) {
  const slots = []
  const [oH, oM] = openTime.split(':').map(Number)
  const [cH, cM] = closeTime.split(':').map(Number)
  const openMin = oH * 60 + oM, closeMin = cH * 60 + cM
  for (let t = openMin; t + duration <= closeMin; t += 15) {
    const h = Math.floor(t / 60), m = t % 60
    slots.push(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`)
  }
  return slots
}

export default function BookingPage() {
  const { slug } = useParams()
  const [merchant, setMerchant] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selected, setSelected] = useState(null)
  const [step, setStep] = useState('select')
  const [form, setForm] = useState({ clientName: '', phone: '', email: '', date: '', time: '' })
  const [card, setCard] = useState({ number: '', exp: '', cvc: '' })
  const [availableSlots, setAvailableSlots] = useState([])
  const [submitting, setSubmitting] = useState(false)

  // Load merchant data
  useEffect(() => {
    if (isDemo) {
      try {
        const stored = JSON.parse(localStorage.getItem('serveup_merchant'))
        if (stored && stored.slug === slug) { setMerchant(stored); setLoading(false); return }
      } catch {}
      setError('Not found')
      setLoading(false)
      return
    }
    fetch(`/api/storefront/${slug}`)
      .then((r) => { if (!r.ok) throw new Error('Not found'); return r.json() })
      .then(setMerchant)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [slug])

  // Generate/fetch available time slots
  useEffect(() => {
    if (!form.date || !selected || !merchant) return
    if (isDemo) {
      const dayMap = { Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6, Sun: 0 }
      const dayOfWeek = new Date(form.date + 'T12:00').getDay()
      const dayAvail = (merchant.availability || []).find((d) => d.enabled && dayMap[d.day] === dayOfWeek)
      if (dayAvail) setAvailableSlots(generateSlots(dayAvail.open, dayAvail.close, selected.duration))
      else setAvailableSlots([])
      return
    }
    fetch(`/api/storefront/${slug}/slots?date=${form.date}&serviceId=${selected.id}`)
      .then((r) => r.json())
      .then((data) => setAvailableSlots(data.slots || []))
      .catch(() => setAvailableSlots([]))
  }, [form.date, selected, slug, merchant])

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-100 flex items-center justify-center">
        <div className="text-zinc-400">Loading...</div>
      </div>
    )
  }

  if (error || !merchant) {
    return (
      <div className="min-h-screen bg-zinc-100 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-zinc-900 font-bold text-lg mb-1">Page not found</h2>
          <p className="text-zinc-400 text-sm">This booking page doesn't exist.</p>
        </div>
      </div>
    )
  }

  const activeDays = (merchant.availability || []).filter((d) => d.enabled)
  const dayMap = { Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6, Sun: 0 }
  const enabledDayNums = new Set(activeDays.map((d) => dayMap[d.day]))
  const availableDates = []
  for (let i = 1; i <= 14; i++) {
    const d = new Date()
    d.setDate(d.getDate() + i)
    if (enabledDayNums.has(d.getDay())) availableDates.push(d.toISOString().split('T')[0])
  }

  const services = (merchant.services || []).map((s) => ({ ...s, price: Number(s.price) }))

  const handleBook = (service) => {
    setSelected(service)
    setStep('details')
    setForm({ clientName: '', phone: '', email: '', date: '', time: '' })
    setCard({ number: '', exp: '', cvc: '' })
    setAvailableSlots([])
  }

  const toPayment = (e) => {
    e.preventDefault()
    setStep('payment')
  }

  const confirmPayment = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      if (isDemo) {
        // Demo mode: save booking to localStorage
        const stored = JSON.parse(localStorage.getItem('serveup_merchant') || '{}')
        const booking = {
          id: crypto.randomUUID(),
          clientName: form.clientName,
          clientPhone: form.phone,
          clientEmail: form.email,
          service: { name: selected.name },
          servicePrice: selected.price,
          platformFee: 0.5,
          date: form.date,
          time: form.time,
          status: 'confirmed',
          paid: true,
          createdAt: new Date().toISOString(),
        }
        stored.bookings = [booking, ...(stored.bookings || [])]
        localStorage.setItem('serveup_merchant', JSON.stringify(stored))
        setStep('confirmed')
        return
      }
      const res = await fetch(`/api/storefront/${slug}/book`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          serviceId: selected.id,
          clientName: form.clientName,
          clientPhone: form.phone || undefined,
          clientEmail: form.email || undefined,
          date: form.date,
          time: form.time,
        }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Booking failed')
      }
      setStep('confirmed')
    } catch (err) {
      alert(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  const reset = () => {
    setSelected(null)
    setStep('select')
  }

  return (
    <div className="min-h-screen bg-zinc-100 flex items-start justify-center p-4 pt-6 lg:pt-12">
      <div className="w-full max-w-sm">
        <div className="bg-white rounded-2xl overflow-hidden shadow-xl">
          {/* Header */}
          <div className="bg-zinc-900 px-5 py-6 text-center">
            {merchant.photo ? (
              <img src={merchant.photo} alt="" className="w-14 h-14 rounded-full mx-auto mb-2 object-cover ring-2 ring-emerald-500" />
            ) : (
              <div className="w-14 h-14 rounded-full mx-auto mb-2 bg-zinc-800 flex items-center justify-center">
                <span className="text-zinc-400 text-lg font-bold">{merchant.businessName?.[0]?.toUpperCase() || '?'}</span>
              </div>
            )}
            <h2 className="text-white font-bold text-lg">{merchant.businessName}</h2>
            {merchant.category && <p className="text-zinc-500 text-xs mt-0.5">{merchant.category}</p>}
            {merchant.bio && <p className="text-zinc-400 text-sm mt-2">{merchant.bio}</p>}
          </div>

          <div className="p-4">
            {step === 'select' && (
              <>
                <p className="text-zinc-500 text-xs font-semibold uppercase tracking-wider mb-3">Services</p>
                <div className="space-y-2">
                  {services.map((s) => (
                    <div key={s.id} className="flex items-center justify-between p-3.5 bg-zinc-50 rounded-xl">
                      <div>
                        <p className="text-zinc-900 font-semibold text-sm">{s.name}</p>
                        <p className="text-zinc-400 text-xs">{s.duration} min</p>
                      </div>
                      <div className="flex items-center gap-2.5">
                        <span className="text-zinc-900 font-bold">${s.price.toFixed(2)}</span>
                        <button onClick={() => handleBook(s)} className="px-3.5 py-1.5 bg-emerald-500 text-white text-xs font-bold rounded-lg hover:bg-emerald-400 transition">
                          Book
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {activeDays.length > 0 && (
                  <div className="mt-5 pt-4 border-t border-zinc-100">
                    <p className="text-zinc-500 text-xs font-semibold uppercase tracking-wider mb-2">Hours</p>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                      {activeDays.map((d) => (
                        <div key={d.day} className="flex justify-between text-xs">
                          <span className="text-zinc-500">{d.day}</span>
                          <span className="text-zinc-700">{d.open}–{d.close}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {merchant.location && (
                  <div className="mt-3 pt-3 border-t border-zinc-100">
                    <p className="text-zinc-400 text-xs flex items-center gap-1">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 0115 0z" />
                      </svg>
                      {merchant.location}
                    </p>
                  </div>
                )}
              </>
            )}

            {step === 'details' && selected && (
              <form onSubmit={toPayment} className="space-y-3">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-bold text-zinc-900">Book {selected.name}</h3>
                  <button type="button" onClick={reset} className="text-zinc-400 text-xs hover:text-zinc-600">Cancel</button>
                </div>
                <p className="text-zinc-500 text-sm">${selected.price.toFixed(2)} · {selected.duration} min</p>
                <input
                  required autoFocus
                  value={form.clientName}
                  onChange={(e) => setForm((f) => ({ ...f, clientName: e.target.value }))}
                  placeholder="Your name"
                  className="w-full px-3.5 py-2.5 border border-zinc-200 rounded-xl text-zinc-900 text-sm placeholder-zinc-400 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                />
                <input
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                  placeholder="Email (for confirmation)"
                  type="email"
                  className="w-full px-3.5 py-2.5 border border-zinc-200 rounded-xl text-zinc-900 text-sm placeholder-zinc-400 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                />
                <input
                  value={form.phone}
                  onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                  placeholder="Phone (optional)"
                  type="tel"
                  className="w-full px-3.5 py-2.5 border border-zinc-200 rounded-xl text-zinc-900 text-sm placeholder-zinc-400 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                />
                <select
                  required
                  value={form.date}
                  onChange={(e) => setForm((f) => ({ ...f, date: e.target.value, time: '' }))}
                  className="w-full px-3.5 py-2.5 border border-zinc-200 rounded-xl text-zinc-900 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none bg-white"
                >
                  <option value="">Pick a date</option>
                  {availableDates.map((d) => (
                    <option key={d} value={d}>
                      {new Date(d + 'T12:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                    </option>
                  ))}
                </select>

                {form.date && (
                  availableSlots.length > 0 ? (
                    <select
                      required
                      value={form.time}
                      onChange={(e) => setForm((f) => ({ ...f, time: e.target.value }))}
                      className="w-full px-3.5 py-2.5 border border-zinc-200 rounded-xl text-zinc-900 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none bg-white"
                    >
                      <option value="">Pick a time</option>
                      {availableSlots.map((t) => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  ) : (
                    <p className="text-zinc-400 text-xs text-center py-2">No available times for this date</p>
                  )
                )}

                <button type="submit" disabled={!form.time} className="w-full py-3 bg-emerald-500 text-white rounded-xl font-bold text-sm hover:bg-emerald-400 transition disabled:opacity-40 disabled:cursor-not-allowed">
                  Continue to Payment
                </button>
              </form>
            )}

            {step === 'payment' && selected && (
              <form onSubmit={confirmPayment} className="space-y-3">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-bold text-zinc-900">Payment</h3>
                  <button type="button" onClick={() => setStep('details')} className="text-zinc-400 text-xs hover:text-zinc-600">Back</button>
                </div>

                <div className="bg-zinc-50 rounded-xl p-3.5 space-y-1.5 text-sm">
                  <div className="flex justify-between">
                    <span className="text-zinc-500">{selected.name}</span>
                    <span className="text-zinc-900 font-medium">${selected.price.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Booking fee</span>
                    <span className="text-zinc-900 font-medium">${PLATFORM_FEE.toFixed(2)}</span>
                  </div>
                  <div className="border-t border-zinc-200 pt-1.5 flex justify-between font-bold">
                    <span className="text-zinc-900">Total</span>
                    <span className="text-zinc-900">${(selected.price + PLATFORM_FEE).toFixed(2)}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="relative">
                    <input
                      required
                      value={card.number}
                      onChange={(e) => setCard((c) => ({ ...c, number: e.target.value.replace(/\D/g, '').replace(/(\d{4})/g, '$1 ').trim().slice(0, 19) }))}
                      placeholder="4242 4242 4242 4242"
                      maxLength={19}
                      className="w-full px-3.5 py-2.5 border border-zinc-200 rounded-xl text-zinc-900 text-sm placeholder-zinc-400 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none pr-12"
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      <svg className="w-6 h-4 text-zinc-300" viewBox="0 0 24 16" fill="currentColor"><rect width="24" height="16" rx="2" /></svg>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <input
                      required
                      value={card.exp}
                      onChange={(e) => {
                        let v = e.target.value.replace(/\D/g, '').slice(0, 4)
                        if (v.length > 2) v = v.slice(0, 2) + '/' + v.slice(2)
                        setCard((c) => ({ ...c, exp: v }))
                      }}
                      placeholder="MM/YY"
                      maxLength={5}
                      className="flex-1 px-3.5 py-2.5 border border-zinc-200 rounded-xl text-zinc-900 text-sm placeholder-zinc-400 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                    />
                    <input
                      required
                      value={card.cvc}
                      onChange={(e) => setCard((c) => ({ ...c, cvc: e.target.value.replace(/\D/g, '').slice(0, 4) }))}
                      placeholder="CVC"
                      maxLength={4}
                      className="w-20 px-3.5 py-2.5 border border-zinc-200 rounded-xl text-zinc-900 text-sm placeholder-zinc-400 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                    />
                  </div>
                </div>

                <button type="submit" disabled={submitting} className="w-full py-3 bg-emerald-500 text-white rounded-xl font-bold text-sm hover:bg-emerald-400 transition disabled:opacity-50">
                  {submitting ? 'Processing...' : `Pay $${(selected.price + PLATFORM_FEE).toFixed(2)}`}
                </button>
                <p className="text-zinc-400 text-[10px] text-center flex items-center justify-center gap-1">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                  </svg>
                  Secured by ServeUp. Demo mode — no real charges.
                </p>
              </form>
            )}

            {step === 'confirmed' && (
              <div className="text-center py-6">
                <div className="w-14 h-14 rounded-full bg-emerald-500/15 flex items-center justify-center mx-auto mb-3">
                  <svg className="w-7 h-7 text-emerald-500" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                </div>
                <h3 className="font-bold text-zinc-900 text-lg mb-1">Booked!</h3>
                <p className="text-zinc-500 text-sm mb-1">
                  {form.clientName}, you're confirmed for {selected?.name}.
                </p>
                <p className="text-zinc-400 text-xs">
                  {form.date && new Date(form.date + 'T12:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })} at {form.time}
                </p>
                <button onClick={reset} className="mt-5 px-5 py-2 bg-zinc-100 text-zinc-600 rounded-xl text-sm font-medium hover:bg-zinc-200 transition">
                  Book another service
                </button>
              </div>
            )}
          </div>

          <div className="px-4 pb-3 text-center">
            <p className="text-zinc-300 text-[9px]">Powered by ServeUp</p>
          </div>
        </div>
      </div>
    </div>
  )
}
