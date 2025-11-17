@echo off
chcp 65001 >nul
cls
echo.
echo ╔════════════════════════════════════════════════════════════╗
echo ║     🚀 INICIANDO EDUBATTLE CON BACKEND NESTJS              ║
echo ╚════════════════════════════════════════════════════════════╝
echo.
echo   📦 Frontend: http://localhost:8000
echo   🔥 Backend NestJS: http://localhost:4000
echo.
echo ════════════════════════════════════════════════════════════
echo.

REM Verificar si Node está instalado
where node >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ ERROR: Node.js no está instalado
    echo.
    echo 📥 Instala Node.js desde: https://nodejs.org/
    echo.
    pause
    exit /b 1
)

REM Verificar si npm está instalado
where npm >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ ERROR: npm no está instalado
    pause
    exit /b 1
)

echo [1/3] 🔍 Verificando instalación del backend NestJS...
if not exist "src\backend-nestjs\node_modules" (
    echo.
    echo 📦 Instalando dependencias del backend NestJS...
    cd src\backend-nestjs
    call npm install
    if %errorlevel% neq 0 (
        echo ❌ ERROR: Falló la instalación de dependencias
        pause
        exit /b 1
    )
    cd ..\..
)
echo       ✓ Backend NestJS listo
echo.

echo [2/3] 🔍 Verificando instalación del frontend...
if not exist "node_modules" (
    echo.
    echo 📦 Instalando dependencias del frontend...
    call npm install
    if %errorlevel% neq 0 (
        echo ❌ ERROR: Falló la instalación de dependencias
        pause
        exit /b 1
    )
)
echo       ✓ Frontend listo
echo.

echo [3/3] 🚀 Iniciando servidores...
echo.
echo ════════════════════════════════════════════════════════════
echo.
echo   🔥 Se abrirán 2 ventanas:
echo
echo      1️⃣  BACKEND NESTJS - Puerto 4000
echo      2️⃣  FRONTEND - Puerto 8000
echo.
echo   ⚠️  NO CIERRES ESTAS VENTANAS
echo.
echo ════════════════════════════════════════════════════════════
echo.

timeout /t 3 >nul

REM Iniciar Backend NestJS
start "BACKEND NESTJS - Puerto 4000" cmd /k "cd src\backend-nestjs && npm run dev"

REM Esperar 3 segundos
timeout /t 3 >nul

REM Iniciar Frontend
start "FRONTEND - Puerto 8000" cmd /k "npm run dev:frontend"

echo.
echo ╔════════════════════════════════════════════════════════════╗
echo ║              ✅ SERVIDORES INICIADOS                        ║
echo ╚════════════════════════════════════════════════════════════╝
echo.
echo   📱 Frontend: http://localhost:8000
echo   🔥 Backend NestJS: http://localhost:4000
echo.
echo   💡 Para conectar el frontend con NestJS, edita:
echo      src/frontend/lib/localApi.ts
echo.
echo   🛑 Para detener: Cierra las ventanas del backend y frontend
echo   🧹 Para limpiar puertos: ejecuta KILL-PORTS.bat
echo.
pause
