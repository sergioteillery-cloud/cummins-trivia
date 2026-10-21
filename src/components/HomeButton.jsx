import { useEffect, useState } from 'react'
import { Home } from 'lucide-react'

// Botón para volver al inicio durante el juego. Pide un segundo toque para evitar salidas accidentales.
export default function HomeButton({ onHome }) {
  const [confirm, setConfirm] = useState(false)
  useEffect(() => {
    if (!confirm) return
    const t = setTimeout(() => setConfirm(false), 4000)
    return () => clearTimeout(t)
  }, [confirm])

  return (
    <button
      onPointerDown={(e) => { e.stopPropagation(); if (confirm) onHome(); else setConfirm(true) }}
      aria-label={confirm ? 'Toca de nuevo para volver al inicio' : 'Volver al inicio'}
      style={{
        position: 'absolute', top: 24, left: 128, zIndex: 50, height: 88, borderRadius: 44,
        padding: confirm ? '0 32px 0 24px' : 0, width: confirm ? 'auto' : 88,
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 14,
        background: confirm ? '#DA291C' : 'var(--chip)', color: confirm ? '#fff' : 'var(--chip-fg)',
        fontSize: 32, fontWeight: 700, transition: 'background .2s',
      }}
    >
      <Home size={44} />
      {confirm && 'Toca de nuevo para volver al inicio'}
    </button>
  )
}
