import { useState } from 'react'
import { Check, Download, Pencil, Plus, RotateCcw, Trash2, X } from 'lucide-react'
import { THEMES } from '../theme.js'
import { clearLeads, downloadCsv, leadsToCsv, loadLeads } from '../storage.js'

const EMPTY_Q = { question: '', options: ['', '', '', ''], correct: 0, explanation: '', active: true }
const LETTERS = ['A', 'B', 'C', 'D']

// Pantalla oculta: PIN -> leads (CSV) y banco de preguntas (agregar / editar / sacar / habilitar)
export default function Admin({ pin, bank, perGame, onPerGame, usedCount, onResetDeck, onBank, onRestore, theme, onTheme, collect, onCollect, onClose }) {
  const [input, setInput] = useState('')
  const [ok, setOk] = useState(false)
  const [tab, setTab] = useState('questions')

  const press = (d) => {
    const next = (input + d).slice(0, 8)
    setInput(next)
    if (next === pin) setOk(true)
  }

  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 100, background: 'rgba(0,0,0,.97)', padding: '130px 60px 60px', display: 'flex', flexDirection: 'column', alignItems: 'center', overflow: 'auto' }}>
      <button onClick={onClose} aria-label="Cerrar" style={{ position: 'absolute', top: 40, right: 40, width: 100, height: 100, borderRadius: 32, background: '#2A2A2A', color: '#fff', display: 'grid', placeItems: 'center' }}><X size={56} /></button>
      <div style={{ fontSize: 70, fontWeight: 900 }}>Administración</div>

      {!ok ? (
        <>
          <div style={{ fontSize: 40, color: '#A9A8A6', marginTop: 20 }}>Ingresa el PIN</div>
          <div style={{ fontSize: 100, letterSpacing: '.3em', height: 130, marginTop: 20 }}>{'•'.repeat(input.length)}</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20, width: 760, marginTop: 30 }}>
            {['1', '2', '3', '4', '5', '6', '7', '8', '9', 'C', '0', '⌫'].map((d) => (
              <button key={d} onClick={() => (d === 'C' ? setInput('') : d === '⌫' ? setInput(input.slice(0, -1)) : press(d))} style={{ height: 150, borderRadius: 36, background: '#2A2A2A', color: '#fff', fontSize: 70, fontWeight: 700 }}>{d}</button>
            ))}
          </div>
        </>
      ) : (
        <>
          <div style={{ display: 'flex', gap: 16, marginTop: 40, width: '100%' }}>
            {[['questions', 'Preguntas'], ['theme', 'Ajustes'], ['leads', 'Leads']].map(([id, label]) => (
              <button key={id} onClick={() => setTab(id)} style={{ flex: 1, height: 110, borderRadius: 55, fontSize: 40, fontWeight: 700, background: tab === id ? '#DA291C' : '#2A2A2A', color: '#fff' }}>{label}</button>
            ))}
          </div>
          {tab === 'questions' && <Questions bank={bank} perGame={perGame} onBank={onBank} onRestore={onRestore} />}
          {tab === 'theme' && <Settings bank={bank} perGame={perGame} onPerGame={onPerGame} usedCount={usedCount} onResetDeck={onResetDeck} theme={theme} onTheme={onTheme} collect={collect} onCollect={onCollect} />}
          {tab === 'leads' && <Leads />}
        </>
      )}
    </div>
  )
}

