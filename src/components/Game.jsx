import { useRef, useState } from 'react'
import { motion } from 'framer-motion'
import confetti from 'canvas-confetti'
import { Check, X } from 'lucide-react'
import ListenButton from './ListenButton.jsx'
import { sfx } from '../audio.js'
import { useNarration } from '../speech.js'

const LETTERS = ['A', 'B', 'C', 'D']
const HIGHLIGHT_MS = 1300 // se ven las alternativas marcadas antes de pasar a la explicación

// Sin tiempo límite: el juego solo avanza cuando la persona toca un botón
export default function Game({ questions, onFinish }) {
  const [idx, setIdx] = useState(0)
  const [picked, setPicked] = useState(null)
  const [showExp, setShowExp] = useState(false)
  const [score, setScore] = useState(0)
  const stats = useRef({ correct: 0, startedAt: Date.now() })
  const expTimer = useRef(null)
  const q = questions[idx]
  const answered = picked !== null
  const ok = picked === q.correct
  const last = idx + 1 >= questions.length

  const questionText = `Pregunta ${idx + 1} de ${questions.length}. ${q.question} ${q.options.map((o, i) => `Alternativa ${LETTERS[i]}: ${o}.`).join(' ')} Elige tu respuesta tocando la alternativa, o los botones ${q.options.map((_, i) => LETTERS[i]).join(', ')} de abajo.`
  const feedbackText = `${ok ? '¡Correcto! Ganaste 1 punto.' : 'Respuesta incorrecta.'} La respuesta correcta es: ${q.options[q.correct]}. ${q.explanation || ''} Toca ${last ? 'Ver resultado' : 'Continuar'} para seguir.`
  const listenQuestion = useNarration(questionText, !answered)
  const listenFeedback = useNarration(feedbackText, showExp)

  const answer = (i) => {
    if (answered) return
    sfx.tap()
    setPicked(i)
    if (i === q.correct) {
      stats.current.correct++
      setScore((s) => s + 1) // 1 punto por acierto, 0 si falla
      sfx.correct()
      confetti({ particleCount: 140, spread: 90, origin: { y: 0.55 }, colors: ['#DA291C', '#ffffff', '#30A566', '#A9A8A6'] })
    } else sfx.wrong()
    expTimer.current = setTimeout(() => setShowExp(true), HIGHLIGHT_MS)
  }

  const next = () => {
    clearTimeout(expTimer.current)
    if (last) {
      onFinish({ score: stats.current.correct, correct: stats.current.correct, total: questions.length, timeSec: Math.round((Date.now() - stats.current.startedAt) / 1000) })
    } else { setIdx(idx + 1); setPicked(null); setShowExp(false) }
  }

  return (
    <div style={{ position: 'absolute', inset: 0, padding: '140px 60px 70px', display: 'flex', flexDirection: 'column' }}>
      {/* Progreso */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', fontSize: 46, fontWeight: 700 }}>
        <span>Pregunta {idx + 1} <span style={{ color: 'var(--dim)' }}>de {questions.length}</span></span>
        <span style={{ color: '#DA291C', fontSize: 56, fontWeight: 900 }}>{score} {score === 1 ? 'punto' : 'puntos'}</span>
      </div>
      <div style={{ display: 'flex', gap: 10, marginTop: 22 }}>
        {questions.map((_, i) => (
          <div key={i} style={{ flex: 1, height: 16, borderRadius: 8, background: i < idx || (i === idx && answered) ? '#DA291C' : i === idx ? 'var(--fg)' : 'var(--track)' }} />
        ))}
      </div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 26, minHeight: 92 }}>
        <ListenButton onListen={listenQuestion} />
      </div>

      {/* Pregunta */}
      <motion.div key={idx} initial={{ opacity: 0, x: 80 }} animate={{ opacity: 1, x: 0 }} className={answered && !ok ? 'shake' : ''} style={{ marginTop: 20, minHeight: 300, display: 'flex', alignItems: 'center', fontSize: q.question.length > 70 ? 70 : 84, fontWeight: 900, lineHeight: 1.08 }}>
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
              disabled={answered} onPointerDown={() => answer(i)} aria-label={`Alternativa ${LETTERS[i]}: ${opt}`}
              style={{ background: bg, color: fg, minHeight: q.options.length > 3 ? 130 : 160, borderRadius: 36, border: '4px solid var(--card-border)', padding: '0 44px', display: 'flex', alignItems: 'center', gap: 36, fontSize: 56, fontWeight: 700, textAlign: 'left', transition: 'background .2s' }}>
              <span style={{ flex: '0 0 96px', height: 96, borderRadius: 28, display: 'grid', placeItems: 'center', background: answered && (isCorrect || isPicked) ? 'rgba(255,255,255,.25)' : '#DA291C', color: '#fff', fontSize: 52, fontWeight: 900 }}>
                {answered && isCorrect ? <Check size={60} strokeWidth={4} /> : answered && isPicked ? <X size={60} strokeWidth={4} /> : LETTERS[i]}
              </span>
              <span style={{ flex: 1, lineHeight: 1.1 }}>{opt}</span>
            </motion.button>
          )
        })}
      </div>

      <div style={{ flex: 1 }} />

      {/* Botones A B C abajo: se puede responder arriba o abajo según la estatura de la persona */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: 60 }}>
        {q.options.map((_, i) => {
          const isCorrect = i === q.correct
          const isPicked = i === picked
          const bg = answered && isCorrect ? '#30A566' : answered && isPicked ? '#DA291C' : 'var(--card)'
          const fg = answered && (isCorrect || isPicked) ? '#fff' : '#DA291C'
          return (
            <button key={i} disabled={answered} onPointerDown={() => answer(i)} aria-label={`Responder ${LETTERS[i]}`}
              style={{ width: 200, height: 200, borderRadius: 100, background: bg, color: fg, border: '6px solid var(--abc-border)', fontSize: 110, fontWeight: 900, display: 'grid', placeItems: 'center', opacity: answered && !isCorrect && !isPicked ? 0.4 : 1, transition: 'background .2s, opacity .2s' }}>
              {LETTERS[i]}
            </button>
          )
        })}
      </div>

      {/* Explicación a pantalla completa: letra grande, alto contraste; avanza solo con el botón */}
      {answered && showExp && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ position: 'absolute', inset: 0, zIndex: 20, background: 'var(--bg)', padding: '150px 70px 70px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
          <div style={{ fontSize: 88, fontWeight: 900, color: ok ? '#30A566' : '#DA291C', lineHeight: 1.05 }}>
            {ok ? '¡Correcto! +1 punto' : '¡Ooops! 0 puntos'}
          </div>
          <div style={{ marginTop: 40, fontSize: 40, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.12em' }}>Respuesta correcta</div>
          <div style={{ marginTop: 12, fontSize: 58, fontWeight: 900, lineHeight: 1.12 }}>{q.options[q.correct]}</div>
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', marginTop: 30 }}>
            {q.explanation && <div style={{ fontSize: 60, fontWeight: 500, lineHeight: 1.28, color: 'var(--fg)' }}>{q.explanation}</div>}
          </div>
          <ListenButton onListen={listenFeedback} style={{ marginBottom: 30 }} />
          <button onPointerDown={next} className="btn btn-primary" style={{ width: '100%', height: 160, fontSize: 66 }}>
            {last ? 'Ver resultado' : 'Continuar'}
          </button>
        </motion.div>
      )}
    </div>
  )
}
