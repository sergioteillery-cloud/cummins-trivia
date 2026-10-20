// Persistencia local (offline-first): leads y puntuaciones en localStorage
const KEY = 'cummins_trivia_leads'

export const loadLeads = () => { try { return JSON.parse(localStorage.getItem(KEY)) || [] } catch { return [] } }
export function saveLead(lead) {
  const all = loadLeads()
  all.push({ id: Date.now(), date: new Date().toISOString(), ...lead })
  try { localStorage.setItem(KEY, JSON.stringify(all)) } catch (e) { console.error('No se pudo guardar el lead', e) }
}
export const clearLeads = () => { try { localStorage.removeItem(KEY) } catch { /* sin storage */ } }

const esc = (v) => '"' + String(v ?? '').replace(/"/g, '""') + '"'
export function leadsToCsv(leads) {
  const head = ['fecha', 'nombre', 'email', 'telefono', 'empresa', 'puntos', 'aciertos', 'total_preguntas', 'tiempo_seg']
  const rows = leads.map((l) => [l.date, l.name, l.email, l.phone, l.company, l.score, l.correct, l.total, l.timeSec].map(esc).join(','))
  return '﻿' + [head.join(','), ...rows].join('\r\n')
}
export function downloadCsv(leads) {
  const blob = new Blob([leadsToCsv(leads)], { type: 'text/csv;charset=utf-8' })
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = 'leads-cummins-' + new Date().toISOString().slice(0, 10) + '.csv'
  document.body.appendChild(a); a.click(); a.remove()
}

// Banco de preguntas editable desde el panel de administración (sobrescribe questions.json)
const BANK_KEY = 'cummins_trivia_bank'
// El banco guardado lleva la versión de questions.json: si el archivo cambia de versión, se descartan las ediciones locales
export const loadBank = (version) => { try { const b = JSON.parse(localStorage.getItem(BANK_KEY)); return b && !Array.isArray(b) && b.version === version && Array.isArray(b.questions) ? b.questions : null } catch { return null } }
export const saveBank = (bank, version) => { try { localStorage.setItem(BANK_KEY, JSON.stringify({ version, questions: bank })) } catch (e) { console.error('No se pudo guardar el banco', e) } }
export const resetBank = () => { try { localStorage.removeItem(BANK_KEY) } catch { /* sin storage */ } }

// Modo de juego: con toma de datos (registro) o sin toma de datos (juego directo)
const COLLECT_KEY = 'cummins_trivia_collect'
export const loadCollect = () => { try { return localStorage.getItem(COLLECT_KEY) !== '0' } catch { return true } }
export const saveCollect = (v) => { try { localStorage.setItem(COLLECT_KEY, v ? '1' : '0') } catch { /* sin storage */ } }

// Preguntas por ronda (administrable)
const PER_GAME_KEY = 'cummins_trivia_pergame'
export const loadPerGame = (fallback) => { try { const n = parseInt(localStorage.getItem(PER_GAME_KEY), 10); return n >= 1 ? n : fallback } catch { return fallback } }
export const savePerGame = (n) => { try { localStorage.setItem(PER_GAME_KEY, String(n)) } catch { /* sin storage */ } }

// Mazo sin repetición: preguntas ya usadas en el ciclo actual (se reinicia al agotar el banco)
const USED_KEY = 'cummins_trivia_used'
export const loadUsed = () => { try { const u = JSON.parse(localStorage.getItem(USED_KEY)); return Array.isArray(u) ? u : [] } catch { return [] } }
export const saveUsed = (u) => { try { localStorage.setItem(USED_KEY, JSON.stringify(u)) } catch { /* sin storage */ } }

// Pantalla de reposo: minutos sin uso antes de mostrar el logo (0 = desactivada); null = valor de questions.json
const SAVER_KEY = 'cummins_trivia_saver_min'
export const loadSaverMinutes = () => { try { const v = localStorage.getItem(SAVER_KEY); return v === null ? null : Math.max(0, parseInt(v, 10) || 0) } catch { return null } }
export const saveSaverMinutes = (m) => { try { localStorage.setItem(SAVER_KEY, String(m)) } catch { /* sin storage */ } }