// Selector de tema: se aplica al instante y queda guardado en el dispositivo
function Settings({ bank, perGame, onPerGame, usedCount, onResetDeck, theme, onTheme, collect, onCollect }) {
  const activeCount = bank.filter((q) => q.active !== false).length
  const maxPer = Math.max(1, Math.min(10, activeCount))
  const modes = [
    { v: true, label: 'Con toma de datos', desc: 'El visitante se registra (nombre y email) antes de jugar.' },
    { v: false, label: 'Sin toma de datos', desc: 'Juega directo, sin formulario. Se guarda solo el puntaje como "Anónimo".' },
  ]
  return (
    <div style={{ width: '100%', marginTop: 40, display: 'flex', flexDirection: 'column', gap: 30 }}>
      <div style={{ fontSize: 40, fontWeight: 900 }}>Preguntas por ronda</div>
      <div style={{ background: '#1a1a1a', borderRadius: 36, padding: 30 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 50 }}>
          <button onClick={() => onPerGame(Math.max(1, perGame - 1))} aria-label="Menos preguntas" style={{ width: 130, height: 130, borderRadius: 40, background: '#2A2A2A', color: '#fff', fontSize: 80, fontWeight: 700 }}>−</button>
          <div style={{ fontSize: 140, fontWeight: 900, minWidth: 160, textAlign: 'center' }}>{Math.min(perGame, maxPer)}</div>
          <button onClick={() => onPerGame(Math.min(maxPer, perGame + 1))} aria-label="Más preguntas" style={{ width: 130, height: 130, borderRadius: 40, background: '#DA291C', color: '#fff', fontSize: 80, fontWeight: 700 }}>+</button>
        </div>
        <div style={{ fontSize: 30, color: '#A9A8A6', textAlign: 'center', marginTop: 16 }}>Máximo {maxPer} (preguntas habilitadas en el banco: {activeCount}).</div>
        <div style={{ fontSize: 32, color: '#E0E0DF', textAlign: 'center', marginTop: 24 }}>Ciclo sin repetición: <b>{usedCount}</b> de <b>{activeCount}</b> preguntas ya usadas.</div>
        <button onClick={onResetDeck} style={{ display: 'block', margin: '20px auto 0', height: 84, padding: '0 50px', borderRadius: 42, background: '#2A2A2A', color: '#fff', fontSize: 32, fontWeight: 700 }}>Reiniciar ciclo</button>
      </div>
      <div style={{ fontSize: 40, fontWeight: 900, marginTop: 10 }}>Modo de juego</div>
      {modes.map((m) => (
        <button key={String(m.v)} onClick={() => onCollect(m.v)} style={{ padding: 30, borderRadius: 36, background: '#1a1a1a', border: collect === m.v ? '6px solid #DA291C' : '6px solid transparent', color: '#fff', textAlign: 'left' }}>
          <div style={{ fontSize: 48, fontWeight: 900, display: 'flex', alignItems: 'center', gap: 16 }}>{m.label}{collect === m.v && <span style={{ fontSize: 32, color: '#30A566', display: 'inline-flex', alignItems: 'center', gap: 8 }}><Check size={36} strokeWidth={4} /> En uso</span>}</div>
          <div style={{ fontSize: 32, color: '#A9A8A6', marginTop: 8 }}>{m.desc}</div>
        </button>
      ))}
      <div style={{ fontSize: 40, fontWeight: 900, marginTop: 20 }}>Apariencia</div>
      <div style={{ fontSize: 36, color: '#E0E0DF' }}>Elige el estilo visual del juego para los visitantes.</div>
      {THEMES.map((t) => {
        const light = t.id === 'light'
        const on = theme === t.id
        return (
          <button key={t.id} onClick={() => onTheme(t.id)} style={{ display: 'flex', alignItems: 'center', gap: 40, padding: 30, borderRadius: 40, background: '#1a1a1a', border: on ? '6px solid #DA291C' : '6px solid transparent', color: '#fff', textAlign: 'left' }}>
            <div style={{ flex: '0 0 220px', height: 390, borderRadius: 28, background: light ? '#fff' : '#000', border: '3px solid #474747', padding: 22, display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ height: 16, width: '50%', borderRadius: 8, background: '#DA291C' }} />
              <div style={{ height: 40, borderRadius: 10, background: light ? '#000' : '#fff', opacity: 0.9 }} />
              {[0, 1, 2, 3].map((i) => <div key={i} style={{ height: 44, borderRadius: 12, background: light ? '#fff' : '#2A2A2A', border: light ? '3px solid #000' : 'none' }} />)}
              <div style={{ flex: 1 }} />
              <div style={{ height: 54, borderRadius: 27, background: '#DA291C' }} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 56, fontWeight: 900 }}>{t.label}</div>
              <div style={{ fontSize: 34, color: '#A9A8A6', marginTop: 8 }}>{t.desc}</div>
              {on && <div style={{ marginTop: 24, display: 'inline-flex', alignItems: 'center', gap: 12, fontSize: 34, fontWeight: 700, color: '#30A566' }}><Check size={40} strokeWidth={4} /> En uso</div>}
            </div>
          </button>
        )
      })}
    </div>
  )
}

