import { Volume2 } from 'lucide-react'
import { isVoiceEnabled, speechSupported } from '../speech.js'
import { isMuted } from '../audio.js'

// Botón para repetir la lectura en voz alta de la pantalla actual
export default function ListenButton({ onListen, label = 'Repetir audio', style }) {
  if (!speechSupported || !isVoiceEnabled() || isMuted()) return null
  return (
    <button
      onPointerDown={(e) => { e.stopPropagation(); onListen() }}
      aria-label={label}
      style={{ display: 'inline-flex', alignItems: 'center', gap: 16, height: 92, padding: '0 40px', borderRadius: 46, background: 'var(--surface)', color: 'var(--fg)', fontSize: 38, fontWeight: 700, flexShrink: 0, ...style }}
    >
      <Volume2 size={46} color="#DA291C" /> {label}
    </button>
  )
}
