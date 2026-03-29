import { createContext, useContext, useState, useEffect } from 'react'

const ThemeContext = createContext()

export const THEMES = {
  peach: {
    name: 'Peach & Sky',
    bg: '#FFF5F0',
    bgCard: '#FFFFFF',
    bgSidebar: '#FFF0E8',
    bgInput: '#FFF8F4',
    border: '#FFE4D6',
    borderActive: '#FF9B71',
    text: '#2D1B0E',
    textSecondary: '#8B6E5A',
    textMuted: '#BFA28E',
    accent: '#FF9B71',
    accentHover: '#FF8555',
    accentBg: '#FFF0E8',
    accentText: '#D4622A',
    success: '#7EC8A4',
    btnText: '#FFFFFF',
    booking: '#EEF6FF',
    bookingAccent: '#7BB8E8',
  },
  lavender: {
    name: 'Lavender Mist',
    bg: '#F5F0FF',
    bgCard: '#FFFFFF',
    bgSidebar: '#EDE5FF',
    bgInput: '#F8F4FF',
    border: '#E0D4F5',
    borderActive: '#A78BFA',
    text: '#1E1533',
    textSecondary: '#6B5A8A',
    textMuted: '#A898C0',
    accent: '#A78BFA',
    accentHover: '#8B6CF7',
    accentBg: '#EDE5FF',
    accentText: '#7C3AED',
    success: '#7EC8A4',
    btnText: '#FFFFFF',
    booking: '#F5F0FF',
    bookingAccent: '#A78BFA',
  },
  mint: {
    name: 'Mint Fresh',
    bg: '#F0FFF5',
    bgCard: '#FFFFFF',
    bgSidebar: '#E5FFF0',
    bgInput: '#F4FFF8',
    border: '#D4F5E4',
    borderActive: '#5BB98B',
    text: '#0E2D1B',
    textSecondary: '#4A7A5E',
    textMuted: '#8EBFA0',
    accent: '#5BB98B',
    accentHover: '#4AA77A',
    accentBg: '#E5FFF0',
    accentText: '#2D8B5A',
    success: '#5BB98B',
    btnText: '#FFFFFF',
    booking: '#F0FFF5',
    bookingAccent: '#5BB98B',
  },
  midnight: {
    name: 'Midnight',
    bg: '#09090B',
    bgCard: '#18181B',
    bgSidebar: '#09090B',
    bgInput: '#27272A',
    border: '#27272A',
    borderActive: '#10B981',
    text: '#FAFAFA',
    textSecondary: '#A1A1AA',
    textMuted: '#52525B',
    accent: '#10B981',
    accentHover: '#34D399',
    accentBg: 'rgba(16,185,129,0.1)',
    accentText: '#34D399',
    success: '#10B981',
    btnText: '#000000',
    booking: '#F4F4F5',
    bookingAccent: '#10B981',
  },
}

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => localStorage.getItem('serveup_theme') || 'peach')

  useEffect(() => {
    localStorage.setItem('serveup_theme', theme)
    const t = THEMES[theme] || THEMES.peach
    const root = document.documentElement
    Object.entries(t).forEach(([key, val]) => {
      if (key === 'name') return
      root.style.setProperty(`--${key}`, val)
    })
  }, [theme])

  return (
    <ThemeContext.Provider value={{ theme, setTheme, colors: THEMES[theme] || THEMES.peach }}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => useContext(ThemeContext)
