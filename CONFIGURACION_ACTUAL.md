# 🎯 Configuración Actual del Proyecto

## ✅ ARCHIVOS CREADOS/ACTUALIZADOS:

### 1️⃣ **`src/backend/.env`** ⭐ IMPORTANTE
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/edubattle?schema=public"
JWT_SECRET="edubattle-secret-key-2024-change-in-production"
PORT=3000
NODE_ENV=development
CORS_ORIGIN=http://localhost:3001
```

### 2️⃣ **`.env`** (raíz del proyecto)
```env
VITE_API_URL=http://localhost:3000/api
VITE_WS_URL=http://localhost:3000
VITE_SUPABASE_ANON_KEY=...
VITE_SUPABASE_URL=...
```

### 3️⃣ **Scripts auxiliares creados:**
- ✅ `start-clean.bat` - Para Windows (mata procesos y inicia limpio)
- ✅ `check-config.sh` - Para Linux/Mac (verifica configuración)
- ✅ `INICIO_RAPIDO.md` - Guía de inicio rápido

---

## 🔌 PUERTOS CONFIGURADOS:

```
┌─────────────────────────────────────────┐
│  BACKEND (Express + WebSocket)          │
│  Puerto: 3000                           │
│  URL: http://localhost:3000             │
│  API: http://localhost:3000/api         │
│  WebSocket: ws://localhost:3000         │
└─────────────────────────────────────────┘
                  ↑
                  │
                  │ CORS permitido
                  │
                  ↓
┌─────────────────────────────────────────┐
│  FRONTEND (Vite + React)                │
│  Puerto: 3001                           │
│  URL: http://localhost:3001             │
└─────────────────────────────────────────┘
                  ↑
                  │
                  │ Conexión DB
                  │
                  ↓
┌─────────────────────────────────────────┐
│  POSTGRESQL (Base de Datos)             │
│  Puerto: 5432                           │
│  Base: edubattle                        │
│  Host: localhost                        │
└─────────────────────────────────────────┘
```

---

## 🚀 CÓMO INICIAR EL PROYECTO:

### **OPCIÓN 1: Iniciar todo junto (RECOMENDADO)**

**Windows:**
```bash
start-clean.bat
```

**Linux/Mac:**
```bash
npm run dev
```

### **OPCIÓN 2: Iniciar por separado**

**Terminal 1 (Backend):**
```bash
cd src/backend
npm run dev
```

**Terminal 2 (Frontend):**
```bash
npm run dev:frontend
```

---

## ⚠️ PROBLEMA QUE TENÍAS:

### **ANTES:**
- ❌ El archivo `src/backend/.env` NO existía
- ❌ El backend leía las variables del `.env` de la raíz
- ❌ Ambos servicios intentaban usar el mismo puerto
- ❌ Error: `EADDRINUSE: address already in use`

### **AHORA:**
- ✅ El archivo `src/backend/.env` existe con PORT=3000
- ✅ El backend usa puerto 3000
- ✅ El frontend usa puerto 3001
- ✅ Cada servicio tiene su propia configuración

---

## 🧪 VERIFICAR QUE TODO FUNCIONA:

### **1. Backend:**
```bash
curl http://localhost:3000/api/health
```
Debería responder:
```json
{
  "status": "ok",
  "message": "EduBattle Arena API is running"
}
```

### **2. Frontend:**
Abre en tu navegador:
```
http://localhost:3001
```
Deberías ver la pantalla de login **SIN** el error "Network Error".

---

## 🔧 SOLUCIÓN DE PROBLEMAS:

### **Si ves: "EADDRINUSE"**
```bash
# Windows
taskkill /IM node.exe /F

# Linux/Mac
killall node
```

### **Si el backend no inicia:**
1. Verifica que `src/backend/.env` exista
2. Verifica que PostgreSQL esté corriendo
3. Verifica que el puerto 3000 esté libre

### **Si el frontend muestra "Network Error":**
1. Verifica que el backend esté corriendo: http://localhost:3000/api/health
2. Verifica el archivo `.env` en la raíz tenga `VITE_API_URL=http://localhost:3000/api`

---

## 📦 ESTRUCTURA DE ARCHIVOS IMPORTANTE:

```
project/
├── .env                          ← Variables del FRONTEND (VITE_*)
├── src/
│   └── backend/
│       ├── .env                  ← Variables del BACKEND (PORT, DATABASE_URL, etc) ⭐
│       └── src/
│           └── server.ts         ← Lee PORT de .env
├── vite.config.ts                ← Configura puerto 3001 para frontend
├── start-clean.bat               ← Script de inicio para Windows
├── check-config.sh               ← Script de verificación para Linux/Mac
└── INICIO_RAPIDO.md              ← Guía rápida
```

---

## ✅ CHECKLIST FINAL:

- [x] Archivo `src/backend/.env` creado con PORT=3000
- [x] Archivo `.env` en raíz con configuración del frontend
- [x] Backend configurado para puerto 3000
- [x] Frontend configurado para puerto 3001
- [x] CORS configurado correctamente
- [x] Scripts auxiliares creados
- [x] Documentación actualizada
- [x] Build exitoso

---

## 🎉 ¡LISTO PARA USAR!

Ahora puedes ejecutar:
```bash
npm run dev
```

Y deberías ver:
```
[0] 🚀 Server running on port 3000        ← BACKEND
[1] ➜  Local: http://localhost:3001/     ← FRONTEND
```

¡Todo debería funcionar sin conflictos de puertos! 🚀
