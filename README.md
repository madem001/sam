# EduBattle Arena

Plataforma educativa interactiva de batallas de trivia en tiempo real para profesores y estudiantes.

## ✅ ESTADO ACTUAL DEL PROYECTO

Este proyecto está **CONFIGURADO** para funcionar con backend local Node.js (sin Supabase).

### ✅ APIs Habilitadas:
- ✅ Cliente API completo en `src/frontend/lib/localApi.ts`
- ✅ Backend con Node.js + Express + Prisma
- ✅ Sistema de autenticación JWT
- ✅ Endpoints de batallas implementados
- ✅ WebSocket para tiempo real con Socket.IO
- ✅ Build funciona correctamente

### 📊 Endpoints Implementados:
- ✅ Auth: registro, login, perfil, listar estudiantes
- ✅ Batallas: crear, unirse, iniciar, responder, terminar, resultados
- ✅ WebSocket: eventos en tiempo real

---

## 🚀 INICIO RÁPIDO

### Requisitos Previos

- Node.js 18+
- PostgreSQL 14+
- npm

### Instalación Paso a Paso

**Consulta la guía completa:** [CONFIGURACION_LOCAL.md](./CONFIGURACION_LOCAL.md)

#### Resumen Rápido:

1. **Crear base de datos PostgreSQL:**
   ```sql
   CREATE DATABASE edubattle;
   ```

2. **Configurar variables de entorno:**
   ```bash
   # Backend: src/backend/.env
   cp src/backend/.env.example src/backend/.env
   # Editar DATABASE_URL y JWT_SECRET

   # Frontend: .env
   cp .env.example .env
   # VITE_API_URL=http://localhost:3001/api
   ```

3. **Instalar y migrar:**
   ```bash
   npm run setup
   ```

4. **Ejecutar:**
   ```bash
   npm run dev
   ```

5. **Verificar:**
   - Backend: http://localhost:3001/api/health
   - Frontend: http://localhost:5173

---

## 📚 DOCUMENTACIÓN

- **[CONFIGURACION_LOCAL.md](./CONFIGURACION_LOCAL.md)** - Guía paso a paso completa
- **[RESUMEN_CONFIGURACION.md](./RESUMEN_CONFIGURACION.md)** - APIs y estado actual
- **[GUIA_CONEXION_BACKEND.md](./GUIA_CONEXION_BACKEND.md)** - Cómo agregar nuevas funcionalidades

**Pasos resumidos:**
1. Instalar PostgreSQL localmente
2. Configurar backend y aplicar migraciones de Prisma
3. Implementar ~15 endpoints faltantes en el backend
4. Reescribir ~40 componentes del frontend para usar API REST
5. Configurar WebSocket para comunicación en tiempo real

⏱️ **Tiempo estimado: 8-12 horas de desarrollo**

---

## 🛠️ Tecnologías

### Frontend
- React 18 + TypeScript
- Ionic React 7
- Vite 6
- TailwindCSS
- Socket.IO Client
- Axios

### Backend (Preparado pero no completamente implementado)
- Node.js + Express
- Prisma ORM
- PostgreSQL 14+
- JWT para autenticación
- Bcrypt para encriptación
- Socket.IO para realtime

---

## 📁 Estructura del Proyecto

```
edubattle-arena/
├── src/
│   ├── frontend/          # Frontend React
│   │   ├── components/
│   │   │   ├── student/   # 6 componentes de estudiantes
│   │   │   ├── teacher/   # 13 componentes de profesores
│   │   │   └── shared/    # 15 componentes compartidos
│   │   ├── lib/           # APIs y utilidades
│   │   └── types/         # Tipos TypeScript
│   │
│   └── backend/           # Backend Node.js (preparado)
│       ├── prisma/        # Schema de base de datos
│       │   └── schema.prisma  # Schema completo con todas las tablas
│       └── src/
│           ├── config/
│           ├── controllers/
│           ├── routes/
│           ├── services/
│           ├── middleware/
│           └── websocket/
│
├── README.md                      # Este archivo
├── GUIA_MIGRACION_LOCAL.md        # Guía completa para setup 100% local
├── DOCUMENTACION.md               # Documentación técnica (Supabase)
├── ESTRUCTURA.txt                 # Árbol detallado de archivos
└── package.json                   # Con scripts para frontend y backend
```

