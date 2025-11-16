# 📘 Guía Completa de Setup - EduBattle Arena

**Documentación completa desde cero para conectar Frontend con Backend**

Esta guía te llevará paso a paso desde cero hasta tener el proyecto funcionando al 100%.

---

# 📋 Tabla de Contenidos

1. [Requisitos Previos](#1-requisitos-previos)
2. [Setup de la Base de Datos](#2-setup-de-la-base-de-datos)
3. [Configuración del Backend](#3-configuración-del-backend)
4. [Configuración del Frontend](#4-configuración-del-frontend)
5. [Conexión Frontend-Backend](#5-conexión-frontend-backend)
6. [API Endpoints Completos](#6-api-endpoints-completos)
7. [WebSocket en Tiempo Real](#7-websocket-en-tiempo-real)
8. [Ejemplos Prácticos](#8-ejemplos-prácticos)
9. [Troubleshooting](#9-troubleshooting)

---

# 1. Requisitos Previos

## Software Necesario

```bash
# Node.js (v18 o superior)
node --version  # Debe mostrar v18.x.x o superior

# PostgreSQL (v14 o superior)
psql --version  # Debe mostrar 14.x o superior

# npm (viene con Node.js)
npm --version   # Debe mostrar 9.x.x o superior
```

## Instalación de PostgreSQL

### En Ubuntu/Debian:

```bash
# Actualizar paquetes
sudo apt update

# Instalar PostgreSQL
sudo apt install postgresql postgresql-contrib

# Iniciar servicio
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Verificar que esté corriendo
sudo systemctl status postgresql
```

### En macOS:

```bash
# Usando Homebrew
brew install postgresql@14

# Iniciar servicio
brew services start postgresql@14
```

### En Windows:

1. Descargar desde: https://www.postgresql.org/download/windows/
2. Ejecutar instalador
3. Seguir wizard (recordar la contraseña del usuario postgres)

---

# 2. Setup de la Base de Datos

## Paso 1: Crear la Base de Datos

```bash
# Conectarse a PostgreSQL como superusuario
sudo -u postgres psql

# O en Windows/Mac:
psql -U postgres
```

Dentro de psql:

```sql
-- Crear la base de datos
CREATE DATABASE edubattle_arena;

-- Crear usuario (opcional, puedes usar postgres)
CREATE USER edubattle_user WITH ENCRYPTED PASSWORD 'tu_password_segura';

-- Dar permisos
GRANT ALL PRIVILEGES ON DATABASE edubattle_arena TO edubattle_user;

-- Salir
\q
```

## Paso 2: Verificar la Conexión

```bash
# Conectarse a la BD
psql -U postgres -d edubattle_arena

# O con tu usuario:
psql -U edubattle_user -d edubattle_arena -W
```

Si conecta exitosamente, ¡listo! 🎉

---

# 3. Configuración del Backend

## Paso 1: Instalar Dependencias

```bash
cd backend

# Instalar todas las dependencias
npm install
```

Esto instalará:
- Express (servidor web)
- Prisma (ORM)
- Socket.io (WebSockets)
- JWT (autenticación)
- bcryptjs (encriptación)
- Y más...

## Paso 2: Configurar Variables de Entorno

```bash
# Copiar archivo ejemplo
cp .env.example .env

# Editar .env
nano .env  # O usa tu editor favorito
```

Contenido del archivo `.env`:

```env
# Base de Datos
DATABASE_URL="postgresql://postgres:tu_password@localhost:5432/edubattle_arena"

# Autenticación JWT
JWT_SECRET="tu-clave-super-secreta-de-minimo-32-caracteres-aqui"
JWT_EXPIRES_IN="7d"

# Servidor
PORT=3001
NODE_ENV="development"

# CORS (para desarrollo)
CORS_ORIGIN="http://localhost:5173"
```

**⚠️ IMPORTANTE**:
- Cambia `tu_password` por tu contraseña de PostgreSQL
- Cambia `JWT_SECRET` por una clave segura aleatoria

### Generar JWT_SECRET Seguro:

```bash
# En Linux/Mac:
openssl rand -base64 32

# O en Node.js:
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

## Paso 3: Generar Cliente de Prisma

```bash
# Esto genera el cliente TypeScript de Prisma
npx prisma generate
```

Verás:

```
✔ Generated Prisma Client to ./node_modules/@prisma/client
```

## Paso 4: Crear las Tablas en la BD

```bash
# Sincronizar schema con la base de datos
npx prisma db push
```

Verás:

```
🚀  Your database is now in sync with your Prisma schema.
```

### Verificar Tablas Creadas:

```bash
# Abrir Prisma Studio (interfaz visual)
npx prisma studio
```

Se abrirá en `http://localhost:5555` y verás 15 tablas:

1. profiles
2. battles
3. battle_groups
4. group_members
5. battle_questions
6. battle_answers
7. question_sets
8. question_bank
9. professor_cards
10. student_professor_cards
11. student_professor_points
12. professor_rewards
13. student_reward_redemptions
14. achievements
15. notifications

## Paso 5: Iniciar el Backend

```bash
# Modo desarrollo (con auto-reload)
npm run dev
```

Verás:

```
🚀 Server running on port 3001
📡 WebSocket ready for connections
🌍 Environment: development
```

**¡Backend listo!** ✅

---

# 4. Configuración del Frontend

## Paso 1: Instalar Dependencias

```bash
# Volver a la raíz del proyecto
cd ..

# Instalar dependencias
npm install
```

Esto instalará:
- React 19
- Vite
- Socket.io Client
- Axios
- TypeScript

## Paso 2: Configurar Variables de Entorno

```bash
# Copiar archivo ejemplo
cp .env.example .env

# Editar .env
nano .env
```

Contenido del archivo `.env`:

```env
# URL del Backend API
VITE_API_URL=http://localhost:3001/api

# URL del WebSocket
VITE_WS_URL=http://localhost:3001
```

**Nota**: En desarrollo local, estos valores por defecto están bien.

## Paso 3: Iniciar el Frontend

```bash
# Modo desarrollo
npm run dev
```

Verás:

```
VITE v6.4.1  ready in 500 ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
```

**¡Frontend listo!** ✅

---

# 5. Conexión Frontend-Backend

## Arquitectura de la Conexión

```
┌─────────────────────────────────────────────────┐
│                   FRONTEND                       │
│                 (React + Vite)                   │
│          http://localhost:5173                   │
└────────────────┬────────────────┬────────────────┘
                 │                │
                 │ HTTP/REST      │ WebSocket
                 │ (axios)        │ (Socket.io)
                 │                │
                 ▼                ▼
┌──────────────────────────────────────────────────┐
│                   BACKEND                        │
│              (Node.js + Express)                 │
│          http://localhost:3001                   │
│                                                  │
│  ┌──────────────┐      ┌──────────────────┐    │
│  │  API REST    │      │  WebSocket       │    │
│  │  /api/*      │      │  Socket.io       │    │
│  └──────┬───────┘      └────────┬─────────┘    │
│         │                       │               │
│         ▼                       ▼               │
│  ┌──────────────────────────────────────────┐  │
│  │         Prisma ORM                       │  │
│  └──────────────┬───────────────────────────┘  │
└─────────────────┼──────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────┐
│              PostgreSQL Database                 │
│           edubattle_arena                        │
│              (15 tablas)                         │
└─────────────────────────────────────────────────┘
```

## HTTP Client (lib/httpClient.ts)

El frontend usa un cliente HTTP personalizado para comunicarse con el backend:

```typescript
// lib/httpClient.ts - YA ESTÁ CREADO

import { httpClient } from './lib/httpClient';

// Ejemplo de uso:
const data = await httpClient.post('/auth/login', {
  email: 'profesor@ejemplo.com',
  password: 'password123'
});
```

### Características del HTTP Client:

1. **Auto-manejo de tokens JWT**
   - Guarda el token en localStorage
   - Lo incluye automáticamente en todas las peticiones
   - Header: `Authorization: Bearer <token>`

2. **Manejo de errores**
   - Captura errores HTTP
   - Muestra mensajes claros

3. **Métodos disponibles**:
   - `httpClient.get(url)`
   - `httpClient.post(url, data)`
   - `httpClient.put(url, data)`
   - `httpClient.patch(url, data)`
   - `httpClient.delete(url)`

## Flujo de Autenticación

```
1. Usuario ingresa email/password
   │
   ▼
2. Frontend envía POST /api/auth/login
   │
   ▼
3. Backend verifica credenciales en PostgreSQL
   │
   ▼
4. Backend genera JWT token
   │
   ▼
5. Frontend recibe { user, token }
   │
   ▼
6. Frontend guarda token en localStorage
   │
   ▼
7. Frontend incluye token en todas las peticiones
   │
   ▼
8. Backend verifica token en middleware
   │
   ▼
9. Si válido → Continúa petición
   Si inválido → 401 Unauthorized
```

---

# 6. API Endpoints Completos

## Base URL

```
http://localhost:3001/api
```

## 6.1 Autenticación (`/api/auth`)

### POST /api/auth/register

Registrar un nuevo usuario.

**Request:**

```typescript
POST http://localhost:3001/api/auth/register
Content-Type: application/json

{
  "email": "profesor@ejemplo.com",
  "password": "password123",
  "name": "Juan Pérez",
  "role": "TEACHER"  // O "STUDENT"
}
```

**Response:**

```json
{
  "user": {
    "id": "clxxx123",
    "email": "profesor@ejemplo.com",
    "name": "Juan Pérez",
    "role": "TEACHER",
    "avatar": null,
    "points": 0,
    "level": 1,
    "streak": 0
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Ejemplo Frontend:**

```typescript
import { httpClient } from './lib/httpClient';

const handleRegister = async () => {
  try {
    const response = await httpClient.post('/auth/register', {
      email: 'profesor@ejemplo.com',
      password: 'password123',
      name: 'Juan Pérez',
      role: 'TEACHER'
    });

    // Guardar token
    httpClient.setToken(response.token);

    // Guardar usuario
    localStorage.setItem('user', JSON.stringify(response.user));

    console.log('Registrado:', response.user);
  } catch (error) {
    console.error('Error en registro:', error);
  }
};
```

---

### POST /api/auth/login

Iniciar sesión.

**Request:**

```typescript
POST http://localhost:3001/api/auth/login
Content-Type: application/json

{
  "email": "profesor@ejemplo.com",
  "password": "password123"
}
```

**Response:**

```json
{
  "user": {
    "id": "clxxx123",
    "email": "profesor@ejemplo.com",
    "name": "Juan Pérez",
    "role": "TEACHER"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Ejemplo Frontend:**

```typescript
const handleLogin = async () => {
  try {
    const response = await httpClient.post('/auth/login', {
      email: 'profesor@ejemplo.com',
      password: 'password123'
    });

    httpClient.setToken(response.token);
    localStorage.setItem('user', JSON.stringify(response.user));

    // Redirigir según rol
    if (response.user.role === 'TEACHER') {
      navigate('/teacher/dashboard');
    } else {
      navigate('/student/home');
    }
  } catch (error) {
    alert('Credenciales incorrectas');
  }
};
```

---

### GET /api/auth/me

Obtener información del usuario actual.

**Request:**

```typescript
GET http://localhost:3001/api/auth/me
Authorization: Bearer <token>
```

**Response:**

```json
{
  "id": "clxxx123",
  "email": "profesor@ejemplo.com",
  "name": "Juan Pérez",
  "role": "TEACHER",
  "points": 0,
  "level": 1,
  "streak": 0
}
```

**Ejemplo Frontend:**

```typescript
const loadUserProfile = async () => {
  try {
    const user = await httpClient.get('/auth/me');
    setCurrentUser(user);
  } catch (error) {
    // Token inválido, redirigir a login
    navigate('/login');
  }
};
```

---

### PATCH /api/auth/profile

Actualizar perfil del usuario.

**Request:**

```typescript
PATCH http://localhost:3001/api/auth/profile
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Juan Pérez Actualizado",
  "avatar": "https://..."
}
```

**Response:**

```json
{
  "id": "clxxx123",
  "email": "profesor@ejemplo.com",
  "name": "Juan Pérez Actualizado",
  "avatar": "https://...",
  "role": "TEACHER"
}
```

---

### GET /api/auth/students

Listar todos los estudiantes (solo para profesores).

**Request:**

```typescript
GET http://localhost:3001/api/auth/students
Authorization: Bearer <token>
```

**Response:**

```json
[
  {
    "id": "clyyy456",
    "name": "María González",
    "email": "maria@ejemplo.com",
    "points": 350,
    "level": 3
  },
  {
    "id": "clzzz789",
    "name": "Carlos Ramírez",
    "email": "carlos@ejemplo.com",
    "points": 200,
    "level": 2
  }
]
```

---

## 6.2 Batallas (`/api/battles`)

### POST /api/battles

Crear una nueva batalla (solo profesores).

**Request:**

```typescript
POST http://localhost:3001/api/battles
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Batalla de Matemáticas",
  "questionCount": 10,
  "groupCount": 5,
  "questionTimeLimit": 60,
  "questions": [
    {
      "text": "¿Cuánto es 2+2?",
      "answers": ["3", "4", "5", "6"],
      "correctIndex": 1
    },
    {
      "text": "¿Cuánto es 5×3?",
      "answers": ["10", "15", "20", "25"],
      "correctIndex": 1
    }
  ]
}
```

**Response:**

```json
{
  "battle": {
    "id": "clbattle123",
    "name": "Batalla de Matemáticas",
    "battleCode": "ABC123",
    "status": "WAITING",
    "questionCount": 10,
    "createdAt": "2025-11-16T10:00:00.000Z"
  },
  "groups": [
    {
      "id": "clgroup1",
      "groupCode": "GRP001",
      "groupName": "Grupo 1",
      "score": 0
    },
    {
      "id": "clgroup2",
      "groupCode": "GRP002",
      "groupName": "Grupo 2",
      "score": 0
    }
  ]
}
```

**Ejemplo Frontend:**

```typescript
const handleCreateBattle = async () => {
  try {
    const response = await httpClient.post('/battles', {
      name: 'Batalla de Matemáticas',
      questionCount: questions.length,
      groupCount: 5,
      questionTimeLimit: 60,
      questions: questions.map(q => ({
        text: q.text,
        answers: q.answers,
        correctIndex: q.correctIndex
      }))
    });

    alert(`Código de batalla: ${response.battle.battleCode}`);
    navigate(`/teacher/battle/${response.battle.id}`);
  } catch (error) {
    alert('Error creando batalla');
  }
};
```

---

### GET /api/battles/teacher

Obtener todas las batallas del profesor.

**Request:**

```typescript
GET http://localhost:3001/api/battles/teacher
Authorization: Bearer <token>
```

**Response:**

```json
[
  {
    "id": "clbattle123",
    "name": "Batalla de Matemáticas",
    "battleCode": "ABC123",
    "status": "ACTIVE",
    "questionCount": 10,
    "createdAt": "2025-11-16T10:00:00.000Z",
    "groupsCount": 5
  },
  {
    "id": "clbattle456",
    "name": "Batalla de Historia",
    "battleCode": "DEF456",
    "status": "FINISHED",
    "questionCount": 15,
    "createdAt": "2025-11-15T14:00:00.000Z",
    "groupsCount": 3
  }
]
```

---

### GET /api/battles/:battleId

Obtener detalles de una batalla específica.

**Request:**

```typescript
GET http://localhost:3001/api/battles/clbattle123
Authorization: Bearer <token>
```

**Response:**

```json
{
  "id": "clbattle123",
  "name": "Batalla de Matemáticas",
  "battleCode": "ABC123",
  "status": "ACTIVE",
  "currentQuestionIndex": 3,
  "questionCount": 10,
  "questionTimeLimit": 60,
  "teacher": {
    "id": "clteacher123",
    "name": "Prof. Juan Pérez"
  },
  "createdAt": "2025-11-16T10:00:00.000Z",
  "startedAt": "2025-11-16T10:05:00.000Z"
}
```

---

### GET /api/battles/:battleId/groups

Obtener grupos y sus puntajes.

**Request:**

```typescript
GET http://localhost:3001/api/battles/clbattle123/groups
Authorization: Bearer <token>
```

**Response:**

```json
[
  {
    "id": "clgroup1",
    "groupCode": "GRP001",
    "groupName": "Grupo 1",
    "score": 500,
    "correctAnswers": 5,
    "wrongAnswers": 2,
    "members": [
      {
        "studentName": "María González",
        "joinedAt": "2025-11-16T10:02:00.000Z"
      },
      {
        "studentName": "Carlos Ramírez",
        "joinedAt": "2025-11-16T10:02:30.000Z"
      }
    ]
  },
  {
    "id": "clgroup2",
    "groupCode": "GRP002",
    "groupName": "Grupo 2",
    "score": 450,
    "correctAnswers": 4,
    "wrongAnswers": 3,
    "members": [
      {
        "studentName": "Ana López",
        "joinedAt": "2025-11-16T10:03:00.000Z"
      }
    ]
  }
]
```

---

### POST /api/battles/join

Unirse a un grupo con código.

**Request:**

```typescript
POST http://localhost:3001/api/battles/join
Authorization: Bearer <token>
Content-Type: application/json

{
  "groupCode": "GRP001"
}
```

**Response:**

```json
{
  "group": {
    "id": "clgroup1",
    "groupCode": "GRP001",
    "groupName": "Grupo 1",
    "battleId": "clbattle123"
  },
  "battle": {
    "id": "clbattle123",
    "name": "Batalla de Matemáticas",
    "status": "WAITING"
  }
}
```

**Ejemplo Frontend:**

```typescript
const handleJoinGroup = async (code: string) => {
  try {
    const response = await httpClient.post('/battles/join', {
      groupCode: code
    });

    navigate(`/student/battle/${response.battle.id}`);
  } catch (error) {
    alert('Código inválido o grupo lleno');
  }
};
```

---

### POST /api/battles/answer

Enviar respuesta a una pregunta.

**Request:**

```typescript
POST http://localhost:3001/api/battles/answer
Authorization: Bearer <token>
Content-Type: application/json

{
  "battleId": "clbattle123",
  "groupId": "clgroup1",
  "questionId": "clquestion1",
  "answerIndex": 1,
  "responseTimeMs": 3500
}
```

**Response:**

```json
{
  "answer": {
    "id": "clanswer1",
    "isCorrect": true,
    "answerIndex": 1,
    "responseTimeMs": 3500
  },
  "group": {
    "id": "clgroup1",
    "score": 100,
    "correctAnswers": 1,
    "wrongAnswers": 0
  }
}
```

---

### POST /api/battles/:battleId/start

Iniciar batalla (solo profesor).

**Request:**

```typescript
POST http://localhost:3001/api/battles/clbattle123/start
Authorization: Bearer <token>
```

**Response:**

```json
{
  "battle": {
    "id": "clbattle123",
    "status": "ACTIVE",
    "startedAt": "2025-11-16T10:05:00.000Z",
    "currentQuestionIndex": 0
  }
}
```

---

### POST /api/battles/:battleId/next

Pasar a siguiente pregunta (solo profesor).

**Request:**

```typescript
POST http://localhost:3001/api/battles/clbattle123/next
Authorization: Bearer <token>
```

**Response:**

```json
{
  "battle": {
    "id": "clbattle123",
    "currentQuestionIndex": 1,
    "status": "ACTIVE"
  }
}
```

---

# 7. WebSocket en Tiempo Real

## 7.1 Configuración del Cliente

```typescript
// En tu componente React
import { useEffect, useState } from 'react';
import io, { Socket } from 'socket.io-client';

const BattleScreen = () => {
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    // Obtener token
    const token = localStorage.getItem('auth_token');

    if (!token) {
      console.error('No hay token');
      return;
    }

    // Conectar a WebSocket
    const newSocket = io(import.meta.env.VITE_WS_URL, {
      auth: {
        token: token
      }
    });

    newSocket.on('connect', () => {
      console.log('✅ Conectado a WebSocket');
    });

    newSocket.on('connect_error', (error) => {
      console.error('❌ Error de conexión:', error.message);
    });

    setSocket(newSocket);

    // Limpiar al desmontar
    return () => {
      newSocket.close();
    };
  }, []);

  return (
    <div>
      {/* Tu UI aquí */}
    </div>
  );
};
```

## 7.2 Eventos del Cliente

### Unirse a una Batalla

```typescript
// Unirse a la sala de batalla
socket?.emit('join-battle', battleId);

console.log(`Unido a batalla: ${battleId}`);
```

### Salir de una Batalla

```typescript
// Salir de la sala
socket?.emit('leave-battle', battleId);
```

### Unirse a un Grupo

```typescript
socket?.emit('join-group', groupId);
```

### Salir de un Grupo

```typescript
socket?.emit('leave-group', groupId);
```

## 7.3 Eventos del Servidor

### battle-update

Se emite cuando cambia el estado de la batalla.

```typescript
socket?.on('battle-update', (data) => {
  console.log('Actualización de batalla:', data);

  /*
  data = {
    battleId: "clbattle123",
    status: "ACTIVE",
    currentQuestionIndex: 2,
    questionStartedAt: "2025-11-16T10:10:00.000Z"
  }
  */

  // Actualizar estado local
  setBattle(prevBattle => ({
    ...prevBattle,
    ...data
  }));
});
```

### group-update

Se emite cuando cambian los puntajes de grupos.

```typescript
socket?.on('group-update', (data) => {
  console.log('Actualización de grupo:', data);

  /*
  data = {
    battleId: "clbattle123",
    groupId: "clgroup1",
    score: 500,
    correctAnswers: 5,
    wrongAnswers: 2
  }
  */

  // Actualizar ranking
  setGroups(prevGroups =>
    prevGroups.map(g =>
      g.id === data.groupId
        ? { ...g, score: data.score, correctAnswers: data.correctAnswers }
        : g
    )
  );
});
```

### notification

Notificaciones para el usuario.

```typescript
socket?.on('notification', (data) => {
  console.log('Notificación:', data);

  /*
  data = {
    message: "¡Respuesta correcta!",
    payload: { points: 100 },
    timestamp: "2025-11-16T10:12:00.000Z"
  }
  */

  // Mostrar toast/alert
  showNotification(data.message);
});
```

## 7.4 Ejemplo Completo

```typescript
import { useEffect, useState } from 'react';
import io, { Socket } from 'socket.io-client';
import { httpClient } from './lib/httpClient';

interface Battle {
  id: string;
  name: string;
  status: string;
  currentQuestionIndex: number;
}

interface Group {
  id: string;
  groupName: string;
  score: number;
  correctAnswers: number;
}

const StudentBattleScreen = ({ battleId }: { battleId: string }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [battle, setBattle] = useState<Battle | null>(null);
  const [groups, setGroups] = useState<Group[]>([]);

  // Conectar WebSocket
  useEffect(() => {
    const token = httpClient.getToken();

    if (!token) return;

    const newSocket = io(import.meta.env.VITE_WS_URL, {
      auth: { token }
    });

    newSocket.on('connect', () => {
      console.log('✅ WebSocket conectado');

      // Unirse a la batalla
      newSocket.emit('join-battle', battleId);
    });

    newSocket.on('battle-update', (data) => {
      console.log('📡 Battle update:', data);
      setBattle(prev => prev ? { ...prev, ...data } : null);
    });

    newSocket.on('group-update', (data) => {
      console.log('📡 Group update:', data);
      setGroups(prev =>
        prev.map(g =>
          g.id === data.groupId
            ? { ...g, ...data }
            : g
        )
      );
    });

    newSocket.on('notification', (data) => {
      console.log('🔔 Notificación:', data.message);
      alert(data.message);
    });

    setSocket(newSocket);

    return () => {
      newSocket.emit('leave-battle', battleId);
      newSocket.close();
    };
  }, [battleId]);

  // Cargar datos iniciales
  useEffect(() => {
    const loadBattle = async () => {
      try {
        const battleData = await httpClient.get(`/battles/${battleId}`);
        setBattle(battleData);

        const groupsData = await httpClient.get(`/battles/${battleId}/groups`);
        setGroups(groupsData);
      } catch (error) {
        console.error('Error cargando batalla:', error);
      }
    };

    loadBattle();
  }, [battleId]);

  // Enviar respuesta
  const handleAnswer = async (questionId: string, answerIndex: number) => {
    try {
      const response = await httpClient.post('/battles/answer', {
        battleId: battle?.id,
        groupId: groups[0]?.id,
        questionId,
        answerIndex,
        responseTimeMs: 3500
      });

      console.log('Respuesta enviada:', response);
    } catch (error) {
      console.error('Error enviando respuesta:', error);
    }
  };

  return (
    <div>
      <h1>{battle?.name}</h1>
      <p>Pregunta: {battle?.currentQuestionIndex + 1}</p>

      <h2>Ranking</h2>
      <ul>
        {groups
          .sort((a, b) => b.score - a.score)
          .map((group, index) => (
            <li key={group.id}>
              {index + 1}. {group.groupName} - {group.score} pts
            </li>
          ))}
      </ul>
    </div>
  );
};
```

---

# 8. Ejemplos Prácticos

## 8.1 Flujo Completo: Profesor Crea Batalla

```typescript
// 1. Profesor se registra/inicia sesión
const loginResponse = await httpClient.post('/auth/login', {
  email: 'profesor@ejemplo.com',
  password: 'password123'
});

httpClient.setToken(loginResponse.token);

// 2. Profesor crea batalla
const battleResponse = await httpClient.post('/battles', {
  name: 'Batalla de Matemáticas',
  questionCount: 5,
  groupCount: 3,
  questionTimeLimit: 60,
  questions: [
    {
      text: '¿Cuánto es 2+2?',
      answers: ['3', '4', '5', '6'],
      correctIndex: 1
    },
    {
      text: '¿Cuánto es 5×3?',
      answers: ['10', '15', '20', '25'],
      correctIndex: 1
    }
  ]
});

console.log('Código de batalla:', battleResponse.battle.battleCode);
console.log('Códigos de grupos:', battleResponse.groups.map(g => g.groupCode));

// 3. Conectar WebSocket
const socket = io(import.meta.env.VITE_WS_URL, {
  auth: { token: loginResponse.token }
});

socket.on('connect', () => {
  socket.emit('join-battle', battleResponse.battle.id);
});

// 4. Escuchar actualizaciones
socket.on('group-update', (data) => {
  console.log('Grupo actualizó:', data);
});

// 5. Iniciar batalla cuando todos estén listos
await httpClient.post(`/battles/${battleResponse.battle.id}/start`);

// 6. Avanzar preguntas
await httpClient.post(`/battles/${battleResponse.battle.id}/next`);
```

## 8.2 Flujo Completo: Estudiante se Une

```typescript
// 1. Estudiante se registra/inicia sesión
const loginResponse = await httpClient.post('/auth/login', {
  email: 'estudiante@ejemplo.com',
  password: 'password123'
});

httpClient.setToken(loginResponse.token);

// 2. Estudiante ingresa código de grupo
const joinResponse = await httpClient.post('/battles/join', {
  groupCode: 'GRP001'
});

console.log('Unido a:', joinResponse.group.groupName);
console.log('Batalla:', joinResponse.battle.name);

// 3. Conectar WebSocket
const socket = io(import.meta.env.VITE_WS_URL, {
  auth: { token: loginResponse.token }
});

socket.on('connect', () => {
  socket.emit('join-battle', joinResponse.battle.id);
  socket.emit('join-group', joinResponse.group.id);
});

// 4. Escuchar preguntas
socket.on('battle-update', async (data) => {
  if (data.currentQuestionIndex !== undefined) {
    console.log('Nueva pregunta:', data.currentQuestionIndex);

    // Cargar pregunta
    const questions = await httpClient.get(
      `/battles/${joinResponse.battle.id}/questions`
    );

    const currentQuestion = questions[data.currentQuestionIndex];
    console.log('Pregunta:', currentQuestion.questionText);
  }
});

// 5. Responder pregunta
await httpClient.post('/battles/answer', {
  battleId: joinResponse.battle.id,
  groupId: joinResponse.group.id,
  questionId: 'clquestion1',
  answerIndex: 1,
  responseTimeMs: 3500
});
```

---

# 9. Troubleshooting

## Error: Cannot connect to database

**Síntoma**: Backend no inicia, error de conexión a PostgreSQL

**Solución**:

```bash
# Verificar que PostgreSQL esté corriendo
sudo systemctl status postgresql

# Si no está corriendo:
sudo systemctl start postgresql

# Verificar DATABASE_URL en .env
# Asegúrate de que el password sea correcto
DATABASE_URL="postgresql://postgres:tu_password@localhost:5432/edubattle_arena"
```

## Error: JWT token invalid

**Síntoma**: 401 Unauthorized en todas las peticiones

**Solución**:

```typescript
// Limpiar localStorage y hacer login nuevamente
localStorage.clear();
httpClient.logout();

// Volver a hacer login
const response = await httpClient.post('/auth/login', {
  email: 'usuario@ejemplo.com',
  password: 'password123'
});

httpClient.setToken(response.token);
```

## Error: Port 3001 already in use

**Síntoma**: Backend no inicia, puerto ocupado

**Solución**:

```bash
# Ver qué proceso está usando el puerto
lsof -i :3001

# O en Windows:
netstat -ano | findstr :3001

# Matar el proceso
kill -9 <PID>

# O cambiar puerto en .env
PORT=3002
```

## Error: WebSocket connection refused

**Síntoma**: Frontend no puede conectarse a WebSocket

**Solución**:

1. Verificar que backend esté corriendo
2. Verificar VITE_WS_URL en frontend/.env
3. Verificar CORS_ORIGIN en backend/.env

```env
# Backend .env
CORS_ORIGIN=http://localhost:5173

# Frontend .env
VITE_WS_URL=http://localhost:3001
```

## Error: Prisma Client not generated

**Síntoma**: `Cannot find module '@prisma/client'`

**Solución**:

```bash
cd backend
npx prisma generate
```

## Error: Tables not found

**Síntoma**: Errores de SQL, tablas no existen

**Solución**:

```bash
cd backend
npx prisma db push
```

---

# ✅ Checklist Final

Una vez completados todos los pasos:

- [ ] PostgreSQL instalado y corriendo
- [ ] Base de datos `edubattle_arena` creada
- [ ] Backend: dependencias instaladas (`npm install`)
- [ ] Backend: `.env` configurado con DATABASE_URL y JWT_SECRET
- [ ] Backend: Prisma client generado (`npx prisma generate`)
- [ ] Backend: Tablas creadas (`npx prisma db push`)
- [ ] Backend: Servidor corriendo (`npm run dev`) en puerto 3001
- [ ] Frontend: dependencias instaladas (`npm install`)
- [ ] Frontend: `.env` configurado con VITE_API_URL
- [ ] Frontend: Servidor corriendo (`npm run dev`) en puerto 5173
- [ ] Puedes hacer login desde el frontend
- [ ] WebSocket conecta correctamente
- [ ] Profesor puede crear batalla
- [ ] Estudiante puede unirse a grupo
- [ ] Sistema de puntos funciona

---

¡Con esto tienes el proyecto 100% funcional! 🎉

**Siguiente paso**: Restaurar los componentes de React desde Git y actualizar los imports de Supabase a httpClient.
