@echo off
rem Inicia el servidor local y abre la trivia a pantalla completa (modo kiosco).
cd /d "%~dp0"
set URL=http://localhost:8765/

start "" /min powershell -NoProfile -ExecutionPolicy Bypass -WindowStyle Hidden -File "%~dp0servidor.ps1"
timeout /t 2 /nobreak >nul

set EDGE=%ProgramFiles(x86)%\Microsoft\Edge\Application\msedge.exe
if not exist "%EDGE%" set EDGE=%ProgramFiles%\Microsoft\Edge\Application\msedge.exe
set CHROME=%ProgramFiles%\Google\Chrome\Application\chrome.exe
if not exist "%CHROME%" set CHROME=%ProgramFiles(x86)%\Google\Chrome\Application\chrome.exe

rem Perfil propio en la carpeta "datos-navegador": ahí quedan guardados los leads y ajustes.
set FLAGS=--user-data-dir="%~dp0datos-navegador" --no-first-run --no-default-browser-check --autoplay-policy=no-user-gesture-required --disable-pinch --overscroll-history-navigation=0 --disable-features=Translate

if exist "%EDGE%" (
  start "" "%EDGE%" --kiosk %URL% --edge-kiosk-type=fullscreen %FLAGS%
) else if exist "%CHROME%" (
  start "" "%CHROME%" --kiosk %URL% %FLAGS%
) else (
  echo No se encontro Microsoft Edge ni Google Chrome. Abre %URL% en tu navegador.
  pause
)
