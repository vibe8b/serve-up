import { useEffect } from 'react'
import { useMerchant } from '../context/MerchantContext'
import { useNavigate } from 'react-router-dom'

const PLATFORM_FEE = 0.5

export default function Dashboard() {
  const { merchant, refreshBookings, cancelBooking } = useMerchant()
  const navigate = useNavigate()
  const bookings = (merchant.bookings || []).filter((b) => b.status !== 'cancelled')
  const hasBookings = bookings.length > 0

  useEffect(() => { refreshBookings() }, [refreshBookings])

  const todayStr = new Date().toISOString().split('T')[0]
  const todayBookings = bookings.filter((b) => b.date === todayStr)
  const nextBooking = todayBookings.find((b) => b.time >= new Date().toTimeString().slice(0, 5))

  const totalRevenue = bookings.reduce((sum, b) => sum + Number(b.servicePrice), 0)
  const todayRevenue = todayBookings.reduce((sum, b) => sum + Number(b.servicePrice), 0)
  const netEarnings = totalRevenue - bookings.length * PLATFORM_FEE

  const bookingLink = `${window.location.origin}${window.location.pathname}#/book/${merchant.slug}`
  const copyLink = () => navigator.clipboard.writeText(bookingLink)

  const handleCancel = async (id) => {
    if (!window.confirm('Cancel this booking?')) return
    await cancelBooking(id)
  }

  return (
    <div>
      {/* Booking link banner */}
      <div className="rounded-3xl p-5 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3" style={{ background: 'var(--accentBg)', border: '1px solid var(--border)' }}>
        <div>
          <p className="font-bold text-sm" style={{ color: 'var(--accentText)' }}>Your booking page is live</p>
          <p className="text-xs mt-0.5" style={{ color: 'var(--textMuted)' }}>Share with clients to start getting bookings.</p>
        </div>
        <div className="flex items-center gap-2">
          <code className="text-xs px-3 py-2 rounded-xl truncate max-w-[180px]" style={{ background: 'var(--bgCard)', color: 'var(--accentText)', border: '1px solid var(--border)' }}>
            /book/{merchant.slug}
          </code>
          <button onClick={copyLink} className="px-4 py-2 text-xs font-bold rounded-xl transition hover:opacity-90" style={{ background: 'var(--accent)', color: 'var(--btnText)' }}>
            Copy
          </button>
          <button onClick={() => navigate(`/book/${merchant.slug}`)} className="px-4 py-2 text-xs font-medium rounded-xl transition" style={{ background: 'var(--bgCard)', color: 'var(--textSecondary)', border: '1px solid var(--border)' }}>
            View
          </button>
        </div>
      </div>

      {!hasBookings ? (
        <div className="text-center py-20 rounded-3xl" style={{ background: 'var(--bgCard)', border: '1px solid var(--border)' }}>
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5" style={{ background: 'var(--accentBg)' }}>
            <svg className="w-8 h-8" fill="none" stroke="var(--accent)" strokeWidth={1.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
            </svg>
          </div>
          <p className="font-semibold mb-1" style={{ color: 'var(--text)' }}>No bookings yet</p>
          <p className="text-sm mb-6 max-w-xs mx-auto" style={{ color: 'var(--textMuted)' }}>Share your link. Your first booking shows up here.</p>
          <div className="flex gap-3 justify-center">
            <button onClick={copyLink} className="px-5 py-3 rounded-2xl text-sm font-bold transition hover:opacity-90" style={{ background: 'var(--accent)', color: 'var(--btnText)' }}>Copy Link</button>
            <button onClick={() => navigate(`/book/${merchant.slug}`)} className="px-5 py-3 rounded-2xl text-sm font-medium transition" style={{ background: 'var(--bgCard)', color: 'var(--textSecondary)', border: '1px solid var(--border)' }}>Test Booking</button>
          </div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <div className="rounded-3xl p-6" style={{ background: 'var(--bgCard)', border: '1px solid var(--border)' }}>
              <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--textMuted)' }}>Next Client</p>
              {nextBooking ? (
                <div className="mt-2">
                  <p className="font-bold text-lg" style={{ color: 'var(--text)' }}>{nextBooking.clientName}</p>
                  <p className="text-sm" style={{ color: 'var(--textSecondary)' }}>{nextBooking.service?.name || 'Service'} · {nextBooking.time}</p>
                </div>
              ) : (
                <p className="text-sm mt-2" style={{ color: 'var(--textMuted)' }}>No more today</p>
              )}
            </div>
            <div className="rounded-3xl p-6" style={{ background: 'var(--bgCard)', border: '1px solid var(--border)' }}>
              <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--textMuted)' }}>Today</p>
              <p className="font-bold text-2xl mt-2" style={{ color: 'var(--text)' }}>{todayBookings.length}</p>
              <p className="text-xs" style={{ color: 'var(--textMuted)' }}>bookings · ${todayRevenue.toFixed(2)}</p>
            </div>
            <div className="rounded-3xl p-6" style={{ background: 'var(--bgCard)', border: '1px solid var(--border)' }}>
              <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--textMuted)' }}>Total Earned</p>
              <p className="font-bold text-2xl mt-2" style={{ color: 'var(--accent)' }}>${netEarnings.toFixed(2)}</p>
              <p className="text-xs" style={{ color: 'var(--textMuted)' }}>{bookings.length} bookings</p>
            </div>
          </div>

          <div className="rounded-3xl overflow-hidden" style={{ background: 'var(--bgCard)', border: '1px solid var(--border)' }}>
            <div className="px-6 py-4" style={{ borderBottom: '1px solid var(--border)' }}>
              <h2 className="font-semibold text-sm" style={{ color: 'var(--text)' }}>All Bookings</h2>
            </div>
            <div>
              {bookings.map((b) => (
                <div key={b.id} className="px-6 py-4 flex items-center justify-between" style={{ borderBottom: '1px solid var(--border)' }}>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl flex items-center justify-center text-xs font-bold" style={{ background: 'var(--accentBg)', color: 'var(--accentText)' }}>
                      {b.clientName.split(' ').map((n) => n[0]).join('').toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium text-sm" style={{ color: 'var(--text)' }}>{b.clientName}</p>
                      <p className="text-xs" style={{ color: 'var(--textMuted)' }}>{b.service?.name || 'Service'} · {b.date} · {b.time}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-semibold text-sm" style={{ color: 'var(--text)' }}>${Number(b.servicePrice).toFixed(2)}</span>
                    <span className="px-2.5 py-1 rounded-xl text-[10px] font-bold" style={{
                      background: b.paid ? 'var(--accentBg)' : 'var(--bgInput)',
                      color: b.paid ? 'var(--accentText)' : 'var(--textMuted)',
                    }}>
                      {b.paid ? 'Paid' : 'Pending'}
                    </span>
                    <button onClick={() => handleCancel(b.id)} className="p-1.5 rounded-xl transition hover:opacity-60" style={{ color: 'var(--textMuted)' }} title="Cancel">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
