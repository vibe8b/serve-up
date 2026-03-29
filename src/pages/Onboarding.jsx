import { useState } from 'react'
import { useMerchant } from '../context/MerchantContext'

const CATEGORIES = [
  'Barber', 'Hair Stylist', 'Nail Tech', 'Makeup Artist', 'Photographer',
  'Personal Trainer', 'Massage Therapist', 'Tattoo Artist', 'DJ',
  'Tutor', 'Cleaning', 'Other',
]

export default function Onboarding() {
  const { merchant, update, updateService } = useMerchant()
  const [form, setForm] = useState({
    name: '',
    businessName: '',
    category: '',
  })
  const [service, setService] = useState({
    name: merchant.services[0]?.name || 'Haircut',
    price: merchant.services[0]?.price?.toString() || '35',
    duration: merchant.services[0]?.duration || 30,
  })
  const [photo, setPhoto] = useState('')

  const handlePhoto = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => setPhoto(ev.target.result)
    reader.readAsDataURL(file)
  }

  const canLaunch =
    form.name.trim() &&
    form.businessName.trim() &&
    form.category &&
    service.name.trim() &&
    service.price &&
    parseFloat(service.price) > 0

  const launch = () => {
    if (merchant.services[0]) {
      updateService(merchant.services[0].id, {
        name: service.name,
        price: parseFloat(service.price),
        duration: parseInt(service.duration),
      })
    }
    update({
      ...form,
      photo,
      onboarded: true,
      goLiveSeen: false,
    })
  }

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col lg:flex-row">
      {/* Form */}
      <div className="flex-1 flex flex-col justify-center px-5 py-10 lg:px-16">
        <div className="max-w-md mx-auto w-full">
          <p className="text-emerald-400 text-xs font-semibold tracking-widest uppercase mb-2">
            Ready in 60 seconds
          </p>
          <h1 className="text-3xl lg:text-4xl font-black text-white leading-tight mb-2">
            Start taking bookings.<br />No app needed.
          </h1>
          <p className="text-zinc-500 text-sm mb-10">Just a link. Share it anywhere.</p>

          <div className="space-y-5">
            {/* Photo + Name row */}
            <div className="flex gap-4 items-start">
              <label className="shrink-0 cursor-pointer group">
                <div className="w-16 h-16 rounded-full bg-zinc-800 border-2 border-dashed border-zinc-700 group-hover:border-emerald-400/50 flex items-center justify-center overflow-hidden transition">
                  {photo ? (
                    <img src={photo} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <svg className="w-6 h-6 text-zinc-600" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z" />
                    </svg>
                  )}
                </div>
                <input type="file" accept="image/*" onChange={handlePhoto} className="hidden" />
              </label>
              <div className="flex-1 space-y-2">
                <input
                  autoFocus
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder="Your name"
                  className="w-full px-4 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-white text-sm placeholder-zinc-600 focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 outline-none transition"
                />
                <input
                  value={form.businessName}
                  onChange={(e) => setForm((f) => ({ ...f, businessName: e.target.value }))}
                  placeholder="Business name"
                  className="w-full px-4 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-white text-sm placeholder-zinc-600 focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 outline-none transition"
                />
              </div>
            </div>

            {/* Category */}
            <div className="flex flex-wrap gap-1.5">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setForm((f) => ({ ...f, category: cat }))}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition ${
                    form.category === cat
                      ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400'
                      : 'border-zinc-800 text-zinc-500 hover:border-zinc-700'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Service — pre-filled, editable */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 space-y-3">
              <p className="text-zinc-400 text-xs font-medium">Your service (edit if needed)</p>
              <div className="flex gap-2">
                <input
                  value={service.name}
                  onChange={(e) => setService((s) => ({ ...s, name: e.target.value }))}
                  className="flex-1 px-3 py-2.5 bg-zinc-800 border border-zinc-700 rounded-lg text-white text-sm placeholder-zinc-600 focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 outline-none transition"
                />
                <div className="relative w-24">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 text-sm">$</span>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={service.price}
                    onChange={(e) => setService((s) => ({ ...s, price: e.target.value }))}
                    className="w-full pl-7 pr-2 py-2.5 bg-zinc-800 border border-zinc-700 rounded-lg text-white text-sm focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 outline-none transition"
                  />
                </div>
                <select
                  value={service.duration}
                  onChange={(e) => setService((s) => ({ ...s, duration: e.target.value }))}
                  className="w-20 px-1 py-2.5 bg-zinc-800 border border-zinc-700 rounded-lg text-white text-xs focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 outline-none transition"
                >
                  {[15, 30, 45, 60, 90].map((d) => (
                    <option key={d} value={d}>{d}m</option>
                  ))}
                </select>
              </div>
              {service.name && service.price && (
                <p className="text-emerald-400 text-xs">
                  You keep <span className="font-bold">${(parseFloat(service.price) - 0.5).toFixed(2)}</span> per booking
                </p>
              )}
            </div>

            {/* Launch */}
            <button
              onClick={launch}
              disabled={!canLaunch}
              className="w-full py-3.5 bg-emerald-500 text-white rounded-xl font-bold text-base hover:bg-emerald-400 disabled:opacity-30 disabled:cursor-not-allowed transition shadow-lg shadow-emerald-500/20"
            >
              Go Live
            </button>
            <p className="text-zinc-600 text-[11px] text-center">
              Default hours: Mon–Sat, 9am–5pm. Change anytime in Settings.
            </p>
          </div>
        </div>
      </div>

      {/* Preview — desktop only */}
      <div className="hidden lg:flex w-[380px] bg-zinc-900 border-l border-zinc-800 items-center justify-center p-6">
        <div className="w-full max-w-[320px]">
          <p className="text-zinc-600 text-[10px] font-medium uppercase tracking-widest mb-4 text-center">
            What your clients see
          </p>
          <PreviewCard
            businessName={form.businessName || 'Your Business'}
            category={form.category}
            photo={photo}
            serviceName={service.name}
            servicePrice={service.price}
            serviceDuration={service.duration}
          />
        </div>
      </div>
    </div>
  )
}

