import { createContext, useContext, useState, useCallback } from 'react'
import api, { isDemo } from '../api'

const MerchantContext = createContext()

const STORAGE_KEY = 'serveup_merchant'

function persist(merchant) {
  if (isDemo) localStorage.setItem(STORAGE_KEY, JSON.stringify(merchant))
}

const EMPTY = {
  onboarded: false,
  goLiveSeen: false,
  name: '',
  businessName: '',
  category: '',
  slug: '',
  photo: '',
  bio: '',
  location: '',
  availability: [],
  services: [],
  bookings: [],
}

export function MerchantProvider({ children }) {
  const [merchant, setMerchant] = useState(EMPTY)

  const setMerchantData = useCallback((data) => {
    const m = {
      ...EMPTY,
      ...data,
      services: (data.services || []).map((s) => ({ ...s, price: Number(s.price) })),
      bookings: (data.bookings || []).map((b) => ({ ...b, servicePrice: Number(b.servicePrice || 0), platformFee: Number(b.platformFee || 0) })),
    }
    setMerchant(m)
  }, [])

  const refresh = useCallback(async () => {
    if (isDemo) return merchant
    try {
      const data = await api.get('/api/merchant')
      setMerchantData(data)
      return data
    } catch { return null }
  }, [setMerchantData, merchant])

  const update = useCallback(async (fields) => {
    if (isDemo) {
      setMerchant((prev) => {
        const next = { ...prev, ...fields }
        persist(next)
        return next
      })
      return
    }
    try {
      const data = await api.patch('/api/merchant', fields)
      setMerchant((prev) => ({
        ...prev,
        ...data,
        services: (data.services || prev.services).map((s) => ({ ...s, price: Number(s.price) })),
        bookings: prev.bookings,
      }))
    } catch (err) { console.error('Update failed:', err) }
  }, [])

  const addService = useCallback(async (service) => {
    if (isDemo) {
      setMerchant((prev) => {
        const next = { ...prev, services: [...prev.services, { ...service, id: crypto.randomUUID() }] }
        persist(next)
        return next
      })
      return
    }
    const created = await api.post('/api/services', service)
    setMerchant((prev) => ({ ...prev, services: [...prev.services, { ...created, price: Number(created.price) }] }))
  }, [])

  const updateService = useCallback(async (id, fields) => {
    if (isDemo) {
      setMerchant((prev) => {
        const next = { ...prev, services: prev.services.map((s) => (s.id === id ? { ...s, ...fields } : s)) }
        persist(next)
        return next
      })
      return
    }
    const updated = await api.patch(`/api/services/${id}`, fields)
    setMerchant((prev) => ({ ...prev, services: prev.services.map((s) => (s.id === id ? { ...updated, price: Number(updated.price) } : s)) }))
  }, [])

  const deleteService = useCallback(async (id) => {
    if (isDemo) {
      setMerchant((prev) => {
        const next = { ...prev, services: prev.services.filter((s) => s.id !== id) }
        persist(next)
        return next
      })
      return
    }
    await api.delete(`/api/services/${id}`)
    setMerchant((prev) => ({ ...prev, services: prev.services.filter((s) => s.id !== id) }))
  }, [])

  const updateAvailability = useCallback(async (availability) => {
    if (isDemo) {
      setMerchant((prev) => {
        const next = { ...prev, availability }
        persist(next)
        return next
      })
      return
    }
    const updated = await api.put('/api/availability', availability)
    setMerchant((prev) => ({ ...prev, availability: updated }))
  }, [])

  const refreshBookings = useCallback(async () => {
    if (isDemo) return
    try {
      const bookings = await api.get('/api/bookings')
      setMerchant((prev) => ({
        ...prev,
        bookings: bookings.map((b) => ({ ...b, servicePrice: Number(b.servicePrice), platformFee: Number(b.platformFee) })),
      }))
    } catch {}
  }, [])

  const cancelBooking = useCallback(async (id) => {
    if (isDemo) {
      setMerchant((prev) => {
        const next = { ...prev, bookings: prev.bookings.map((b) => (b.id === id ? { ...b, status: 'cancelled' } : b)) }
        persist(next)
        return next
      })
      return
    }
    await api.patch(`/api/bookings/${id}/cancel`)
    setMerchant((prev) => ({ ...prev, bookings: prev.bookings.map((b) => (b.id === id ? { ...b, status: 'cancelled' } : b)) }))
  }, [])

  const addBooking = useCallback((booking) => {
    setMerchant((prev) => {
      const next = {
        ...prev,
        bookings: [{ ...booking, id: crypto.randomUUID(), createdAt: new Date().toISOString(), paid: true }, ...prev.bookings],
      }
      persist(next)
      return next
    })
  }, [])

  return (
    <MerchantContext.Provider
      value={{ merchant, setMerchantData, refresh, update, addService, updateService, deleteService, updateAvailability, refreshBookings, cancelBooking, addBooking }}
    >
      {children}
    </MerchantContext.Provider>
  )
}

export const useMerchant = () => useContext(MerchantContext)
