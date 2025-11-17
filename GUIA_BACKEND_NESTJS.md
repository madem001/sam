# Guía de Migración: Backend NestJS

## Descripción

Ahora EduBattle Arena cuenta con **DOS BACKENDS**:

1. **Backend Express (Puerto 3000)** - `/src/backend`
2. **Backend NestJS (Puerto 4000)** - `/src/backend-nestjs` ✨ NUEVO

Ambos backends comparten la misma base de datos PostgreSQL y tienen la misma funcionalidad.

---

## Tabla de Comparación

| Característica | Express Backend | NestJS Backend |
|---------------|-----------------|----------------|
| **Puerto** | 3000 | 4000 |
| **Ubicación** | `/src/backend` | `/src/backend-nestjs` |
| **Base de datos** | PostgreSQL (Prisma) | PostgreSQL (Prisma) |
| **Autenticación** | JWT | JWT + Passport |
| **WebSocket** | Socket.IO | Socket.IO Gateway |
| **Validación** | Manual | Class Validator |
| **Arquitectura** | Controllers + Services | Módulos NestJS |

---

## Instalación del Backend NestJS

### 1. Instalar dependencias

```bash
cd src/backend-nestjs
npm install
```

### 2. Configurar variables de entorno

El archivo `.env` ya está creado con estos valores:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/edubattle?schema=public"
JWT_SECRET="edubattle-secret-key-2024-change-in-production"
PORT=4000
NODE_ENV=development
CORS_ORIGIN=http://localhost:8000
```

### 3. Generar cliente Prisma

```bash
npm run prisma:generate
```

### 4. Sincronizar base de datos

```bash
npm run prisma:push
```

---

## Iniciar el Backend NestJS

### Desarrollo (con hot-reload)

```bash
cd src/backend-nestjs
npm run dev
```

### Producción

```bash
cd src/backend-nestjs
npm run build
npm run start:prod
```

---

## Conectar el Frontend con NestJS

### Opción 1: Cambiar la URL de la API

Edita el archivo `/src/frontend/lib/localApi.ts`:

```typescript
// CAMBIAR ESTA LÍNEA:
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
const WS_URL = import.meta.env.VITE_WS_URL || 'http://localhost:3000';

// POR ESTA:
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';
const WS_URL = import.meta.env.VITE_WS_URL || 'http://localhost:4000';
```

### Opción 2: Usar variables de entorno

Crea un archivo `.env` en la raíz del proyecto:

```env
# Para usar Express Backend (Puerto 3000)
VITE_API_URL=http://localhost:3000/api
VITE_WS_URL=http://localhost:3000

# O para usar NestJS Backend (Puerto 4000)
VITE_API_URL=http://localhost:4000/api
VITE_WS_URL=http://localhost:4000
```

---

## Arquitectura del Backend NestJS

### Estructura de carpetas

```
src/backend-nestjs/
├── src/
│   ├── auth/                    # Módulo de autenticación
│   │   ├── dto/                 # DTOs (Data Transfer Objects)
│   │   │   ├── login.dto.ts
│   │   │   ├── register.dto.ts
│   │   │   └── update-profile.dto.ts
│   │   ├── auth.controller.ts   # Controlador de rutas
│   │   ├── auth.service.ts      # Lógica de negocio
│   │   ├── auth.module.ts       # Módulo de autenticación
│   │   ├── jwt.strategy.ts      # Estrategia JWT Passport
│   │   └── jwt-auth.guard.ts    # Guard de autenticación
│   ├── websocket/               # WebSocket Gateway
│   │   ├── events.gateway.ts    # Gateway de eventos
│   │   └── websocket.module.ts  # Módulo WebSocket
│   ├── prisma/                  # Módulo Prisma
│   │   ├── prisma.service.ts    # Servicio de Prisma
│   │   └── prisma.module.ts     # Módulo global de Prisma
│   ├── common/                  # Utilidades comunes
│   │   └── decorators/
│   │       └── current-user.decorator.ts
│   ├── app.module.ts            # Módulo principal
│   └── main.ts                  # Archivo de entrada
├── prisma/
│   └── schema.prisma            # Esquema de base de datos
├── .env                         # Variables de entorno
├── package.json
├── tsconfig.json
└── nest-cli.json
```

---

## Diferencias Clave con Express

### 1. Decoradores en lugar de funciones

**Express:**
```typescript
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  // ...
});
```

**NestJS:**
```typescript
@Post('login')
async login(@Body() loginDto: LoginDto) {
  return this.authService.login(loginDto);
}
```

### 2. Validación automática

NestJS valida automáticamente los datos usando decoradores:

```typescript
export class RegisterDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsString()
  name: string;

  @IsEnum(UserRole)
  role: UserRole;
}
```

### 3. Inyección de dependencias

NestJS usa inyección de dependencias por constructor:

```typescript
@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}
}
```

### 4. Guards para autenticación

NestJS usa Guards en lugar de middleware:

```typescript
@UseGuards(JwtAuthGuard)
@Get('me')
async getMe(@Request() req) {
  return this.authService.getUserById(req.user.id);
}
```

---

## API Endpoints (Idénticos en ambos backends)

### Autenticación

- `POST /api/auth/register` - Registrar usuario
- `POST /api/auth/login` - Iniciar sesión
- `GET /api/auth/me` - Obtener perfil (requiere token)
- `PATCH /api/auth/profile` - Actualizar perfil (requiere token)
- `GET /api/auth/students` - Lista de estudiantes (requiere token)

### WebSocket Events

- `join-battle` - Unirse a una batalla
- `leave-battle` - Salir de una batalla
- `battle-start` - Iniciar batalla
- `answer-submitted` - Enviar respuesta
- `battle-end` - Terminar batalla

---

## Testing

### Health Check

```bash
# Express Backend
curl http://localhost:3000/api/health

