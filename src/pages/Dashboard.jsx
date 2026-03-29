import { useEffect } from 'react'
import { useMerchant } from '../context/MerchantContext'
import { useNavigate } from 'react-router-dom'

const PLATFORM_FEE = 0.5

export default function Dashboard() {
  const { merchant, refreshBookings, cancelBooking } = useMerchant()
  const navigate = useNavigate()
  const bookings = (merchant.bookings || []).filter((b) => b.status !== 'cancelled')
  const hasBookings = bookings.length > 0

  // Refresh bookings on mount
  useEffect(() => { refreshBookings() }, [refreshBookings])

  const todayStr = new Date().toISOString().split('T')[0]
  const todayBookings = bookings.filter((b) => b.date === todayStr)
  const nextBooking = todayBookings.find((b) => b.time >= new Date().toTimeString().slice(0, 5))

  const totalRevenue = bookings.reduce((sum, b) => sum + Number(b.servicePrice), 0)
  const todayRevenue = todayBookings.reduce((sum, b) => sum + Number(b.servicePrice), 0)
  const netEarnings = totalRevenue - bookings.length * PLATFORM_FEE

  const bookingLink = `${window.location.origin}/book/${merchant.slug}`
  const copyLink = () => navigator.clipboard.writeText(bookingLink)

  const handleCancel = async (id) => {
    if (!window.confirm('Cancel this booking?')) return
    await cancelBooking(id)
  }

  return (
    <div>
      {/* Booking link banner */}
      <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-4 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <p className="text-emerald-400 font-bold text-sm">Your booking page is live</p>
          <p className="text-zinc-500 text-xs mt-0.5">Share with clients to start getting bookings.</p>
        </div>
        <div className="flex items-center gap-2">
          <code className="text-emerald-400 text-xs bg-zinc-900 px-3 py-2 rounded-lg truncate max-w-[180px]">
            /book/{merchant.slug}
          </code>
          <button onClick={copyLink} className="px-3 py-2 bg-emerald-500 text-white text-xs font-bold rounded-lg hover:bg-emerald-400 transition shrink-0">
            Copy
          </button>
          <button onClick={() => navigate(`/book/${merchant.slug}`)} className="px-3 py-2 bg-zinc-800 text-zinc-300 text-xs font-medium rounded-lg hover:bg-zinc-700 transition shrink-0">
            View
          </button>
        </div>
      </div>

      {!hasBookings ? (
        <div className="text-center py-16 bg-zinc-900 border border-zinc-800 rounded-2xl">
          <div className="w-14 h-14 rounded-full bg-zinc-800 flex items-center justify-center mx-auto mb-4">
            <svg className="w-7 h-7 text-zinc-600" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
            </svg>
          </div>
          <p className="text-zinc-300 font-medium mb-1">No bookings yet</p>
          <p className="text-zinc-600 text-sm mb-5 max-w-xs mx-auto">Share your link. Your first booking shows up here.</p>
          <div className="flex gap-2 justify-center">
            <button onClick={copyLink} className="px-4 py-2.5 bg-emerald-500 text-white rounded-xl text-sm font-bold hover:bg-emerald-400 transition">Copy Link</button>
            <button onClick={() => navigate(`/book/${merchant.slug}`)} className="px-4 py-2.5 bg-zinc-800 text-zinc-300 rounded-xl text-sm font-medium hover:bg-zinc-700 transition">Test Booking</button>
          </div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
              <p className="text-zinc-500 text-xs font-medium uppercase tracking-wider">Next Client</p>
              {nextBooking ? (
                <div className="mt-2">
                  <p className="text-white font-bold text-lg">{nextBooking.clientName}</p>
                  <p className="text-zinc-500 text-sm">{nextBooking.service?.name || 'Service'} · {nextBooking.time}</p>
                </div>
              ) : (
                <p className="text-zinc-600 text-sm mt-2">No more today</p>
              )}
            </div>
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
              <p className="text-zinc-500 text-xs font-medium uppercase tracking-wider">Today</p>
              <p className="text-white font-bold text-2xl mt-2">{todayBookings.length}</p>
              <p className="text-zinc-600 text-xs">bookings · ${todayRevenue.toFixed(2)}</p>
            </div>
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
              <p className="text-zinc-500 text-xs font-medium uppercase tracking-wider">Total Earned</p>
              <p className="text-emerald-400 font-bold text-2xl mt-2">${netEarnings.toFixed(2)}</p>
              <p className="text-zinc-600 text-xs">{bookings.length} bookings</p>
            </div>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
            <div className="px-5 py-4 border-b border-zinc-800">
              <h2 className="font-semibold text-white text-sm">All Bookings</h2>
            </div>
            <div className="divide-y divide-zinc-800/50">
              {bookings.map((b) => (
                <div key={b.id} className="px-5 py-3.5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-zinc-800 flex items-center justify-center text-xs font-bold text-zinc-400">
                      {b.clientName.split(' ').map((n) => n[0]).join('').toUpperCase()}
                    </div>
                    <div>
                      <p className="text-white font-medium text-sm">{b.clientName}</p>
                      <p className="text-zinc-500 text-xs">{b.service?.name || 'Service'} · {b.date} · {b.time}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-white font-semibold text-sm">${Number(b.servicePrice).toFixed(2)}</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                      b.paid ? 'bg-emerald-500/15 text-emerald-400' : 'bg-zinc-800 text-zinc-500'
                    }`}>
                      {b.paid ? 'Paid' : 'Pending'}
                    </span>
                    <button
                      onClick={() => handleCancel(b.id)}
                      className="p-1 text-zinc-600 hover:text-red-400 transition"
                      title="Cancel booking"
                    >
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
