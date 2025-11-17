# EduBattle Arena - Backend NestJS

Backend moderno desarrollado con NestJS para la plataforma educativa EduBattle Arena.

## Características

- Framework NestJS con TypeScript
- Autenticación JWT con Passport
- WebSocket Gateway con Socket.IO
- Validación automática con Class Validator
- Base de datos PostgreSQL con Prisma ORM
- Arquitectura modular y escalable
- CORS configurado para desarrollo

## Requisitos

- Node.js v18 o superior
- PostgreSQL 14 o superior
- npm o yarn

## Instalación

```bash
# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env

# Generar cliente Prisma
npm run prisma:generate

# Sincronizar base de datos
npm run prisma:push
```

## Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/edubattle?schema=public"
JWT_SECRET="edubattle-secret-key-2024-change-in-production"
PORT=4000
NODE_ENV=development
CORS_ORIGIN=http://localhost:8000
```

## Scripts disponibles

```bash
# Desarrollo (con hot-reload)
npm run dev

# Compilar
npm run build

# Iniciar en producción
npm run start:prod

# Debug mode
npm run start:debug

# Generar cliente Prisma
npm run prisma:generate

# Sincronizar base de datos
npm run prisma:push

# Abrir Prisma Studio
npm run prisma:studio
```

## Estructura del Proyecto

```
src/
├── auth/                    # Módulo de autenticación
│   ├── dto/                 # Data Transfer Objects
│   ├── auth.controller.ts   # Controlador de rutas
│   ├── auth.service.ts      # Lógica de negocio
│   ├── auth.module.ts       # Módulo de autenticación
│   ├── jwt.strategy.ts      # Estrategia JWT
│   └── jwt-auth.guard.ts    # Guard de autenticación
├── websocket/               # WebSocket Gateway
│   ├── events.gateway.ts    # Gateway de eventos
│   └── websocket.module.ts  # Módulo WebSocket
├── prisma/                  # Módulo Prisma
│   ├── prisma.service.ts    # Servicio de Prisma
│   └── prisma.module.ts     # Módulo global
├── common/                  # Utilidades comunes
│   └── decorators/          # Decoradores personalizados
├── app.module.ts            # Módulo principal
└── main.ts                  # Punto de entrada
```

## API Endpoints

### Autenticación

#### POST `/api/auth/register`
Registrar un nuevo usuario

**Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "name": "User Name",
  "role": "STUDENT"
}
```

**Response:**
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "User Name",
    "role": "STUDENT",
    "points": 0,
    "level": 1
  },
  "token": "jwt-token"
}
```

#### POST `/api/auth/login`
Iniciar sesión

**Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "User Name",
    "role": "STUDENT"
  },
  "token": "jwt-token"
}
```

#### GET `/api/auth/me`
Obtener perfil del usuario autenticado

**Headers:**
```
Authorization: Bearer jwt-token
```