function Questions({ bank, perGame, onBank, onRestore }) {
  const [editing, setEditing] = useState(null) // { index (-1 = nueva), q }
  const [confirmDel, setConfirmDel] = useState(null)
  const [confirmRestore, setConfirmRestore] = useState(false)
  const activeCount = bank.filter((q) => q.active !== false).length

  if (editing) {
    return (
      <Editor
        initial={editing.q}
        isNew={editing.index === -1}
        onCancel={() => setEditing(null)}
        onSave={(q) => {
          const next = editing.index === -1 ? [...bank, q] : bank.map((x, i) => (i === editing.index ? q : x))
          onBank(next)
          setEditing(null)
        }}
      />
    )
  }

  return (
    <div style={{ width: '100%', marginTop: 30, display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ fontSize: 34, color: '#E0E0DF', lineHeight: 1.3 }}>
        Banco: <b>{bank.length}</b> preguntas · <b style={{ color: activeCount < perGame ? '#DA291C' : '#30A566' }}>{activeCount}</b> habilitadas. Cada juego sortea {perGame} de las habilitadas.
        {activeCount < perGame && <div style={{ color: '#DA291C' }}>Habilita al menos {perGame} para juegos completos.</div>}
      </div>
      <button className="btn btn-primary" onClick={() => setEditing({ index: -1, q: EMPTY_Q })} style={{ height: 120, fontSize: 48 }}><Plus size={52} /> Agregar pregunta</button>

      {bank.map((q, i) => {
        const on = q.active !== false
        return (
          <div key={i} style={{ background: '#1a1a1a', borderRadius: 30, padding: 28, opacity: on ? 1 : 0.55 }}>
            <div style={{ fontSize: 38, fontWeight: 700, lineHeight: 1.2 }}>{i + 1}. {q.question}</div>
            <div style={{ fontSize: 30, color: '#30A566', marginTop: 10 }}>✔ {LETTERS[q.correct]}) {q.options[q.correct]}</div>
            <div style={{ display: 'flex', gap: 14, marginTop: 20 }}>
              <button onClick={() => onBank(bank.map((x, j) => (j === i ? { ...x, active: !on } : x)))} style={smallBtn(on ? '#30A566' : '#474747')}>{on ? <Check size={36} /> : <X size={36} />} {on ? 'Habilitada' : 'Deshabilitada'}</button>
              <button onClick={() => setEditing({ index: i, q })} style={smallBtn('#2A2A2A')}><Pencil size={36} /> Editar</button>
              <button onClick={() => { if (confirmDel === i) { onBank(bank.filter((_, j) => j !== i)); setConfirmDel(null) } else setConfirmDel(i) }} style={smallBtn(confirmDel === i ? '#DA291C' : '#2A2A2A')}>
                <Trash2 size={36} /> {confirmDel === i ? '¿Seguro?' : 'Sacar'}
              </button>
            </div>
          </div>
        )
      })}

      <button className="btn btn-secondary" onClick={() => { if (confirmRestore) { onRestore(); setConfirmRestore(false) } else setConfirmRestore(true) }} style={{ height: 110, fontSize: 40, background: confirmRestore ? '#DA291C' : '#fff', color: confirmRestore ? '#fff' : '#000' }}>
        <RotateCcw size={44} /> {confirmRestore ? 'Toca de nuevo: se pierden tus cambios' : 'Restaurar banco original'}
      </button>
    </div>
  )
}

const smallBtn = (bg) => ({ flex: 1, height: 84, borderRadius: 42, background: bg, color: '#fff', fontSize: 30, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 })

