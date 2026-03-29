import { useMerchant } from '../context/MerchantContext'
import { useNavigate } from 'react-router-dom'
import { useState } from 'react'

export default function GoLive() {
  const { merchant, update } = useMerchant()
  const navigate = useNavigate()
  const [copied, setCopied] = useState(false)

  const bookingUrl = `${window.location.origin}/book/${merchant.slug}`

  const copy = () => {
    navigator.clipboard.writeText(bookingUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const proceed = async () => {
    await update({ goLiveSeen: true })
    navigate('/dashboard')
  }

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-5">
      <div className="max-w-md w-full text-center">
        {/* Celebration */}
        <div className="w-20 h-20 rounded-full bg-emerald-500/15 flex items-center justify-center mx-auto mb-6">
          <svg className="w-10 h-10 text-emerald-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>

        <h1 className="text-3xl font-black text-white mb-2">You're live.</h1>
        <p className="text-zinc-400 mb-8">
          Your booking page is ready. Share the link and start getting paid.
        </p>

        {/* Link */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 mb-6 text-left">
          <p className="text-zinc-500 text-xs font-medium mb-2">Your booking link</p>
          <div className="flex items-center gap-2">
            <code className="flex-1 text-emerald-400 text-sm font-mono bg-zinc-800 px-3 py-2.5 rounded-xl truncate">
              {bookingUrl}
            </code>
            <button
              onClick={copy}
              className="px-4 py-2.5 bg-emerald-500 text-white text-sm font-bold rounded-xl hover:bg-emerald-400 transition shrink-0"
            >
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
        </div>

        {/* Share options */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <button
            onClick={() => window.open(`sms:&body=Book me here: ${bookingUrl}`, '_blank')}
            className="flex items-center justify-center gap-2 py-3 bg-zinc-900 border border-zinc-800 rounded-xl text-zinc-300 text-sm font-medium hover:bg-zinc-800 transition"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
            </svg>
            iMessage
          </button>
          <button
            onClick={() => window.open(`https://www.instagram.com/`, '_blank')}
            className="flex items-center justify-center gap-2 py-3 bg-zinc-900 border border-zinc-800 rounded-xl text-zinc-300 text-sm font-medium hover:bg-zinc-800 transition"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
            </svg>
            Instagram
          </button>
        </div>

        {/* Test booking */}
        <button
          onClick={() => navigate(`/book/${merchant.slug}`)}
          className="w-full py-3 bg-zinc-900 border border-zinc-800 rounded-xl text-zinc-300 text-sm font-medium hover:bg-zinc-800 transition mb-4"
        >
          Test your booking page →
        </button>

        {/* Continue */}
        <button
          onClick={proceed}
          className="w-full py-3.5 bg-emerald-500 text-white rounded-xl font-bold hover:bg-emerald-400 transition shadow-lg shadow-emerald-500/20"
        >
          Go to Dashboard
        </button>
      </div>
    </div>
  )
}
