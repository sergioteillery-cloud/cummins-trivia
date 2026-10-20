import { useCallback, useEffect, useReducer, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Volume2, VolumeX } from 'lucide-react'
import Stage from './components/Stage.jsx'
import Background from './components/Background.jsx'
import Attract from './components/Attract.jsx'
import Register from './components/Register.jsx'
import Game from './components/Game.jsx'
import Result from './components/Result.jsx'
import Admin from './components/Admin.jsx'
import { isMuted, setMuted, sfx } from './audio.js'
import { isVoiceEnabled, setVoiceEnabled, stopSpeech } from './speech.js'
import { ThemeContext, loadTheme, saveTheme } from './theme.js'
import { loadBank, loadCollect, resetBank, saveBank, saveCollect, saveLead, loadPerGame, savePerGame, loadUsed, saveUsed } from './storage.js'
import bundled from '../public/questions.json'

// Sin tiempos visibles en el juego; solo un reinicio de seguridad si alguien abandona el tótem a mitad de camino
const DEFAULT_CONFIG = { questionsPerGame: 3, shuffleQuestions: true, registerResetSeconds: 90, playingResetSeconds: 300, resultResetSeconds: 180, adminPin: '1234', prizeMinScore: 1, prizeText: '¡Reclama tu premio en nuestro stand!', noPrizeText: '¡Te esperamos en una próxima oportunidad!' }

// Máquina de estados global: idle -> register -> playing -> result
const initial = { screen: 'idle', player: null, questions: [], result: null }
function reducer(state, a) {
  switch (a.type) {
    case 'goto': return { ...state, screen: a.screen }
    case 'register': return { ...state, screen: 'register' }
    case 'start': return { ...state, screen: 'playing', player: a.player, questions: a.questions }
    case 'finish': return { ...state, screen: 'result', result: a.result }
    case 'reset': return { ...initial }
    default: return state
  }
}

const shuffle = (arr) => arr.map((v) => [Math.random(), v]).sort((a, b) => a[0] - b[0]).map((x) => x[1])

