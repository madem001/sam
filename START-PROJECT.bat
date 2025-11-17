@echo off
echo ==========================================
echo 🧹 LIMPIANDO PROCESOS ANTERIORES
echo ==========================================
echo.

echo Matando procesos de Node.js y tsx...
taskkill /F /IM node.exe 2>nul
taskkill /F /IM tsx.exe 2>nul
timeout /t 2 >nul

echo.
echo ==========================================
echo 🔍 VERIFICANDO PUERTOS
echo ==========================================
echo.

echo Verificando puerto 3000 (Backend)...
netstat -ano | findstr :3000 >nul
if %errorlevel% equ 0 (
    echo ❌ Puerto 3000 OCUPADO - Limpiando...
    for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3000') do (
        taskkill /F /PID %%a 2>nul
    )
    timeout /t 1 >nul
) else (
    echo ✅ Puerto 3000 LIBRE
)

echo.
echo Verificando puerto 3001 (Frontend)...
netstat -ano | findstr :3001 >nul
if %errorlevel% equ 0 (
    echo ❌ Puerto 3001 OCUPADO - Limpiando...
    for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3001') do (
        taskkill /F /PID %%a 2>nul
    )
    timeout /t 1 >nul
) else (
    echo ✅ Puerto 3001 LIBRE
)

echo.
echo ==========================================
echo 📁 VERIFICANDO CONFIGURACIÓN
echo ==========================================
echo.

if not exist "src\backend\.env" (
    echo ❌ ERROR: src\backend\.env NO EXISTE
    echo.
    echo Creando archivo...
    (
        echo DATABASE_URL="postgresql://postgres:postgres@localhost:5432/edubattle?schema=public"
        echo JWT_SECRET="edubattle-secret-key-2024-change-in-production"
        echo PORT=3000
        echo NODE_ENV=development
        echo CORS_ORIGIN=http://localhost:3001
    ) > src\backend\.env
    echo ✅ Archivo creado!
) else (
    echo ✅ src\backend\.env existe
)

echo.
echo ==========================================
echo 🚀 INICIANDO PROYECTO
echo ==========================================
echo.
echo Backend: http://localhost:3000
echo Frontend: http://localhost:3001
echo.
echo ⚠️  Se abrirán DOS ventanas:
echo    - Ventana 1: Backend (puerto 3000)
echo    - Ventana 2: Frontend (puerto 3001)
echo.
echo Presiona cualquier tecla para continuar...
pause >nul

echo.
echo Iniciando Backend...
start "BACKEND - Puerto 3000" cmd /k "cd src\backend && npm run dev"

timeout /t 3 >nul

echo Iniciando Frontend...
start "FRONTEND - Puerto 3001" cmd /k "npm run dev:frontend"

echo.
echo ==========================================
echo ✅ PROYECTO INICIADO
echo ==========================================
echo.
echo 📝 URLs:
echo    Backend API: http://localhost:3000/api/health
echo    Frontend:    http://localhost:3001
echo.
echo ⚠️  NO CIERRES las dos ventanas que se abrieron
echo.
echo Presiona cualquier tecla para salir...
pause >nul
