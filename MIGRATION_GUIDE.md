# 🔄 Guía de Migración: De Supabase a PostgreSQL Local

Esta guía explica cómo migrar completamente de Supabase a PostgreSQL local con Prisma.

---

## ❌ Lo Que SE ELIMINÓ

### 1. **Dependencia de Supabase**
```json
// package.json - ANTES
"dependencies": {
  "@supabase/supabase-js": "^2.81.1",  // ❌ ELIMINADO
  ...
}

// package.json - AHORA
"dependencies": {
  "axios": "^1.6.0",  // ✅ HTTP client simple (opcional)
  ...
}
```

### 2. **Cliente de Supabase**
```
❌ ELIMINADO: lib/supabase.ts
✅ REEMPLAZADO POR: lib/httpClient.ts
```

### 3. **Variables de Entorno de Supabase**
```env
# .env - ANTES (ELIMINADO)
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJxxx...

# .env - AHORA
VITE_API_URL=http://localhost:3001/api
VITE_WS_URL=http://localhost:3001
```

---

## ✅ Lo Que SE AGREGÓ

### 1. **HTTP Client** (`lib/httpClient.ts`)

Cliente HTTP simple para comunicarse con el backend:

```typescript
import { httpClient } from './lib/httpClient';

// GET
const battles = await httpClient.get('/battles');

// POST
const battle = await httpClient.post('/battles', {
  name: 'Mi Batalla',
  questions: [...]
});

// Con autenticación automática
// El token se agrega automáticamente si existe
```

### 2. **Backend Completo con Prisma**

```
backend/
├── prisma/
│   └── schema.prisma         # 15 modelos de BD
├── src/
│   ├── config/
│   │   └── database.ts       # Prisma client
│   ├── controllers/          # Lógica de negocio
│   ├── services/             # Servicios
│   ├── middleware/
│   │   └── auth.ts           # JWT authentication
│   ├── routes/               # Rutas de API
│   └── server.ts             # Express server
└── .env                      # DATABASE_URL, JWT_SECRET
```

### 3. **Documentación Completa**

- `ARCHITECTURE_WITHOUT_SUPABASE.md` - Arquitectura nueva
- `SETUP_LOCAL_DATABASE.md` - Setup de PostgreSQL
- `backend/README.md` - Documentación del backend
- `backend/QUICK_START.md` - Inicio rápido

---

## 🔄 Cambios en el Código

### Antes (con Supabase):

```typescript
// lib/api.ts - ANTES
import { supabase } from './supabase';

export const createBattle = async (data) => {
  const { data: battle, error } = await supabase
    .from('battles')
    .insert(data)
    .select()
    .single();

  if (error) throw error;
  return battle;
};
```

### Ahora (sin Supabase):

```typescript
// lib/api.ts - AHORA
import { httpClient } from './httpClient';

export const createBattle = async (data) => {
  const battle = await httpClient.post('/battles', data);
  return battle;
};
```

---

## 🛠️ Pasos para Completar la Migración

### Paso 1: Actualizar Dependencias

```bash
# Eliminar Supabase
npm uninstall @supabase/supabase-js

# Instalar nuevas dependencias (opcional, fetch nativo también funciona)
npm install axios  # O usa fetch nativo
```

### Paso 2: Actualizar Variables de Entorno

```bash
# Editar .env
VITE_API_URL=http://localhost:3001/api
VITE_WS_URL=http://localhost:3001
```

### Paso 3: Reemplazar Imports

**Buscar y reemplazar** en todos los archivos:

```typescript
// Reemplazar esto:
import { supabase } from './lib/supabase';

// Por esto:
import { httpClient } from './lib/httpClient';
```

### Paso 4: Actualizar Llamadas de API

#### Login
```typescript
// ANTES
const { data, error } = await supabase.auth.signInWithPassword({
  email,
  password
});

// AHORA
const { user, token } = await httpClient.post('/auth/login', {
  email,
  password
});
setAuthToken(token);
```

#### Crear Batalla
```typescript
// ANTES
const { data: battle } = await supabase
  .from('battles')
  .insert({ name, teacher_id, ... })
  .select()
  .single();

// AHORA
const battle = await httpClient.post('/battles', {
  name,
  questionCount,
  groupCount,
  questions
});
```

#### Obtener Datos
```typescript
// ANTES
const { data: battles } = await supabase
  .from('battles')
  .select('*')
  .eq('teacher_id', teacherId);

// AHORA
const battles = await httpClient.get(`/battles/teacher`);
```

