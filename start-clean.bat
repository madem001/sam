@echo off
echo ======================================
echo 🧹 LIMPIANDO PROCESOS ANTERIORES
echo ======================================
echo.

echo Matando todos los procesos de Node.js...
taskkill /IM node.exe /F 2>nul
if %errorlevel% equ 0 (
    echo ✅ Procesos de Node.js eliminados
) else (
    echo ℹ️  No habia procesos de Node.js corriendo
)

echo.
echo ======================================
echo 🔍 VERIFICANDO CONFIGURACIÓN
echo ======================================
echo.

echo Verificando archivo .env del backend...
if exist "src\backend\.env" (
    echo ✅ src\backend\.env existe
) else (
    echo ❌ src\backend\.env NO existe
    echo.
    echo Creando archivo .env del backend...
    (
        echo DATABASE_URL="postgresql://postgres:postgres@localhost:5432/edubattle?schema=public"
        echo JWT_SECRET="edubattle-secret-key-2024-change-in-production"
        echo PORT=3000
        echo NODE_ENV=development
        echo CORS_ORIGIN=http://localhost:3001
    ) > src\backend\.env
    echo ✅ Archivo creado!
)

echo.
echo ======================================
echo 🚀 INICIANDO SERVICIOS
echo ======================================
echo.
echo Backend: http://localhost:3000
echo Frontend: http://localhost:3001
echo.
echo Presiona Ctrl+C para detener
echo.

npm run dev
