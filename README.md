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

## Accesibilidad

- Lectura en voz alta de cada pantalla (Web Speech API, voces en español del equipo) y botón **Repetir audio**.
- Sin límite de tiempo: el juego avanza solo al tocar un botón.
- Botones A/B/C grandes abajo, para responder arriba o abajo según la estatura.
- Tipografía **Cummins Innova** si está instalada o en `public/fonts/`; si no, Roboto.

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

## Versión local para totem Windows

```bash
npm run build:kiosk   # genera kiosk-dist/Cummins-Trivia-Windows.zip
```

El paquete incluye un servidor local (PowerShell, sin instalar nada), scripts `.bat` para abrir en modo kiosco y autoinicio, y un `LEEME-WINDOWS.txt` con las instrucciones.
