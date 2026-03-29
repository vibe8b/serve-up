import { useState } from 'react'
import { useMerchant } from '../context/MerchantContext'

const EMPTY = { name: '', duration: 30, price: '' }

export default function Services() {
  const { merchant, addService, updateService, deleteService } = useMerchant()
  const [form, setForm] = useState(EMPTY)
  const [editingId, setEditingId] = useState(null)
  const [showForm, setShowForm] = useState(false)

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    const data = { ...form, price: parseFloat(form.price), duration: parseInt(form.duration) }
    if (editingId) await updateService(editingId, data)
    else await addService(data)
    setForm(EMPTY)
    setEditingId(null)
    setShowForm(false)
  }

  const startEdit = (s) => {
    setForm({ name: s.name, duration: s.duration, price: s.price.toString() })
    setEditingId(s.id)
    setShowForm(true)
  }

  const cancel = () => { setForm(EMPTY); setEditingId(null); setShowForm(false) }
  const valid = form.name.trim() && form.price && parseFloat(form.price) > 0

  return (
    <div className="max-w-xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-white mb-0.5">Services</h1>
          <p className="text-zinc-500 text-sm">Manage what you offer.</p>
        </div>
        {!showForm && (
          <button onClick={() => setShowForm(true)} className="px-3.5 py-2 bg-emerald-500 text-white rounded-xl text-xs font-bold hover:bg-emerald-400 transition flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
            Add
          </button>
        )}
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 mb-5 space-y-3">
          <h3 className="font-semibold text-white text-sm">{editingId ? 'Edit Service' : 'New Service'}</h3>
          <input autoFocus value={form.name} onChange={set('name')} placeholder="Service name"
            className="w-full px-3.5 py-2.5 bg-zinc-800 border border-zinc-700 rounded-xl text-white text-sm placeholder-zinc-500 focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 outline-none transition" />
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 text-sm">$</span>
              <input type="number" min="0" step="0.01" value={form.price} onChange={set('price')} placeholder="0.00"
                className="w-full pl-7 pr-3 py-2.5 bg-zinc-800 border border-zinc-700 rounded-xl text-white text-sm placeholder-zinc-500 focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 outline-none transition" />
            </div>
            <select value={form.duration} onChange={set('duration')}
              className="w-24 px-2 py-2.5 bg-zinc-800 border border-zinc-700 rounded-xl text-white text-xs focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 outline-none transition">
              {[15, 30, 45, 60, 90, 120].map((d) => <option key={d} value={d}>{d} min</option>)}
            </select>
          </div>
          <div className="flex gap-2 pt-1">
            <button type="button" onClick={cancel} className="flex-1 py-2.5 border border-zinc-700 rounded-xl text-sm font-medium text-zinc-400 hover:bg-zinc-800 transition">Cancel</button>
            <button type="submit" disabled={!valid} className="flex-1 py-2.5 bg-emerald-500 text-white rounded-xl text-sm font-bold hover:bg-emerald-400 disabled:opacity-30 disabled:cursor-not-allowed transition">{editingId ? 'Update' : 'Add'}</button>
          </div>
        </form>
      )}

      <div className="space-y-2">
        {merchant.services.map((s) => (
          <div key={s.id} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 flex items-center justify-between hover:border-zinc-700 transition">
            <div>
              <h3 className="font-semibold text-white text-sm">{s.name}</h3>
              <p className="text-zinc-500 text-xs mt-0.5">{s.duration} min · You keep ${(s.price - 0.5).toFixed(2)}</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-emerald-400 font-bold">${s.price.toFixed(2)}</span>
              <div className="flex gap-0.5">
                <button onClick={() => startEdit(s)} className="p-1.5 text-zinc-500 hover:text-emerald-400 hover:bg-emerald-500/10 rounded-lg transition">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" /></svg>
                </button>
                <button onClick={() => deleteService(s.id)} className="p-1.5 text-zinc-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" /></svg>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
