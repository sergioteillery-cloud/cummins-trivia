import { useEffect, useState } from 'react'
import { animate, motion } from 'framer-motion'
import confetti from 'canvas-confetti'
import { Gift, RotateCcw } from 'lucide-react'

function tier(pct) {
  if (pct >= 0.9) return { title: '¡Nivel Experto!', msg: 'Eres un gran referente de inclusión.' }
  if (pct >= 0.6) return { title: '¡Gran trabajo!', msg: 'Sabes mucho de inclusión y de Cummins.' }
  if (pct >= 0.4) return { title: '¡Casi lo logras!', msg: 'Un poco más y llegas a la cima.' }
  return { title: '¡Buen intento!', msg: 'Pregunta al promotor y vuelve a intentarlo.' }
}

export default function Result({ result, player, prizeText, prizeMinScore = 1, seconds, onDone }) {
  const wonPrize = result.score >= prizeMinScore // premio si consigue al menos 1 respuesta correcta
  const [shown, setShown] = useState(0)
  const [left, setLeft] = useState(seconds)
  const pct = result.correct / result.total
  const t = tier(pct)

  useEffect(() => {
    const c = animate(0, result.score, { duration: 1.6, onUpdate: (v) => setShown(Math.round(v)) })
    if (result.score >= 1) confetti({ particleCount: 220, spread: 120, origin: { y: 0.4 }, colors: ['#DA291C', '#ffffff', '#A9A8A6'] })
    const id = setInterval(() => setLeft((l) => Math.max(0, l - 1)), 1000)
    return () => { c.stop(); clearInterval(id) }
  }, [result.score])

  return (
    <div style={{ position: 'absolute', inset: 0, padding: '170px 70px 90px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
      <div style={{ fontSize: 44, color: 'var(--muted)', fontWeight: 500 }}>{player?.anonymous ? 'Tu resultado' : `${player?.name?.split(' ')[0]}, tu resultado`}</div>
      <motion.div initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring' }} style={{ fontSize: 120, fontWeight: 900, lineHeight: 1, marginTop: 20 }}>
        {t.title}
      </motion.div>
      <div style={{ fontSize: 44, marginTop: 24, color: 'var(--soft)', fontWeight: 300 }}>{t.msg}</div>

      <div style={{ marginTop: 70, width: '100%', background: '#DA291C', color: '#fff', borderRadius: 60, padding: '60px 40px' }}>
        <div style={{ fontSize: 36, fontWeight: 700, letterSpacing: '.2em' }}>{result.score === 1 ? 'PUNTO' : 'PUNTOS'}</div>
        <div style={{ fontSize: 280, fontWeight: 900, lineHeight: 1 }}>{shown}<span style={{ fontSize: 110, opacity: 0.75 }}> / {result.total}</span></div>
      </div>

      <div style={{ display: 'flex', gap: 30, marginTop: 30, width: '100%' }}>
        <Stat label="Precisión" value={`${Math.round(pct * 100)}%`} />
        <Stat label="Tiempo" value={`${result.timeSec}s`} />
      </div>

      <div style={{ flex: 1 }} />

      <div style={{ width: '100%', background: 'var(--inv-bg)', color: 'var(--inv-fg)', borderRadius: 50, padding: '44px 50px', display: 'flex', alignItems: 'center', gap: 36, textAlign: 'left' }}>
        {wonPrize ? <Gift size={110} color="#DA291C" style={{ flex: '0 0 auto' }} /> : <RotateCcw size={110} color="#DA291C" style={{ flex: '0 0 auto' }} />}
        <div style={{ fontSize: 44, fontWeight: 700, lineHeight: 1.15 }}>{wonPrize ? prizeText : 'Esta vez no sumaste puntos para el premio. ¡Vuelve a jugar y sigue aprendiendo!'}</div>
      </div>

      <button className="btn btn-secondary" onPointerDown={onDone} style={{ marginTop: 40, width: '100%', height: 140, background: '#fff', fontSize: 58 }}>
        FINALIZAR · {left}s
      </button>
      <div className="tagline" style={{ marginTop: 30, fontSize: 40, color: '#A9A8A6' }}>Power Onward<sup>TM</sup></div>
    </div>
  )
}

const Stat = ({ label, value }) => (
  <div style={{ flex: 1, background: 'var(--surface)', borderRadius: 36, padding: '28px 10px' }}>
    <div style={{ fontSize: 72, fontWeight: 900 }}>{value}</div>
    <div style={{ fontSize: 30, color: '#A9A8A6' }}>{label}</div>
  </div>
)
