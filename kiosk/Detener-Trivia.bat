@echo off
rem Detiene el servidor local de la trivia. Para cerrar la pantalla completa: Alt+F4.
powershell -NoProfile -ExecutionPolicy Bypass -Command "Get-CimInstance Win32_Process | Where-Object { $_.CommandLine -like '*servidor.ps1*' } | ForEach-Object { Stop-Process -Id $_.ProcessId -Force }"
echo Servidor detenido.
timeout /t 2 >nul
