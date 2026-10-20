import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { CircleCheck, CircleHelp, Gift, Hand } from 'lucide-react'
import LogoHeader from './Logo.jsx'
import ListenButton from './ListenButton.jsx'
import { useNarration } from '../speech.js'
import * as N from '../narration.js'

export default function Attract({ onStart, ready, perGame = 3, prizeMinScore = 1 }) {
  const steps = [
    { Icon: CircleHelp, title: '¡Juega!', text: `Responde ${perGame} ${perGame === 1 ? 'pregunta' : 'preguntas'}.` },
    { Icon: CircleCheck, title: '¡Acierta!', text: `Con ${prizeMinScore} ${prizeMinScore === 1 ? 'respuesta correcta' : 'respuestas correctas'} ganas.` },
    { Icon: Gift, title: '¡Gana!', text: 'Retira tu premio con el promotor.' },
  ]
  // Explicación interactiva: los pasos se destacan uno tras otro
  const [active, setActive] = useState(0)
  useEffect(() => {
    const id = setInterval(() => setActive((a) => (a + 1) % steps.length), 1800)
    return () => clearInterval(id)
  }, [steps.length])

  // En la pantalla de espera no se lee sola (se repetiría sin fin); se escucha con el botón
  const listen = useNarration(N.attract(perGame, prizeMinScore), false)

  return (
    <div onPointerDown={ready ? onStart : undefined} style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '140px 70px 80px' }}>
      <LogoHeader height={130} />

      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} style={{ alignSelf: 'stretch', marginTop: 80, fontSize: 150, fontWeight: 900, lineHeight: 1.0, letterSpacing: '-.01em' }}>
        Ganando con<br /><span style={{ color: '#DA291C' }}>el poder</span> de<br />la diferencia
      </motion.div>

      <div style={{ alignSelf: 'stretch', marginTop: 70, background: 'var(--surface-2)', borderRadius: 40, padding: '30px 36px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {steps.map(({ Icon, title, text }, i) => {
          const on = i === active
          return (
            <motion.div key={title} animate={{ scale: on ? 1.03 : 1, opacity: on ? 1 : 0.75 }} transition={{ duration: 0.35 }}
              style={{ display: 'flex', alignItems: 'center', gap: 32, padding: '18px 24px', borderRadius: 28, background: on ? 'var(--step-on)' : 'transparent' }}>
              <span style={{ flex: '0 0 96px', height: 96, borderRadius: 48, display: 'grid', placeItems: 'center', background: on ? '#DA291C' : 'transparent', border: '4px solid #DA291C', transition: 'background .3s' }}>
                <Icon size={54} color={on ? '#fff' : '#DA291C'} strokeWidth={2.4} />
              </span>
              <div>
                <div style={{ fontSize: 56, fontWeight: 900, lineHeight: 1.1 }}>{title}</div>
                <div style={{ fontSize: 42, color: 'var(--soft)', lineHeight: 1.2 }}>{text}</div>
              </div>
            </motion.div>
          )
        })}
      </div>

      <ListenButton onListen={listen} label="Escuchar instrucciones" style={{ marginTop: 30 }} />

      <div style={{ flex: 1 }} />

      <div style={{ position: 'relative', width: '100%', display: 'grid', placeItems: 'center' }}>
        {[0, 1].map((i) => (
          <div key={i} style={{ position: 'absolute', inset: 0, borderRadius: 100, border: '6px solid #DA291C', animation: `pulse-ring 2s ${i}s infinite ease-out` }} />
        ))}
        <motion.button className="btn btn-primary" animate={{ scale: [1, 1.04, 1] }} transition={{ repeat: Infinity, duration: 1.6 }} style={{ width: '100%', height: 250, fontSize: 82, borderRadius: 100, textTransform: 'uppercase', gap: 36 }}>
          <Hand size={90} /> ¡Toca aquí para jugar!
        </motion.button>
      </div>
    </div>
  )
}
