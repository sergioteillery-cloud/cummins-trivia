// Lectura en voz alta (Web Speech API) para personas con discapacidad visual.
// Usa las voces en español instaladas en el equipo; en Windows funcionan sin internet.
import { useCallback, useEffect } from 'react'
import { isMuted } from './audio.js'

const KEY = 'cummins_trivia_voice'
const synth = typeof window !== 'undefined' ? window.speechSynthesis : null
export const speechSupported = !!synth

let enabled = (() => { try { return localStorage.getItem(KEY) !== '0' } catch { return true } })()
let voice = null

// Preferencia: español de Chile/Latinoamérica, luego cualquier español; voces locales primero
const PREFERRED = ['es-cl', 'es-419', 'es-mx', 'es-us', 'es-ar', 'es-co', 'es-es']
function pickVoice() {
  if (!synth) return
  const es = synth.getVoices().filter((v) => v.lang?.toLowerCase().startsWith('es'))
  const rank = (v) => {
    const i = PREFERRED.indexOf(v.lang.toLowerCase().replace('_', '-'))
    return (i === -1 ? PREFERRED.length : i) + (v.localService ? 0 : 0.5)
  }
  voice = es.sort((a, b) => rank(a) - rank(b))[0] || null
}
if (synth) { pickVoice(); synth.addEventListener?.('voiceschanged', pickVoice) }

export const isVoiceEnabled = () => enabled
export function setVoiceEnabled(v) {
  enabled = v
  try { localStorage.setItem(KEY, v ? '1' : '0') } catch { /* sin storage */ }
  if (!v) stopSpeech()
}

export function stopSpeech() { synth?.cancel() }

// Lee el texto por oraciones (Chrome corta las frases muy largas)
export function speak(text) {
  if (!synth || !enabled || isMuted() || !text) return
  synth.cancel()
  const parts = text.replace(/\s+/g, ' ').split(/(?<=[.!?:])\s+/)
  for (const p of parts) {
    const t = p.trim()
    if (!t) continue
    const u = new SpeechSynthesisUtterance(t)
    u.lang = voice?.lang || 'es-CL'
    if (voice) u.voice = voice
    u.rate = 0.95
    synth.speak(u)
  }
}

// Narra el contenido de una pantalla al aparecer (auto) y devuelve una función para repetirlo
export function useNarration(text, auto = true) {
  useEffect(() => {
    if (!auto || !text) return
    const t = setTimeout(() => speak(text), 400)
    return () => { clearTimeout(t); stopSpeech() }
  }, [text, auto])
  useEffect(() => () => stopSpeech(), [])
  return useCallback(() => speak(text), [text])
}
