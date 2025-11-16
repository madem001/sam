# 🗄️ Configuración de Base de Datos Local con Node.js + Prisma + PostgreSQL

Esta guía te explica cómo migrar de Supabase a una base de datos PostgreSQL local usando Prisma ORM.

## 📋 Índice

1. [Visión General](#visión-general)
2. [Instalación Rápida](#instalación-rápida)
3. [Arquitectura del Sistema](#arquitectura-del-sistema)
4. [Migración de Supabase a Prisma](#migración-de-supabase-a-prisma)
5. [Comandos Útiles](#comandos-útiles)

---

## 🎯 Visión General

**Antes (Supabase):**
```
Frontend (React) → Supabase Client → Supabase Cloud (PostgreSQL)
```

**Ahora (Local):**
```
Frontend (React) → Backend API (Express) → Prisma → PostgreSQL Local
```

### Ventajas del Setup Local:

✅ **Control Total**: Tienes acceso completo a la base de datos
✅ **Desarrollo Offline**: No necesitas internet para desarrollar
✅ **Más Rápido**: Sin latencia de red
✅ **Aprendizaje**: Entiendes mejor cómo funciona todo
✅ **Gratuito**: No dependes de servicios en la nube

---

## 🚀 Instalación Rápida

### Opción 1: Script Automático (Más Fácil)

```bash
cd backend
chmod +x setup.sh
./setup.sh
```

Sigue las instrucciones en pantalla y ¡listo!

### Opción 2: Paso a Paso Manual

Ver [backend/QUICK_START.md](backend/QUICK_START.md) para instrucciones detalladas.

---

## 🏗️ Arquitectura del Sistema

### Estructura Completa

```
edubattle-arena/
├── 📱 Frontend (React + Vite)
│   ├── src/
│   ├── components/
│   └── lib/
│       ├── api.ts          # Llamadas a Supabase (OLD)
│       └── supabase.ts     # Cliente Supabase (OLD)
│
└── 🔧 Backend (Node.js + Express + Prisma)
    ├── prisma/
    │   └── schema.prisma   # Definición de base de datos
    ├── src/
    │   ├── server.ts       # Servidor Express
    │   ├── routes/         # Rutas de API
    │   ├── controllers/    # Lógica de negocio
    │   └── services/       # Servicios
    └── .env                # Configuración
```

### Flujo de Datos

```
1. Usuario hace login
   ↓
2. Frontend envía POST /api/auth/login
   ↓
3. Backend valida con Prisma
   ↓
4. PostgreSQL retorna usuario
   ↓
5. Backend genera JWT
   ↓
6. Frontend guarda token
   ↓
7. Frontend usa token en requests subsecuentes
```

---

## 🔄 Migración de Supabase a Prisma

### Comparación de Código

#### Antes (Supabase):

```typescript
// lib/supabase.ts
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.VITE_SUPABASE_ANON_KEY!
);

// Obtener batallas
const { data: battles } = await supabase
  .from('battles')
  .select('*')
  .eq('teacher_id', teacherId);
```

#### Ahora (Prisma):

```typescript
// Backend: src/services/battleService.ts
import { prisma } from '../config/database';

// Obtener batallas
const battles = await prisma.battle.findMany({
  where: {
    teacherId: teacherId
  },
  include: {
    teacher: true,
    groups: true,
    questions: true
  }
});
```

### Mapeo de Operaciones

| Supabase | Prisma |
|----------|--------|
| `.select('*')` | `.findMany()` |
| `.select('*').eq('id', id).maybeSingle()` | `.findUnique({ where: { id } })` |
| `.insert({ ... })` | `.create({ data: { ... } })` |
| `.update({ ... }).eq('id', id)` | `.update({ where: { id }, data: { ... } })` |
| `.delete().eq('id', id)` | `.delete({ where: { id } })` |

---

## 📊 Esquema de Base de Datos

El archivo `backend/prisma/schema.prisma` define TODAS las tablas:

### Modelos Principales

#### User (profiles)
```prisma
model User {
  id           String   @id @default(cuid())
  email        String   @unique
  password     String
  name         String
  role         UserRole // STUDENT | TEACHER
  points       Int      @default(0)
  level        Int      @default(1)
  // ... más campos
}
```

#### Battle
```prisma
model Battle {
  id                   String       @id @default(cuid())
  name                 String
  teacherId            String
  teacher              User         @relation(fields: [teacherId], references: [id])
  battleCode           String?      @unique
  status               BattleStatus @default(WAITING)
  // ... más campos
}
```

#### ProfessorCard
```prisma
model ProfessorCard {
  id           String   @id @default(uuid())
  teacherId    String
  teacher      User     @relation(fields: [teacherId], references: [id])
  name         String
  unlockPoints Int      @default(100)
  // ... más campos
}
```

#### StudentProfessorPoint
```prisma
model StudentProfessorPoint {
  id          String   @id @default(cuid())
  studentId   String
  professorId String
  points      Int      @default(0)
  // ... más campos
}
```

Y 11 modelos más: `BattleGroup`, `GroupMember`, `BattleQuestion`, `BattleAnswer`, `QuestionSet`, `Question`, `StudentProfessorCard`, `ProfessorReward`, `RewardRedemption`, `Achievement`, `Notification`.

---

## 🛠️ Comandos Útiles

### Base de Datos

```bash
# Crear la base de datos
psql -U postgres -c "CREATE DATABASE edubattle_arena;"

# Conectarse a la BD
psql -U postgres -d edubattle_arena

# Ver todas las tablas
\dt

# Ver estructura de una tabla
\d profiles

# Salir de psql
\q
```

### Prisma

```bash
# Generar cliente (después de cambios en schema.prisma)
npx prisma generate

# Sincronizar schema con BD (desarrollo)
npx prisma db push

# Crear migración (recomendado para producción)
npx prisma migrate dev --name nombre_descriptivo

# Ver estado de migraciones
npx prisma migrate status

# Abrir interfaz visual (Prisma Studio)
npx prisma studio

# Formatear schema.prisma
npx prisma format

# Resetear BD (CUIDADO: borra todos los datos)
npx prisma migrate reset
```

### Backend

```bash
# Desarrollo (con hot-reload)
cd backend
npm run dev

# Producción
npm run build
npm start

# Ver logs en tiempo real
npm run dev | grep "🚀"
```

### PostgreSQL

```bash
# Iniciar PostgreSQL
sudo systemctl start postgresql

# Detener PostgreSQL
sudo systemctl stop postgresql

# Estado de PostgreSQL
sudo systemctl status postgresql

# Reiniciar PostgreSQL
sudo systemctl restart postgresql

# Hacer backup
pg_dump -U postgres edubattle_arena > backup.sql

# Restaurar backup
psql -U postgres -d edubattle_arena < backup.sql
```

---

## 🔐 Seguridad

### Variables de Entorno

**NUNCA** subas el archivo `.env` a Git. Contiene credenciales sensibles:

```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/edubattle_arena"
JWT_SECRET="tu-clave-super-secreta"
```

### JWT Tokens

El backend genera tokens JWT para autenticación:

```typescript
// Login exitoso
{
  "user": { ... },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}

// Usar token en requests
headers: {
  "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

## 🧪 Testing

### Probar el Backend

```bash
# Registrar usuario
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "name": "Test User",
    "role": "TEACHER"
  }'

# Login
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'

# Crear batalla (con token)
curl -X POST http://localhost:3001/api/battles \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TU_TOKEN_AQUI" \
  -d '{
    "name": "Mi Primera Batalla",
    "questionCount": 10,
    "groupCount": 5,
    "questions": [...]
  }'
```

---

## 🐛 Troubleshooting

### Error: "Can't reach database server"

```bash
# Verificar que PostgreSQL esté corriendo
sudo systemctl status postgresql

# Iniciar PostgreSQL
sudo systemctl start postgresql
```

### Error: "Database does not exist"

```bash
# Crear la base de datos
psql -U postgres -c "CREATE DATABASE edubattle_arena;"
```

### Error: "role 'postgres' does not exist"

```bash
# Crear usuario postgres
sudo -u postgres createuser --superuser $USER
```

### Error: "Prisma Client not generated"

```bash
# Generar cliente Prisma
cd backend
npx prisma generate
```

### Error: Puerto 3001 ya en uso

```bash
# Encontrar proceso
lsof -ti:3001

# Matar proceso
lsof -ti:3001 | xargs kill -9

# O cambiar puerto en .env
PORT=3002
```

---

## 📚 Recursos Adicionales

- **Prisma Docs**: https://www.prisma.io/docs
- **PostgreSQL Docs**: https://www.postgresql.org/docs/
- **Express.js Docs**: https://expressjs.com/
- **Node.js Docs**: https://nodejs.org/docs/

### Tutoriales Recomendados

- [Prisma Quickstart](https://www.prisma.io/docs/getting-started/quickstart)
- [PostgreSQL Tutorial](https://www.postgresqltutorial.com/)
- [REST API with Express + Prisma](https://www.prisma.io/docs/getting-started/setup-prisma/start-from-scratch/relational-databases-typescript-postgresql)

---

## ✅ Checklist Final

- [ ] PostgreSQL instalado y corriendo
- [ ] Base de datos `edubattle_arena` creada
- [ ] Backend configurado (`.env` listo)
- [ ] Dependencias instaladas (`npm install`)
- [ ] Cliente Prisma generado (`npx prisma generate`)
- [ ] Tablas creadas (`npx prisma db push`)
- [ ] Backend corriendo (`npm run dev` en http://localhost:3001)
- [ ] Frontend actualizado para usar backend local
- [ ] Login funciona correctamente
- [ ] Batallas se crean y funcionan

---

## 🎉 ¡Éxito!

Si completaste todos los pasos, ahora tienes:

✅ Base de datos PostgreSQL local funcionando
✅ Backend API con Node.js + Express + Prisma
✅ Todas las tablas creadas con relaciones
✅ Sistema de autenticación JWT
✅ Frontend conectado al backend local

**¡Felicitaciones!** Ahora puedes desarrollar sin depender de servicios externos.

---

## 🤝 Contribuir

Si encuentras errores o mejoras en esta documentación:

1. Documenta el problema
2. Propón una solución
3. Actualiza la documentación
4. Comparte con el equipo

---

¿Necesitas ayuda? Revisa:
- [backend/README.md](backend/README.md) - Documentación completa del backend
- [backend/QUICK_START.md](backend/QUICK_START.md) - Guía de inicio rápido
- Sección de Troubleshooting arriba

¡Buena suerte con tu desarrollo! 🚀
