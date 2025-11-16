# EduBattle Arena - Backend

Backend API con Node.js, Express, Prisma y PostgreSQL para EduBattle Arena.

## Estructura del Proyecto

```
backend/
├── src/
│   ├── config/          # Configuración de base de datos y constantes
│   ├── controllers/     # Controladores de las rutas
│   ├── middleware/      # Middleware de autenticación
│   ├── routes/          # Definición de rutas
│   ├── services/        # Lógica de negocio
│   ├── types/           # Tipos TypeScript
│   ├── websocket/       # Configuración de WebSocket
│   └── server.ts        # Punto de entrada
├── prisma/
│   └── schema.prisma    # Esquema de la base de datos
└── package.json
```

## Instalación

1. Instalar dependencias:
```bash
cd backend
npm install
```

2. Configurar variables de entorno:
```bash
cp .env.example .env
```

Editar `.env` con tus credenciales de PostgreSQL:
```
DATABASE_URL="postgresql://user:password@localhost:5432/edubattle?schema=public"
JWT_SECRET="tu-clave-secreta-jwt"
PORT=3001
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173
```

3. Inicializar Prisma:
```bash
npm run prisma:generate
npm run prisma:push
```

4. Iniciar el servidor:
```bash
npm run dev
```

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

## Comandos Útiles

- `npm run dev` - Iniciar en modo desarrollo
- `npm run build` - Compilar TypeScript
- `npm start` - Iniciar en producción
- `npm run prisma:generate` - Generar cliente Prisma
- `npm run prisma:migrate` - Crear migración
- `npm run prisma:push` - Sincronizar esquema con base de datos
