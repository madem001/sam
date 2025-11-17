@echo off
chcp 65001 >nul
cls
echo.
echo ╔════════════════════════════════════════════════════════════╗
echo ║         EDUBATTLE ARENA - INICIO AUTOMÁTICO                ║
echo ╚════════════════════════════════════════════════════════════╝
echo.

REM ========================================
REM PASO 1: LIMPIAR PROCESOS ANTERIORES
REM ========================================
echo [1/5] 🧹 Limpiando procesos anteriores...
taskkill /F /IM node.exe >nul 2>&1
taskkill /F /IM tsx.exe >nul 2>&1
timeout /t 2 >nul
echo       ✓ Procesos limpiados
echo.

REM ========================================
REM PASO 2: VERIFICAR Y CREAR .ENV DEL BACKEND
REM ========================================
echo [2/5] 📝 Configurando backend...
cd src\backend

if not exist ".env" (
    echo       Creando archivo .env del backend...
    (
        echo DATABASE_URL="postgresql://postgres:postgres@localhost:5432/edubattle?schema=public"
        echo JWT_SECRET="edubattle-secret-key-2024-change-in-production"
        echo PORT=3000
        echo NODE_ENV=development
        echo CORS_ORIGIN=http://localhost:8000
    ) > .env
    echo       ✓ Archivo .env creado con puerto 3000
) else (
    echo       ✓ Archivo .env ya existe
)

cd ..\..
echo.

REM ========================================
REM PASO 3: VERIFICAR .ENV DEL FRONTEND
REM ========================================
echo [3/5] 📝 Verificando configuración del frontend...
if exist ".env" (
    echo       ✓ Archivo .env del frontend existe
) else (
    echo       ⚠ ADVERTENCIA: No existe .env en la raíz
)
echo.

REM ========================================
REM PASO 4: INICIAR BACKEND (Puerto 3000)
REM ========================================
echo [4/5] 🚀 Iniciando BACKEND en puerto 3000...
start "BACKEND - Puerto 3000" cmd /k "cd src\backend && echo. && echo ╔════════════════════════════════════════╗ && echo ║    BACKEND CORRIENDO EN PUERTO 3000    ║ && echo ╚════════════════════════════════════════╝ && echo. && npm run dev"
timeout /t 3 >nul
echo       ✓ Backend iniciado
echo.

REM ========================================
REM PASO 5: INICIAR FRONTEND (Puerto 8000)
REM ========================================
echo [5/5] 🌐 Iniciando FRONTEND en puerto 8000...
start "FRONTEND - Puerto 8000" cmd /k "echo. && echo ╔════════════════════════════════════════╗ && echo ║    FRONTEND CORRIENDO EN PUERTO 8000   ║ && echo ╚════════════════════════════════════════╝ && echo. && npm run dev:frontend"
timeout /t 2 >nul
echo       ✓ Frontend iniciado
echo.

REM ========================================
REM RESUMEN FINAL
REM ========================================
echo.
echo ╔════════════════════════════════════════════════════════════╗
echo ║                    ✅ TODO LISTO                           ║
echo ╚════════════════════════════════════════════════════════════╝
echo.
echo   📡 Backend API:  http://localhost:3000/api
echo   🌐 Frontend:     http://localhost:8000
echo.
echo   ℹ️  Se han abierto 2 ventanas:
echo      • Ventana BACKEND (puerto 3000)
echo      • Ventana FRONTEND (puerto 8000)
echo.
echo   ⚠️  NO CIERRES esas ventanas mientras uses la aplicación
echo.
echo ╔════════════════════════════════════════════════════════════╗
echo ║  Presiona cualquier tecla para cerrar esta ventana         ║
echo ╚════════════════════════════════════════════════════════════╝
pause >nul
