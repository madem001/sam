# 🚀 Guía de Instalación Local - EduBattle Arena

Esta guía te ayudará a configurar y ejecutar EduBattle Arena localmente con la arquitectura completa:
- **Frontend**: React + Ionic + Vite
- **Backend**: Node.js + Express + Prisma
- **Base de Datos**: PostgreSQL

---

## 📋 Requisitos Previos

Antes de comenzar, asegúrate de tener instalado:

1. **Node.js** (v18 o superior)
   ```bash
   node --version  # Debe ser v18+
   ```

2. **PostgreSQL** (v14 o superior)
   ```bash
   psql --version  # Debe ser v14+
   ```

3. **npm** o **yarn**
   ```bash
   npm --version
   ```

---

## 🗄️ Paso 1: Configurar PostgreSQL

### Opción A: PostgreSQL Local

1. **Iniciar PostgreSQL**:
   ```bash
   # macOS (con Homebrew)
   brew services start postgresql@14

   # Linux
   sudo systemctl start postgresql

   # Windows
   # Usar pgAdmin o el servicio de Windows
   ```

2. **Crear la base de datos**:
   ```bash
   psql -U postgres
   ```

   En el prompt de PostgreSQL:
   ```sql
   CREATE DATABASE edubattle;
   \q
   ```

3. **Verificar conexión**:
   ```bash
   psql -U postgres -d edubattle -c "SELECT version();"
   ```

### Opción B: PostgreSQL con Docker

```bash
docker run --name edubattle-postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=edubattle \
  -p 5432:5432 \
  -d postgres:14
```

---

## 🔧 Paso 2: Configurar el Backend

1. **Navegar a la carpeta del backend**:
   ```bash
   cd backend
   ```

2. **Instalar dependencias**:
   ```bash
   npm install
   ```

3. **Configurar variables de entorno**:
   - El archivo `.env` ya está creado con valores por defecto
   - Si necesitas modificarlo:
   ```bash
   nano .env
   ```

   Contenido del `.env`:
   ```env
   DATABASE_URL="postgresql://postgres:postgres@localhost:5432/edubattle?schema=public"
   JWT_SECRET="edubattle-secret-key-2024-change-in-production"
   PORT=3001
   NODE_ENV=development
   CORS_ORIGIN=http://localhost:5173
   ```

4. **Generar el cliente de Prisma**:
   ```bash
   npx prisma generate
   ```

5. **Ejecutar migraciones**:
   ```bash
   npx prisma db push
   ```

6. **(Opcional) Ver la base de datos**:
   ```bash
   npx prisma studio
   # Abre en http://localhost:5555
   ```

---

## 🎨 Paso 3: Configurar el Frontend

1. **Volver a la carpeta raíz**:
   ```bash
   cd ..
   ```

2. **Instalar dependencias**:
   ```bash
   npm install
   ```

3. **Verificar configuración**:
   - El archivo `.env.local` ya está configurado
   - Contenido:
   ```env
   VITE_API_URL=http://localhost:3001/api
   VITE_WS_URL=http://localhost:3001
   ```

---

## 🚀 Paso 4: Iniciar la Aplicación

### Opción A: Script Automático (Recomendado)

```bash
./start-dev.sh
```

Este script:
- ✅ Verifica que PostgreSQL esté corriendo
- ✅ Instala dependencias si es necesario
- ✅ Ejecuta las migraciones
- ✅ Inicia backend y frontend simultáneamente

### Opción B: Manual (dos terminales)

**Terminal 1 - Backend**:
```bash
cd backend
npm run dev
```
El backend correrá en: `http://localhost:3001`

**Terminal 2 - Frontend**:
```bash
npm run dev
```
El frontend correrá en: `http://localhost:5173`

---

## 📱 Paso 5: Usar con Ionic (Opcional)

Para probar con Ionic CLI y tener recarga en caliente:

```bash
npm run ionic:serve
```

---

## 🧪 Verificar que Todo Funciona

1. **Backend Health Check**:
   ```bash
   curl http://localhost:3001/api/health
   ```
   Debe responder: `{"status":"ok","message":"EduBattle Arena API is running"}`

2. **Abrir el Frontend**:
   - Ve a `http://localhost:5173`
   - Deberías ver la pantalla de login

3. **Crear una cuenta de prueba**:
   - Regístrate como estudiante o profesor
   - Completa el perfil

---

## 🐛 Solución de Problemas

### Error: "PostgreSQL no está corriendo"
```bash
# Verificar estado
pg_isready -h localhost -p 5432

# Iniciar PostgreSQL
brew services start postgresql@14  # macOS
sudo systemctl start postgresql     # Linux
```

### Error: "Puerto 3001 ya está en uso"
```bash
# Encontrar el proceso
lsof -i :3001

# Matar el proceso
kill -9 [PID]
```

