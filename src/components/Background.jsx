import { useEffect, useRef } from 'react'
import { useTheme } from '../theme.js'

// Fondo dinámico: negro con partículas redondeadas en rojo Cummins y grises
export default function Background({ intensity = 1 }) {
  const light = useTheme() === 'light'
  const ref = useRef(null)
  useEffect(() => {
    const cv = ref.current
    const c = cv.getContext('2d')
    const W = (cv.width = 1080), H = (cv.height = 1920)
    let raf
    const ps = Array.from({ length: 46 }, () => ({
      x: Math.random() * W, y: Math.random() * H, r: 4 + Math.random() * 16,
      vy: 0.3 + Math.random() * 1.2, red: Math.random() < 0.45, a: 0.15 + Math.random() * 0.4,
    }))
    const draw = () => {
      c.clearRect(0, 0, W, H)
      for (const p of ps) {
        p.y -= p.vy * intensity
        if (p.y < -40) { p.y = H + 40; p.x = Math.random() * W }
        c.fillStyle = p.red ? `rgba(218,41,28,${light ? p.a * 0.7 : p.a})` : `rgba(169,168,166,${light ? p.a * 0.8 : p.a * 0.5})`
        c.beginPath(); c.roundRect(p.x, p.y, p.r * 2, p.r * 2, p.r * 0.5); c.fill()
      }
      raf = requestAnimationFrame(draw)
    }
    draw()
    return () => cancelAnimationFrame(raf)
  }, [intensity, light])
  return (
    <>
      <div style={{ position: 'absolute', inset: 0, background: light ? 'radial-gradient(circle at 50% 115%, rgba(218,41,28,.22) 0%, #fff 62%)' : 'radial-gradient(circle at 50% 110%, #680F14 0%, #000 60%)' }} />
      <canvas ref={ref} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} />
    </>
  )
}
