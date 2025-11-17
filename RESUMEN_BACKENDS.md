# Resumen: Dos Backends Disponibles

## Estado Actual

EduBattle Arena ahora tiene **DOS BACKENDS** funcionando en paralelo:

### 1. Backend Express (Original)
- **Puerto:** 3000
- **Ubicación:** `/src/backend`
- **Tecnología:** Express.js + TypeScript
- **Estado:** ✅ Completamente funcional

### 2. Backend NestJS (Nuevo)
- **Puerto:** 4000
- **Ubicación:** `/src/backend-nestjs`
- **Tecnología:** NestJS + TypeScript
- **Estado:** ✅ Listo para usar (módulo Auth + WebSocket)

---

## Scripts de Inicio

### Para usar Express Backend:
```bash
INICIAR-TODO.bat
```
- Frontend: http://localhost:8000
- Backend Express: http://localhost:3000

### Para usar NestJS Backend:
```bash
INICIAR-NESTJS.bat
```
- Frontend: http://localhost:8000
- Backend NestJS: http://localhost:4000

### Para limpiar puertos:
```bash
KILL-PORTS.bat
```

---

## Conectar Frontend con Cada Backend

### Opción 1: Express Backend (Por defecto)

El frontend ya está configurado para Express (puerto 3000).

**No requiere cambios.**

### Opción 2: NestJS Backend

Edita: `/src/frontend/lib/localApi.ts`

```typescript
// Cambiar estas líneas:
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
const WS_URL = import.meta.env.VITE_WS_URL || 'http://localhost:3000';

// Por estas:
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';
const WS_URL = import.meta.env.VITE_WS_URL || 'http://localhost:4000';
```

---

## Funcionalidad Implementada en NestJS

### ✅ Completo
- Autenticación (Registro, Login, Perfil)
- JWT con Passport
- WebSocket Gateway
- Integración con Prisma
- CORS configurado
- Validación automática

### ⚠️ Pendiente (puedes agregar cuando necesites)
- Módulo de Batallas
- Módulo de Professor Cards
- Módulo de Achievements
- Módulo de Questions
- Módulo de All-For-All
- Módulo de Rewards
- Módulo de Notifications

---

## Instalar Backend NestJS

```bash
# Paso 1: Ir a la carpeta
cd src/backend-nestjs

# Paso 2: Instalar dependencias
npm install

# Paso 3: Generar Prisma Client
npm run prisma:generate

# Paso 4: Sincronizar base de datos
npm run prisma:push

# Paso 5: Iniciar en desarrollo
npm run dev
```

---

## Comparación Rápida

| Característica | Express | NestJS |
|---------------|---------|---------|
| **Puerto** | 3000 | 4000 |
| **Validación** | Manual | Automática |
| **Arquitectura** | Archivos sueltos | Módulos |
| **TypeScript** | Configurado | Nativo |
| **Decoradores** | No | Sí |
| **Testing** | Manual | Integrado |
| **Escalabilidad** | Media | Alta |

---

## Documentación

- **Guía completa de NestJS:** `GUIA_BACKEND_NESTJS.md`
- **README de NestJS:** `src/backend-nestjs/README.md`
- **Guía de conexión Express:** `GUIA_CONEXION_BACKEND.md`

---

## Base de Datos

**Ambos backends comparten la misma base de datos PostgreSQL:**
- Host: localhost
- Puerto: 5432
- Database: edubattle
- User: postgres
- Password: postgres

---

## Próximos Pasos

### Si quieres usar Express:
No hagas nada, ya está configurado.

### Si quieres usar NestJS:
1. Ejecuta `cd src/backend-nestjs && npm install`
2. Ejecuta `npm run prisma:generate`
3. Cambia la URL en `/src/frontend/lib/localApi.ts`
4. Ejecuta `INICIAR-NESTJS.bat`

### Si quieres agregar más funcionalidad a NestJS:
Consulta la sección "Próximos Pasos" en `GUIA_BACKEND_NESTJS.md`

---

## Notas Importantes

- Ambos backends pueden correr al mismo tiempo (en puertos diferentes)
- El frontend solo puede conectarse a UNO a la vez
- Los datos son 100% compatibles entre ambos
- Usa el mismo `JWT_SECRET` para compatibilidad de tokens
- PostgreSQL debe estar corriendo para ambos

---

## Soporte

Si tienes problemas:
1. Lee `GUIA_BACKEND_NESTJS.md`
2. Revisa el README de cada backend
3. Ejecuta `KILL-PORTS.bat` y reinicia
