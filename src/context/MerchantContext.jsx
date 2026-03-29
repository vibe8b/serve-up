import { createContext, useContext, useState, useCallback } from 'react'
import api from '../api'

const MerchantContext = createContext()

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

  // Set full merchant data (called after login/register)
  const setMerchantData = useCallback((data) => {
    setMerchant({
      ...EMPTY,
      ...data,
      // Normalize services: ensure price is a number
      services: (data.services || []).map((s) => ({
        ...s,
        price: Number(s.price),
      })),
      // Normalize bookings
      bookings: (data.bookings || []).map((b) => ({
        ...b,
        servicePrice: Number(b.servicePrice),
        platformFee: Number(b.platformFee),
      })),
    })
  }, [])

  // Refresh merchant data from API
  const refresh = useCallback(async () => {
    try {
      const data = await api.get('/api/merchant')
      setMerchantData(data)
      return data
    } catch {
      return null
    }
  }, [setMerchantData])

  // Update merchant profile fields
  const update = useCallback(async (fields) => {
    try {
      const data = await api.patch('/api/merchant', fields)
      setMerchant((prev) => ({
        ...prev,
        ...data,
        services: (data.services || prev.services).map((s) => ({ ...s, price: Number(s.price) })),
        bookings: prev.bookings, // bookings not returned from PATCH
      }))
    } catch (err) {
      console.error('Update failed:', err)
    }
  }, [])

  // Service CRUD
  const addService = useCallback(async (service) => {
    const created = await api.post('/api/services', service)
    setMerchant((prev) => ({
      ...prev,
      services: [...prev.services, { ...created, price: Number(created.price) }],
    }))
  }, [])

  const updateService = useCallback(async (id, fields) => {
    const updated = await api.patch(`/api/services/${id}`, fields)
    setMerchant((prev) => ({
      ...prev,
      services: prev.services.map((s) => (s.id === id ? { ...updated, price: Number(updated.price) } : s)),
    }))
  }, [])

  const deleteService = useCallback(async (id) => {
    await api.delete(`/api/services/${id}`)
    setMerchant((prev) => ({
      ...prev,
      services: prev.services.filter((s) => s.id !== id),
    }))
  }, [])

  // Availability
  const updateAvailability = useCallback(async (availability) => {
    const updated = await api.put('/api/availability', availability)
    setMerchant((prev) => ({ ...prev, availability: updated }))
  }, [])

  // Bookings
  const refreshBookings = useCallback(async () => {
    try {
      const bookings = await api.get('/api/bookings')
      setMerchant((prev) => ({
        ...prev,
        bookings: bookings.map((b) => ({
          ...b,
          servicePrice: Number(b.servicePrice),
          platformFee: Number(b.platformFee),
        })),
      }))
    } catch {
      // silent
    }
  }, [])

  const cancelBooking = useCallback(async (id) => {
    await api.patch(`/api/bookings/${id}/cancel`)
    setMerchant((prev) => ({
      ...prev,
      bookings: prev.bookings.map((b) => (b.id === id ? { ...b, status: 'cancelled' } : b)),
    }))
  }, [])

  return (
    <MerchantContext.Provider
      value={{
        merchant,
        setMerchantData,
        refresh,
        update,
        addService,
        updateService,
        deleteService,
        updateAvailability,
        refreshBookings,
        cancelBooking,
      }}
    >
      {children}
    </MerchantContext.Provider>
  )
}

export const useMerchant = () => useContext(MerchantContext)
