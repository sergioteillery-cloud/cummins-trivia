import { motion } from 'framer-motion'
import thisAbility from '../assets/this-ability.png'

// Pantalla de reposo: fondo blanco con el logo This Ability. Al tocar, vuelve a la app tal como estaba.
export default function Screensaver({ onWake }) {
  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1, transition: { duration: 0.8 } }} exit={{ opacity: 0, transition: { duration: 0.25 } }}
      onPointerDown={(e) => { e.stopPropagation(); e.preventDefault(); onWake() }}
      role="button" aria-label="Toca la pantalla para continuar"
      style={{ position: 'absolute', inset: 0, zIndex: 200, background: '#fff', display: 'grid', placeItems: 'center' }}
    >
      <motion.img
        src={thisAbility} alt="This Ability Cummins Chile"
        animate={{ scale: [1, 1.04, 1] }} transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
        style={{ width: 760, height: 'auto' }}
      />
    </motion.div>
  )
}
