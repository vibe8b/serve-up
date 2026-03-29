import { useState } from 'react'
import { useMerchant } from '../context/MerchantContext'
import { useAuth } from '../context/AuthContext'

const PLATFORM_FEE = 0.5

export default function Settings() {
  const { merchant, update, updateAvailability } = useMerchant()
  const { logout } = useAuth()
  const [availability, setAvailability] = useState([...merchant.availability])
  const [saved, setSaved] = useState(false)

  const toggleDay = (i) => setAvailability((a) => a.map((d, j) => (j === i ? { ...d, enabled: !d.enabled } : d)))
  const setDayTime = (i, field, val) => setAvailability((a) => a.map((d, j) => (j === i ? { ...d, [field]: val } : d)))

  const saveSchedule = async () => {
    await updateAvailability(availability)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="max-w-xl">
      <h1 className="text-xl font-bold text-white mb-1">Settings</h1>
      <p className="text-zinc-500 text-sm mb-6">Manage your account and schedule.</p>

      {/* Account */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 mb-5">
        <h2 className="font-semibold text-white text-sm mb-3">Account</h2>
        <div className="space-y-2 text-sm">
          {[['Name', merchant.name], ['Business', merchant.businessName], ['Category', merchant.category], ['Link', `/book/${merchant.slug}`]].map(([label, val]) => (
            <div key={label} className="flex justify-between py-1.5 border-b border-zinc-800/50 last:border-0">
              <span className="text-zinc-500">{label}</span>
              <span className="text-zinc-300 font-medium">{val}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Availability */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 mb-5">
        <h2 className="font-semibold text-white text-sm mb-1">Availability</h2>
        <p className="text-zinc-500 text-xs mb-4">When clients can book you.</p>
        <div className="space-y-1.5">
          {availability.map((day, i) => (
            <div key={day.day} className={`flex items-center gap-2.5 p-2.5 rounded-xl border transition ${day.enabled ? 'border-zinc-800 bg-zinc-800/30' : 'border-zinc-900 opacity-40'}`}>
              <button onClick={() => toggleDay(i)} className={`w-11 text-[10px] font-bold rounded-lg py-1 transition ${day.enabled ? 'bg-emerald-500/15 text-emerald-400' : 'bg-zinc-800 text-zinc-600'}`}>
                {day.day}
              </button>
              {day.enabled ? (
                <div className="flex items-center gap-1.5 flex-1">
                  <input type="time" value={day.open} onChange={(e) => setDayTime(i, 'open', e.target.value)} className="flex-1 px-2 py-1 bg-zinc-900 border border-zinc-700 rounded-lg text-white text-xs outline-none focus:border-emerald-500 transition" />
                  <span className="text-zinc-600 text-xs">–</span>
                  <input type="time" value={day.close} onChange={(e) => setDayTime(i, 'close', e.target.value)} className="flex-1 px-2 py-1 bg-zinc-900 border border-zinc-700 rounded-lg text-white text-xs outline-none focus:border-emerald-500 transition" />
                </div>
              ) : (
                <span className="text-zinc-600 text-xs">Closed</span>
              )}
            </div>
          ))}
        </div>
        <button onClick={saveSchedule} className="mt-3 px-4 py-2 bg-emerald-500 text-white rounded-xl text-xs font-bold hover:bg-emerald-400 transition">
          {saved ? 'Saved!' : 'Save'}
        </button>
      </div>

      {/* Fee */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 mb-5">
        <h2 className="font-semibold text-white text-sm mb-1">Pricing</h2>
        <p className="text-zinc-500 text-xs mb-3">How your earnings work.</p>
        <div className="bg-zinc-800/50 rounded-xl p-4 flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-emerald-500/15 flex items-center justify-center shrink-0">
            <span className="text-emerald-400 font-bold text-sm">$</span>
          </div>
          <div>
            <p className="text-white text-sm font-medium">You keep ${(35 - PLATFORM_FEE).toFixed(2)} on a $35 service</p>
            <p className="text-zinc-500 text-xs">${PLATFORM_FEE.toFixed(2)} booking fee per transaction</p>
          </div>
        </div>
      </div>

      {/* Logout */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
        <button
          onClick={logout}
          className="px-3.5 py-2 bg-zinc-800 text-zinc-300 border border-zinc-700 rounded-xl text-xs font-medium hover:bg-zinc-700 transition"
        >
          Log Out
        </button>
      </div>
    </div>
  )
}
