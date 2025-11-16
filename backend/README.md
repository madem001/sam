# EduBattle Arena - Backend API

Sistema de backend con Node.js, Express, Prisma y PostgreSQL para la aplicación EduBattle Arena.

## 📋 Tabla de Contenidos

- [Requisitos Previos](#requisitos-previos)
- [Instalación](#instalación)
- [Configuración de Base de Datos](#configuración-de-base-de-datos)
- [Configuración del Proyecto](#configuración-del-proyecto)
- [Migraciones de Base de Datos](#migraciones-de-base-de-datos)
- [Ejecución del Proyecto](#ejecución-del-proyecto)
- [Estructura del Proyecto](#estructura-del-proyecto)
- [API Endpoints](#api-endpoints)
- [Modelos de Base de Datos](#modelos-de-base-de-datos)
- [WebSocket Events](#websocket-events)
- [Troubleshooting](#troubleshooting)

---

## 🔧 Requisitos Previos

Antes de comenzar, asegúrate de tener instalado:

- **Node.js** (versión 18 o superior)
- **PostgreSQL** (versión 14 o superior)
- **npm** o **yarn**

### Instalación de PostgreSQL

#### En macOS (con Homebrew):
```bash
brew install postgresql@14
brew services start postgresql@14
```

#### En Ubuntu/Debian:
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

#### En Windows:
Descarga el instalador desde [postgresql.org](https://www.postgresql.org/download/windows/)

---

## 📦 Instalación

### 1. Navegar al directorio del backend
```bash
cd backend
```

### 2. Instalar dependencias
```bash
npm install
```

Esto instalará todas las dependencias necesarias:
- **express**: Framework web
- **@prisma/client**: Cliente de Prisma ORM
- **bcryptjs**: Encriptación de contraseñas
- **jsonwebtoken**: Autenticación JWT
- **cors**: Manejo de CORS
- **socket.io**: WebSockets en tiempo real
- **dotenv**: Variables de entorno

---

## 🗄️ Configuración de Base de Datos

### 1. Crear la base de datos

Conectarse a PostgreSQL:
```bash
psql -U postgres
```

Crear la base de datos:
```sql
CREATE DATABASE edubattle_arena;
```

Crear un usuario (opcional):
```sql
CREATE USER edubattle_user WITH ENCRYPTED PASSWORD 'tu_password_seguro';
GRANT ALL PRIVILEGES ON DATABASE edubattle_arena TO edubattle_user;
```

Salir de psql:
```sql
\q
```

### 2. Verificar conexión

```bash
psql -U postgres -d edubattle_arena -c "SELECT version();"
```

---

## ⚙️ Configuración del Proyecto

### 1. Crear archivo .env

Copia el archivo de ejemplo:
```bash
cp .env.example .env
```

### 2. Editar archivo .env

Abre `.env` y configura tus credenciales:

```env
# Database Configuration
DATABASE_URL="postgresql://postgres:tu_password@localhost:5432/edubattle_arena?schema=public"

# Server Configuration
PORT=3001
NODE_ENV=development

# JWT Configuration
JWT_SECRET=tu-clave-super-secreta-cambiar-en-produccion
JWT_EXPIRES_IN=7d

# CORS Configuration
CORS_ORIGIN=http://localhost:5173
```

**⚠️ Importante:**
- Reemplaza `tu_password` con tu contraseña de PostgreSQL
- En producción, cambia `JWT_SECRET` por una clave aleatoria segura
- Ajusta `CORS_ORIGIN` según tu configuración de frontend

---

## 🔄 Migraciones de Base de Datos

### 1. Generar cliente de Prisma

```bash
npx prisma generate
```

Este comando genera el cliente de Prisma basado en tu schema.

### 2. Crear las tablas en la base de datos

```bash
npx prisma db push
```

O para crear una migración:

```bash
npx prisma migrate dev --name init
```

Este comando:
- ✅ Lee el archivo `prisma/schema.prisma`
- ✅ Crea todas las tablas en PostgreSQL
- ✅ Crea índices y relaciones
- ✅ Aplica valores por defecto

### 3. Ver las tablas creadas

```bash
psql -U postgres -d edubattle_arena -c "\dt"
```

Deberías ver 15 tablas incluyendo:
- `profiles` (usuarios)
- `battles` (batallas)
- `battle_groups` (grupos de batalla)
- `professor_cards` (cartas de profesores)
- `professor_rewards` (recompensas)
- Y más...

### 4. Abrir Prisma Studio (Opcional)

```bash
npx prisma studio
```

Esto abrirá una interfaz visual en `http://localhost:5555`

---

## 🚀 Ejecución del Proyecto

### Modo Desarrollo

```bash
npm run dev
```

El servidor se iniciará en `http://localhost:3001`

### Modo Producción

```bash
npm run build
npm start
```

---

## 📁 Estructura del Proyecto

```
backend/
├── prisma/
│   └── schema.prisma          # Definición de modelos de base de datos
├── src/
│   ├── config/
│   │   ├── database.ts        # Configuración de Prisma
│   │   └── constants.ts       # Constantes de la aplicación
│   ├── controllers/
│   │   ├── authController.ts  # Lógica de autenticación
│   │   └── battleController.ts # Lógica de batallas
│   ├── middleware/
│   │   └── auth.ts            # Middleware de autenticación JWT
│   ├── routes/
│   │   ├── authRoutes.ts      # Rutas de autenticación
│   │   └── battleRoutes.ts    # Rutas de batallas
│   ├── services/
│   │   ├── authService.ts     # Servicios de autenticación
│   │   └── battleService.ts   # Servicios de batallas
│   ├── types/
│   │   └── index.ts           # Tipos de TypeScript
│   ├── websocket/
│   │   └── index.ts           # WebSocket para tiempo real
│   └── server.ts              # Punto de entrada principal
├── .env                       # Variables de entorno (no incluir en git)
├── .env.example               # Ejemplo de variables de entorno
├── package.json               # Dependencias del proyecto
├── tsconfig.json              # Configuración de TypeScript
└── README.md                  # Esta documentación
```

---

## 🗂️ Modelos de Base de Datos

### User (profiles)
Usuarios del sistema (profesores y estudiantes)

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | String | ID único (CUID) |
| email | String | Email único |
| password | String | Contraseña encriptada |
| name | String | Nombre completo |
| role | UserRole | TEACHER o STUDENT |
| points | Int | Puntos acumulados |
| level | Int | Nivel del usuario |

### Battle (battles)
Batallas/Trivias creadas por profesores

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | String | ID único |
| name | String | Nombre de la batalla |
| teacherId | String | ID del profesor creador |
| battleCode | String | Código para unirse |
| status | BattleStatus | WAITING, ACTIVE, FINISHED |
| questionCount | Int | Número de preguntas |
| studentsPerGroup | Int | Estudiantes por grupo |

### ProfessorCard (professor_cards)
Cartas coleccionables de profesores

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | String | ID único |
| teacherId | String | ID del profesor |
| name | String | Nombre en la carta |
| unlockPoints | Int | Puntos para desbloquear |

### StudentProfessorPoint (student_professor_points)
Puntos acumulados por estudiante por profesor

| Campo | Tipo | Descripción |
|-------|------|-------------|
| studentId | String | ID del estudiante |
| professorId | String | ID del profesor |
| points | Int | Puntos acumulados |

---

## API Endpoints

### Autenticación (`/api/auth`)

- `POST /register` - Registrar nuevo usuario
- `POST /login` - Iniciar sesión
- `GET /me` - Obtener usuario actual (requiere token)
- `PATCH /profile` - Actualizar perfil (requiere token)
- `GET /students` - Obtener lista de estudiantes (requiere token)

### Batallas (`/api/battles`)

- `POST /` - Crear nueva batalla (requiere rol TEACHER)
- `GET /teacher` - Obtener batallas del maestro (requiere rol TEACHER)
- `GET /:battleId` - Obtener batalla por ID
- `GET /:battleId/groups` - Obtener grupos de una batalla
- `GET /:battleId/questions` - Obtener preguntas de una batalla
- `GET /:battleId/answers` - Obtener respuestas de una batalla
- `POST /join` - Unirse a un grupo
- `POST /answer` - Enviar respuesta
- `POST /:battleId/start` - Iniciar batalla (requiere rol TEACHER)
- `POST /:battleId/next` - Siguiente pregunta (requiere rol TEACHER)
- `GET /groups/:groupId/members` - Obtener miembros de un grupo

## WebSocket Events

### Cliente → Servidor

- `join-battle` - Unirse a sala de batalla
- `leave-battle` - Salir de sala de batalla
- `join-group` - Unirse a sala de grupo
- `leave-group` - Salir de sala de grupo

### Servidor → Cliente

- `battle-update` - Actualización de estado de batalla
- `group-update` - Actualización de grupo (puntaje, respuestas)
- `notification` - Notificaciones para usuarios

## Tecnologías Utilizadas

- **Node.js** - Runtime
- **Express** - Framework web
- **Prisma** - ORM para PostgreSQL
- **PostgreSQL** - Base de datos
- **Socket.io** - WebSocket para tiempo real
- **JWT** - Autenticación
- **bcrypt** - Encriptación de contraseñas
- **TypeScript** - Tipado estático
- **Zod** - Validación de esquemas

## 🔍 Comandos Útiles de Prisma

### Desarrollo
```bash
npm run dev                 # Iniciar servidor en modo desarrollo
npx prisma studio           # Abrir interfaz visual
npx prisma generate         # Generar cliente Prisma
npx prisma db push          # Sincronizar schema con BD
```

### Migraciones
```bash
npx prisma migrate dev --name nombre    # Crear nueva migración
npx prisma migrate status               # Ver estado de migraciones
npx prisma migrate reset                # Resetear BD (CUIDADO)
```

### Producción
```bash
npm run build              # Compilar TypeScript
npm start                  # Iniciar en producción
```

---

## 🐛 Troubleshooting

### Error: "Can't reach database server"

**Problema:** No se puede conectar a PostgreSQL

**Solución:**
```bash
# Verificar que PostgreSQL esté corriendo
sudo systemctl status postgresql

# Iniciar PostgreSQL si está detenido
sudo systemctl start postgresql

# Verificar la conexión
psql -U postgres -c "SELECT 1;"
```

### Error: "Database does not exist"

**Problema:** La base de datos no existe

**Solución:**
```bash
psql -U postgres -c "CREATE DATABASE edubattle_arena;"
```

### Error: "Invalid DATABASE_URL"

**Problema:** La URL de conexión está mal configurada

**Solución:**
Verifica tu archivo `.env`:
```env
DATABASE_URL="postgresql://usuario:contraseña@localhost:5432/nombre_bd?schema=public"
```

Formato correcto:
- `usuario`: Tu usuario de PostgreSQL (ej: `postgres`)
- `contraseña`: Tu contraseña
- `localhost`: Servidor (localhost para local)
- `5432`: Puerto de PostgreSQL
- `nombre_bd`: Nombre de la base de datos

### Error: "Prisma Client not generated"

**Solución:**
```bash
npx prisma generate
```

### Error: Puerto 3001 en uso

**Solución:**
```bash
# En Linux/Mac
lsof -ti:3001 | xargs kill -9

# En Windows
netstat -ano | findstr :3001
taskkill /PID <PID> /F
```

O cambia el puerto en `.env`:
```env
PORT=3002
```

---

## 📚 Recursos Adicionales

- [Documentación de Prisma](https://www.prisma.io/docs)
- [Guía de PostgreSQL](https://www.postgresql.org/docs/)
- [Express.js Documentation](https://expressjs.com/)
- [Socket.io Documentation](https://socket.io/docs/)

---

## ✅ Checklist de Instalación

- [ ] PostgreSQL instalado y corriendo
- [ ] Base de datos `edubattle_arena` creada
- [ ] Archivo `.env` configurado
- [ ] Dependencias instaladas (`npm install`)
- [ ] Cliente de Prisma generado (`npx prisma generate`)
- [ ] Migraciones aplicadas (`npx prisma db push`)
- [ ] Servidor iniciado (`npm run dev`)
- [ ] API respondiendo en `http://localhost:3001`

---

## 📝 Notas Importantes

- **Seguridad**: Nunca subas el archivo `.env` a git. Ya está en `.gitignore`
- **Migraciones**: Siempre crea migraciones antes de cambios en producción
- **Backups**: Haz backups regulares de tu base de datos
- **JWT_SECRET**: Usa una clave aleatoria segura (mínimo 32 caracteres)
