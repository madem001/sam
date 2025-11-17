# ✅ RESUMEN DE CONFIGURACIÓN - BACKEND LOCAL

Las APIs ya están **HABILITADAS** y el proyecto está listo para funcionar con el backend Node.js local.

---

## 🎯 CAMBIOS REALIZADOS

### 1. ✅ API Cliente Creado

**Archivo:** `src/frontend/lib/localApi.ts`

Este archivo conecta el frontend con tu backend local. Incluye:

- ✅ **authApi** - Login, registro, perfil, estudiantes
- ✅ **battleApi** - Crear, unirse, responder, terminar batallas
- ✅ **websocketApi** - Conexión en tiempo real con Socket.IO
- ✅ **professorCardsApi** - Stubs (pendiente implementar en backend)

### 2. ✅ API Principal Actualizada

**Archivo:** `src/frontend/lib/api.ts`

Ahora simplemente re-exporta las APIs de `localApi.ts`:

```typescript
export { authApi, battleApi, professorCardsApi, websocketApi } from './localApi';
```

Esto significa que **todos tus componentes existentes siguen funcionando sin cambios**.

### 3. ✅ Referencias a Supabase Deshabilitadas

Todos los archivos que importaban Supabase ahora tienen esas líneas comentadas:

```typescript
// import { supabase } from './supabase'; // DESHABILITADO - Ver GUIA_CONEXION_BACKEND.md
```

**Archivos modificados:**
- App.tsx
- 12+ componentes en `src/frontend/components/`
- Archivos de lib

---

## 📊 APIS DISPONIBLES

### 🔐 AUTH API

```typescript
import { authApi } from './lib/api';

// Login
await authApi.login('email@test.com', 'password');

// Registro
await authApi.register('email@test.com', 'password', 'Nombre', 'STUDENT');

// Obtener perfil actual
await authApi.getMe();

// Actualizar perfil
await authApi.updateProfile(userId, { name: 'Nuevo Nombre' });

// Logout
authApi.logout();

// Listar estudiantes
await authApi.getAllStudents();
```

### ⚔️ BATTLE API

```typescript
import { battleApi } from './lib/api';

// Crear batalla
await battleApi.createBattle({
  name: 'Batalla de Matemáticas',
  questions: [...],
  timeLimit: 60,
  maxPlayers: 4
});

// Obtener batallas activas
await battleApi.getActiveBattles();

// Unirse a batalla
await battleApi.joinBattle(battleId);

// Iniciar batalla
await battleApi.startBattle(battleId);

// Enviar respuesta
await battleApi.submitAnswer(battleId, questionId, 'respuesta');

// Terminar batalla
await battleApi.endBattle(battleId);

// Obtener resultados
await battleApi.getBattleResults(battleId);
```

### 🌐 WEBSOCKET API

```typescript
import { websocketApi } from './lib/api';

// Conectar
websocketApi.connect();

// Unirse a batalla
websocketApi.joinBattle(battleId);

// Escuchar eventos
websocketApi.onBattleUpdate((data) => {
  console.log('Actualización:', data);
});

websocketApi.onPlayerJoined((player) => {
  console.log('Jugador unido:', player);
});

websocketApi.onBattleStarted((battle) => {
  console.log('Batalla iniciada:', battle);
});

// Limpiar eventos
websocketApi.offAllBattleEvents();

// Desconectar
websocketApi.disconnect();
```

---

## 🚀 CÓMO EJECUTAR

### Opción 1: Todo junto (Recomendado)

```bash
npm run dev
```

Esto ejecuta:
- Backend en `http://localhost:3001`
- Frontend en `http://localhost:5173`

### Opción 2: Por separado

**Terminal 1 - Backend:**
```bash
cd src/backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
npm run dev:frontend
```

---

## 📋 PASOS ANTES DE EJECUTAR

Si es la primera vez, sigue estos pasos:

### 1. Instalar PostgreSQL

Descarga e instala desde: https://www.postgresql.org/download/

### 2. Crear Base de Datos

```sql
-- Conectarse a PostgreSQL
psql -U postgres

-- Crear base de datos
CREATE DATABASE edubattle;

-- Salir
\q
```

### 3. Configurar Variables de Entorno

**Backend:** `src/backend/.env`
```env
DATABASE_URL="postgresql://postgres:tu_password@localhost:5432/edubattle"
JWT_SECRET="tu-secret-super-seguro"
PORT=3001
CORS_ORIGIN=http://localhost:5173
```

**Frontend:** `.env` (en la raíz)
```env
VITE_API_URL=http://localhost:3001/api
VITE_WS_URL=http://localhost:3001
```

