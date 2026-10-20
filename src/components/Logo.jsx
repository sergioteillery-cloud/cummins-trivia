// Logos oficiales: Cummins Chile y DEI (Diversidad | Equidad | Inclusión), en versión para fondo claro y oscuro.
import chileLight from '../assets/cummins-chile-light.png'
import chileDark from '../assets/cummins-chile-dark.png'
import deiLight from '../assets/dei-light.png'
import deiDark from '../assets/dei-dark.png'
import { useTheme } from '../theme.js'

export default function LogoHeader({ height = 130 }) {
  const dark = useTheme() === 'dark'
  return (
    <div style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <img src={dark ? chileDark : chileLight} alt="Cummins Chile" style={{ height }} />
      <img src={dark ? deiDark : deiLight} alt="DEI: Diversidad, Equidad, Inclusión" style={{ height: height * 1.05 }} />
    </div>
  )
}