#### Realtime (Suscripciones)
```typescript
// ANTES
const channel = supabase
  .channel('battles')
  .on('postgres_changes', { ... }, callback)
  .subscribe();

// AHORA
import io from 'socket.io-client';

const socket = io(import.meta.env.VITE_WS_URL);
socket.on('battle-update', callback);
```

### Paso 5: Configurar Backend

```bash
cd backend

# Instalar dependencias
npm install

# Configurar .env
cp .env.example .env
# Editar DATABASE_URL, JWT_SECRET, etc.

# Generar Prisma client
npx prisma generate

# Crear tablas en la BD
npx prisma db push

# Iniciar servidor
npm run dev
```

### Paso 6: Probar

```bash
# 1. Iniciar backend
cd backend && npm run dev

# 2. En otra terminal, iniciar frontend
npm run dev

# 3. Probar login y funcionalidades
```

---

## 📊 Tabla de Equivalencias

| Supabase | Backend + Prisma |
|----------|------------------|
| `supabase.auth.signUp()` | `POST /api/auth/register` |
| `supabase.auth.signInWithPassword()` | `POST /api/auth/login` |
| `supabase.auth.signOut()` | `clearAuthToken()` |
| `supabase.from('table').select()` | `GET /api/endpoint` |
| `supabase.from('table').insert()` | `POST /api/endpoint` |
| `supabase.from('table').update()` | `PATCH /api/endpoint/:id` |
| `supabase.from('table').delete()` | `DELETE /api/endpoint/:id` |
| `supabase.channel().subscribe()` | `socket.on('event', ...)` |

---

## 🔐 Autenticación

### Supabase (Antes):
```typescript
const { data } = await supabase.auth.signInWithPassword({
  email,
  password
});

// Token automático en requests
```

### JWT Backend (Ahora):
```typescript
const { user, token } = await httpClient.post('/auth/login', {
  email,
  password
});

// Guardar token
setAuthToken(token);

// Todas las requests siguientes incluyen automáticamente:
// Authorization: Bearer <token>
```

---

## 🗄️ Base de Datos

### Supabase (Antes):
- PostgreSQL en la nube
- Dashboard web de Supabase
- SQL Editor online
- Limitaciones del plan gratuito

### PostgreSQL Local (Ahora):
- PostgreSQL en tu máquina
- Prisma Studio: `npx prisma studio`
- psql CLI: `psql -U postgres -d edubattle_arena`
- Sin limitaciones

---

## 🐛 Troubleshooting

### Error: "Cannot connect to backend"

**Problema**: Frontend no puede conectarse al backend

**Solución**:
```bash
# 1. Verificar que el backend esté corriendo
cd backend && npm run dev

# 2. Verificar .env del frontend
VITE_API_URL=http://localhost:3001/api

# 3. Verificar CORS en backend
CORS_ORIGIN=http://localhost:5173
```

### Error: "401 Unauthorized"

**Problema**: Token no válido o expirado

**Solución**:
```typescript
// Limpiar token y hacer login nuevamente
clearAuthToken();
localStorage.removeItem('user');
navigate('/login');
```

### Error: "Cannot find module '@supabase/supabase-js'"

**Problema**: Código aún referencia Supabase

**Solución**:
```bash
# Buscar referencias
grep -r "@supabase/supabase-js" src/

# Reemplazar por httpClient
```

---

## ✅ Checklist de Migración

- [ ] ❌ Desinstalar `@supabase/supabase-js`
- [ ] ❌ Eliminar `lib/supabase.ts`
- [ ] ✅ Crear `lib/httpClient.ts`
- [ ] ✅ Actualizar `.env` con `VITE_API_URL`
- [ ] ✅ Backend configurado y corriendo
- [ ] ✅ PostgreSQL local instalado
- [ ] ✅ Prisma client generado
- [ ] ✅ Tablas creadas (`npx prisma db push`)
- [ ] Actualizar todos los `import { supabase }`
- [ ] Actualizar todas las llamadas a Supabase
- [ ] Probar login
- [ ] Probar crear batalla
- [ ] Probar unirse a batalla
- [ ] Probar sistema de puntos

---

## 📚 Recursos

- **Documentación Principal**: `ARCHITECTURE_WITHOUT_SUPABASE.md`
- **Setup Backend**: `backend/README.md`
- **Inicio Rápido**: `backend/QUICK_START.md`
- **Prisma Docs**: https://www.prisma.io/docs
- **Express Docs**: https://expressjs.com/

---

¡Con esto tienes control total de tu aplicación sin dependencias externas! 🚀
