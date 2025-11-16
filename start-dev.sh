#!/bin/bash

echo "🚀 Iniciando EduBattle Arena - Modo Desarrollo Local"
echo ""

# Colores para output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Verificar si PostgreSQL está corriendo
echo -e "${BLUE}📊 Verificando PostgreSQL...${NC}"
if ! pg_isready -h localhost -p 5432 > /dev/null 2>&1; then
    echo -e "${YELLOW}⚠️  PostgreSQL no está corriendo en localhost:5432${NC}"
    echo "   Por favor inicia PostgreSQL primero"
    echo "   Ejemplo: pg_ctl -D /usr/local/var/postgres start"
    exit 1
fi
echo -e "${GREEN}✓ PostgreSQL está corriendo${NC}"
echo ""

# Configurar backend
echo -e "${BLUE}🔧 Configurando Backend...${NC}"
cd backend

if [ ! -f ".env" ]; then
    echo -e "${YELLOW}⚠️  Creando archivo .env desde .env.example${NC}"
    cp .env.example .env
fi

if [ ! -d "node_modules" ]; then
    echo -e "${BLUE}📦 Instalando dependencias del backend...${NC}"
    npm install
fi

echo -e "${BLUE}🗄️  Ejecutando migraciones de Prisma...${NC}"
npx prisma generate
npx prisma db push

echo -e "${GREEN}✓ Backend configurado${NC}"
cd ..
echo ""

# Configurar frontend
echo -e "${BLUE}🎨 Configurando Frontend...${NC}"
if [ ! -d "node_modules" ]; then
    echo -e "${BLUE}📦 Instalando dependencias del frontend...${NC}"
    npm install
fi
echo -e "${GREEN}✓ Frontend configurado${NC}"
echo ""

# Iniciar servicios
echo -e "${GREEN}🎯 Iniciando servicios...${NC}"
echo ""
echo -e "${BLUE}Backend:${NC}  http://localhost:3001"
echo -e "${BLUE}Frontend:${NC} http://localhost:5173"
echo ""
echo "Presiona Ctrl+C para detener ambos servicios"
echo ""

# Iniciar backend en segundo plano
cd backend
npm run dev &
BACKEND_PID=$!
cd ..

# Esperar 3 segundos para que el backend inicie
sleep 3

# Iniciar frontend
npm run dev &
FRONTEND_PID=$!

# Función para limpiar procesos al salir
cleanup() {
    echo ""
    echo -e "${YELLOW}🛑 Deteniendo servicios...${NC}"
    kill $BACKEND_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    echo -e "${GREEN}✓ Servicios detenidos${NC}"
    exit 0
}

# Capturar Ctrl+C
trap cleanup SIGINT SIGTERM

# Mantener el script corriendo
wait
