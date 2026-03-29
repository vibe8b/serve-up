import { useState } from 'react'
import { useMerchant } from '../context/MerchantContext'

export default function Storefront() {
  const { merchant, update } = useMerchant()
  const [form, setForm] = useState({
    photo: merchant.photo,
    bio: merchant.bio,
    location: merchant.location,
  })
  const [saved, setSaved] = useState(false)

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }))

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
    <div className="flex gap-8">
      <div className="flex-1 max-w-lg">
        <h1 className="text-xl font-bold text-white mb-1">Storefront</h1>
        <p className="text-zinc-500 text-sm mb-6">Edit how clients see your business.</p>

        <div className="space-y-5">
          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-2">Profile Photo</label>
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-full bg-zinc-800 border-2 border-dashed border-zinc-700 flex items-center justify-center overflow-hidden">
                {form.photo ? (
                  <img src={form.photo} alt="" className="w-full h-full object-cover" />
                ) : (
                  <svg className="w-5 h-5 text-zinc-600" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0" />
                  </svg>
                )}
              </div>
              <label className="px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-xs font-medium text-zinc-300 hover:bg-zinc-700 cursor-pointer transition">
                Upload
                <input type="file" accept="image/*" onChange={handlePhoto} className="hidden" />
              </label>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-2">Bio</label>
            <textarea
              value={form.bio}
              onChange={set('bio')}
              rows={3}
              placeholder="Tell clients about yourself..."
              className="w-full px-3.5 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-white text-sm placeholder-zinc-600 focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 outline-none transition resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-2">Location</label>
            <input
              value={form.location}
              onChange={set('location')}
              placeholder="e.g. 123 Main St, Brooklyn, NY"
              className="w-full px-3.5 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-white text-sm placeholder-zinc-600 focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 outline-none transition"
            />
          </div>

          <button onClick={save} className="px-5 py-2.5 bg-emerald-500 text-white rounded-xl text-sm font-bold hover:bg-emerald-400 transition">
            {saved ? 'Saved!' : 'Save'}
          </button>
        </div>
      </div>

      {/* Live preview */}
      <div className="hidden lg:block w-72 shrink-0">
        <p className="text-zinc-600 text-[10px] font-medium uppercase tracking-widest mb-3 text-center">Client View</p>
        <div className="sticky top-8 bg-white rounded-2xl overflow-hidden shadow-xl">
          <div className="bg-zinc-900 px-4 py-5 text-center">
            {form.photo ? (
              <img src={form.photo} alt="" className="w-12 h-12 rounded-full mx-auto mb-2 object-cover ring-2 ring-emerald-500" />
            ) : (
              <div className="w-12 h-12 rounded-full mx-auto mb-2 bg-zinc-800 flex items-center justify-center">
                <span className="text-zinc-500 font-bold">{merchant.businessName?.[0]?.toUpperCase()}</span>
              </div>
            )}
            <h3 className="text-white font-bold text-sm">{merchant.businessName}</h3>
            {merchant.category && <p className="text-zinc-500 text-xs">{merchant.category}</p>}
            {form.bio && <p className="text-zinc-400 text-xs mt-1.5 line-clamp-2">{form.bio}</p>}
          </div>
          <div className="p-3.5 space-y-1.5">
            {merchant.services.map((s) => (
              <div key={s.id} className="flex items-center justify-between p-2.5 bg-zinc-50 rounded-lg">
                <div>
                  <p className="text-zinc-900 font-semibold text-xs">{s.name}</p>
                  <p className="text-zinc-400 text-[10px]">{s.duration} min</p>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-zinc-900 font-bold text-xs">${s.price.toFixed(2)}</span>
                  <span className="px-2 py-0.5 bg-emerald-500 text-white text-[10px] font-bold rounded">Book</span>
                </div>
              </div>
            ))}
            {form.location && (
              <p className="text-zinc-400 text-[10px] pt-2 border-t border-zinc-100 flex items-center gap-1">
                <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 0115 0z" />
                </svg>
                {form.location}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
