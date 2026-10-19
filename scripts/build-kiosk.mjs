// Arma el paquete para totem Windows: dist/ + servidor local + .bat -> kiosk-dist/Cummins-Trivia-Windows.zip
import { cpSync, rmSync, mkdirSync } from 'node:fs'
import { execFileSync } from 'node:child_process'

const out = 'kiosk-dist/Cummins-Trivia-Windows'
rmSync('kiosk-dist', { recursive: true, force: true })
mkdirSync(out, { recursive: true })
cpSync('dist', `${out}/app`, { recursive: true })
cpSync('kiosk', out, { recursive: true })
execFileSync('powershell', ['-NoProfile', '-Command', `Compress-Archive -Path '${out}' -DestinationPath 'kiosk-dist/Cummins-Trivia-Windows.zip' -Force`], { stdio: 'inherit' })
console.log('Listo: kiosk-dist/Cummins-Trivia-Windows.zip')