function Editor({ initial, isNew, onSave, onCancel }) {
  const [q, setQ] = useState({ ...initial, options: [...initial.options, '', '', ''].slice(0, 4) })
  // La opción D es opcional (preguntas de 3 o 4 alternativas); la correcta debe tener texto
  const valid = q.question.trim() && q.options.slice(0, 3).every((o) => o.trim()) && q.options[q.correct].trim()
  const setOpt = (i, v) => setQ((s) => ({ ...s, options: s.options.map((o, j) => (j === i ? v : o)) }))

  return (
    <div style={{ width: '100%', marginTop: 30, display: 'flex', flexDirection: 'column', gap: 18 }}>
      <div style={{ fontSize: 48, fontWeight: 900 }}>{isNew ? 'Nueva pregunta' : 'Editar pregunta'}</div>
      <Field label="Pregunta"><textarea id="q-text" rows={2} value={q.question} onChange={(e) => setQ({ ...q, question: e.target.value })} style={{ ...inputStyle, resize: 'none' }} /></Field>
      {q.options.map((o, i) => (
        <div key={i} style={{ display: 'flex', gap: 16, alignItems: 'flex-end' }}>
          <div style={{ flex: 1 }}>
            <Field label={`Opción ${LETTERS[i]}${i === 3 ? ' (opcional)' : ''}`}><input id={`q-opt-${i}`} value={o} onChange={(e) => setOpt(i, e.target.value)} style={inputStyle} /></Field>
          </div>
          <button onClick={() => setQ({ ...q, correct: i })} aria-label={`Marcar ${LETTERS[i]} como correcta`} style={{ flex: '0 0 130px', height: 84, borderRadius: 24, background: q.correct === i ? '#30A566' : '#2A2A2A', color: '#fff', fontSize: 28, fontWeight: 700 }}>
            {q.correct === i ? '✔ Correcta' : 'Marcar'}
          </button>
        </div>
      ))}
      <Field label="Explicación breve (opcional)"><textarea id="q-exp" rows={2} value={q.explanation} onChange={(e) => setQ({ ...q, explanation: e.target.value })} style={{ ...inputStyle, resize: 'none' }} /></Field>
      <div style={{ display: 'flex', gap: 20, marginTop: 10 }}>
        <button className="btn btn-secondary" onClick={onCancel} style={{ flex: 1, height: 110, fontSize: 44 }}>Cancelar</button>
        <button className="btn btn-primary" disabled={!valid} onClick={() => onSave({ ...q, question: q.question.trim(), options: q.options.map((o) => o.trim()).filter((o, i) => o || i < 3), explanation: q.explanation.trim() })} style={{ flex: 1, height: 110, fontSize: 44 }}>Guardar</button>
      </div>
    </div>
  )
}

const inputStyle = { width: '100%', boxSizing: 'border-box', borderRadius: 20, border: '3px solid #474747', background: '#fff', color: '#000', fontSize: 36, padding: '16px 22px', fontFamily: 'inherit', userSelect: 'text', WebkitUserSelect: 'text' }
const Field = ({ label, children }) => (
  <label style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
    <span style={{ fontSize: 26, fontWeight: 700, color: '#A9A8A6', textTransform: 'uppercase', letterSpacing: '.1em' }}>{label}</span>
    {children}
  </label>
)

function Leads() {
  const [leads, setLeads] = useState(loadLeads())
  const [confirm, setConfirm] = useState(false)
  const [copied, setCopied] = useState(false)
  const copyCsv = () => { try { navigator.clipboard.writeText(leadsToCsv(leads)).then(() => setCopied(true)) } catch { /* sin portapapeles */ } }
  const avg = leads.length ? Math.round(leads.reduce((s, l) => s + (l.score || 0), 0) / leads.length) : 0

  return (
    <div style={{ width: '100%' }}>
      <div style={{ display: 'flex', gap: 30, marginTop: 40, width: '100%' }}>
        <Box label="Leads" value={leads.length} />
        <Box label="Puntaje promedio" value={avg} />
      </div>
      <div style={{ width: '100%', marginTop: 40, maxHeight: 600, overflow: 'auto', background: '#1a1a1a', borderRadius: 30, padding: 30, fontSize: 32, color: '#E0E0DF', boxSizing: 'border-box' }}>
        {leads.length === 0 && 'Aún no hay registros.'}
        {[...leads].reverse().slice(0, 15).map((l) => (
          <div key={l.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #333' }}>
            <span>{l.name}{l.email ? ` · ${l.email}` : ''}</span><b>{l.score} pts</b>
          </div>
        ))}
      </div>
      <button className="btn btn-primary" disabled={!leads.length} onClick={() => downloadCsv(leads)} style={{ marginTop: 40, width: '100%' }}><Download size={56} /> Exportar CSV</button>
      <button className="btn btn-secondary" disabled={!leads.length} onClick={copyCsv} style={{ marginTop: 30, width: '100%' }}>{copied ? '¡CSV copiado!' : 'Copiar CSV al portapapeles'}</button>
      <button className="btn btn-secondary" onClick={() => { if (confirm) { clearLeads(); setLeads([]); setConfirm(false) } else setConfirm(true) }} style={{ marginTop: 30, width: '100%', color: confirm ? '#fff' : '#000', background: confirm ? '#DA291C' : '#fff' }}>
        <Trash2 size={50} /> {confirm ? 'Toca de nuevo para borrar todo' : 'Borrar datos'}
      </button>
    </div>
  )
}

const Box = ({ label, value }) => (
  <div style={{ flex: 1, background: '#DA291C', borderRadius: 40, padding: 40, textAlign: 'center' }}>
    <div style={{ fontSize: 120, fontWeight: 900, lineHeight: 1 }}>{value}</div>
    <div style={{ fontSize: 34 }}>{label}</div>
  </div>
)
