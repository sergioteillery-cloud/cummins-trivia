// Genera los audios de la trivia con Piper (voz neuronal gratuita y local) en public/voz/.
// Uso: npm run voz
// Requiere Piper y la voz descargados (por defecto en D:\TriviaVoz; se puede cambiar con PIPER_DIR) y ffmpeg en el PATH.
// Solo genera los segmentos que aún no existen y borra los que ya no se usan.
import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from 'node:fs'
import { spawn, spawnSync } from 'node:child_process'
import { join, resolve } from 'node:path'
import { tmpdir } from 'node:os'
import { allSegments, segmentKey } from '../src/narration.js'

const PIPER_DIR = process.env.PIPER_DIR || 'D:\\TriviaVoz'
const VOICES = {
  // Voz "Daniela" (es_AR, calidad alta): https://huggingface.co/rhasspy/piper-voices — licencia CC BY-SA 4.0, dataset OpenSLR 61
  daniela: { model: 'es_AR-daniela-high', label: 'Daniela', lengthScale: 1.15 },
}
const DEFAULTS = { prizeMinScore: 1, prizeText: '¡Reclama tu premio en nuestro stand!', noPrizeText: '¡Te esperamos en una próxima oportunidad!' }

const piperExe = join(PIPER_DIR, 'bin', 'piper', 'piper.exe')
if (!existsSync(piperExe)) { console.error(`No se encontró Piper en ${piperExe} (define PIPER_DIR)`); process.exit(1) }
if (spawnSync('ffmpeg', ['-version']).status !== 0) { console.error('No se encontró ffmpeg en el PATH'); process.exit(1) }

const bank = JSON.parse(readFileSync('public/questions.json', 'utf8'))
const config = { ...DEFAULTS, ...bank.config }
const segments = allSegments(bank.questions, config)
const keys = segments.map(segmentKey)
console.log(`${segments.length} segmentos, ${segments.reduce((n, s) => n + s.length, 0).toLocaleString('es-CL')} caracteres`)

// Un solo proceso de Piper para todos los textos (entrada JSON línea por línea)
function runPiper(model, lengthScale, jobs) {
  return new Promise((ok, fail) => {
    const p = spawn(piperExe, ['--model', join(PIPER_DIR, 'voces', `${model}.onnx`), '--json-input', '--length_scale', String(lengthScale), '--sentence_silence', '0.35'], { stdio: ['pipe', 'pipe', 'pipe'] })
    let done = 0
    p.stdout.on('data', (d) => { done += String(d).split(/\r?\n/).filter(Boolean).length; process.stdout.write(`\r  voz sintetizada ${Math.min(done, jobs.length)}/${jobs.length}`) })
    let err = ''
    p.stderr.on('data', (d) => { err += d })
    p.on('error', fail)
    p.on('close', (code) => (code === 0 ? ok() : fail(new Error(`Piper terminó con código ${code}: ${err.slice(-300)}`))))
    for (const j of jobs) p.stdin.write(JSON.stringify({ text: j.text, output_file: j.wav }) + '\n')
    p.stdin.end()
  })
}

const manifestPath = 'public/voz/manifest.json'
const manifest = { voices: {} }

for (const [id, { model, label, lengthScale }] of Object.entries(VOICES)) {
  const dir = `public/voz/${id}`
  mkdirSync(dir, { recursive: true })
  const tmp = join(tmpdir(), `trivia-voz-${id}`)
  mkdirSync(tmp, { recursive: true })
  const jobs = segments
    .map((text) => ({ text, key: segmentKey(text) }))
    .filter((j) => !existsSync(`${dir}/${j.key}.mp3`))
    .map((j) => ({ ...j, wav: resolve(tmp, `${j.key}.wav`) }))
  console.log(`\n${label}: ${jobs.length} audios por generar (${segments.length - jobs.length} ya existen)`)
  if (jobs.length) {
    await runPiper(model, lengthScale, jobs)
    console.log('')
    jobs.forEach((j, i) => {
      if (!existsSync(j.wav)) throw new Error(`Piper no generó el audio de: ${j.text.slice(0, 60)}…`)
      const r = spawnSync('ffmpeg', ['-y', '-loglevel', 'error', '-i', j.wav, '-af', 'loudnorm=I=-16:TP=-1.5', '-ar', '24000', '-ac', '1', '-codec:a', 'libmp3lame', '-b:a', '64k', `${dir}/${j.key}.mp3`])
      if (r.status !== 0) throw new Error(`ffmpeg falló: ${r.stderr}`)
      rmSync(j.wav)
      if ((i + 1) % 25 === 0 || i + 1 === jobs.length) process.stdout.write(`\r  convertido a mp3 ${i + 1}/${jobs.length}`)
    })
    console.log('')
  }
  const keep = new Set(keys.map((k) => `${k}.mp3`))
  let removed = 0
  for (const f of readdirSync(dir)) if (f.endsWith('.mp3') && !keep.has(f)) { rmSync(`${dir}/${f}`); removed++ }
  const size = readdirSync(dir).reduce((n, f) => n + statSync(`${dir}/${f}`).size, 0)
  console.log(`  listo: ${keys.length} audios, ${(size / 1048576).toFixed(1)} MB${removed ? `, ${removed} obsoletos borrados` : ''}`)
  manifest.voices[id] = { label, engine: 'piper', model, keys }
}

manifest.generatedAt = new Date().toISOString()
manifest.bankVersion = config.bankVersion
writeFileSync(manifestPath, JSON.stringify(manifest))
console.log(`Manifiesto actualizado: ${manifestPath}`)
