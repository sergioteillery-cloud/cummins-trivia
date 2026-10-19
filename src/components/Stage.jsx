import { useEffect, useState } from 'react'

const W = 1080, H = 1920

// Lienzo fijo 1080x1920 escalado para ajustarse a cualquier pantalla vertical (tótem o tablet)
export default function Stage({ children, theme = 'dark' }) {
  const [scale, setScale] = useState(1)
  useEffect(() => {
    const fit = () => setScale(Math.min(window.innerWidth / W, window.innerHeight / H))
    fit()
    window.addEventListener('resize', fit)
    return () => window.removeEventListener('resize', fit)
  }, [])
  return <div className="stage" data-theme={theme} style={{ transform: `translate(-50%, -50%) scale(${scale})` }}>{children}</div>
}
