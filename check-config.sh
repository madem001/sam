#!/bin/bash

echo "======================================"
echo "🔍 VERIFICACIÓN DE CONFIGURACIÓN"
echo "======================================"
echo ""

echo "📁 Verificando archivo .env del BACKEND:"
if [ -f "src/backend/.env" ]; then
    echo "✅ src/backend/.env EXISTS"
    echo ""
    echo "📄 Contenido:"
    cat src/backend/.env
else
    echo "❌ src/backend/.env NO EXISTE"
    echo ""
    echo "Creando archivo .env del backend..."
    cat > src/backend/.env << 'EOF'
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/edubattle?schema=public"
JWT_SECRET="edubattle-secret-key-2024-change-in-production"
PORT=3000
NODE_ENV=development
CORS_ORIGIN=http://localhost:3001
EOF
    echo "✅ Archivo creado!"
fi

echo ""
echo "======================================"
echo "📁 Verificando archivo .env del ROOT:"
if [ -f ".env" ]; then
    echo "✅ .env EXISTS"
    echo ""
    echo "📄 Contenido:"
    cat .env
else
    echo "❌ .env NO EXISTE"
fi

echo ""
echo "======================================"
echo "🔌 Verificando puertos en uso:"
echo ""

if command -v lsof &> /dev/null; then
    echo "Puerto 3000 (Backend):"
    lsof -i :3000 || echo "  ✅ Puerto 3000 LIBRE"
    echo ""
    echo "Puerto 3001 (Frontend):"
    lsof -i :3001 || echo "  ✅ Puerto 3001 LIBRE"
elif command -v netstat &> /dev/null; then
    echo "Puerto 3000 (Backend):"
    netstat -ano | grep :3000 || echo "  ✅ Puerto 3000 LIBRE"
    echo ""
    echo "Puerto 3001 (Frontend):"
    netstat -ano | grep :3001 || echo "  ✅ Puerto 3001 LIBRE"
else
    echo "⚠️  No se pudo verificar puertos (lsof/netstat no disponibles)"
fi

echo ""
echo "======================================"
echo "✅ VERIFICACIÓN COMPLETA"
echo "======================================"
echo ""
echo "Para levantar el proyecto:"
echo "  npm run dev"
echo ""
echo "O por separado:"
echo "  Terminal 1: cd src/backend && npm run dev"
echo "  Terminal 2: npm run dev:frontend"
echo ""
