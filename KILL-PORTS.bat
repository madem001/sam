@echo off
chcp 65001 >nul
cls
echo.
echo ╔════════════════════════════════════════════════════════════╗
echo ║           🧹 LIMPIANDO PUERTOS Y PROCESOS                  ║
echo ╚════════════════════════════════════════════════════════════╝
echo.

echo [1/3] 🔪 Matando todos los procesos de Node.js...
taskkill /F /IM node.exe >nul 2>&1
taskkill /F /IM tsx.exe >nul 2>&1
echo       ✓ Procesos de Node.js terminados
echo.

echo [2/3] 🧹 Limpiando puertos 3000 y 8000...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3000') do taskkill /F /PID %%a >nul 2>&1
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :8000') do taskkill /F /PID %%a >nul 2>&1
echo       ✓ Puertos liberados
echo.

echo [3/3] ⏳ Esperando 3 segundos...
timeout /t 3 >nul
echo       ✓ Sistema listo
echo.

echo ╔════════════════════════════════════════════════════════════╗
echo ║                     ✅ LIMPIEZA COMPLETA                    ║
echo ╚════════════════════════════════════════════════════════════╝
echo.
echo   ℹ️  Ahora puedes ejecutar INICIAR-TODO.bat
echo.
pause
