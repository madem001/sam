#!/bin/bash

echo "🚀 Configurando EduBattle Arena Backend..."

echo "📦 Instalando dependencias..."
npm install

echo "📝 Copiando archivo de entorno..."
if [ ! -f .env ]; then
    cp .env.example .env
    echo "✅ Archivo .env creado. Por favor, configura tus variables de entorno."
else
    echo "⚠️  El archivo .env ya existe."
fi

echo "🗄️  Generando cliente de Prisma..."
npm run prisma:generate

echo "🔄 Sincronizando esquema con la base de datos..."
npm run prisma:push

echo "✅ Setup completado!"
echo ""
echo "Para iniciar el servidor en modo desarrollo:"
echo "  npm run dev"
echo ""
echo "El servidor estará disponible en http://localhost:3001"
