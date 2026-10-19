# Cummins · Trivia Power Onward

Trivia táctil vertical (tótems y tablets, 1080x1920) para activaciones de marca. Vite + React + Tailwind + Framer Motion.

## Uso

```bash
npm install
npm run dev      # desarrollo
npm run build    # producción (carpeta dist/)
```

## Preguntas y configuración

Se editan en `public/questions.json` (preguntas de 2 a 4 opciones, `correct` = posición desde 0, `explanation` opcional).
Si cambias las preguntas, cambia también `config.bankVersion` para que los dispositivos descarten el banco editado localmente.

## Administración

Botón **Admin** (arriba a la derecha), PIN por defecto `1234` (`config.adminPin`).
- **Preguntas:** agregar, editar, sacar y habilitar/deshabilitar.
- **Ajustes:** preguntas por ronda, ciclo sin repetición, modo con/sin toma de datos y tema oscuro/blanco.
- **Leads:** ver, exportar CSV y borrar.

Los datos (leads, banco editado, ajustes) se guardan en el navegador de cada dispositivo (localStorage).
El PIN es visible en el código; sirve para evitar toques accidentales, no como seguridad.

## Despliegue

Cada push a `main` publica en GitHub Pages mediante `.github/workflows/deploy.yml`.

El logo y la marca Cummins pertenecen a Cummins Inc.
