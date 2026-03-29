import { useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import { useMerchant } from './context/MerchantContext'
import Layout from './components/Layout'
import Login from './pages/Login'
import GoLive from './pages/GoLive'
import Storefront from './pages/Storefront'
import Services from './pages/Services'
import Dashboard from './pages/Dashboard'
import Settings from './pages/Settings'
import BookingPage from './pages/BookingPage'

function App() {
  const { user } = useAuth()
  const { merchant, setMerchantData, refresh } = useMerchant()

  // When user logs in / registers, load their merchant data
  useEffect(() => {
    if (user) {
      setMerchantData(user)
      // Also do a fresh fetch to get bookings
      refresh()
    }
  }, [user, setMerchantData, refresh])

  return (
    <Routes>
      <Route path="/book/:slug" element={<BookingPage />} />

      {!user ? (
        <Route path="*" element={<Login />} />
      ) : !merchant.goLiveSeen ? (
        <Route path="*" element={<GoLive />} />
      ) : (
        <Route element={<Layout />}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/storefront" element={<Storefront />} />
          <Route path="/services" element={<Services />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Route>
      )}
    </Routes>
  )
}

export default App
