// Efectos sintetizados con Web Audio API (sin archivos, funciona offline)
let ctx = null
let muted = (() => { try { return localStorage.getItem('ct_muted') === '1' } catch { return false } })()

const getCtx = () => {
  if (!ctx) { const AC = window.AudioContext || window.webkitAudioContext; if (AC) ctx = new AC() }
  if (ctx && ctx.state === 'suspended') ctx.resume()
  return ctx
}

function tone(freq, start, dur, type = 'sine', vol = 0.25) {
  const c = getCtx(); if (!c || muted) return
  const o = c.createOscillator(), g = c.createGain()
  o.type = type; o.frequency.value = freq
  const t = c.currentTime + start
  g.gain.setValueAtTime(0.0001, t)
  g.gain.exponentialRampToValueAtTime(vol, t + 0.02)
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur)
  o.connect(g).connect(c.destination); o.start(t); o.stop(t + dur + 0.05)
}

export const isMuted = () => muted
export function setMuted(v) { muted = v; try { localStorage.setItem('ct_muted', v ? '1' : '0') } catch { /* sin storage */ } }

export const sfx = {
  tap: () => tone(660, 0, 0.06, 'triangle', 0.15),
  start: () => [392, 523, 659, 784].forEach((f, i) => tone(f, i * 0.08, 0.2, 'square', 0.15)),
  correct: () => [523, 659, 784, 1047].forEach((f, i) => tone(f, i * 0.09, 0.25, 'triangle', 0.3)),
  wrong: () => { tone(220, 0, 0.25, 'sawtooth', 0.2); tone(165, 0.18, 0.35, 'sawtooth', 0.2) },
  tick: () => tone(880, 0, 0.05, 'square', 0.08),
  finish: () => [523, 659, 784, 659, 784, 1047, 1319].forEach((f, i) => tone(f, i * 0.11, 0.3, 'triangle', 0.3)),
}
