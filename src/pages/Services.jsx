import { useState } from 'react'
import { useMerchant } from '../context/MerchantContext'

const PLATFORM_FEE = 0.5
const EMPTY = { name: '', price: '', duration: '30' }

export default function Services() {
  const { merchant, addService, updateService, deleteService } = useMerchant()
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(EMPTY)

  const startEdit = (s) => {
    setForm({ name: s.name, price: String(s.price), duration: String(s.duration) })
    setEditingId(s.id)
    setShowForm(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const data = { ...form, price: parseFloat(form.price), duration: parseInt(form.duration) }
    if (editingId) await updateService(editingId, data)
    else await addService(data)
    setForm(EMPTY)
    setEditingId(null)
    setShowForm(false)
  }

  return (
    <div className="max-w-xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold" style={{ color: 'var(--text)' }}>Services</h1>
          <p className="text-sm" style={{ color: 'var(--textMuted)' }}>Manage what you offer.</p>
        </div>
        <button onClick={() => { setForm(EMPTY); setEditingId(null); setShowForm(true) }} className="px-4 py-2.5 rounded-2xl text-sm font-bold transition hover:opacity-90" style={{ background: 'var(--accent)', color: 'var(--btnText)' }}>
          + Add
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="rounded-3xl p-6 mb-5" style={{ background: 'var(--bgCard)', border: '1px solid var(--border)' }}>
          <div className="grid grid-cols-3 gap-3 mb-4">
            <input placeholder="Service name" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} required
              className="col-span-3 rounded-2xl px-4 py-3 text-sm outline-none"
              style={{ background: 'var(--bgInput)', border: '2px solid var(--border)', color: 'var(--text)' }}
            />
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm" style={{ color: 'var(--textMuted)' }}>$</span>
              <input type="number" step="0.01" min="1" placeholder="Price" value={form.price} onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))} required
                className="w-full rounded-2xl pl-7 pr-3 py-3 text-sm outline-none"
                style={{ background: 'var(--bgInput)', border: '2px solid var(--border)', color: 'var(--text)' }}
              />
            </div>
            <select value={form.duration} onChange={(e) => setForm((f) => ({ ...f, duration: e.target.value }))}
              className="rounded-2xl px-3 py-3 text-sm outline-none"
              style={{ background: 'var(--bgInput)', border: '2px solid var(--border)', color: 'var(--text)' }}
            >
              {[15, 30, 45, 60, 90, 120].map((m) => <option key={m} value={m}>{m}m</option>)}
            </select>
            <div className="flex gap-2">
              <button type="submit" className="flex-1 py-3 rounded-2xl text-xs font-bold transition hover:opacity-90" style={{ background: 'var(--accent)', color: 'var(--btnText)' }}>
                {editingId ? 'Save' : 'Add'}
              </button>
              <button type="button" onClick={() => { setShowForm(false); setEditingId(null) }} className="px-3 py-3 rounded-2xl text-xs" style={{ color: 'var(--textMuted)', background: 'var(--bgInput)' }}>
                Cancel
              </button>
            </div>
          </div>
        </form>
      )}

      <div className="space-y-3">
        {merchant.services.map((s) => (
          <div key={s.id} className="flex items-center justify-between p-5 rounded-3xl" style={{ background: 'var(--bgCard)', border: '1px solid var(--border)' }}>
            <div>
              <p className="font-semibold text-sm" style={{ color: 'var(--text)' }}>{s.name}</p>
              <p className="text-xs mt-0.5" style={{ color: 'var(--textMuted)' }}>{s.duration} min · You keep ${(s.price - PLATFORM_FEE).toFixed(2)}</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="font-bold" style={{ color: 'var(--accent)' }}>${s.price.toFixed(2)}</span>
              <button onClick={() => startEdit(s)} className="p-2 rounded-xl transition hover:opacity-70" style={{ color: 'var(--textMuted)' }}>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" />
                </svg>
              </button>
              <button onClick={() => deleteService(s.id)} className="p-2 rounded-xl transition hover:opacity-70" style={{ color: 'var(--textMuted)' }}>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                </svg>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
