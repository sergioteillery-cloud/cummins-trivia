import { useEffect } from 'react'
import { motion } from 'framer-motion'
import confetti from 'canvas-confetti'
import { Check, CircleCheckBig, Gift, RefreshCw, Star, Trophy } from 'lucide-react'
import ListenButton from './ListenButton.jsx'
import { useNarration } from '../speech.js'
import * as N from '../narration.js'

// Ícono según el tramo de puntaje (los textos están en narration.js)
const ICONS = {
  zero: <RefreshCw size={150} color="#F5A524" strokeWidth={2.6} />,
  perfect: <Trophy size={150} color="#F5A524" fill="#FFD36B" strokeWidth={2} />,
  great: <CircleCheckBig size={150} color="#30A566" strokeWidth={2.6} />,
  good: <span style={{ position: 'relative', display: 'inline-grid', placeItems: 'center' }}><Star size={150} color="#2F7FC1" fill="#55A1D3" strokeWidth={2} /><Check size={60} color="#fff" strokeWidth={5} style={{ position: 'absolute', top: 50 }} /></span>,
}

export default function Result({ result, prizeText, noPrizeText, prizeMinScore = 1, onDone }) {
  const wonPrize = result.score >= prizeMinScore // premio si consigue al menos 1 respuesta correcta
  const t = { ...N.tierFor(result.score, result.total) }
  t.icon = ICONS[t.key]
  const card = wonPrize ? prizeText : noPrizeText
  const points = `${result.score} de ${result.total} ${result.total === 1 ? 'punto' : 'puntos'}`

  const listen = useNarration(N.result(result.score, result.total, t, card))

  useEffect(() => {
    if (result.score >= 1) confetti({ particleCount: 220, spread: 120, origin: { y: 0.4 }, colors: ['#DA291C', '#ffffff', '#A9A8A6'] })
  }, [result.score])

  return (
    <div style={{ position: 'absolute', inset: 0, padding: '150px 70px 80px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
      <div style={{ fontSize: 44, color: 'var(--muted)', fontWeight: 500 }}>Tu resultado</div>
      <motion.div initial={{ scale: 0.4, opacity: 0, rotate: -15 }} animate={{ scale: 1, opacity: 1, rotate: 0 }} transition={{ type: 'spring', stiffness: 160, damping: 12 }} style={{ marginTop: 30 }}>
        {t.icon}
      </motion.div>
      <div style={{ marginTop: 30, background: '#DA291C', color: '#fff', borderRadius: 28, padding: '20px 70px', fontSize: 68, fontWeight: 900 }}>{points}</div>

      <motion.div initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }} style={{ marginTop: 70, fontSize: 130, fontWeight: 900, lineHeight: 1.02, textWrap: 'balance' }}>
        {t.title}
      </motion.div>
      <div style={{ marginTop: 30, fontSize: 58, lineHeight: 1.2, color: 'var(--fg)', textWrap: 'balance' }}>{t.msg}</div>

      <div style={{ flex: 1 }} />

      <div style={{ width: '100%', background: 'var(--inv-bg)', color: 'var(--inv-fg)', borderRadius: 50, padding: '44px 50px', display: 'flex', alignItems: 'center', gap: 36, textAlign: 'left' }}>
        {wonPrize
          ? <Gift size={110} color="#DA291C" fill="#FFD36B" style={{ flex: '0 0 auto' }} />
          : <RefreshCw size={110} color="#DA291C" style={{ flex: '0 0 auto' }} />}
        <div style={{ fontSize: 54, fontWeight: 700, lineHeight: 1.15 }}>{card}</div>
      </div>

      <ListenButton onListen={listen} style={{ marginTop: 30 }} />

      <button className="btn btn-secondary" onPointerDown={onDone} style={{ marginTop: 30, width: '100%', height: 150, fontSize: 62 }}>
        FINALIZAR
      </button>
    </div>
  )
}