### Error: "Puerto 5173 ya está en uso"
```bash
# Cambiar puerto en vite.config.ts
server: {
  port: 5174  # Usar otro puerto
}
```

### Error de conexión a base de datos
1. Verificar que PostgreSQL esté corriendo
2. Verificar credenciales en `backend/.env`
3. Verificar que la base de datos `edubattle` existe:
   ```bash
   psql -U postgres -l | grep edubattle
   ```

### Error: "Cannot find module '@prisma/client'"
```bash
cd backend
npx prisma generate
npm install
```

---

## 📊 Estructura del Proyecto

```
edubattle-arena/
├── backend/                    # API Node.js + Express + Prisma
│   ├── prisma/
│   │   └── schema.prisma      # Esquema de la base de datos
│   ├── src/
│   │   ├── server.ts          # Punto de entrada
│   │   ├── routes/            # Rutas del API
│   │   ├── controllers/       # Lógica de negocio
│   │   ├── services/          # Servicios
│   │   └── websocket/         # WebSocket para tiempo real
│   ├── .env                   # Variables de entorno
│   └── package.json
│
├── src/                        # Frontend React + Ionic
│   ├── components/            # Componentes React
│   ├── lib/                   # Utilidades y API client
│   └── types/                 # TypeScript types
│
├── .env.local                 # Config del frontend
├── capacitor.config.ts        # Configuración de Capacitor
├── ionic.config.json          # Configuración de Ionic
├── start-dev.sh              # Script de inicio
└── package.json              # Dependencias del frontend
```

---

## 🔐 Usuarios de Prueba

Después de registrarte, puedes crear:

1. **Cuenta de Profesor**:
   - Email: `profesor@test.com`
   - Contraseña: tu contraseña
   - Rol: TEACHER

2. **Cuenta de Estudiante**:
   - Email: `estudiante@test.com`
   - Contraseña: tu contraseña
   - Rol: STUDENT

---

## 🛠️ Comandos Útiles

### Backend
```bash
cd backend

# Desarrollo con recarga automática
npm run dev

# Compilar TypeScript
npm run build

# Producción
npm start

# Ver base de datos en el navegador
npx prisma studio

# Resetear base de datos
npx prisma migrate reset

# Crear nueva migración
npx prisma migrate dev --name nombre_migracion
```

### Frontend
```bash
# Desarrollo
npm run dev

# Build de producción
npm run build

# Preview del build
npm run preview

# Ionic serve
npm run ionic:serve

# Build con Ionic
npm run ionic:build
```

---

## 📱 Compilar para Móvil (Android/iOS)

### Requisitos Adicionales

- **Android**: Android Studio + SDK
- **iOS**: Xcode (solo macOS)

### Pasos

1. **Instalar Capacitor**:
   ```bash
   npm install @capacitor/core @capacitor/cli
   npm install @capacitor/android @capacitor/ios
   ```

2. **Inicializar Capacitor**:
   ```bash
   npx cap init
   ```

3. **Build del frontend**:
   ```bash
   npm run build
   ```

4. **Agregar plataformas**:
   ```bash
   # Android
   npx cap add android

   # iOS (solo macOS)
   npx cap add ios
   ```

5. **Sincronizar código**:
   ```bash
   npx cap sync
   ```

6. **Abrir en IDE nativo**:
   ```bash
   # Android
   npx cap open android

   # iOS
   npx cap open ios
   ```

---

## 🚢 Despliegue en Producción

### Backend (Railway, Render, Heroku)

1. Configura las variables de entorno
2. Asegúrate de tener `DATABASE_URL` de PostgreSQL
3. Deploy:
   ```bash
   cd backend
   npm run build
   npm start
   ```

### Frontend (Vercel, Netlify, Render)

1. Build:
   ```bash
   npm run build
   ```

2. La carpeta `dist/` contiene los archivos estáticos

3. Configura variables de entorno en tu plataforma:
   - `VITE_API_URL`: URL de tu backend en producción
   - `VITE_WS_URL`: URL de WebSocket en producción

---

## 📞 Soporte

Si encuentras problemas:

1. Revisa la sección de "Solución de Problemas"
2. Verifica los logs del backend y frontend
3. Asegúrate de que todas las dependencias estén instaladas
4. Verifica que PostgreSQL esté corriendo

---

## ✅ Checklist de Instalación

- [ ] Node.js v18+ instalado
- [ ] PostgreSQL v14+ instalado y corriendo
- [ ] Base de datos `edubattle` creada
- [ ] Dependencias del backend instaladas
- [ ] Archivo `backend/.env` configurado
- [ ] Migraciones de Prisma ejecutadas
- [ ] Dependencias del frontend instaladas
- [ ] Backend corriendo en puerto 3001
- [ ] Frontend corriendo en puerto 5173
- [ ] Puedes registrarte y crear una cuenta

---

¡Listo! 🎉 Ahora tienes EduBattle Arena corriendo localmente con la arquitectura completa.
