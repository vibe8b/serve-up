import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { MerchantProvider } from './context/MerchantContext'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <MerchantProvider>
          <App />
        </MerchantProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
)
