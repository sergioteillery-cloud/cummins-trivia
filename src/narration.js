// Textos que se leen en voz alta, divididos en segmentos reutilizables.
// La app y el generador de audios (scripts/generate-voice.mjs) usan este mismo módulo,
// así cada segmento grabado coincide exactamente con lo que la app quiere decir.

export const LETTERS = ['A', 'B', 'C', 'D']
export const MAX_PER_GAME = 10

const plural = (n, one, many) => `${n} ${n === 1 ? one : many}`
const letterList = (n) => {
  const ls = LETTERS.slice(0, n)
  return ls.length > 1 ? `${ls.slice(0, -1).join(', ')} y ${ls[ls.length - 1]}` : ls[0]
}

export const attract = (perGame, prizeMinScore) => [
  `Ganando con el poder de la diferencia. Trivia de Cummins Chile. ¡Juega! Responde ${plural(perGame, 'pregunta', 'preguntas')}. ¡Acierta! Con ${plural(prizeMinScore, 'respuesta correcta', 'respuestas correctas')} ganas. ¡Gana! Retira tu premio con el promotor. Toca el botón rojo de abajo para jugar.`,
]

export const register = () => [
  'Regístrate para jugar. Escribe tu nombre y tu correo con el teclado de la pantalla. Luego marca la casilla para aceptar los términos y toca el botón Comenzar, abajo.',
]

export const question = (i, n, q) => [
  `Pregunta ${i} de ${n}.`,
  `${q.question} ${q.options.map((o, k) => `Alternativa ${LETTERS[k]}: ${o}.`).join(' ')} Elige tu respuesta tocando la alternativa, o los botones ${letterList(q.options.length)} de abajo.`,
]

export const feedback = (ok, q, last) => [
  ok ? '¡Correcto! Ganaste 1 punto.' : 'Respuesta incorrecta.',
  `La respuesta correcta es: ${q.options[q.correct]}. ${q.explanation || ''}`.trim(),
  last ? 'Toca Ver resultado para seguir.' : 'Toca Continuar para seguir.',
]

export const result = (score, total, tier, card) => [
  `Tu resultado: ${score} de ${plural(total, 'punto', 'puntos')}.`,
  `${tier.title} ${tier.msg}`,
  card,
  'Toca Finalizar para terminar.',
]

export const SAMPLE = ['Hola, te damos la bienvenida a la trivia de Cummins Chile. Ganando con el poder de la diferencia.']

// Mensajes de resultado según puntaje (los íconos se eligen en Result.jsx)
export function tierFor(score, total) {
  if (score === 0) return { key: 'zero', title: '¡Gracias por participar!', msg: 'Cada intento es una oportunidad para aprender.' }
  if (score >= total) return { key: 'perfect', title: '¡Felicitaciones, puntaje perfecto!', msg: '¡Demostraste el poder de la diferencia!' }
  if (score / total >= 0.6) return { key: 'great', title: '¡Gran resultado!', msg: '¡Vas por buen camino! Juntos hacemos la diferencia.' }
  return { key: 'good', title: '¡Buen trabajo!', msg: '¡Cada acierto cuenta y tú ya ganaste!' }
}

// Clave estable de un segmento (FNV-1a 32 bits) = nombre del archivo de audio grabado
export function segmentKey(text) {
  const s = text.replace(/\s+/g, ' ').trim()
  let h = 0x811c9dc5
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 0x01000193) >>> 0 }
  return h.toString(16).padStart(8, '0')
}

// Todos los segmentos que la app puede necesitar con este banco y configuración
export function allSegments(questions, config) {
  const out = new Set()
  const add = (arr) => arr.forEach((t) => t && out.add(t))
  const prizeMin = config.prizeMinScore ?? 1
  for (let n = 1; n <= MAX_PER_GAME; n++) {
    add(attract(n, prizeMin))
    for (let i = 1; i <= n; i++) add([question(i, n, { question: '', options: [] })[0]])
    for (let s = 0; s <= n; s++) add([result(s, n, tierFor(s, n), '')[0]])
  }
  add(register())
  add(SAMPLE)
  for (const t of ['zero', 'good', 'great', 'perfect']) {
    const tier = [tierFor(0, 3), tierFor(1, 3), tierFor(2, 3), tierFor(3, 3)].find((x) => x.key === t)
    add([`${tier.title} ${tier.msg}`])
  }
  add([config.prizeText, config.noPrizeText, 'Toca Finalizar para terminar.'])
  for (const q of questions) {
    add([question(1, 1, q)[1]])
    for (const ok of [true, false]) for (const last of [true, false]) add(feedback(ok, q, last))
  }
  return [...out]
}
