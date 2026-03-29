import { useState } from 'react'
import { useMerchant } from '../context/MerchantContext'

export default function Storefront() {
  const { merchant, update } = useMerchant()
  const [form, setForm] = useState({ photo: merchant.photo, bio: merchant.bio, location: merchant.location })
  const [saved, setSaved] = useState(false)

  const handlePhoto = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => setForm((f) => ({ ...f, photo: ev.target.result }))
    reader.readAsDataURL(file)
  }

  const save = async () => {
    await update(form)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="max-w-xl">
      <h1 className="text-xl font-bold mb-1" style={{ color: 'var(--text)' }}>Storefront</h1>
      <p className="text-sm mb-6" style={{ color: 'var(--textMuted)' }}>Edit how clients see your business.</p>

      <div className="rounded-3xl p-6" style={{ background: 'var(--bgCard)', border: '1px solid var(--border)' }}>
        <div className="mb-5">
          <label className="text-xs font-semibold mb-2 block" style={{ color: 'var(--text)' }}>Profile Photo</label>
          <div className="flex items-center gap-4">
            {form.photo ? (
              <img src={form.photo} alt="" className="w-16 h-16 rounded-2xl object-cover" style={{ border: '2px solid var(--border)' }} />
            ) : (
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{ background: 'var(--accentBg)', color: 'var(--accentText)' }}>
                <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                </svg>
              </div>
            )}
            <label className="px-4 py-2 rounded-2xl text-xs font-semibold cursor-pointer transition" style={{ background: 'var(--bgInput)', color: 'var(--textSecondary)', border: '1px solid var(--border)' }}>
              Upload
              <input type="file" accept="image/*" className="hidden" onChange={handlePhoto} />
            </label>
          </div>
        </div>

        <div className="mb-5">
          <label className="text-xs font-semibold mb-2 block" style={{ color: 'var(--text)' }}>Bio</label>
          <textarea value={form.bio || ''} onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))} rows={3} placeholder="Tell clients about yourself..."
            className="w-full rounded-2xl px-4 py-3 text-sm outline-none resize-none transition"
            style={{ background: 'var(--bgInput)', border: '2px solid var(--border)', color: 'var(--text)' }}
          />
        </div>

        <div className="mb-5">
          <label className="text-xs font-semibold mb-2 block" style={{ color: 'var(--text)' }}>Location</label>
          <input value={form.location || ''} onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))} placeholder="e.g. 123 Main St, Brooklyn, NY"
            className="w-full rounded-2xl px-4 py-3 text-sm outline-none transition"
            style={{ background: 'var(--bgInput)', border: '2px solid var(--border)', color: 'var(--text)' }}
          />
        </div>

        <button onClick={save} className="px-5 py-2.5 rounded-2xl text-sm font-bold transition hover:opacity-90" style={{ background: 'var(--accent)', color: 'var(--btnText)' }}>
          {saved ? 'Saved!' : 'Save'}
        </button>
      </div>
    </div>
  )
}