### 4. Instalar Dependencias y Migrar

```bash
# Instalar dependencias del frontend
npm install

# Instalar dependencias del backend
cd src/backend
npm install

# Ejecutar migraciones
npx prisma generate
npx prisma db push

# Volver a la raíz
cd ../..
```

### 5. Ejecutar

```bash
npm run dev
```

---

## 🧪 VERIFICAR QUE FUNCIONA

### 1. Backend responde

```bash
curl http://localhost:3001/api/health
```

Deberías ver:
```json
{"status":"ok","message":"EduBattle Arena API is running"}
```

### 2. Frontend carga

Abre: http://localhost:5173

Deberías ver la pantalla de login.

### 3. Puedes registrarte

- Haz clic en "Registrarse"
- Crea una cuenta
- Si funciona, ¡las APIs están conectadas! ✅

### 4. WebSocket conecta

Abre la consola del navegador (F12) y busca:
```
✅ WebSocket conectado: xxxx-xxxx
```

---

## 📁 ARCHIVOS IMPORTANTES

### Variables de Entorno

```
proyecto/
├── .env                          # ← Frontend (VITE_API_URL, VITE_WS_URL)
└── src/backend/.env              # ← Backend (DATABASE_URL, JWT_SECRET)
```

### Cliente API

```
src/frontend/lib/
├── localApi.ts                   # ← Nueva API completa
├── api.ts                        # ← Re-exports localApi
└── battleApi.ts                  # ← Deshabilitado (usar api.ts)
```

### Backend

```
src/backend/src/
├── server.ts                     # ← Entry point
├── routes/
│   ├── authRoutes.ts            # ← Rutas de autenticación
│   └── battleRoutes.ts          # ← Rutas de batallas
├── controllers/
│   ├── authController.ts        # ← Lógica de auth
│   └── battleController.ts      # ← Lógica de batallas
└── services/
    ├── authService.ts           # ← Servicios de auth
    └── battleService.ts         # ← Servicios de batallas
```

---

## 🔧 ENDPOINTS DISPONIBLES

### Auth

- `POST /api/auth/register` - Registrar usuario
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Obtener perfil (requiere token)
- `PUT /api/auth/profile` - Actualizar perfil (requiere token)
- `GET /api/auth/students` - Listar estudiantes

### Battles

- `POST /api/battles` - Crear batalla (requiere token)
- `GET /api/battles/active` - Batallas activas
- `GET /api/battles/:id` - Obtener batalla por ID
- `POST /api/battles/:id/join` - Unirse a batalla
- `POST /api/battles/:id/start` - Iniciar batalla
- `POST /api/battles/:id/answer` - Enviar respuesta
- `POST /api/battles/:id/end` - Terminar batalla
- `GET /api/battles/:id/results` - Resultados de batalla

### Health

- `GET /api/health` - Status del servidor

---

## 🆘 SOLUCIÓN RÁPIDA DE PROBLEMAS

### ❌ "Cannot find module 'express'"

```bash
cd src/backend
npm install
```

### ❌ "Connection refused" PostgreSQL

1. Verifica que PostgreSQL esté corriendo
2. Revisa `src/backend/.env` → `DATABASE_URL`

### ❌ "JWT_SECRET is not defined"

Agrega `JWT_SECRET` a `src/backend/.env`

### ❌ Frontend no conecta

1. Verifica que backend esté en puerto 3001
2. Revisa `.env` en la raíz → `VITE_API_URL`
3. Recarga el frontend

### ❌ CORS Error

En `src/backend/.env` verifica:
```env
CORS_ORIGIN=http://localhost:5173
```

---

## 📚 DOCUMENTACIÓN ADICIONAL

- **CONFIGURACION_LOCAL.md** - Guía paso a paso detallada
- **GUIA_CONEXION_BACKEND.md** - Cómo agregar nuevas APIs
- **README.md** - Información general del proyecto

---

## ✅ ESTADO ACTUAL

- ✅ APIs habilitadas en el frontend
- ✅ Backend con auth y battles implementado
- ✅ WebSocket configurado
- ✅ Build funciona correctamente
- ✅ Proyecto listo para ejecutar

**Solo falta:**
1. Configurar PostgreSQL en tu máquina
2. Crear archivos `.env`
3. Ejecutar migraciones
4. Correr `npm run dev`

---

## 🎉 ¡TODO LISTO!

Las APIs **ya están habilitadas**. Solo necesitas seguir los pasos en **CONFIGURACION_LOCAL.md** para ejecutar el proyecto completo.
