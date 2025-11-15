# Instrucciones de Inicio - EduBattle Arena

## ⚠️ IMPORTANTE: Reiniciar Servicios

Si ves el error `Failed to resolve import "socket.io-client"`, necesitas:

1. **Detener el servidor de desarrollo** (Ctrl+C)
2. **Volver a iniciar:**

```bash
npm run dev
```

## Inicio Completo del Sistema

### Paso 1: Iniciar Backend

```bash
# Terminal 1
cd backend
npm run dev
```

Espera a ver:
```
🚀 Server running on port 3001
📡 WebSocket ready for connections
```

### Paso 2: Iniciar Frontend

```bash
# Terminal 2 (desde la raíz del proyecto)
npm run dev
```

Espera a ver:
```
  VITE ready in XXX ms
  ➜  Local:   http://localhost:5173/
```

### Paso 3: Abrir en el Navegador

Abre: **http://localhost:5173**

## Verificación Rápida

### 1. Backend funcionando:
```bash
curl http://localhost:3001/api/health
```

Debe responder:
```json
{"status":"ok","message":"EduBattle Arena API is running"}
```

### 2. Frontend cargando:
- Abre http://localhost:5173
- Debes ver la pantalla de Login
- F12 > Console no debe mostrar errores de socket.io-client

## Si sigues teniendo problemas

### Opción 1: Limpiar cache y reinstalar

```bash
# Detener todos los servidores

# Limpiar node_modules y reinstalar
rm -rf node_modules package-lock.json
npm install

# Limpiar cache de Vite
rm -rf dist .vite

# Volver a iniciar
npm run dev
```

### Opción 2: Verificar instalación

```bash
# Verificar que socket.io-client esté instalado
npm list socket.io-client

# Debe mostrar:
# edubattle-arena@0.0.0
# └── socket.io-client@4.8.1
```

### Opción 3: Reinstalar socket.io-client

```bash
npm uninstall socket.io-client
npm install socket.io-client@^4.8.1
npm run dev
```

## Usando Preview (Producción)

Si quieres usar el preview en vez del modo desarrollo:

```bash
# 1. Hacer build
npm run build

# 2. Iniciar preview
npm run preview
```

**NOTA:** El preview usa los archivos compilados en `dist/`, así que si haces cambios necesitas hacer `npm run build` de nuevo.

## Recomendación

Para desarrollo, **siempre usa** `npm run dev` en vez de `npm run preview`.

## Variables de Entorno

Verifica que `.env` tenga:

```env
VITE_API_URL=http://localhost:3001/api
VITE_WS_URL=http://localhost:3001
```

Si cambias las variables de entorno, **debes reiniciar** el servidor de Vite.

## Puertos en Uso

- **Backend:** http://localhost:3001
- **Frontend:** http://localhost:5173

Si algún puerto está ocupado:

```bash
# Ver qué está usando el puerto
lsof -i :3001
lsof -i :5173

# Matar el proceso
kill -9 <PID>
```

## Orden de Inicio Recomendado

1. ✅ Primero: Backend (`cd backend && npm run dev`)
2. ✅ Segundo: Frontend (`npm run dev`)
3. ✅ Tercero: Abrir navegador en http://localhost:5173

## Logs Útiles

### Ver logs del backend:
Terminal donde corriste `cd backend && npm run dev`

### Ver logs del frontend:
Terminal donde corriste `npm run dev` + Consola del navegador (F12)

### Ver base de datos:
```bash
cd backend
npx prisma studio
```

Abre: http://localhost:5555
