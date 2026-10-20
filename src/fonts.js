// Tipografía de marca Cummins Innova.
// 1) Si está instalada en el equipo (tótem Windows), se usa directamente (local()).
// 2) Si no, se carga desde public/fonts/ cuando existan esos archivos.
// 3) Si no hay ninguna, se usa Roboto (alternativa aprobada por el manual de marca).
const FACES = [
  // [peso, nombres locales, archivo]
  [300, ['Cummins Innova Text Light', 'CumminsInnovaText-Light'], 'CumminsInnovaText-Light'],
  [400, ['Cummins Innova Text Regular', 'Cummins Innova Text', 'CumminsInnovaText-Regular'], 'CumminsInnovaText-Regular'],
  [500, ['Cummins Innova Text SemiBold', 'CumminsInnovaText-SemiBold'], 'CumminsInnovaText-SemiBold'],
  [700, ['Cummins Innova Display Bold', 'CumminsInnovaDisplay-Bold'], 'CumminsInnovaDisplay-Bold'],
  [900, ['Cummins Innova Display Bold', 'CumminsInnovaDisplay-Bold'], 'CumminsInnovaDisplay-Bold'],
]

export function loadBrandFont() {
  const base = import.meta.env.BASE_URL + 'fonts/'
  const css = FACES.map(([w, locals, file]) => `@font-face{font-family:"Cummins Innova";font-weight:${w};font-display:swap;src:${locals.map((n) => `local("${n}")`).join(',')},url("${base}${file}.woff2") format("woff2"),url("${base}${file}.otf") format("opentype"),url("${base}${file}.ttf") format("truetype");}`).join('')
  const style = document.createElement('style')
  style.textContent = css
  document.head.appendChild(style)
}
