@echo off
echo ==========================================
echo 🔫 MATANDO PROCESOS EN PUERTOS 3000 Y 3001
echo ==========================================
echo.

echo Matando todos los procesos de Node.js...
taskkill /F /IM node.exe 2>nul
taskkill /F /IM tsx.exe 2>nul

echo.
echo Limpiando puerto 3000...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3000') do (
    echo Matando PID %%a
    taskkill /F /PID %%a 2>nul
)

echo.
echo Limpiando puerto 3001...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3001') do (
    echo Matando PID %%a
    taskkill /F /PID %%a 2>nul
)

echo.
echo ==========================================
echo ✅ PUERTOS LIBERADOS
echo ==========================================
echo.

timeout /t 2 >nul
