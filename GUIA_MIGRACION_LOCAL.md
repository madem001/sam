# 🔧 GUÍA DE MIGRACIÓN A SETUP 100% LOCAL

Esta guía te ayudará a migrar completamente de Supabase a un setup local con PostgreSQL + Backend Node.js

---

## ⚠️ ADVERTENCIA IMPORTANTE

Esta migración requiere:
- **Reescribir ~40 archivos de componentes** del frontend
- **Implementar ~20 endpoints** en el backend
- **Configurar PostgreSQL** localmente
- **Tiempo estimado: 8-12 horas** de trabajo

---

## 📋 PASOS NECESARIOS

### 1. Instalar PostgreSQL Localmente

#### macOS (con Homebrew):
```bash
brew install postgresql@14
brew services start postgresql@14
```

#### Linux (Ubuntu/Debian):
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

#### Windows:
Descargar e instalar desde: https://www.postgresql.org/download/windows/

### 2. Crear Base de Datos

```bash
# Conectar a PostgreSQL
psql -U postgres

# En el prompt de PostgreSQL:
CREATE DATABASE edubattle;
CREATE USER edubattle_user WITH PASSWORD 'tu_password_segura';
GRANT ALL PRIVILEGES ON DATABASE edubattle TO edubattle_user;
\q
```

### 3. Configurar Backend

```bash
# Ir a la carpeta del backend
cd src/backend

# Instalar dependencias
npm install

# Configurar .env (ya está creado con valores por defecto)
# Editar si es necesario:
nano .env

# Generar cliente de Prisma
npm run prisma:generate

# Aplicar migraciones (crear tablas)
npm run prisma:push

# Iniciar backend
npm run dev
```

El backend estará disponible en `http://localhost:3001`

### 4. Actualizar Frontend para Usar API Local

Necesitas reemplazar TODAS las llamadas a Supabase por llamadas al API REST local.

#### Archivos que DEBES modificar:

**Crear nuevo cliente API (`src/frontend/lib/localApi.ts`)**:
```typescript
import axios from 'axios';

const API_URL = 'http://localhost:3001/api';

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor para agregar token JWT
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// API de autenticación
export const authApi = {
  login: async (email: string, password: string) => {
    const { data } = await api.post('/auth/login', { email, password });
    localStorage.setItem('token', data.token);
    return data;
  },

  register: async (email: string, password: string, name: string, role: string) => {
    const { data } = await api.post('/auth/register', { email, password, name, role });
    return data;
  },

  getMe: async () => {
    const { data } = await api.get('/auth/me');
    return data;
  },

  logout: () => {
    localStorage.removeItem('token');
  }
};

// API de batallas
export const battleApi = {
  create: async (battleData: any) => {
    const { data } = await api.post('/battles', battleData);
    return data;
  },

  getById: async (id: string) => {
    const { data } = await api.get(`/battles/${id}`);
    return data;
  },

  // ... más endpoints
};

// API de All for All
export const allForAllApi = {
  create: async (gameData: any) => {
    const { data } = await api.post('/all-for-all', gameData);
    return data;
  },

  // ... más endpoints
};
```

#### Reemplazar en TODOS los componentes:

**ANTES (con Supabase):**
```typescript
import { supabase } from '../../lib/supabase';

const { data } = await supabase
  .from('battles')
  .select('*')
  .eq('teacher_id', teacherId);
```

**DESPUÉS (con API local):**
```typescript
import { battleApi } from '../../lib/localApi';

const data = await battleApi.getByTeacher(teacherId);
```

### 5. Implementar Endpoints del Backend

En `src/backend/src/` necesitas implementar:

#### Rutas de Autenticación (`routes/authRoutes.ts`):
- ✅ Ya implementado: `POST /api/auth/register`
- ✅ Ya implementado: `POST /api/auth/login`
- ✅ Ya implementado: `GET /api/auth/me`
- ⚠️ Falta: `PATCH /api/auth/profile`
- ⚠️ Falta: `GET /api/auth/students`

#### Rutas de Batallas (`routes/battleRoutes.ts`):
- ✅ Ya implementado: `POST /api/battles`
- ✅ Ya implementado: `GET /api/battles/:id`
- ⚠️ Falta: `GET /api/battles/teacher`
- ⚠️ Falta: `GET /api/battles/:id/groups`
- ⚠️ Falta: `GET /api/battles/:id/questions`
- ⚠️ Falta: `POST /api/battles/join`
- ⚠️ Falta: `POST /api/battles/answer`
- ⚠️ Falta: `POST /api/battles/:id/start`
- ⚠️ Falta: `POST /api/battles/:id/next`

#### Rutas de All for All (NUEVO - `routes/allForAllRoutes.ts`):
- ⚠️ Crear: `POST /api/all-for-all`
- ⚠️ Crear: `GET /api/all-for-all/active`
- ⚠️ Crear: `POST /api/all-for-all/:id/response`
- ⚠️ Crear: `POST /api/all-for-all/:id/end`
- ⚠️ Crear: `GET /api/all-for-all/:id/responses`

#### Rutas de Profesor Cards (NUEVO - `routes/professorCardRoutes.ts`):
- ⚠️ Crear: `GET /api/professor-cards`
- ⚠️ Crear: `GET /api/professor-cards/student/:studentId`
- ⚠️ Crear: `POST /api/professor-cards/assign`

