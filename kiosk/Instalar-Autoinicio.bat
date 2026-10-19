@echo off
rem Hace que la trivia se abra sola cada vez que Windows inicia sesión.
powershell -NoProfile -ExecutionPolicy Bypass -Command "$s=(New-Object -ComObject WScript.Shell).CreateShortcut([Environment]::GetFolderPath('Startup')+'\Trivia Cummins.lnk'); $s.TargetPath='%~dp0Iniciar-Trivia.bat'; $s.WorkingDirectory='%~dp0'; $s.WindowStyle=7; $s.Save()"
echo Listo: la trivia se iniciara automaticamente con Windows.
pause
