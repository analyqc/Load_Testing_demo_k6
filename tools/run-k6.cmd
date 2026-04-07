@echo off
rem Añade k6 al PATH si está en la ruta por defecto del MSI (útil si el terminal no se reinició tras instalar).
if exist "%ProgramFiles%\k6\k6.exe" set "PATH=%ProgramFiles%\k6;%PATH%"
k6.exe %*
