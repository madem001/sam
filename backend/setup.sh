#!/bin/bash

echo "🚀 Configurando EduBattle Arena Backend..."
echo ""

# Verificar si Node.js está instalado
if ! command -v node &> /dev/null; then
    echo "❌ Error: Node.js no está instalado."
    echo "Instala Node.js desde https://nodejs.org/"
    exit 1
fi

echo "✅ Node.js detectado: $(node -v)"

# Verificar si PostgreSQL está instalado
if ! command -v psql &> /dev/null; then
    echo "⚠️  PostgreSQL no está instalado o no está en el PATH."
    echo "Instala PostgreSQL desde https://www.postgresql.org/download/"
else
    echo "✅ PostgreSQL detectado"
fi

echo ""
echo "📦 Instalando dependencias..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ Error instalando dependencias"
    exit 1
fi

echo ""
echo "📝 Configurando archivo de entorno..."
if [ ! -f .env ]; then
    cp .env.example .env
    echo "✅ Archivo .env creado"
    echo ""
    echo "⚠️  IMPORTANTE: Edita el archivo .env con tus credenciales:"
    echo "   - DATABASE_URL: Tu cadena de conexión a PostgreSQL"
    echo "   - JWT_SECRET: Una clave secreta aleatoria"
    echo ""
    read -p "¿Has configurado el archivo .env? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Por favor, configura el archivo .env antes de continuar"
        exit 1
    fi
else
    echo "✅ El archivo .env ya existe"
fi

echo ""
echo "🗄️  Generando cliente de Prisma..."
npx prisma generate

if [ $? -ne 0 ]; then
    echo "❌ Error generando cliente de Prisma"
    exit 1
fi

echo ""
echo "🔄 Verificando conexión a la base de datos..."
echo "   Asegúrate de que PostgreSQL esté corriendo y la BD exista"
echo ""

echo "🔄 Sincronizando esquema con la base de datos..."
npx prisma db push

if [ $? -ne 0 ]; then
    echo "❌ Error sincronizando con la base de datos"
    echo ""
    echo "Verifica que:"
    echo "  1. PostgreSQL esté corriendo"
    echo "  2. La base de datos 'edubattle_arena' exista"
    echo "  3. Las credenciales en DATABASE_URL sean correctas"
    echo ""
    echo "Para crear la base de datos, ejecuta:"
    echo "  psql -U postgres -c \"CREATE DATABASE edubattle_arena;\""
    exit 1
fi

echo ""
echo "✅ ¡Setup completado exitosamente!"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Para iniciar el servidor en modo desarrollo:"
echo "  cd backend"
echo "  npm run dev"
echo ""
echo "Para ver los datos en una interfaz visual:"
echo "  npx prisma studio"
echo ""
echo "El servidor estará disponible en:"
echo "  http://localhost:3001"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
