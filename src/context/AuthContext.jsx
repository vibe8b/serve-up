import { createContext, useContext, useState, useCallback } from 'react'
import api from '../api'

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(false)

  const login = useCallback(async (email, password) => {
    setLoading(true)
    try {
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
    setUser(null)
  }, [])

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
