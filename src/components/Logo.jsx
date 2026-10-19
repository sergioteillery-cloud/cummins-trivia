// Marcador de posición: colocar el arte oficial del Brand Book en public/logo-white.svg.
// El manual indica no recrear ni alterar el logo; el texto es solo un fallback.
import { useState } from 'react'
import logoWhite from '../assets/logo-white.svg'
import logoBlack from '../assets/logo-black.svg'
import { useTheme } from '../theme.js'

export default function Logo({ height = 60, onRed = false }) {
  const theme = useTheme()
  const logoUrl = onRed || theme === 'dark' ? logoWhite : logoBlack
  const [ok, setOk] = useState(true)
  if (ok) return <img src={logoUrl} alt="Cummins" style={{ height }} onError={() => setOk(false)} />
  return <span style={{ fontWeight: 900, fontSize: height * 0.9, letterSpacing: '.06em', color: onRed || theme === 'dark' ? '#fff' : '#000' }}>CUMMINS</span>
}

export function LogoPin({ size = 110 }) {
  return (
    <div style={{ width: size, height: size, borderRadius: 16, background: '#DA291C', display: 'grid', placeItems: 'center' }}>
      <Logo height={size * 0.57} onRed />
    </div>
  )
}
