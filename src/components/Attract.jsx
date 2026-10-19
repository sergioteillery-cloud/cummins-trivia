import { motion } from 'framer-motion'
import { Hand } from 'lucide-react'
import Logo from './Logo.jsx'

export default function Attract({ onStart, ready, perGame = 3 }) {
  return (
    <div onPointerDown={ready ? onStart : undefined} style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '120px 80px 340px' }}>
      <Logo height={150} />

      <div style={{ marginTop: 90, textAlign: 'center' }}>
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', stiffness: 120 }} style={{ fontSize: 60, fontWeight: 500, letterSpacing: '.3em', color: 'var(--muted)' }}>
          TRIVIA
        </motion.div>
        <div style={{ fontSize: 210, fontWeight: 900, lineHeight: 0.95, marginTop: 10 }}>
          Power<br /><span style={{ color: '#DA291C', fontStyle: 'italic' }}>Onward<sup style={{ fontSize: 60, fontStyle: 'normal', verticalAlign: 'top' }}>TM</sup></span>
        </div>
        <div style={{ fontSize: 50, marginTop: 50, color: 'var(--soft)', fontWeight: 300 }}>
          {perGame} {perGame === 1 ? 'pregunta' : 'preguntas'} · <b style={{ fontWeight: 700 }}>¡con 1 acierto ganas un premio!</b>
        </div>
      </div>

      <div style={{ flex: 1 }} />

      <div style={{ position: 'relative', width: '100%', display: 'grid', placeItems: 'center' }}>
        {[0, 1].map((i) => (
          <div key={i} style={{ position: 'absolute', inset: 0, borderRadius: 100, border: '6px solid #DA291C', animation: `pulse-ring 2s ${i}s infinite ease-out` }} />
        ))}
        <motion.button className="btn btn-primary" animate={{ scale: [1, 1.04, 1] }} transition={{ repeat: Infinity, duration: 1.6 }} style={{ width: '100%', height: 260, fontSize: 82, borderRadius: 100, textTransform: 'uppercase', gap: 36 }}>
          <Hand size={90} /> ¡Toca aquí para jugar!
        </motion.button>
      </div>

    </div>
  )
}