export default function App() {
  const [state, dispatch] = useReducer(reducer, initial)
  const [data, setData] = useState({ config: DEFAULT_CONFIG, questions: [] })
  const [collect, setCollect] = useState(loadCollect())
  const [perGame, setPerGame] = useState(null) // null = usar el valor de questions.json
  const [used, setUsed] = useState(loadUsed())
  const [theme, setTheme] = useState(loadTheme())
  const [original, setOriginal] = useState([])
  const [muted, setMutedState] = useState(isMuted())
  const [admin, setAdmin] = useState(false)
  const [voice, setVoiceState] = useState(isVoiceEnabled())
  const idleTimer = useRef(null)

  // Carga de questions.json (editable sin tocar el código)
  useEffect(() => {
    const apply = (j) => setData({ config: { ...DEFAULT_CONFIG, ...j.config }, questions: loadBank(j.config?.bankVersion) || j.questions })
    fetch('./questions.json').then((r) => r.json()).then((j) => { setOriginal(j.questions); apply(j) }).catch(() => { setOriginal(bundled.questions); apply(bundled) })
  }, [])

  const { config } = data
  const reset = useCallback(() => { stopSpeech(); setAdmin(false); dispatch({ type: 'reset' }) }, [])

  // Reset por inactividad en cualquier pantalla distinta de idle
  const armIdle = useCallback(() => {
    clearTimeout(idleTimer.current)
    if (state.screen === 'idle' || admin) return
    const secs = state.screen === 'result' ? config.resultResetSeconds : state.screen === 'playing' ? config.playingResetSeconds : config.registerResetSeconds
    idleTimer.current = setTimeout(reset, secs * 1000)
  }, [state.screen, admin, config, reset])
  useEffect(() => { armIdle(); return () => clearTimeout(idleTimer.current) }, [armIdle])

  const startGame = (player) => {
    const active = data.questions.filter((q) => q.active !== false) // solo preguntas habilitadas del banco
    const n = Math.min(n_(), active.length)
    // Mazo sin repetición: primero las que aún no salieron en este ciclo; al agotarse se reinicia el ciclo
    const key = (q) => q.question
    const mix = (a) => (config.shuffleQuestions ? shuffle(a) : a)
    let usedKeys = used.filter((k) => active.some((q) => key(q) === k))
    let fresh = mix(active.filter((q) => !usedKeys.includes(key(q))))
    let picked = fresh.slice(0, n)
    usedKeys = [...usedKeys, ...picked.map(key)]
    if (picked.length < n) { // el ciclo se agotó: reinicia y completa con preguntas del nuevo ciclo
      const pickedKeys = picked.map(key)
      const extra = mix(active.filter((q) => !pickedKeys.includes(key(q)))).slice(0, n - picked.length)
      picked = [...picked, ...extra]
      usedKeys = extra.map(key)
    } else if (usedKeys.length >= active.length) usedKeys = [] // justo se completó el ciclo
    saveUsed(usedKeys); setUsed(usedKeys)
    dispatch({ type: 'start', player, questions: mix(picked) })
  }
  const finishGame = (result) => {
    saveLead({ ...state.player, ...result })
    sfx.finish()
    dispatch({ type: 'finish', result })
  }

  const n_ = () => perGame ?? loadPerGame(config.questionsPerGame)
  const choosePerGame = (v) => { savePerGame(v); setPerGame(v) }
  const resetDeck = () => { saveUsed([]); setUsed([]) }
  const updateBank = (bank) => { saveBank(bank, config.bankVersion); setData((d) => ({ ...d, questions: bank })) }
  const restoreBank = () => { resetBank(); setData((d) => ({ ...d, questions: original })) }
  const chooseCollect = (v) => { saveCollect(v); setCollect(v) }
  const chooseTheme = (t) => { saveTheme(t); setTheme(t) }
  const toggleMute = () => { const v = !muted; setMuted(v); setMutedState(v); if (v) stopSpeech() }
  const chooseVoice = (v) => { setVoiceEnabled(v); setVoiceState(v) }

  return (
    <div onPointerDown={armIdle} style={{ position: 'fixed', inset: 0, background: theme === 'light' ? '#fff' : '#000' }}>
      <ThemeContext.Provider value={theme}>
      <Stage theme={theme}>
        <Background intensity={state.screen === 'playing' ? 0.6 : 1} />
        <AnimatePresence mode="wait">
          <motion.div key={state.screen} style={{ position: 'absolute', inset: 0 }} initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -40 }} transition={{ duration: 0.3 }}>
            {state.screen === 'idle' && <Attract prizeMinScore={config.prizeMinScore} perGame={Math.min(n_(), data.questions.filter((q) => q.active !== false).length) || n_()} ready={data.questions.some((q) => q.active !== false)} onStart={() => { sfx.start(); if (collect) dispatch({ type: 'register' }); else startGame({ name: 'Anónimo', email: '', phone: '', company: '', anonymous: true }) }} />}
            {state.screen === 'register' && <Register onSubmit={startGame} onBack={reset} />}
            {state.screen === 'playing' && <Game questions={state.questions} onFinish={finishGame} />}
            {state.screen === 'result' && <Result result={state.result} prizeText={config.prizeText} noPrizeText={config.noPrizeText} prizeMinScore={config.prizeMinScore} onDone={reset} />}
          </motion.div>
        </AnimatePresence>

        {/* Botón discreto de administración (arriba a la derecha; pide PIN) y mute visible para organizadores */}
        <button onClick={() => setAdmin(true)} style={{ position: 'absolute', top: 24, right: 24, zIndex: 50, height: 88, padding: '0 36px', borderRadius: 44, background: 'var(--chip)', color: 'var(--chip-fg)', fontSize: 34, fontWeight: 500 }}>Admin</button>
        <button aria-label={muted ? 'Activar sonido' : 'Silenciar'} onClick={toggleMute} style={{ position: 'absolute', top: 24, left: 24, zIndex: 50, width: 88, height: 88, borderRadius: 28, background: 'var(--chip)', color: 'var(--chip-fg)', display: 'grid', placeItems: 'center' }}>
          {muted ? <VolumeX size={44} /> : <Volume2 size={44} />}
        </button>
        {admin && <Admin pin={config.adminPin} bank={data.questions} voice={voice} onVoice={chooseVoice} onBank={updateBank} onRestore={restoreBank} theme={theme} onTheme={chooseTheme} collect={collect} onCollect={chooseCollect} perGame={n_()} onPerGame={choosePerGame} usedCount={used.filter((k) => data.questions.some((q) => q.active !== false && q.question === k)).length} onResetDeck={resetDeck} onClose={() => setAdmin(false)} />}
      </Stage>
      </ThemeContext.Provider>
    </div>
  )
}
