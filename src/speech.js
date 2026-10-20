// Lectura en voz alta para personas con discapacidad visual.
// 1) Voz grabada con Piper ("Daniela") en public/voz/: suena natural y funciona sin internet.
// 2) Si falta la grabación de algún segmento (p. ej. una pregunta creada en el admin), se usa la voz del navegador,
//    prefiriendo las voces "Natural" de Edge; sin internet, las voces instaladas en el equipo.
import { useCallback, useEffect } from 'react'
import { isMuted } from './audio.js'
import { segmentKey } from './narration.js'

const KEY = 'cummins_trivia_voice'
const NAME_KEY = 'cummins_trivia_voice_name'
const synth = typeof window !== 'undefined' ? window.speechSynthesis : null
export const speechSupported = !!synth || typeof Audio !== 'undefined'

const read = (k) => { try { return localStorage.getItem(k) } catch { return null } }
const write = (k, v) => { try { v == null ? localStorage.removeItem(k) : localStorage.setItem(k, v) } catch { /* sin storage */ } }

let enabled = read(KEY) !== '0'
let chosenName = read(NAME_KEY) // null = automática; "rec:<id>" = voz grabada; otro = voz del navegador
let browserVoice = null
let onlineFailed = false

// ---------- Voces grabadas ----------
let recorded = {} // { catalina: { label, keys: Set } }
const BASE = (typeof import.meta !== 'undefined' && import.meta.env?.BASE_URL) || './'
fetch(`${BASE}voz/manifest.json`).then((r) => (r.ok ? r.json() : null)).then((m) => {
  if (!m?.voices) return
  recorded = Object.fromEntries(Object.entries(m.voices).map(([id, v]) => [id, { label: v.label, keys: new Set(v.keys) }]))
  listeners.forEach((fn) => fn())
}).catch(() => { /* sin grabaciones: se usa la voz del navegador */ })

export const listRecorded = () => Object.entries(recorded).map(([id, v]) => ({ id, label: v.label, count: v.keys.size }))
const activeRecorded = () => {
  if (chosenName?.startsWith('rec:')) return recorded[chosenName.slice(4)] ? chosenName.slice(4) : null
  if (chosenName) return null // eligieron una voz del navegador
  return recorded.daniela ? 'daniela' : Object.keys(recorded)[0] || null
}

// ---------- Voces del navegador ----------
const LANGS = ['es-cl', 'es-419', 'es-us', 'es-mx', 'es-ar', 'es-co', 'es-es']
export const isNatural = (v) => /natural|neural|online|google|premium|enhanced/i.test(v.name)
const score = (v) => {
  const i = LANGS.indexOf(v.lang.toLowerCase().replace('_', '-'))
  return (isNatural(v) ? 0 : 100) + (i === -1 ? LANGS.length : i)
}
export function listVoices() {
  if (!synth) return []
  return synth.getVoices().filter((v) => v.lang?.toLowerCase().startsWith('es')).sort((a, b) => score(a) - score(b))
}
function pickVoice() {
  const all = listVoices().filter((v) => !(onlineFailed && !v.localService))
  browserVoice = all.find((v) => v.name === chosenName) || all[0] || null
}
const listeners = new Set()
export const onVoicesChanged = (fn) => { listeners.add(fn); return () => listeners.delete(fn) }
if (synth) {
  pickVoice()
  synth.addEventListener?.('voiceschanged', () => { pickVoice(); listeners.forEach((fn) => fn()) })
}

export const isVoiceEnabled = () => enabled
export function setVoiceEnabled(v) { enabled = v; write(KEY, v ? '1' : '0'); if (!v) stopSpeech() }
export const getVoiceName = () => { const r = activeRecorded(); return r ? `rec:${r}` : browserVoice?.name || null }
export const getChosenName = () => chosenName
export function setVoiceName(name) { chosenName = name; onlineFailed = false; write(NAME_KEY, name); pickVoice() }

// ---------- Reproducción ----------
let player = null
let playToken = 0
export function stopSpeech() {
  playToken++
  synth?.cancel()
  if (player) { player.pause(); player = null }
}

function playRecorded(id, segments, token) {
  let i = 0
  const next = () => {
    if (token !== playToken || i >= segments.length) return
    player = new Audio(`${BASE}voz/${id}/${segmentKey(segments[i++])}.mp3`)
    player.onended = next
    player.onerror = () => { if (token === playToken) speakBrowser(segments.slice(i - 1).join(' '), true) }
    player.play().catch(() => {})
  }
  next()
}

function speakBrowser(text, retry = true) {
  if (!synth) return
  synth.cancel()
  const v = browserVoice
  const parts = text.replace(/\s+/g, ' ').split(/(?<=[.!?:])\s+/)
  parts.forEach((p, i) => {
    const t = p.trim()
    if (!t) return
    const u = new SpeechSynthesisUtterance(t)
    u.lang = v?.lang || 'es-CL'
    if (v) u.voice = v
    u.rate = v && isNatural(v) ? 1 : 0.95
    if (i === 0 && v && !v.localService) {
      u.onerror = (e) => {
        if (!retry || e.error === 'interrupted' || e.error === 'canceled') return
        onlineFailed = true // voz en línea sin conexión: se cambia a una voz instalada
        pickVoice()
        speakBrowser(text, false)
      }
    }
    synth.speak(u)
  })
}

// Acepta un texto o una lista de segmentos (ver narration.js)
export function speak(content) {
  if (!enabled || isMuted() || !content) return
  const segments = (Array.isArray(content) ? content : [content]).filter(Boolean)
  stopSpeech()
  const token = playToken
  const rec = activeRecorded()
  if (rec && segments.every((s) => recorded[rec].keys.has(segmentKey(s)))) playRecorded(rec, segments, token)
  else speakBrowser(segments.join(' '))
}

// Narra el contenido de una pantalla al aparecer (auto) y devuelve una función para repetirlo
export function useNarration(segments, auto = true) {
  const sig = Array.isArray(segments) ? segments.join('\u0001') : segments
  useEffect(() => {
    if (!auto || !sig) return
    const t = setTimeout(() => speak(segments), 400)
    return () => { clearTimeout(t); stopSpeech() }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sig, auto])
  useEffect(() => () => stopSpeech(), [])
  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useCallback(() => speak(segments), [sig])
}
