#!/bin/bash

echo "🔍 VERIFICANDO CONFIGURACIÓN DE EDUBATTLE ARENA"
echo "================================================"
echo ""

# Colores
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Verificar Node.js
echo "📦 Verificando Node.js..."
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    echo -e "${GREEN}✓${NC} Node.js instalado: $NODE_VERSION"
else
    echo -e "${RED}✗${NC} Node.js NO encontrado. Instalar desde https://nodejs.org/"
    exit 1
fi

# Verificar npm
echo "📦 Verificando npm..."
if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm --version)
    echo -e "${GREEN}✓${NC} npm instalado: $NPM_VERSION"
else
    echo -e "${RED}✗${NC} npm NO encontrado"
    exit 1
fi

# Verificar PostgreSQL
echo "🗄️  Verificando PostgreSQL..."
if command -v psql &> /dev/null; then
    PSQL_VERSION=$(psql --version | cut -d' ' -f3)
    echo -e "${GREEN}✓${NC} PostgreSQL instalado: $PSQL_VERSION"
else
    echo -e "${YELLOW}⚠${NC} PostgreSQL NO encontrado. Instalar desde https://www.postgresql.org/download/"
fi

echo ""
echo "📁 Verificando archivos..."

# Verificar .env del backend
if [ -f "src/backend/.env" ]; then
    echo -e "${GREEN}✓${NC} src/backend/.env existe"

    # Verificar variables importantes
    if grep -q "DATABASE_URL" src/backend/.env; then
        echo -e "  ${GREEN}✓${NC} DATABASE_URL configurada"
    else
        echo -e "  ${RED}✗${NC} DATABASE_URL falta"
    fi

    if grep -q "JWT_SECRET" src/backend/.env; then
        echo -e "  ${GREEN}✓${NC} JWT_SECRET configurada"
    else
        echo -e "  ${RED}✗${NC} JWT_SECRET falta"
    fi
else
    echo -e "${RED}✗${NC} src/backend/.env NO existe"
    echo "  → Copiar: cp src/backend/.env.example src/backend/.env"
fi

# Verificar .env del frontend
if [ -f ".env" ]; then
    echo -e "${GREEN}✓${NC} .env (frontend) existe"

    if grep -q "VITE_API_URL" .env; then
        echo -e "  ${GREEN}✓${NC} VITE_API_URL configurada"
    else
        echo -e "  ${RED}✗${NC} VITE_API_URL falta"
    fi
else
    echo -e "${RED}✗${NC} .env (frontend) NO existe"
    echo "  → Copiar: cp .env.example .env"
fi

echo ""
echo "📦 Verificando dependencias..."

# node_modules raíz
if [ -d "node_modules" ]; then
    echo -e "${GREEN}✓${NC} node_modules (frontend) instalados"
else
    echo -e "${RED}✗${NC} node_modules (frontend) NO instalados"
    echo "  → Ejecutar: npm install"
fi

# node_modules backend
if [ -d "src/backend/node_modules" ]; then
    echo -e "${GREEN}✓${NC} node_modules (backend) instalados"
else
    echo -e "${RED}✗${NC} node_modules (backend) NO instalados"
    echo "  → Ejecutar: cd src/backend && npm install"
fi

# Verificar Prisma Client
if [ -d "src/backend/node_modules/.prisma" ]; then
    echo -e "${GREEN}✓${NC} Prisma Client generado"
else
    echo -e "${RED}✗${NC} Prisma Client NO generado"
    echo "  → Ejecutar: cd src/backend && npx prisma generate"
fi

echo ""
echo "🌐 Verificando puertos..."

# Verificar si puerto 3001 está ocupado
if lsof -Pi :3001 -sTCP:LISTEN -t >/dev/null 2>&1 ; then
    echo -e "${YELLOW}⚠${NC} Puerto 3001 está ocupado (backend podría estar corriendo)"
else
    echo -e "${GREEN}✓${NC} Puerto 3001 disponible"
fi

# Verificar si puerto 5173 está ocupado
if lsof -Pi :5173 -sTCP:LISTEN -t >/dev/null 2>&1 ; then
    echo -e "${YELLOW}⚠${NC} Puerto 5173 está ocupado (frontend podría estar corriendo)"
else
    echo -e "${GREEN}✓${NC} Puerto 5173 disponible"
fi

echo ""
echo "📊 Verificando conexión al backend..."

# Verificar si el backend responde
if curl -s http://localhost:3001/api/health > /dev/null 2>&1; then
    echo -e "${GREEN}✓${NC} Backend responde en http://localhost:3001"
    RESPONSE=$(curl -s http://localhost:3001/api/health)
    echo "  Respuesta: $RESPONSE"
else
    echo -e "${YELLOW}⚠${NC} Backend NO responde (no está ejecutándose)"
    echo "  → Ejecutar: npm run dev"
fi

echo ""
echo "================================================"
echo "📋 RESUMEN"
echo "================================================"

if [ -f "src/backend/.env" ] && [ -f ".env" ] && [ -d "node_modules" ] && [ -d "src/backend/node_modules" ]; then
    echo -e "${GREEN}✓ Configuración básica completa${NC}"
    echo ""
    echo "🚀 Para ejecutar el proyecto:"
    echo "   npm run dev"
    echo ""
    echo "📚 Ver guías detalladas:"
    echo "   - CONFIGURACION_LOCAL.md"
    echo "   - RESUMEN_CONFIGURACION.md"
else
    echo -e "${YELLOW}⚠ Configuración incompleta${NC}"
    echo ""
    echo "📝 Pasos faltantes:"

    if [ ! -f "src/backend/.env" ]; then
        echo "   1. cp src/backend/.env.example src/backend/.env"
    fi

    if [ ! -f ".env" ]; then
        echo "   2. cp .env.example .env"
    fi

    if [ ! -d "node_modules" ]; then
        echo "   3. npm install"
    fi

    if [ ! -d "src/backend/node_modules" ]; then
        echo "   4. cd src/backend && npm install"
    fi

    echo ""
    echo "📚 Consultar: CONFIGURACION_LOCAL.md"
fi

echo ""
