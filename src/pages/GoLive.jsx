import { useMerchant } from '../context/MerchantContext'
import { useNavigate } from 'react-router-dom'
import { useState } from 'react'

export default function GoLive() {
  const { merchant, update } = useMerchant()
  const navigate = useNavigate()
  const [copied, setCopied] = useState(false)

  const bookingUrl = `${window.location.origin}${window.location.pathname}#/book/${merchant.slug}`

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
    <div className="min-h-screen flex items-center justify-center p-5" style={{ background: 'var(--bg)' }}>
      <div className="max-w-md w-full text-center">
        <div className="w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6" style={{ background: 'var(--accentBg)' }}>
          <svg className="w-10 h-10" fill="none" stroke="var(--accent)" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>

        <h1 className="text-3xl font-black mb-2" style={{ color: 'var(--text)' }}>You're live.</h1>
        <p className="mb-8" style={{ color: 'var(--textSecondary)' }}>
          Your booking page is ready. Share the link and start getting paid.
        </p>

        <div className="rounded-3xl p-5 mb-6 text-left" style={{ background: 'var(--bgCard)', border: '1px solid var(--border)' }}>
          <p className="text-xs font-semibold mb-2" style={{ color: 'var(--textMuted)' }}>Your booking link</p>
          <div className="flex items-center gap-2">
            <code className="flex-1 text-sm font-mono px-3 py-2.5 rounded-2xl truncate" style={{ background: 'var(--accentBg)', color: 'var(--accentText)' }}>
              {bookingUrl}
            </code>
            <button onClick={copy} className="px-4 py-2.5 text-sm font-bold rounded-2xl transition hover:opacity-90 shrink-0" style={{ background: 'var(--accent)', color: 'var(--btnText)' }}>
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-6">
          <button onClick={() => window.open(`sms:&body=Book me here: ${bookingUrl}`, '_blank')}
            className="flex items-center justify-center gap-2 py-3.5 rounded-2xl text-sm font-medium transition"
            style={{ background: 'var(--bgCard)', border: '1px solid var(--border)', color: 'var(--textSecondary)' }}
          >iMessage</button>
          <button onClick={() => window.open('https://www.instagram.com/', '_blank')}
            className="flex items-center justify-center gap-2 py-3.5 rounded-2xl text-sm font-medium transition"
            style={{ background: 'var(--bgCard)', border: '1px solid var(--border)', color: 'var(--textSecondary)' }}
          >Instagram</button>
        </div>

        <button onClick={() => navigate(`/book/${merchant.slug}`)}
          className="w-full py-3.5 rounded-2xl text-sm font-medium mb-4 transition"
          style={{ background: 'var(--bgCard)', border: '1px solid var(--border)', color: 'var(--textSecondary)' }}
        >Test your booking page →</button>

        <button onClick={proceed}
          className="w-full py-4 rounded-2xl font-bold transition hover:opacity-90"
          style={{ background: 'var(--accent)', color: 'var(--btnText)', boxShadow: '0 8px 24px -4px var(--accent)' }}
        >Go to Dashboard</button>
      </div>
    </div>
  )
}
