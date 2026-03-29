import { useState } from 'react'
import { useMerchant } from '../context/MerchantContext'
import { useAuth } from '../context/AuthContext'
import { useTheme, THEMES } from '../context/ThemeContext'

const PLATFORM_FEE = 0.5

export default function Settings() {
  const { merchant, update, updateAvailability } = useMerchant()
  const { logout } = useAuth()
  const { theme, setTheme } = useTheme()
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
      <h1 className="text-xl font-bold mb-1" style={{ color: 'var(--text)' }}>Settings</h1>
      <p className="text-sm mb-6" style={{ color: 'var(--textMuted)' }}>Manage your account, schedule, and appearance.</p>

      {/* Theme */}
      <div className="rounded-3xl p-6 mb-5" style={{ background: 'var(--bgCard)', border: '1px solid var(--border)' }}>
        <h2 className="font-semibold text-sm mb-1" style={{ color: 'var(--text)' }}>Appearance</h2>
        <p className="text-xs mb-4" style={{ color: 'var(--textMuted)' }}>Choose your color scheme.</p>
        <div className="grid grid-cols-2 gap-3">
          {Object.entries(THEMES).map(([key, t]) => (
            <button
              key={key}
              onClick={() => setTheme(key)}
              className="flex items-center gap-3 p-4 rounded-2xl transition-all text-left"
              style={{
                background: theme === key ? 'var(--accentBg)' : 'var(--bgInput)',
                border: `2px solid ${theme === key ? 'var(--accent)' : 'var(--border)'}`,
              }}
            >
              <div className="flex gap-1">
                <div className="w-5 h-5 rounded-full" style={{ background: t.accent }} />
                <div className="w-5 h-5 rounded-full" style={{ background: t.bg }} />
                <div className="w-5 h-5 rounded-full" style={{ background: t.bgSidebar, border: '1px solid ' + t.border }} />
              </div>
              <span className="text-xs font-semibold" style={{ color: theme === key ? 'var(--accentText)' : 'var(--textSecondary)' }}>
                {t.name}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Account */}
      <div className="rounded-3xl p-6 mb-5" style={{ background: 'var(--bgCard)', border: '1px solid var(--border)' }}>
        <h2 className="font-semibold text-sm mb-3" style={{ color: 'var(--text)' }}>Account</h2>
        <div className="space-y-2 text-sm">
          {[['Name', merchant.name], ['Business', merchant.businessName], ['Category', merchant.category], ['Link', `/book/${merchant.slug}`]].map(([label, val]) => (
            <div key={label} className="flex justify-between py-2" style={{ borderBottom: '1px solid var(--border)' }}>
              <span style={{ color: 'var(--textMuted)' }}>{label}</span>
              <span className="font-medium" style={{ color: 'var(--text)' }}>{val}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Availability */}
      <div className="rounded-3xl p-6 mb-5" style={{ background: 'var(--bgCard)', border: '1px solid var(--border)' }}>
        <h2 className="font-semibold text-sm mb-1" style={{ color: 'var(--text)' }}>Availability</h2>
        <p className="text-xs mb-4" style={{ color: 'var(--textMuted)' }}>When clients can book you.</p>
        <div className="space-y-2">
          {availability.map((day, i) => (
            <div key={day.day} className="flex items-center gap-3 p-3 rounded-2xl transition" style={{
              background: day.enabled ? 'var(--bgInput)' : 'transparent',
              border: '1px solid var(--border)',
              opacity: day.enabled ? 1 : 0.4,
            }}>
              <button onClick={() => toggleDay(i)} className="w-12 text-[10px] font-bold rounded-xl py-1.5 transition" style={{
                background: day.enabled ? 'var(--accentBg)' : 'var(--bgInput)',
                color: day.enabled ? 'var(--accentText)' : 'var(--textMuted)',
              }}>
                {day.day}
              </button>
              {day.enabled ? (
                <div className="flex items-center gap-2 flex-1">
                  <input type="time" value={day.open} onChange={(e) => setDayTime(i, 'open', e.target.value)}
                    className="flex-1 px-3 py-1.5 rounded-xl text-xs outline-none transition"
                    style={{ background: 'var(--bgCard)', border: '1px solid var(--border)', color: 'var(--text)' }}
                  />
                  <span className="text-xs" style={{ color: 'var(--textMuted)' }}>–</span>
                  <input type="time" value={day.close} onChange={(e) => setDayTime(i, 'close', e.target.value)}
                    className="flex-1 px-3 py-1.5 rounded-xl text-xs outline-none transition"
                    style={{ background: 'var(--bgCard)', border: '1px solid var(--border)', color: 'var(--text)' }}
                  />
                </div>
              ) : (
                <span className="text-xs" style={{ color: 'var(--textMuted)' }}>Closed</span>
              )}
            </div>
          ))}
        </div>
        <button onClick={saveSchedule} className="mt-4 px-5 py-2.5 rounded-2xl text-xs font-bold transition hover:opacity-90" style={{ background: 'var(--accent)', color: 'var(--btnText)' }}>
          {saved ? 'Saved!' : 'Save Schedule'}
        </button>
      </div>

      {/* Fee */}
      <div className="rounded-3xl p-6 mb-5" style={{ background: 'var(--bgCard)', border: '1px solid var(--border)' }}>
        <h2 className="font-semibold text-sm mb-1" style={{ color: 'var(--text)' }}>Pricing</h2>
        <p className="text-xs mb-3" style={{ color: 'var(--textMuted)' }}>How your earnings work.</p>
        <div className="rounded-2xl p-4 flex items-center gap-3" style={{ background: 'var(--accentBg)' }}>
          <div className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0" style={{ background: 'var(--accent)' }}>
            <span className="font-bold text-sm" style={{ color: 'var(--btnText)' }}>$</span>
          </div>
          <div>
            <p className="text-sm font-semibold" style={{ color: 'var(--text)' }}>You keep ${(35 - PLATFORM_FEE).toFixed(2)} on a $35 service</p>
            <p className="text-xs" style={{ color: 'var(--textMuted)' }}>${PLATFORM_FEE.toFixed(2)} booking fee per transaction</p>
          </div>
        </div>
      </div>

      {/* Logout */}
      <div className="rounded-3xl p-6" style={{ background: 'var(--bgCard)', border: '1px solid var(--border)' }}>
        <button onClick={logout} className="px-4 py-2.5 rounded-2xl text-xs font-semibold transition" style={{ background: 'var(--bgInput)', color: 'var(--textSecondary)', border: '1px solid var(--border)' }}>
          Log Out
        </button>
      </div>
    </div>
  )
}