#### Rutas de Achievements (NUEVO - `routes/achievementRoutes.ts`):
- ⚠️ Crear: `GET /api/achievements`
- ⚠️ Crear: `GET /api/achievements/user/:userId`
- ⚠️ Crear: `POST /api/achievements/unlock`

#### Rutas de Question Sets (NUEVO - `routes/questionSetRoutes.ts`):
- ⚠️ Crear: `POST /api/question-sets`
- ⚠️ Crear: `GET /api/question-sets/teacher/:teacherId`
- ⚠️ Crear: `GET /api/question-sets/:id`
- ⚠️ Crear: `PUT /api/question-sets/:id`
- ⚠️ Crear: `DELETE /api/question-sets/:id`

### 6. Configurar WebSocket para Realtime

En `src/backend/src/websocket/index.ts` necesitas:

```typescript
import { Server } from 'socket.io';

export function setupWebSocket(httpServer: any) {
  const io = new Server(httpServer, {
    cors: {
      origin: process.env.CORS_ORIGIN,
      methods: ['GET', 'POST']
    }
  });

  io.on('connection', (socket) => {
    console.log('Cliente conectado:', socket.id);

    // Unirse a sala de batalla
    socket.on('join-battle', (battleId) => {
      socket.join(`battle-${battleId}`);
    });

    // Salir de sala de batalla
    socket.on('leave-battle', (battleId) => {
      socket.leave(`battle-${battleId}`);
    });

    // Unirse a juego All for All
    socket.on('join-all-for-all', (gameId) => {
      socket.join(`all-for-all-${gameId}`);
    });

    socket.on('disconnect', () => {
      console.log('Cliente desconectado:', socket.id);
    });
  });

  return io;
}

// Emitir actualizaciones desde servicios:
export function emitBattleUpdate(io: any, battleId: string, data: any) {
  io.to(`battle-${battleId}`).emit('battle-update', data);
}

export function emitAllForAllUpdate(io: any, gameId: string, data: any) {
  io.to(`all-for-all-${gameId}`).emit('game-update', data);
}
```

### 7. Archivos que DEBES Eliminar

```bash
# Eliminar referencias a Supabase
rm src/frontend/lib/supabase.ts

# Eliminar archivo de variables de entorno antiguo
rm .env
```

### 8. Crear Nuevo .env en la Raíz

```env
VITE_API_URL=http://localhost:3001/api
VITE_WS_URL=http://localhost:3001
```

### 9. Componentes a Reescribir

**Todos estos componentes usan Supabase y deben reescribirse:**

1. `src/frontend/components/student/AllForAllScreen.tsx`
2. `src/frontend/components/student/JoinBattleScreen.tsx`
3. `src/frontend/components/student/StudentBattleScreen.tsx`
4. `src/frontend/components/student/AchievementsScreen.tsx`
5. `src/frontend/components/student/ProfileScreen.tsx`
6. `src/frontend/components/teacher/AllForAllControlScreen.tsx`
7. `src/frontend/components/teacher/BattleControlScreen.tsx`
8. `src/frontend/components/teacher/BattleManagerScreen.tsx`
9. `src/frontend/components/teacher/DashboardScreen.tsx`
10. `src/frontend/components/teacher/StudentListScreen.tsx`
11. `src/frontend/components/teacher/QuestionBankScreen.tsx`
12. `src/frontend/components/teacher/RewardsManagementScreen.tsx`
13. `src/frontend/components/teacher/TeacherProfileScreen.tsx`
14. `src/frontend/components/teacher/TeacherDashboard.tsx`
15. `App.tsx`

**Y todos los archivos en `src/frontend/lib/`:**
- `battleApi.ts` - Reescribir completamente
- `api.ts` - Reescribir completamente
- `achievementsService.ts` - Reescribir completamente

---

## 🎯 ALTERNATIVA RECOMENDADA

Si no quieres hacer esta migración masiva manual, considera:

1. **Usar Supabase de forma gratuita** - Es gratuito hasta 500MB de base de datos y 2GB de ancho de banda
2. **Hacer la migración gradualmente** - Migrar un módulo a la vez
3. **Contratar un desarrollador** - Esta es una tarea de 8-12 horas que requiere experiencia

---

## 📝 RESUMEN DE TRABAJO PENDIENTE

- [ ] Instalar y configurar PostgreSQL
- [ ] Crear base de datos y usuario
- [ ] Aplicar migraciones de Prisma
- [ ] Implementar ~15 endpoints faltantes en el backend
- [ ] Crear cliente API REST para el frontend
- [ ] Reescribir ~40 archivos de componentes
- [ ] Configurar WebSocket para realtime
- [ ] Probar todo el sistema end-to-end
- [ ] Eliminar dependencias de Supabase
- [ ] Actualizar documentación

**Tiempo estimado total: 8-12 horas de trabajo**

---

## ✅ LO QUE YA ESTÁ HECHO

- ✅ Schema de Prisma completo
- ✅ Estructura de backend lista
- ✅ Autenticación básica (login/register)
- ✅ Batallas básicas (crear/obtener)
- ✅ WebSocket configurado
- ✅ Variables de entorno configuradas
- ✅ package.json actualizado

---

## 📞 SOPORTE

Si decides hacer esta migración y necesitas ayuda con algún paso específico, por favor hazlo paso por paso y solicita ayuda cuando la necesites.
