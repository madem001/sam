# 🎯 SOLUCIÓN DEFINITIVA - EduBattle Arena

## ⚠️ EL PROBLEMA QUE TENÍAS:

```
Error: listen EADDRINUSE: address already in use :::3000
```

**Significa:** Ya hay un proceso usando el puerto 3000.

---

## ✅ SOLUCIÓN EN 3 PASOS:

### **PASO 1: Mata TODOS los procesos**

Ejecuta en cualquier terminal:

```bash
KILL-PORTS.bat
```

O manualmente:
```bash
taskkill /F /IM node.exe
taskkill /F /IM tsx.exe
```

---

### **PASO 2: Espera 5 segundos**

Dale tiempo al sistema para liberar los puertos.

---

### **PASO 3: Inicia el proyecto**

```bash
START-PROJECT.bat
```

Este script:
- ✅ Mata procesos automáticamente
- ✅ Verifica que los puertos estén libres
- ✅ Crea el archivo `.env` si no existe
- ✅ Abre DOS ventanas separadas:
  - Ventana 1: Backend en puerto 3000
  - Ventana 2: Frontend en puerto 3001

---

## 🎯 LO QUE DEBERÍAS VER:

### **Ventana 1 (Backend):**
```
🚀 Server running on port 3000
📡 WebSocket ready for connections
🌍 Environment: development
```

### **Ventana 2 (Frontend):**
```
VITE v6.4.1  ready in XXX ms

➜  Local:   http://localhost:3001/
```

### **En tu navegador:**
```
http://localhost:3001
```

Deberías ver la pantalla de login SIN errores.

---

## 🔧 SI AÚN TIENES PROBLEMAS:

### **Opción 1: Reinicia tu PC**
A veces Windows retiene los puertos. Un reinicio limpia todo.

### **Opción 2: Cambia los puertos**

**Backend** (`src/backend/.env`):
```env
PORT=4000
```

**Frontend** (`.env`):
```env
VITE_API_URL=http://localhost:4000/api
VITE_WS_URL=http://localhost:4000
```

**Vite** (`vite.config.ts`):
```typescript
server: {
  port: 4001,
  host: '0.0.0.0',
}
```

Luego:
```bash
START-PROJECT.bat
```

---

## 🚀 RESUMEN RÁPIDO:

```bash
# 1. Mata procesos
KILL-PORTS.bat

# 2. Espera 5 segundos

# 3. Inicia el proyecto
START-PROJECT.bat

# 4. Abre tu navegador
http://localhost:3001
```

---

## ✅ CHECKLIST:

- [ ] Ejecuté KILL-PORTS.bat
- [ ] Esperé 5 segundos
- [ ] Ejecuté START-PROJECT.bat
- [ ] Se abrieron 2 ventanas
- [ ] Backend muestra: "Server running on port 3000"
- [ ] Frontend muestra: "Local: http://localhost:3001/"
- [ ] Abrí http://localhost:3001 en el navegador
- [ ] Veo la pantalla de login sin errores
