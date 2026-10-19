import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import confetti from 'canvas-confetti'
import { Check, X } from 'lucide-react'
import { sfx } from '../audio.js'

const LETTERS = ['A', 'B', 'C', 'D']
// Tiempo de la retroalimentación: más largo si hay justificación para poder leerla (se puede saltar con "Continuar")
const EXP_DELAY = 1300 // se ven primero las respuestas marcadas; luego aparece la justificación a pantalla completa
const feedbackMs = (q) => (q.explanation ? Math.min(18000, Math.max(9000, EXP_DELAY + 3000 + q.explanation.length * 90)) : 1800)

export default function Game({ questions, secondsPer, onFinish }) {
  const [idx, setIdx] = useState(0)
  const [picked, setPicked] = useState(null) // índice elegido, -1 = tiempo agotado
  const [timeLeft, setTimeLeft] = useState(secondsPer)
  const [score, setScore] = useState(0)
  const [gain, setGain] = useState(0)
  const [showExp, setShowExp] = useState(false)
  const expTimer = useRef(null)
  const nextTimer = useRef(null)
  const advance = useRef(() => {})
  const stats = useRef({ correct: 0, startedAt: Date.now() })
  const q = questions[idx]
  const answered = picked !== null

  // Cuenta regresiva
  useEffect(() => {
    if (answered) return
    setTimeLeft(secondsPer)
    const t0 = Date.now()
    const id = setInterval(() => {
      const left = Math.max(0, secondsPer - (Date.now() - t0) / 1000)
      setTimeLeft(left)
      if (left <= 3 && Math.ceil(left) !== Math.ceil(left + 0.1)) sfx.tick()
      if (left <= 0) { clearInterval(id); answer(-1, 0) }
    }, 100)
    return () => clearInterval(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idx, answered === false])

  const answer = (i, left = timeLeft) => {
    if (answered) return
    setPicked(i)
    const ok = i === q.correct
    let pts = 0
    if (ok) {
      pts = 1 // 1 punto por acierto, 0 si falla
      stats.current.correct++
      sfx.correct()
      confetti({ particleCount: 140, spread: 90, origin: { y: 0.55 }, colors: ['#DA291C', '#ffffff', '#30A566', '#A9A8A6'] })
    } else sfx.wrong()
    setGain(pts)
    const total = score + pts
    setScore(total)
    if (q.explanation) expTimer.current = setTimeout(() => setShowExp(true), EXP_DELAY)
    advance.current = () => {
      clearTimeout(nextTimer.current); clearTimeout(expTimer.current); setShowExp(false)
      if (idx + 1 >= questions.length) {
        onFinish({ score: total, correct: stats.current.correct, total: questions.length, timeSec: Math.round((Date.now() - stats.current.startedAt) / 1000) })
      } else { setIdx(idx + 1); setPicked(null) }
    }
    nextTimer.current = setTimeout(() => advance.current(), feedbackMs(q))
  }

  const pct = (timeLeft / secondsPer) * 100
  const low = timeLeft <= 4
  const wrong = answered && picked !== q.correct

  return (
    <div style={{ position: 'absolute', inset: 0, padding: '130px 60px 70px', display: 'flex', flexDirection: 'column' }}>
      {/* Progreso */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', fontSize: 44, fontWeight: 700 }}>
        <span>Pregunta {idx + 1} <span style={{ color: '#787877' }}>de {questions.length}</span></span>
        <span style={{ color: '#DA291C', fontSize: 56, fontWeight: 900 }}>{score} {score === 1 ? 'punto' : 'puntos'}</span>
      </div>
      <div style={{ display: 'flex', gap: 10, marginTop: 22 }}>
        {questions.map((_, i) => (
          <div key={i} style={{ flex: 1, height: 16, borderRadius: 8, background: i < idx || (i === idx && answered) ? '#DA291C' : i === idx ? 'var(--fg)' : 'var(--track)' }} />
        ))}
      </div>

      {/* Reloj */}
      <div style={{ marginTop: 40, display: 'flex', alignItems: 'center', gap: 30 }}>
        <div style={{ flex: 1, height: 36, borderRadius: 18, background: 'var(--surface)', overflow: 'hidden' }}>
          <div style={{ width: `${pct}%`, height: '100%', background: low ? '#DA291C' : 'var(--fg)', transition: 'width .1s linear, background .3s' }} />
        </div>
        <div style={{ width: 130, textAlign: 'right', fontSize: 90, fontWeight: 900, color: low ? '#DA291C' : 'var(--fg)' }}>{Math.ceil(timeLeft)}</div>
      </div>

      {/* Pregunta */}
      <motion.div key={idx} initial={{ opacity: 0, x: 80 }} animate={{ opacity: 1, x: 0 }} className={wrong ? 'shake' : ''} style={{ marginTop: 40, minHeight: 300, display: 'flex', alignItems: 'center', fontSize: q.question.length > 70 ? 68 : 82, fontWeight: 900, lineHeight: 1.08 }}>
        {q.question}
      </motion.div>

      {/* Alternativas */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24, marginTop: 20 }}>
        {q.options.map((opt, i) => {
          const isCorrect = i === q.correct
          const isPicked = i === picked
          let bg = 'var(--card)', fg = 'var(--card-fg)'
          if (answered && isCorrect) { bg = '#30A566'; fg = '#fff' }
          else if (answered && isPicked) { bg = '#DA291C'; fg = '#fff' }
          else if (answered) { bg = 'var(--surface)'; fg = 'var(--dim)' }
          return (
            <motion.button key={idx + '-' + i} initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0, scale: answered && isCorrect ? 1.03 : 1 }} transition={{ delay: i * 0.07 }}
              disabled={answered} onPointerDown={() => { sfx.tap(); answer(i) }}
              style={{ background: bg, color: fg, minHeight: q.options.length > 3 ? 130 : 170, borderRadius: 36, border: '4px solid var(--card-border)', padding: '0 44px', display: 'flex', alignItems: 'center', gap: 36, fontSize: 56, fontWeight: 700, textAlign: 'left', transition: 'background .2s' }}>
              <span style={{ flex: '0 0 96px', height: 96, borderRadius: 28, display: 'grid', placeItems: 'center', background: answered && (isCorrect || isPicked) ? 'rgba(255,255,255,.25)' : '#DA291C', color: '#fff', fontSize: 52, fontWeight: 900 }}>
                {answered && isCorrect ? <Check size={60} strokeWidth={4} /> : answered && isPicked ? <X size={60} strokeWidth={4} /> : LETTERS[i]}
              </span>
              <span style={{ flex: 1, lineHeight: 1.1 }}>{opt}</span>
            </motion.button>
          )
        })}
      </div>

      {/* Feedback breve (sin justificación) */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
        {answered && !q.explanation && (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} style={{ fontSize: 60, fontWeight: 900, color: picked === q.correct ? '#30A566' : '#DA291C' }}>
            {picked === q.correct ? `¡Correcto! +${gain} punto` : picked === -1 ? '¡Se acabó el tiempo!' : '¡Ooops!'}
          </motion.div>
        )}
        {answered && q.explanation && !showExp && (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} style={{ fontSize: 64, fontWeight: 900, color: picked === q.correct ? '#30A566' : '#DA291C' }}>
            {picked === q.correct ? '¡Correcto!' : picked === -1 ? '¡Se acabó el tiempo!' : '¡Ooops!'}
          </motion.div>
        )}
      </div>

      {/* Justificación a pantalla completa: letra grande y alto contraste para leer a distancia */}
      {answered && q.explanation && showExp && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ position: 'absolute', inset: 0, zIndex: 20, background: 'var(--bg)', padding: '150px 70px 70px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
          <div style={{ fontSize: 88, fontWeight: 900, color: picked === q.correct ? '#30A566' : '#DA291C', lineHeight: 1.05 }}>
            {picked === q.correct ? `¡Correcto! +${gain} punto` : picked === -1 ? '¡Se acabó el tiempo!' : '¡Ooops! 0 puntos'}
          </div>
          <div style={{ marginTop: 40, fontSize: 40, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.12em' }}>Respuesta correcta</div>
          <div style={{ marginTop: 12, fontSize: 56, fontWeight: 900, lineHeight: 1.12 }}>{q.options[q.correct]}</div>
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', marginTop: 30 }}>
            <div style={{ fontSize: 60, fontWeight: 500, lineHeight: 1.28, color: 'var(--fg)' }}>{q.explanation}</div>
          </div>
          <button onPointerDown={() => advance.current()} className="btn btn-primary" style={{ width: '100%', height: 150, fontSize: 62 }}>
            {idx + 1 >= questions.length ? 'Ver resultado' : 'Continuar'}
          </button>
        </motion.div>
      )}
    </div>
  )
}
