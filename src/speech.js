// Lectura en voz alta (Web Speech API) para personas con discapacidad visual.
// Prefiere voces neuronales "Natural" (Edge: Microsoft Catalina/Lorenzo de Chile, requieren internet);
// sin internet usa las voces en español instaladas en el equipo.
import { useCallback, useEffect } from 'react'
import { isMuted } from './audio.js'

const KEY = 'cummins_trivia_voice'
const NAME_KEY = 'cummins_trivia_voice_name'
const synth = typeof window !== 'undefined' ? window.speechSynthesis : null
export const speechSupported = !!synth

const read = (k) => { try { return localStorage.getItem(k) } catch { return null } }
const write = (k, v) => { try { v == null ? localStorage.removeItem(k) : localStorage.setItem(k, v) } catch { /* sin storage */ } }

let enabled = read(KEY) !== '0'
let chosenName = read(NAME_KEY) // voz elegida en el admin (null = automática)
let voice = null
let onlineFailed = false // si una voz en línea falla (sin internet), se usa una instalada

const LANGS = ['es-cl', 'es-419', 'es-us', 'es-mx', 'es-ar', 'es-co', 'es-es']
export const isNatural = (v) => /natural|neural|online|google|premium|enhanced/i.test(v.name)
const score = (v) => {
  const i = LANGS.indexOf(v.lang.toLowerCase().replace('_', '-'))
  return (isNatural(v) ? 0 : 100) + (i === -1 ? LANGS.length : i)
}

// Voces en español, las más naturales primero
export function listVoices() {
  if (!synth) return []
  return synth.getVoices().filter((v) => v.lang?.toLowerCase().startsWith('es')).sort((a, b) => score(a) - score(b))
}

function pickVoice() {
  const all = listVoices().filter((v) => !(onlineFailed && !v.localService))
  voice = all.find((v) => v.name === chosenName) || all[0] || null
}
const listeners = new Set()
export const onVoicesChanged = (fn) => { listeners.add(fn); return () => listeners.delete(fn) }
if (synth) {
  pickVoice()
  synth.addEventListener?.('voiceschanged', () => { pickVoice(); listeners.forEach((fn) => fn()) })
}

export const isVoiceEnabled = () => enabled
export function setVoiceEnabled(v) { enabled = v; write(KEY, v ? '1' : '0'); if (!v) stopSpeech() }
export const getVoiceName = () => voice?.name || null
export const getChosenName = () => chosenName
export function setVoiceName(name) { chosenName = name; onlineFailed = false; write(NAME_KEY, name); pickVoice() }

export function stopSpeech() { synth?.cancel() }

// Lee el texto por oraciones (Chrome corta las frases muy largas)
export function speak(text, retry = true) {
  if (!synth || !enabled || isMuted() || !text) return
  synth.cancel()
  const v = voice
  const natural = v && isNatural(v)
  const parts = text.replace(/\s+/g, ' ').split(/(?<=[.!?:])\s+/)
  parts.forEach((p, i) => {
    const t = p.trim()
    if (!t) return
    const u = new SpeechSynthesisUtterance(t)
    u.lang = v?.lang || 'es-CL'
    if (v) u.voice = v
    u.rate = natural ? 1 : 0.95
    // Voz en línea sin conexión: se cambia a una voz instalada y se repite la lectura
    if (i === 0 && v && !v.localService) {
      u.onerror = (e) => {
        if (!retry || e.error === 'interrupted' || e.error === 'canceled') return
        onlineFailed = true
        pickVoice()
        speak(text, false)
      }
    }
    synth.speak(u)
  })
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