function PreviewCard({ businessName, category, photo, serviceName, servicePrice, serviceDuration }) {
  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-2xl text-left">
      <div className="bg-zinc-900 px-5 py-6 text-center">
        {photo ? (
          <img src={photo} alt="" className="w-14 h-14 rounded-full mx-auto mb-2 object-cover ring-2 ring-emerald-500" />
        ) : (
          <div className="w-14 h-14 rounded-full mx-auto mb-2 bg-zinc-800 flex items-center justify-center">
            <span className="text-zinc-500 text-lg font-bold">{businessName[0]?.toUpperCase() || '?'}</span>
          </div>
        )}
        <h3 className="text-white font-bold">{businessName}</h3>
        {category && <p className="text-zinc-500 text-xs mt-0.5">{category}</p>}
      </div>
      <div className="p-4">
        {serviceName && servicePrice ? (
          <div className="flex items-center justify-between p-3 bg-zinc-50 rounded-xl">
            <div>
              <p className="text-zinc-900 font-semibold text-sm">{serviceName}</p>
              <p className="text-zinc-400 text-xs">{serviceDuration} min</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-zinc-900">${parseFloat(servicePrice).toFixed(2)}</span>
              <span className="px-2.5 py-1 bg-emerald-500 text-white text-xs font-bold rounded-lg">Book</span>
            </div>
          </div>
        ) : (
          <p className="text-zinc-300 text-sm text-center py-4">Add a service to preview</p>
        )}
      </div>
      <div className="px-4 pb-3 text-center">
        <p className="text-zinc-300 text-[9px]">Powered by ServeUp</p>
      </div>
    </div>
  )
}
