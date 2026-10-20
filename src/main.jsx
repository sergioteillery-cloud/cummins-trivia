import React from 'react'
import { createRoot } from 'react-dom/client'
import '@fontsource/roboto/300.css'
import '@fontsource/roboto/400.css'
import '@fontsource/roboto/500.css'
import '@fontsource/roboto/700.css'
import '@fontsource/roboto/900.css'
import '@fontsource/roboto/700-italic.css'
import './index.css'
import { loadBrandFont } from './fonts.js'
import App from './App.jsx'

loadBrandFont()
createRoot(document.getElementById('root')).render(<App />)
