import { createContext, useContext } from 'react'

// Temas: "dark" (negro) y "light" (dominado por blanco). Las variables CSS viven en index.css.
export const THEMES = [
  { id: 'dark', label: 'Oscuro', desc: 'Negro con rojo Cummins' },
  { id: 'light', label: 'Blanco', desc: 'Blanco dominante con rojo Cummins' },
]
const KEY = 'cummins_trivia_theme'
export const loadTheme = () => { try { return localStorage.getItem(KEY) === 'light' ? 'light' : 'dark' } catch { return 'dark' } }
export const saveTheme = (t) => { try { localStorage.setItem(KEY, t) } catch { /* sin storage */ } }
export const ThemeContext = createContext('dark')
export const useTheme = () => useContext(ThemeContext)
