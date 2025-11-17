# Guía de Conexión: Frontend con Backend NestJS

## ✅ Estado Actual

**El frontend está conectado al backend NestJS en el puerto 4000**

---

## 🚀 Iniciar el Sistema Completo

Ejecuta el script:

```bash
INICIAR-NESTJS.bat
```

Esto iniciará:
- **Frontend** en `http://localhost:8000`
- **Backend NestJS** en `http://localhost:4000`

---

## ✨ Funcionalidad Implementada

### ✅ Autenticación Completa
- Registro de usuarios (estudiantes y profesores)
- Inicio de sesión
- Obtener perfil
- Actualizar perfil
- Lista de estudiantes

### ✅ Sistema de Batallas
- Crear batallas con preguntas personalizadas
- Listar batallas activas
- Ver batallas del profesor
- Unirse a grupos
- Iniciar batallas
- Enviar respuestas
- Calcular puntajes automáticamente
- Terminar batallas

### ✅ WebSocket en Tiempo Real
- Notificaciones cuando jugadores se unen/salen
- Inicio de batalla en tiempo real
- Resultados de respuestas en vivo
- Fin de batalla

---

## 🎮 Flujo de Prueba Completo

### 1️⃣ Registrar Usuario Estudiante

1. Abre `http://localhost:8000`
2. Haz clic en "Crear cuenta"
3. Completa:
   - Email: `estudiante@test.com`
   - Contraseña: `123456`
   - Nombre: `Estudiante Test`
   - Rol: **Estudiante**
4. Registrarse

✅ Sesión iniciada automáticamente

### 2️⃣ Registrar Usuario Profesor

1. Cierra sesión
2. Registra nuevo usuario:
   - Email: `profesor@test.com`
   - Contraseña: `123456`
   - Nombre: `Profesor Test`
   - Rol: **Profesor**

✅ Sesión iniciada como profesor

### 3️⃣ Crear Batalla

1. Como profesor, ve a "Gestionar Batallas"
2. Click en "Nueva Batalla"
3. Completa:
   - Nombre: `Mi Primera Batalla`
   - Número de preguntas: `5`
   - Número de grupos: `3`
4. Agrega 5 preguntas con sus respuestas
5. Click en "Crear Batalla"

✅ Batalla creada con código de grupos

### 4️⃣ Unirse a Batalla

1. Cierra sesión e inicia como estudiante
2. Ve a "Unirse a Batalla"
3. Busca la batalla activa
4. Selecciona un grupo (1, 2 o 3)
5. Click en "Unirse"

✅ Ahora estás en el grupo esperando que inicie

### 5️⃣ Iniciar Batalla

1. Como profesor, ve a la batalla
2. Click en "Iniciar Batalla"

✅ Los estudiantes ven las preguntas

### 6️⃣ Responder Preguntas

1. Como estudiante, lee la pregunta
2. Selecciona una respuesta
3. Click en "Enviar"

✅ Puntos actualizados si es correcta

### 7️⃣ Ver Resultados

1. Completa todas las preguntas
2. Como profesor, click en "Terminar Batalla"
3. Ve el ranking final de grupos

✅ Batalla terminada exitosamente

---

## 📋 API Endpoints Disponibles

### Autenticación
- `POST /api/auth/register` - Registrar usuario
- `POST /api/auth/login` - Iniciar sesión  
- `GET /api/auth/me` - Obtener perfil (requiere token)
- `PATCH /api/auth/profile` - Actualizar perfil (requiere token)
- `GET /api/auth/students` - Lista estudiantes (requiere token)

### Batallas
- `POST /api/battles` - Crear batalla (requiere auth profesor)
- `GET /api/battles/active` - Batallas activas (público)
- `GET /api/battles/teacher` - Batallas del profesor (requiere auth)
- `GET /api/battles/:id` - Detalle batalla
- `GET /api/battles/:id/groups` - Grupos de batalla
- `GET /api/battles/:id/questions` - Preguntas
- `POST /api/battles/:id/join` - Unirse (requiere auth)
- `POST /api/battles/:id/start` - Iniciar (requiere auth)
- `POST /api/battles/:id/answer` - Responder (requiere auth)
- `POST /api/battles/:id/end` - Terminar (requiere auth)

---

## 🔄 Cambiar entre Backends

### Backend Express (Puerto 3000):

Edita `/src/frontend/lib/localApi.ts`:

```typescript
const API_URL = 'http://localhost:3000/api';
const WS_URL = 'http://localhost:3000';
```

Luego:
```bash
KILL-PORTS.bat
INICIAR-TODO.bat
```

### Backend NestJS (Puerto 4000): ✅ ACTUAL

Edita `/src/frontend/lib/localApi.ts`:

```typescript
const API_URL = 'http://localhost:4000/api';
const WS_URL = 'http://localhost:4000';
```

Luego:
```bash
KILL-PORTS.bat
INICIAR-NESTJS.bat
```

---

## 🔍 Verificar Conexión

```bash
# Backend NestJS
curl http://localhost:4000/api/auth/students

# Backend Express  
curl http://localhost:3000/api/auth/students
```

---

## 💾 Base de Datos

Ambos backends usan PostgreSQL:
- Host: localhost
- Puerto: 5432
- Database: edubattle
- Usuario: postgres
- Contraseña: postgres

---

## 🐛 Solución de Problemas

### Backend no responde:

```bash
KILL-PORTS.bat
INICIAR-NESTJS.bat
```

### Error de CORS:

Verifica que `.env` tenga:
```
CORS_ORIGIN=http://localhost:8000
```

### Error de Prisma:

```bash
cd src/backend-nestjs
npm run prisma:generate
```

---

## ✅ Resumen

- Frontend conectado a NestJS (puerto 4000)
- Backend NestJS completamente funcional  
- Autenticación, batallas y WebSocket OK
- Listo para crear usuarios y batallas
- ¡Todo funcionando al 100%!
