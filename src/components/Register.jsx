import { useState } from 'react'
import { ArrowLeft, Check, Play } from 'lucide-react'
import TouchKeyboard from './TouchKeyboard.jsx'
import { sfx } from '../audio.js'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

export default function Register({ onSubmit, onBack }) {
  const [v, setV] = useState({ name: '', email: '', phone: '', company: '' })
  const [active, setActive] = useState('name')
  const [extra, setExtra] = useState(false)
  const [consent, setConsent] = useState(false)

  const fields = [
    { id: 'name', label: 'Nombre', ph: 'Tu nombre' },
    { id: 'email', label: 'Email', ph: 'tu@correo.com' },
    ...(extra ? [{ id: 'phone', label: 'Teléfono', ph: 'Opcional' }, { id: 'company', label: 'Empresa', ph: 'Opcional' }] : []),
  ]
  const append = (c) => setV((s) => ({ ...s, [active]: (s[active] + c).slice(0, 60) }))
  const back = () => setV((s) => ({ ...s, [active]: s[active].slice(0, -1) }))
  const valid = v.name.trim().length > 1 && EMAIL_RE.test(v.email.trim()) && consent

  const submit = () => onSubmit({ name: v.name.trim(), email: v.email.trim().toLowerCase(), phone: v.phone.trim(), company: v.company.trim() })

  return (
    <div style={{ position: 'absolute', inset: 0, padding: '130px 50px 50px', display: 'flex', flexDirection: 'column', gap: 26 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 28 }}>
        <button onClick={() => { sfx.tap(); onBack() }} aria-label="Volver" style={{ width: 100, height: 100, borderRadius: 32, background: 'var(--surface)', color: 'var(--fg)', display: 'grid', placeItems: 'center' }}><ArrowLeft size={52} /></button>
        <div>
          <div style={{ fontSize: 72, fontWeight: 900, lineHeight: 1 }}>¡Regístrate <span style={{ color: '#DA291C' }}>y juega!</span></div>
          <div style={{ fontSize: 34, color: 'var(--muted)', marginTop: 8 }}>Solo toma 10 segundos</div>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {fields.map((f) => (
          <div key={f.id} onPointerDown={() => { sfx.tap(); setActive(f.id) }} style={{ background: 'var(--field-bg)', color: 'var(--field-fg)', borderRadius: 28, padding: '8px 36px', height: 150, flexShrink: 0, lineHeight: 1.2, border: active === f.id ? '6px solid #DA291C' : '6px solid var(--field-border)', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <span style={{ fontSize: 28, fontWeight: 700, color: '#787877', textTransform: 'uppercase', letterSpacing: '.1em' }}>{f.label}</span>
            <span style={{ fontSize: 52, fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: v[f.id] ? 'var(--field-fg)' : '#A9A8A6' }}>
              {v[f.id] || f.ph}{active === f.id && <span style={{ color: '#DA291C' }}>|</span>}
            </span>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <button onClick={() => { sfx.tap(); setExtra((e) => !e) }} style={{ alignSelf: 'flex-start', background: 'none', color: 'var(--muted)', fontSize: 34, textDecoration: 'underline', padding: '8px 0' }}>
          {extra ? '– Ocultar teléfono y empresa' : '+ Agregar teléfono y empresa (opcional)'}
        </button>
        <button onClick={() => { sfx.tap(); setConsent((c) => !c) }} style={{ display: 'flex', alignItems: 'center', gap: 24, background: 'none', color: 'var(--fg)', textAlign: 'left', fontSize: 32 }}>
          <span style={{ flex: '0 0 76px', height: 76, borderRadius: 18, background: consent ? '#DA291C' : 'var(--surface)', border: '4px solid #787877', display: 'grid', placeItems: 'center' }}>{consent && <Check size={52} strokeWidth={4} />}</span>
          Acepto los términos y la política de privacidad para recibir información de Cummins.
        </button>
      </div>

      <div style={{ flex: 1 }} />
      <TouchKeyboard mode={active === 'email' ? 'email' : 'text'} domains={['@gmail.com', '@hotmail.com', '@outlook.com']} onKey={append} onBackspace={back} />

      <button className="btn btn-primary" disabled={!valid} onClick={() => { sfx.start(); submit() }} style={{ width: '100%', height: 150, fontSize: 68, textTransform: 'uppercase' }}>
        <Play size={60} fill="#fff" /> ¡Comenzar!
      </button>
    </div>
  )
}
