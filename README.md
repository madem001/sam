# EduBattle Arena

Plataforma educativa interactiva de batallas de trivia en tiempo real para profesores y estudiantes.

## ⚠️ ESTADO ACTUAL DEL PROYECTO

Este proyecto está **parcialmente configurado** para funcionar 100% local (sin Supabase ni servicios en la nube).

### ✅ Lo que está listo:
- ✅ Estructura de carpetas organizada
- ✅ Backend con Node.js + Express + Prisma
- ✅ Schema de base de datos completo en Prisma
- ✅ Configuración de PostgreSQL local
- ✅ Sistema de autenticación con JWT

### ⚠️ Lo que falta para funcionar 100% local:
- ⚠️ Implementar ~15 endpoints REST faltantes en el backend
- ⚠️ Reescribir ~40 archivos del frontend para usar API REST en lugar de Supabase
- ⚠️ Configurar realtime con WebSocket
- ⚠️ Tiempo estimado: **8-12 horas de trabajo de desarrollo**

---

## 🚀 OPCIONES PARA USAR EL PROYECTO

### Opción 1: Usar con Supabase (Recomendado - Funciona Ya) ✅

Si quieres usar el proyecto inmediatamente sin modificaciones:

1. Crear cuenta gratuita en [Supabase](https://supabase.com)
2. Crear proyecto nuevo en Supabase
3. Aplicar migraciones de base de datos (contactar para obtener los scripts SQL)
4. Configurar .env con credenciales de Supabase:
   ```env
   VITE_SUPABASE_URL=tu_url_de_supabase
   VITE_SUPABASE_ANON_KEY=tu_anon_key
   ```
5. Instalar y ejecutar:
   ```bash
   npm install
   npm run dev
   ```

El proyecto funcionará al 100% inmediatamente.

### Opción 2: Migrar a Setup 100% Local (Requiere Desarrollo) ⚠️

Si quieres tener todo local sin depender de servicios en la nube:

**Ver la guía completa**: [GUIA_MIGRACION_LOCAL.md](./GUIA_MIGRACION_LOCAL.md)

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
