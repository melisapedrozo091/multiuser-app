@echo off
title Iniciar Multiuser App - Backend y Frontend
color 0A

echo ========================================================
echo   INICIANDO PROYECTO MULTIUSER APP (ACADEMIA TECH)
echo ========================================================
echo.
echo 1. Abriendo Backend en http://localhost:3000 ...
start "Backend - Multiuser App" cmd /k "cd /d %~dp0backend && npm.cmd run dev"

echo 2. Abriendo Frontend Angular en http://localhost:4200 ...
start "Frontend - Multiuser App" cmd /k "cd /d %~dp0frontend && npm.cmd start"

echo.
echo ========================================================
echo   Listo! Se abrieron dos ventanas:
echo   - Backend:  http://localhost:3000
echo   - Frontend: http://localhost:4200 (se abrira en tu navegador)
echo ========================================================
pause
