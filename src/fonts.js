// Tipografía de marca Cummins Innova (Text para lectura, Display para títulos).
// Se carga desde public/fonts/ (web y paquete Windows) o, si está instalada en el equipo, desde el sistema (local()).
// Si no hay ninguna de las dos, se usa Roboto (alternativa aprobada por el manual de marca).
const FACES = [
  // [peso CSS, archivo, nombres locales]
  [300, 'CumminsInnovaText-Light', ['Cummins Innova Text Light', 'CumminsInnovaText-Light']],
  [400, 'CumminsInnovaText-Regular', ['Cummins Innova Text', 'CumminsInnovaText-Regular']],
  [500, 'CumminsInnovaText-SemiBold', ['Cummins Innova Text SemiBold', 'CumminsInnovaText-SemiBold']],
  [600, 'CumminsInnovaText-SemiBold', ['Cummins Innova Text SemiBold', 'CumminsInnovaText-SemiBold']],
  [700, 'CumminsInnovaText-Bold', ['Cummins Innova Text Bold', 'CumminsInnovaText-Bold']],
  [800, 'CumminsInnovaDisplay-ExtraBold', ['Cummins Innova Display ExtraBold', 'CumminsInnovaDisplay-ExtraBold']],
  [900, 'CumminsInnovaDisplay-Bold', ['Cummins Innova Display Bold', 'CumminsInnovaDisplay-Bold']],
]

export function loadBrandFont() {
  const base = import.meta.env.BASE_URL + 'fonts/'
  const css = FACES.map(([w, file, locals]) => `@font-face{font-family:"Cummins Innova";font-style:normal;font-weight:${w};font-display:swap;src:url("${base}${file}.woff2") format("woff2"),${locals.map((n) => `local("${n}")`).join(',')};}`).join('')
  const style = document.createElement('style')
  style.textContent = css
  document.head.appendChild(style)
}