# NestJS Backend
curl http://localhost:4000/api/health
```

### Test de autenticación

```bash
# Registro
curl -X POST http://localhost:4000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "123456",
    "name": "Test User",
    "role": "STUDENT"
  }'

# Login
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "123456"
  }'
```

---

## Comandos útiles

### Prisma

```bash
# Generar cliente Prisma
npm run prisma:generate

# Sincronizar base de datos
npm run prisma:push

# Abrir Prisma Studio
npm run prisma:studio
```

### Desarrollo

```bash
# Iniciar en modo desarrollo
npm run dev

# Compilar
npm run build

# Iniciar en producción
npm run start:prod

# Debug mode
npm run start:debug
```

---

## Ventajas de NestJS

1. **Tipado fuerte** - TypeScript nativo con decoradores
2. **Validación automática** - Class Validator integrado
3. **Arquitectura modular** - Código más organizado
4. **Documentación automática** - Swagger integrado (fácil de agregar)
5. **Testing** - Herramientas de testing integradas
6. **Escalabilidad** - Mejor estructura para proyectos grandes
7. **Microservicios** - Soporte nativo para arquitectura de microservicios

---

## Próximos Pasos

### Para agregar más funcionalidad:

1. **Generar módulo** con NestJS CLI:
```bash
cd src/backend-nestjs
npx nest generate module battles
npx nest generate controller battles
npx nest generate service battles
```

2. **Crear DTOs** en `src/battles/dto/`
3. **Implementar lógica** en el servicio
4. **Agregar rutas** en el controlador
5. **Importar módulo** en `app.module.ts`

---

## Solución de Problemas

### Error: Cannot find module '@nestjs/core'

```bash
cd src/backend-nestjs
npm install
```

### Error: Prisma Client not initialized

```bash
npm run prisma:generate
npm run prisma:push
```

### Error: Port 4000 already in use

```bash
# Windows
netstat -ano | findstr :4000
taskkill /F /PID <PID>

# Linux/Mac
lsof -i :4000
kill -9 <PID>
```

---

## Recursos

- [Documentación de NestJS](https://docs.nestjs.com/)
- [Prisma con NestJS](https://docs.nestjs.com/recipes/prisma)
- [JWT con NestJS](https://docs.nestjs.com/security/authentication)
- [WebSockets con NestJS](https://docs.nestjs.com/websockets/gateways)

---

## Notas Importantes

- **Ambos backends pueden correr simultáneamente** en puertos diferentes
- **Comparten la misma base de datos** PostgreSQL
- **El frontend solo se puede conectar a uno a la vez**
- **Los datos son compatibles** entre ambos backends
- **Las credenciales JWT son compatibles** si usan el mismo `JWT_SECRET`

---

## Soporte

Si tienes problemas con el backend NestJS:

1. Verifica que todas las dependencias estén instaladas
2. Confirma que el archivo `.env` existe y tiene los valores correctos
3. Asegúrate de que PostgreSQL está corriendo
4. Ejecuta `npm run prisma:generate` antes de iniciar
5. Revisa los logs en la consola para errores específicos
