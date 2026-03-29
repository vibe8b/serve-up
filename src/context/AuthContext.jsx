import { createContext, useContext, useState, useCallback } from 'react'
import api, { isDemo } from '../api'

const AuthContext = createContext()

const STORAGE_KEY = 'serveup_merchant'

function loadDemo() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY))
  } catch { return null }
}

function saveDemo(merchant) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(merchant))
}

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => isDemo ? loadDemo() : null)
  const [loading, setLoading] = useState(false)

  const login = useCallback(async (email, password) => {
    setLoading(true)
    try {
      if (isDemo) {
        // Demo mode: check localStorage
        const stored = loadDemo()
        if (stored && stored.email === email) {
          setUser(stored)
          return { merchant: stored }
        }
        throw new Error('No account found. Register first.')
      }
      const data = await api.post('/api/auth/login', { email, password })
      api.setToken(data.accessToken)
      setUser(data.merchant)
      return data
    } finally {
      setLoading(false)
    }
  }, [])

  const register = useCallback(async (fields) => {
    setLoading(true)
    try {
      if (isDemo) {
        // Demo mode: create merchant in localStorage
        const slug = fields.businessName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
        const merchant = {
          id: crypto.randomUUID(),
          email: fields.email,
          name: fields.name,
          businessName: fields.businessName,
          category: fields.category,
          slug,
          photo: '',
          bio: '',
          location: '',
          onboarded: true,
          goLiveSeen: false,
          services: [{ id: crypto.randomUUID(), name: 'Haircut', price: 35, duration: 30 }],
          availability: DAYS.map((day) => ({ day, enabled: day !== 'Sun', open: '09:00', close: '17:00' })),
          bookings: [],
        }
        saveDemo(merchant)
        setUser(merchant)
        return { merchant }
      }
      const data = await api.post('/api/auth/register', fields)
      api.setToken(data.accessToken)
      setUser(data.merchant)
      return data
    } finally {
      setLoading(false)
    }
  }, [])

  const logout = useCallback(() => {
    api.setToken(null)
    if (isDemo) localStorage.removeItem(STORAGE_KEY)
    setUser(null)
  }, [])

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