---

## 📚 Documentación

- **[README.md](./README.md)** - Este archivo (inicio rápido y opciones)
- **[GUIA_MIGRACION_LOCAL.md](./GUIA_MIGRACION_LOCAL.md)** - Guía paso a paso para migrar a 100% local
- **[DOCUMENTACION.md](./DOCUMENTACION.md)** - Documentación técnica con Supabase
- **[ESTRUCTURA.txt](./ESTRUCTURA.txt)** - Estructura detallada del proyecto

---

## 🎯 Características Principales

### Para Profesores
- ✅ Crear batallas con preguntas personalizadas (5-20 preguntas)
- ✅ Generar códigos de batalla únicos
- ✅ Panel de control en tiempo real
- ✅ Modo "All for All" (todos contra todos)
- ✅ Sistema de bloqueo de sala (un juego activo a la vez)
- ✅ Sistema de recompensas y profesor cards
- ✅ Banco de preguntas personalizado
- ✅ Gestión de estudiantes

### Para Estudiantes
- ✅ Unirse a batallas con códigos de 6 caracteres
- ✅ Responder preguntas en tiempo real
- ✅ Sistema de puntuación y ranking en vivo
- ✅ Colección de profesor cards
- ✅ Sistema de logros (achievements)
- ✅ Perfil personalizable con avatares

---

## 🚦 Instalación Rápida (Requiere Supabase)

```bash
# 1. Clonar repositorio
git clone [tu-repositorio]
cd edubattle-arena

# 2. Instalar dependencias
npm install

# 3. Configurar .env
cp .env.example .env
# Editar .env con tus credenciales de Supabase

# 4. Ejecutar en desarrollo
npm run dev
```

---

## 🔧 Setup Local Completo (Sin Supabase)

```bash
# 1. Instalar dependencias del proyecto
npm install

# 2. Instalar PostgreSQL localmente
# macOS: brew install postgresql@14
# Linux: sudo apt install postgresql
# Windows: descargar desde postgresql.org

# 3. Crear base de datos
psql -U postgres
CREATE DATABASE edubattle;

# 4. Configurar e instalar backend
npm run backend:install

# 5. Aplicar migraciones de Prisma
npm run backend:migrate

# 6. IMPORTANTE: Completar implementación de endpoints
# Ver GUIA_MIGRACION_LOCAL.md para detalles

# 7. Ejecutar backend y frontend simultáneamente
npm run dev
```

---

## 💡 Recomendación

**Para empezar rápidamente**: Usa **Supabase** (es gratuito hasta 500MB de base de datos).
- ✅ Funciona inmediatamente
- ✅ Sin configuración compleja
- ✅ Realtime incluido
- ✅ Autenticación lista

**Para tener control total**: Sigue la [GUIA_MIGRACION_LOCAL.md](./GUIA_MIGRACION_LOCAL.md)
- ⚠️ Requiere 8-12 horas de desarrollo
- ⚠️ Necesitas experiencia con Node.js, Express, Prisma
- ⚠️ Debes implementar todos los endpoints faltantes
- ✅ Control total de tus datos
- ✅ Sin dependencias externas

---

## 📄 Licencia

MIT

---

## 🆘 Soporte

Si decides hacer la migración a 100% local y necesitas ayuda:
1. Lee completamente [GUIA_MIGRACION_LOCAL.md](./GUIA_MIGRACION_LOCAL.md)
2. Implementa paso por paso
3. El schema de Prisma ya incluye TODAS las tablas necesarias
4. Usa el código del backend existente como referencia
