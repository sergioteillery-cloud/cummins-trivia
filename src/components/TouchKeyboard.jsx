import { useState } from 'react'
import { ArrowBigUp, Delete } from 'lucide-react'
import { sfx } from '../audio.js'

const ROWS = [
  '1234567890'.split(''),
  'qwertyuiop'.split(''),
  'asdfghjklñ'.split(''),
  'zxcvbnm'.split(''),
]

// Teclado táctil propio: no depende del teclado del sistema operativo
export default function TouchKeyboard({ onKey, onBackspace, mode = 'text', domains = [] }) {
  const [shift, setShift] = useState(true)
  const press = (fn) => () => { sfx.tap(); fn() }
  const key = (k) => (
    <button key={k} onPointerDown={press(() => { onKey(shift ? k.toUpperCase() : k); if (shift && mode === 'text') setShift(false) })} style={keyStyle}>
      {shift ? k.toUpperCase() : k}
    </button>
  )
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, width: '100%' }}>
      {mode === 'email' && (
        <div style={{ display: 'flex', gap: 12 }}>
          {domains.map((d) => (
            <button key={d} onPointerDown={press(() => onKey(d))} style={{ ...keyStyle, flex: 1, height: 84, fontSize: 34, background: '#680F14', color: '#fff' }}>{d}</button>
          ))}
        </div>
      )}
      {ROWS.map((row, i) => (
        <div key={i} style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
          {i === 3 && (
            <button onPointerDown={press(() => setShift((s) => !s))} style={{ ...keyStyle, flex: 1.5, background: shift ? '#DA291C' : 'var(--key-alt)', color: shift ? '#fff' : 'var(--key-fg)' }}><ArrowBigUp size={52} /></button>
          )}
          {row.map(key)}
          {i === 3 && (
            <button onPointerDown={press(onBackspace)} style={{ ...keyStyle, flex: 1.5, background: 'var(--key-alt)' }}><Delete size={52} /></button>
          )}
        </div>
      ))}
      <div style={{ display: 'flex', gap: 10 }}>
        {['@', '.', '-', '_'].map((c) => (
          <button key={c} onPointerDown={press(() => onKey(c))} style={{ ...keyStyle, flex: 1, background: 'var(--key-alt)' }}>{c}</button>
        ))}
        <button onPointerDown={press(() => onKey(' '))} style={{ ...keyStyle, flex: 3.5, fontSize: 30, color: 'var(--muted)' }}>espacio</button>
      </div>
    </div>
  )
}

const keyStyle = {
  flex: 1, height: 112, minWidth: 0, borderRadius: 20, background: 'var(--key)', color: 'var(--key-fg)',
  fontSize: 52, fontWeight: 500, display: 'grid', placeItems: 'center', touchAction: 'manipulation',
}
