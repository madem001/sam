# 🚀 CONFIGURACIÓN LOCAL - EDUBATTLE ARENA

Esta guía te llevará paso a paso para configurar y ejecutar EduBattle Arena con backend Node.js local.

---

## 📋 REQUISITOS PREVIOS

Antes de empezar, asegúrate de tener instalado:

- ✅ **Node.js** 18+ ([Descargar](https://nodejs.org/))
- ✅ **PostgreSQL** 14+ ([Descargar](https://www.postgresql.org/download/))
- ✅ **npm** (viene con Node.js)

Para verificar las instalaciones:

```bash
node --version    # Debe ser v18 o superior
npm --version     # Cualquier versión reciente
psql --version    # Debe ser 14 o superior
```

---

## 🗄️ PASO 1: CONFIGURAR POSTGRESQL

### 1.1 Iniciar PostgreSQL

**En Windows:**
```bash
# PostgreSQL debería iniciarse automáticamente
# Si no, busca "Services" y inicia el servicio "postgresql-x64-14"
```

**En macOS:**
```bash
brew services start postgresql@14
```

**En Linux:**
```bash
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

### 1.2 Crear Base de Datos

Conéctate a PostgreSQL:

```bash
# Como usuario postgres
psql -U postgres
```

Dentro de psql, ejecuta:

```sql
-- Crear base de datos
CREATE DATABASE edubattle;

-- Crear usuario (opcional, puedes usar postgres)
CREATE USER edubattle_user WITH PASSWORD 'tu_password_seguro';

-- Dar permisos
GRANT ALL PRIVILEGES ON DATABASE edubattle TO edubattle_user;

-- Salir
\q
```

### 1.3 Verificar Conexión

```bash
psql -U postgres -d edubattle -c "SELECT version();"
```

Si ves la versión de PostgreSQL, ¡perfecto! ✅

---

## ⚙️ PASO 2: CONFIGURAR BACKEND

### 2.1 Instalar Dependencias del Backend

```bash
cd src/backend
npm install
```

### 2.2 Configurar Variables de Entorno

Crea el archivo `.env` en `src/backend/`:

```bash
# En src/backend/
cp .env.example .env
```

Edita `src/backend/.env` con tu configuración:

```env
# Base de datos
DATABASE_URL="postgresql://postgres:tu_password@localhost:5432/edubattle"

# JWT
JWT_SECRET="tu-secret-super-seguro-cambiar-en-produccion"

# Server
PORT=3001
NODE_ENV=development

# CORS
CORS_ORIGIN=http://localhost:5173
```

**IMPORTANTE:** Reemplaza `tu_password` con la contraseña de tu usuario PostgreSQL.

### 2.3 Ejecutar Migraciones de Prisma

```bash
# Desde src/backend/
npx prisma generate
npx prisma db push
```

Deberías ver:

```
✔ Generated Prisma Client
🚀 Your database is now in sync with your Prisma schema.
```

### 2.4 (Opcional) Verificar Base de Datos

```bash
# Desde src/backend/
npx prisma studio
```

Esto abre una interfaz web en `http://localhost:5555` donde puedes ver tus tablas.

---

## 🎨 PASO 3: CONFIGURAR FRONTEND

### 3.1 Instalar Dependencias del Frontend

```bash
# Desde la RAÍZ del proyecto
npm install
```

### 3.2 Configurar Variables de Entorno

Crea el archivo `.env` en la RAÍZ del proyecto:

```bash
# En la raíz
cp .env.example .env
```

Edita `.env`:

```env
# URLs del backend local
VITE_API_URL=http://localhost:3001/api
VITE_WS_URL=http://localhost:3001
```

---

## 🚀 PASO 4: EJECUTAR EL PROYECTO

### Opción A: Ejecutar Todo Junto (Recomendado)

Desde la RAÍZ del proyecto:

```bash
npm run dev
```

Esto ejecuta:
- ✅ Backend en `http://localhost:3001`
- ✅ Frontend en `http://localhost:5173`

Verás algo como:

```
[backend]  🚀 Server running on port 3001
[backend]  📡 WebSocket ready for connections
[frontend] VITE v6.4.1 ready in 523 ms
[frontend] ➜ Local: http://localhost:5173/
```

### Opción B: Ejecutar por Separado

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

## 🧪 PASO 5: PROBAR LA CONEXIÓN

### 5.1 Verificar API del Backend

Abre en tu navegador o usa curl:

```bash
curl http://localhost:3001/api/health
```

Deberías ver:
```json
{
  "status": "ok",
  "message": "EduBattle Arena API is running"
}
```

### 5.2 Crear un Usuario de Prueba

Usa Postman, Insomnia o curl:

```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "profesor@test.com",
    "password": "123456",
    "name": "Profesor Test",
    "role": "TEACHER"
  }'
```

Deberías recibir:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "...",
    "email": "profesor@test.com",
    "name": "Profesor Test",
    "role": "TEACHER"
  }
}
```

### 5.3 Probar el Frontend

1. Abre `http://localhost:5173` en tu navegador
2. Deberías ver la pantalla de login
3. Haz clic en "Registrarse"
4. Crea una cuenta de estudiante o profesor
5. Si todo funciona, ¡estás listo! 🎉

---

## 📊 VERIFICAR WEBSOCKET

Abre la consola del navegador (F12) y busca:

```
✅ WebSocket conectado: xxxx-xxxx-xxxx
```

Si ves este mensaje, el WebSocket está funcionando correctamente.

---

## 🔧 SOLUCIÓN DE PROBLEMAS

### ❌ Error: "Cannot find module 'express'"

```bash
cd src/backend
npm install
```

### ❌ Error: "Connection refused" en PostgreSQL

1. Verifica que PostgreSQL esté corriendo:
   ```bash
   # Windows
   services.msc  # Busca postgresql

   # macOS
   brew services list

   # Linux
   sudo systemctl status postgresql
   ```

2. Verifica la URL de conexión en `src/backend/.env`

### ❌ Error: "P1001: Can't reach database server"

Tu `DATABASE_URL` está mal configurada. Verifica:

- Host: `localhost`
- Puerto: `5432` (default de PostgreSQL)
- Usuario y contraseña correctos
- Base de datos existe

### ❌ Error: "JWT_SECRET is not defined"

Asegúrate de que el archivo `src/backend/.env` existe y tiene `JWT_SECRET` definido.

### ❌ Frontend no se conecta al backend

1. Verifica que el backend esté corriendo en el puerto 3001
2. Revisa el archivo `.env` en la RAÍZ del proyecto
3. Asegúrate de que `VITE_API_URL=http://localhost:3001/api`
4. Recarga el frontend con `Ctrl+C` y `npm run dev:frontend`

### ❌ CORS Error

Verifica en `src/backend/.env`:
```env
CORS_ORIGIN=http://localhost:5173
```

---

## 📁 ESTRUCTURA DE ARCHIVOS DE CONFIGURACIÓN

```
edubattle-arena/
├── .env                          # ← Frontend config
├── src/
│   └── backend/
│       ├── .env                  # ← Backend config
│       ├── prisma/
│       │   └── schema.prisma     # ← Database schema
│       └── src/
│           ├── server.ts         # ← Entry point
│           ├── routes/
│           ├── controllers/
│           └── services/
└── src/frontend/
    └── lib/
        ├── localApi.ts           # ← API client (nuevo)
        └── api.ts                # ← Re-exports localApi
```

---

## 🎯 COMANDOS ÚTILES

### Backend

```bash
# Instalar dependencias
cd src/backend && npm install

# Ejecutar migraciones
cd src/backend && npx prisma db push

# Regenerar Prisma Client
cd src/backend && npx prisma generate

# Ver base de datos
cd src/backend && npx prisma studio

# Ejecutar backend solo
cd src/backend && npm run dev

# Ver logs del backend
cd src/backend && npm run dev | grep "🚀"
```

### Frontend

```bash
# Instalar dependencias
npm install

# Ejecutar frontend solo
npm run dev:frontend

# Build producción
npm run build

# Preview build
npm run preview
```

### Ambos

```bash
# Setup inicial completo
npm run setup

# Ejecutar todo
npm run dev
```

---

## 📊 DATOS DE PRUEBA (OPCIONAL)

Si quieres crear datos de prueba, puedes ejecutar este script SQL:

```sql
-- Crear un profesor
INSERT INTO "User" (id, email, password, name, role, "createdAt", "updatedAt")
VALUES (
  gen_random_uuid(),
  'profesor@test.com',
  -- Password: "123456" (debes hashearlo con bcrypt)
  '$2b$10$...',
  'Profesor Demo',
  'TEACHER',
  NOW(),
  NOW()
);

-- Crear estudiantes
INSERT INTO "User" (id, email, password, name, role, "createdAt", "updatedAt")
VALUES
  (gen_random_uuid(), 'estudiante1@test.com', '$2b$10$...', 'Alumno 1', 'STUDENT', NOW(), NOW()),
  (gen_random_uuid(), 'estudiante2@test.com', '$2b$10$...', 'Alumno 2', 'STUDENT', NOW(), NOW()),
  (gen_random_uuid(), 'estudiante3@test.com', '$2b$10$...', 'Alumno 3', 'STUDENT', NOW(), NOW());
```

**Mejor:** Usa la interfaz de registro del frontend.

---

## ✅ CHECKLIST FINAL

- [ ] PostgreSQL instalado y corriendo
- [ ] Base de datos `edubattle` creada
- [ ] Dependencias del backend instaladas (`cd src/backend && npm install`)
- [ ] Dependencias del frontend instaladas (`npm install`)
- [ ] Archivo `src/backend/.env` configurado
- [ ] Archivo `.env` (raíz) configurado
- [ ] Migraciones de Prisma ejecutadas (`npx prisma db push`)
- [ ] Backend corre sin errores (`npm run dev`)
- [ ] Frontend corre sin errores
- [ ] API responde en `http://localhost:3001/api/health`
- [ ] Frontend carga en `http://localhost:5173`
- [ ] Puedes registrar un usuario
- [ ] WebSocket conecta correctamente

---

## 🆘 ¿SIGUES TENIENDO PROBLEMAS?

1. **Revisa los logs**: Los errores detallados aparecen en la terminal
2. **Verifica versiones**: Usa Node.js 18+ y PostgreSQL 14+
3. **Limpia y reinstala**:
   ```bash
   rm -rf node_modules src/backend/node_modules
   npm install
   cd src/backend && npm install
   ```
4. **Verifica puertos**: Asegúrate de que 3001 y 5173 estén libres

---

## 🎉 ¡LISTO!

Si completaste todos los pasos, ahora tienes:

✅ Backend Node.js + Express + Prisma funcionando
✅ PostgreSQL configurada con todas las tablas
✅ Frontend React conectado al backend
✅ WebSocket para actualizaciones en tiempo real
✅ Sistema de autenticación JWT

**¡Ahora puedes empezar a desarrollar y crear batallas educativas!** 🚀

Para agregar nuevas funcionalidades, consulta `GUIA_CONEXION_BACKEND.md`.
