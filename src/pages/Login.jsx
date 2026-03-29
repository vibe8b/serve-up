import { useState } from 'react'
import { useAuth } from '../context/AuthContext'

const CATEGORIES = [
  'Barber', 'Hair Stylist', 'Nail Tech', 'Makeup Artist', 'Photographer',
  'Personal Trainer', 'Massage Therapist', 'Tattoo Artist', 'DJ',
  'Tutor', 'Cleaning', 'Other',
]

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

  const inputClass =
    'w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-3 text-white placeholder-zinc-600 focus:outline-none focus:border-emerald-500 transition text-sm'

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center px-5 py-10">
      <div className="max-w-sm w-full">
        {/* Branding */}
        <div className="text-center mb-10">
          <h1 className="text-3xl font-black text-white tracking-tight">
            Serve<span className="text-emerald-400">Up</span>
          </h1>
          <p className="text-zinc-500 text-sm mt-1">Your bookings, your business</p>
        </div>

        {/* Toggle */}
        <div className="flex bg-zinc-900 rounded-lg p-1 mb-8">
          <button
            type="button"
            onClick={() => { setMode('login'); setError('') }}
            className={`flex-1 py-2 text-sm font-medium rounded-md transition ${
              mode === 'login' ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            Log In
          </button>
          <button
            type="button"
            onClick={() => { setMode('register'); setError('') }}
            className={`flex-1 py-2 text-sm font-medium rounded-md transition ${
              mode === 'register' ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            Register
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'register' && (
            <>
              <input
                type="text"
                placeholder="Your name"
                value={form.name}
                onChange={set('name')}
                className={inputClass}
                required
              />
              <input
                type="text"
                placeholder="Business name"
                value={form.businessName}
                onChange={set('businessName')}
                className={inputClass}
                required
              />
              <select
                value={form.category}
                onChange={set('category')}
                className={`${inputClass} ${!form.category ? 'text-zinc-600' : ''}`}
                required
              >
                <option value="" disabled>Select category</option>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </>
          )}

          <input
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={set('email')}
            className={inputClass}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={set('password')}
            className={inputClass}
            required
            minLength={6}
          />

          {error && (
            <p className="text-red-400 text-sm">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-sm transition disabled:opacity-50"
          >
            {loading ? '...' : mode === 'login' ? 'Log In' : 'Create Account'}
          </button>
        </form>
      </div>
    </div>
  )
}
