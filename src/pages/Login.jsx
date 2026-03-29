import { useState } from 'react'
import { useAuth } from '../context/AuthContext'

const CATEGORIES = [
  'Barber', 'Hair Stylist', 'Nail Tech', 'Makeup Artist', 'Photographer',
  'Personal Trainer', 'Massage Therapist', 'Tattoo Artist', 'DJ',
  'Tutor', 'Cleaning', 'Other',
]

const DEMO_EMAIL = 'demo@serveup.io'
const DEMO_PASS = 'demo123'

export default function Login() {
  const { login, register, loading } = useAuth()
  const [mode, setMode] = useState('login')
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    name: '',
    businessName: '',
    email: '',
    password: '',
    category: '',
  })

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    try {
      if (mode === 'login') {
        await login(form.email, form.password)
      } else {
        await register({
          name: form.name,
          businessName: form.businessName,
          email: form.email,
          password: form.password,
          category: form.category,
        })
      }
    } catch (err) {
      setError(err.message)
    }
  }

  const loginDemo = async () => {
    setError('')
    try {
      await login(DEMO_EMAIL, DEMO_PASS)
    } catch {
      // First time — register the demo account
      try {
        await register({
          name: 'Marcus Johnson',
          businessName: 'Marcus Cuts',
          email: DEMO_EMAIL,
          password: DEMO_PASS,
          category: 'Barber',
        })
      } catch (err) {
        setError(err.message)
      }
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-5 py-10" style={{ background: 'var(--bg)' }}>
      <div className="max-w-sm w-full">
        {/* Branding */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-black tracking-tight" style={{ color: 'var(--text)' }}>
            Serve<span style={{ color: 'var(--accent)' }}>Up</span>
          </h1>
          <p className="text-sm mt-2" style={{ color: 'var(--textSecondary)' }}>Your bookings, your business</p>
        </div>

        {/* Demo CTA */}
        <button
          onClick={loginDemo}
          className="w-full py-4 rounded-2xl font-bold text-base mb-4 transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg"
          style={{ background: 'var(--accent)', color: 'var(--btnText)', boxShadow: '0 8px 24px -4px var(--accent)' }}
        >
          Try Demo Instantly
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
          <span className="text-xs font-medium" style={{ color: 'var(--textMuted)' }}>or sign in</span>
          <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
        </div>

        {/* Toggle */}
        <div className="flex rounded-2xl p-1 mb-6" style={{ background: 'var(--bgCard)', border: '1px solid var(--border)' }}>
          <button
            type="button"
            onClick={() => { setMode('login'); setError('') }}
            className="flex-1 py-2.5 text-sm font-semibold rounded-xl transition"
            style={{
              background: mode === 'login' ? 'var(--accentBg)' : 'transparent',
              color: mode === 'login' ? 'var(--accentText)' : 'var(--textMuted)',
            }}
          >
            Log In
          </button>
          <button
            type="button"
            onClick={() => { setMode('register'); setError('') }}
            className="flex-1 py-2.5 text-sm font-semibold rounded-xl transition"
            style={{
              background: mode === 'register' ? 'var(--accentBg)' : 'transparent',
              color: mode === 'register' ? 'var(--accentText)' : 'var(--textMuted)',
            }}
          >
            Register
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3">
          {mode === 'register' && (
            <>
              <input type="text" placeholder="Your name" value={form.name} onChange={set('name')} required
                className="w-full rounded-2xl px-4 py-3.5 text-sm outline-none transition"
                style={{ background: 'var(--bgCard)', border: '2px solid var(--border)', color: 'var(--text)' }}
                onFocus={(e) => e.target.style.borderColor = 'var(--borderActive)'}
                onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
              />
              <input type="text" placeholder="Business name" value={form.businessName} onChange={set('businessName')} required
                className="w-full rounded-2xl px-4 py-3.5 text-sm outline-none transition"
                style={{ background: 'var(--bgCard)', border: '2px solid var(--border)', color: 'var(--text)' }}
                onFocus={(e) => e.target.style.borderColor = 'var(--borderActive)'}
                onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
              />
              <select value={form.category} onChange={set('category')} required
                className="w-full rounded-2xl px-4 py-3.5 text-sm outline-none transition"
                style={{ background: 'var(--bgCard)', border: '2px solid var(--border)', color: form.category ? 'var(--text)' : 'var(--textMuted)' }}
              >
                <option value="" disabled>Select category</option>
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </>
          )}

          <input type="email" placeholder="Email" value={form.email} onChange={set('email')} required
            className="w-full rounded-2xl px-4 py-3.5 text-sm outline-none transition"
            style={{ background: 'var(--bgCard)', border: '2px solid var(--border)', color: 'var(--text)' }}
            onFocus={(e) => e.target.style.borderColor = 'var(--borderActive)'}
            onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
          />
          <input type="password" placeholder="Password" value={form.password} onChange={set('password')} required minLength={6}
            className="w-full rounded-2xl px-4 py-3.5 text-sm outline-none transition"
            style={{ background: 'var(--bgCard)', border: '2px solid var(--border)', color: 'var(--text)' }}
            onFocus={(e) => e.target.style.borderColor = 'var(--borderActive)'}
            onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
          />

          {error && <p className="text-red-500 text-sm px-1">{error}</p>}

          <button type="submit" disabled={loading}
            className="w-full py-3.5 rounded-2xl font-bold text-sm transition hover:opacity-90 disabled:opacity-50"
            style={{ background: 'var(--accent)', color: 'var(--btnText)' }}
          >
            {loading ? '...' : mode === 'login' ? 'Log In' : 'Create Account'}
          </button>
        </form>

        {/* Demo credentials */}
        <div className="mt-8 rounded-2xl p-4 text-center" style={{ background: 'var(--accentBg)', border: '1px solid var(--border)' }}>
          <p className="text-xs font-semibold mb-2" style={{ color: 'var(--accentText)' }}>Demo Credentials</p>
          <p className="text-sm font-mono" style={{ color: 'var(--text)' }}>{DEMO_EMAIL}</p>
          <p className="text-sm font-mono" style={{ color: 'var(--text)' }}>{DEMO_PASS}</p>
        </div>
      </div>
    </div>
  )
}
