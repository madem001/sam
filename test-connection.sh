#!/bin/bash
echo "🔍 VERIFICANDO CONEXIÓN AL BACKEND..."
echo ""
echo "Backend debería estar en: http://localhost:3000"
echo ""

if curl -s http://localhost:3000/api/health > /dev/null 2>&1; then
    echo "✅ Backend FUNCIONANDO correctamente"
    curl -s http://localhost:3000/api/health | jq '.' 2>/dev/null || curl -s http://localhost:3000/api/health
else
    echo "❌ Backend NO está respondiendo en puerto 3000"
    echo ""
    echo "Posibles causas:"
    echo "1. El backend no se inició"
    echo "2. El backend está corriendo en otro puerto"
    echo "3. Hay un error en el código del backend"
    echo ""
    echo "💡 Solución: Abre la ventana del BACKEND y verifica si hay errores"
fi