**Response:**
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "name": "User Name",
  "role": "STUDENT",
  "points": 100,
  "level": 2
}
```

#### PATCH `/api/auth/profile`
Actualizar perfil del usuario

**Headers:**
```
Authorization: Bearer jwt-token
```

**Body:**
```json
{
  "name": "New Name",
  "avatar": "https://example.com/avatar.png"
}
```

#### GET `/api/auth/students`
Obtener lista de estudiantes (requiere autenticación)

**Headers:**
```
Authorization: Bearer jwt-token
```

## WebSocket Events

### Cliente → Servidor

#### `join-battle`
Unirse a una batalla
```typescript
socket.emit('join-battle', {
  battleId: 'battle-uuid',
  userId: 'user-uuid',
  userName: 'User Name'
});
```

#### `leave-battle`
Salir de una batalla
```typescript
socket.emit('leave-battle', {
  battleId: 'battle-uuid',
  userId: 'user-uuid',
  userName: 'User Name'
});
```

#### `battle-start`
Iniciar una batalla
```typescript
socket.emit('battle-start', {
  battleId: 'battle-uuid'
});
```

#### `answer-submitted`
Enviar una respuesta
```typescript
socket.emit('answer-submitted', {
  battleId: 'battle-uuid',
  userId: 'user-uuid',
  questionId: 'question-uuid',
  isCorrect: true,
  points: 10
});
```

### Servidor → Cliente

#### `player-joined`
Un jugador se unió a la batalla
```typescript
socket.on('player-joined', (data) => {
  console.log(data); // { userId, userName, timestamp }
});
```

#### `player-left`
Un jugador salió de la batalla
```typescript
socket.on('player-left', (data) => {
  console.log(data); // { userId, userName, timestamp }
});
```

#### `battle-started`
La batalla ha comenzado
```typescript
socket.on('battle-started', (data) => {
  console.log(data); // { battleId, timestamp }
});
```

#### `answer-result`
Resultado de una respuesta
```typescript
socket.on('answer-result', (data) => {
  console.log(data); // { battleId, userId, questionId, isCorrect, points }
});
```

#### `battle-ended`
La batalla ha terminado
```typescript
socket.on('battle-ended', (data) => {
  console.log(data); // { battleId, results }
});
```

## Arquitectura NestJS

### Módulos

Los módulos son la unidad básica de organización en NestJS:

```typescript
@Module({
  imports: [PrismaModule],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  exports: [AuthService],
})
export class AuthModule {}
```

### Controladores

Los controladores manejan las rutas HTTP:

```typescript
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }
}
```

### Servicios

Los servicios contienen la lógica de negocio:

```typescript
@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async login(loginDto: LoginDto) {
    // Lógica de autenticación
  }
}
```

### DTOs (Data Transfer Objects)

Los DTOs definen la estructura de datos con validación:

```typescript
export class LoginDto {
  @IsEmail()
  email: string;

  @IsString()
  password: string;
}
```

### Guards

Los Guards protegen rutas que requieren autenticación:

```typescript
@UseGuards(JwtAuthGuard)
@Get('me')
async getMe(@Request() req) {
  return this.authService.getUserById(req.user.id);
}
```

## Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

## Prisma

### Comandos útiles

```bash
# Generar cliente Prisma
npm run prisma:generate

# Crear y aplicar migraciones
npm run prisma:migrate dev

# Sincronizar esquema (desarrollo)
npm run prisma:push

# Abrir Prisma Studio
npm run prisma:studio

# Formatear schema.prisma
npx prisma format
```

## Diferencias con Express Backend

| Aspecto | Express | NestJS |
|---------|---------|--------|
| **Estructura** | Archivos sueltos | Módulos organizados |
| **Validación** | Manual | Automática (Class Validator) |
| **Inyección de Dependencias** | No nativa | Nativa |
| **TypeScript** | Configuración manual | Nativo |
| **Testing** | Setup manual | Herramientas integradas |
| **Decoradores** | No | Sí |

## Ventajas de NestJS

1. **Tipado fuerte** - TypeScript nativo
2. **Arquitectura modular** - Código organizado
3. **Validación automática** - Menos código boilerplate
4. **DI nativa** - Mejor manejo de dependencias
5. **Escalabilidad** - Estructura para proyectos grandes
6. **Testing integrado** - Herramientas de testing incluidas
7. **Documentación** - Swagger fácil de integrar

## Troubleshooting

### Puerto 4000 en uso

```bash
# Windows
netstat -ano | findstr :4000
taskkill /F /PID <PID>

# Linux/Mac
lsof -i :4000
kill -9 <PID>
```

### Error de conexión a PostgreSQL

Verifica que PostgreSQL esté corriendo:
```bash
# Windows
sc query postgresql-x64-14

# Linux/Mac
sudo systemctl status postgresql
```

### Prisma Client no generado

```bash
npm run prisma:generate
```

### Dependencias no instaladas

```bash
rm -rf node_modules package-lock.json
npm install
```

## Recursos

- [Documentación de NestJS](https://docs.nestjs.com/)
- [Prisma Docs](https://www.prisma.io/docs/)
- [Passport JWT](https://www.passportjs.org/packages/passport-jwt/)
- [Socket.IO](https://socket.io/docs/v4/)

## Licencia

MIT

## Autor

EduBattle Arena Team
