# 🚀 Inicio Rápido - EduBattle Arena

## ⚠️ PROBLEMA COMÚN: Conflicto de Puertos

Si ves errores como:
- `Error: listen EADDRINUSE: address already in use :::3000`
- `Error: listen EADDRINUSE: address already in use :::3001`
- "Network Error" en el navegador

**Es porque tienes procesos corriendo en los puertos 3000 o 3001.**

---

## ✅ SOLUCIÓN RÁPIDA

### **Windows:**

Ejecuta el script automático:
```bash
start-clean.bat
```

O manualmente:
```bash
# 1. Mata todos los procesos de Node.js
taskkill /IM node.exe /F

# 2. Inicia el proyecto
npm run dev
```

### **Linux/Mac:**

```bash
# 1. Ejecuta el script de verificación
./check-config.sh

# 2. Inicia el proyecto
npm run dev
```

---

## 📋 Configuración de Puertos

| Servicio | Puerto | URL |
|----------|--------|-----|
| **Backend** | 3000 | http://localhost:3000 |
| **Backend API** | 3000 | http://localhost:3000/api |
| **WebSocket** | 3000 | ws://localhost:3000 |
| **Frontend** | 3001 | http://localhost:3001 |
| **PostgreSQL** | 5432 | localhost:5432 |

---

## 📁 Archivos de Configuración

### **1. `.env` (raíz del proyecto) - Frontend:**
```env
VITE_API_URL=http://localhost:3000/api
VITE_WS_URL=http://localhost:3000
VITE_SUPABASE_ANON_KEY=...
VITE_SUPABASE_URL=...
```

### **2. `src/backend/.env` - Backend:**
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/edubattle?schema=public"
JWT_SECRET="edubattle-secret-key-2024-change-in-production"
PORT=3000
NODE_ENV=development
CORS_ORIGIN=http://localhost:3001
```

---

## 🔧 Comandos Disponibles

### **Iniciar todo (frontend + backend):**
```bash
npm run dev
```

### **Iniciar por separado:**

**Backend (Terminal 1):**
```bash
cd src/backend
npm run dev
```

**Frontend (Terminal 2):**
```bash
npm run dev:frontend
```

---

## 🧪 Verificar que Todo Funciona

### **1. Backend funcionando:**
Abre en tu navegador:
```
http://localhost:3000/api/health
```

Deberías ver:
```json
{
  "status": "ok",
  "message": "EduBattle Arena API is running"
}
```

### **2. Frontend funcionando:**
Abre:
```
http://localhost:3001
```

Deberías ver la pantalla de login sin errores de "Network Error".

---

## 🐛 Solución de Problemas

### **Error: "Network Error" en el navegador**
- El backend no está corriendo
- Verifica: http://localhost:3000/api/health

### **Error: EADDRINUSE en puerto 3000**
```bash
# Windows
taskkill /IM node.exe /F

# Linux/Mac
killall node
```

### **Error: EADDRINUSE en puerto 3001**
```bash
# Windows
netstat -ano | findstr :3001
taskkill /PID [número_del_proceso] /F

# Linux/Mac
lsof -i :3001
kill -9 [PID]
```

### **El backend no lee el .env**
Verifica que el archivo `src/backend/.env` exista:
```bash
# Windows
dir src\backend\.env

# Linux/Mac
ls -la src/backend/.env
```

Si no existe, cópialo del ejemplo:
```bash
# Windows
copy src\backend\.env.example src\backend\.env

# Linux/Mac
cp src/backend/.env.example src/backend/.env
```

Luego edita `src/backend/.env` con tu configuración.

---

## 📦 Primera Instalación

```bash
# 1. Instalar dependencias del frontend
npm install

# 2. Instalar dependencias del backend
npm run backend:install

# 3. Configurar base de datos
npm run backend:migrate

# 4. Iniciar todo
npm run dev
```

---

## ✅ Checklist de Inicio

- [ ] PostgreSQL corriendo en puerto 5432
- [ ] Base de datos `edubattle` creada
- [ ] Archivo `.env` en la raíz del proyecto
- [ ] Archivo `src/backend/.env` existe y configurado
- [ ] Dependencias instaladas (`npm install`)
- [ ] Dependencias del backend instaladas (`npm run backend:install`)
- [ ] Migraciones ejecutadas (`npm run backend:migrate`)
- [ ] Puertos 3000 y 3001 libres
- [ ] `npm run dev` ejecutándose

---

## 🎯 URLs Importantes

- **Frontend:** http://localhost:3001
- **Backend API:** http://localhost:3000/api
- **Health Check:** http://localhost:3000/api/health
- **WebSocket:** ws://localhost:3000

---

## 📞 ¿Necesitas Ayuda?

Si sigues teniendo problemas:
1. Ejecuta `check-config.sh` (Linux/Mac) o revisa manualmente los archivos `.env`
2. Verifica que los puertos estén libres
3. Revisa los logs en la terminal para errores específicos
