# Guía de Pruebas - EduBattle Arena

## Configuración Inicial

### 1. Configurar Base de Datos PostgreSQL

```bash
# Crear base de datos
createdb edubattle

# O con psql
psql -U postgres
CREATE DATABASE edubattle;
\q
```

### 2. Configurar Backend

```bash
cd backend

# Instalar dependencias
npm install

# Configurar variables de entorno
# Ya está configurado en .env, pero verifica:
# DATABASE_URL="postgresql://postgres:postgres@localhost:5432/edubattle?schema=public"

# Generar cliente de Prisma
npm run prisma:generate

# Sincronizar esquema con base de datos
npm run prisma:push

# Iniciar servidor backend
npm run dev
```

El backend estará disponible en: `http://localhost:3001`

### 3. Configurar Frontend

```bash
# Desde la raíz del proyecto
npm install

# Ya está configurado en .env con:
# VITE_API_URL=http://localhost:3001/api
# VITE_WS_URL=http://localhost:3001

# Iniciar servidor frontend
npm run dev
```

El frontend estará disponible en: `http://localhost:5173`

## Pruebas del Sistema

### Escenario 1: Crear Maestro y Estudiantes

1. **Abrir el frontend** en `http://localhost:5173`

2. **Registrar un Maestro:**
   - Click en "Login"
   - Email: `maestro@test.com`
   - Password: `password123`
   - Nombre: `Profesor Juan`
   - Rol: `Teacher`
   - Click en "Registrar"

3. **Abrir otra ventana/tab y registrar 3 Estudiantes:**

   **Estudiante 1:**
   - Email: `estudiante1@test.com`
   - Password: `password123`
   - Nombre: `María García`
   - Rol: `Student`

   **Estudiante 2:**
   - Email: `estudiante2@test.com`
   - Password: `password123`
   - Nombre: `Carlos López`
   - Rol: `Student`

   **Estudiante 3:**
   - Email: `estudiante3@test.com`
   - Password: `password123`
   - Nombre: `Ana Martínez`
   - Rol: `Student`

### Escenario 2: Crear Batalla con Rondas

**Como Maestro:**

1. Ve a "Gestor de Batallas"

2. Click en "Crear Nueva Batalla"

3. Configurar batalla:
   - **Nombre:** "Batalla de Matemáticas"
   - **Rondas:** 10 (mínimo 5, máximo 20)
   - **Grupos:** 2 (hasta 10 grupos)
   - **Por Grupo:** 3 (2-10 estudiantes por grupo)

4. Agregar preguntas (mínimo 10 para 10 rondas):

   **Pregunta 1:**
   - Texto: "¿Cuánto es 2 + 2?"
   - Respuestas: `3`, `4`, `5`, `6`
   - Correcta: `4` (segunda opción)

   **Pregunta 2:**
   - Texto: "¿Cuánto es 5 x 3?"
   - Respuestas: `10`, `15`, `20`, `25`
   - Correcta: `15`

   *(Agregar 8 preguntas más)*

5. Click en "Crear Batalla"

6. Verás la batalla creada con los códigos de cada grupo

### Escenario 3: Estudiantes se Unen Aleatoriamente

**Como Estudiantes (en ventanas diferentes):**

1. **Estudiante 1** (María):
   - Ve a "Unirse a Grupo"
   - Ingresa el código del **Grupo 1**: `ABC123` (ejemplo)
   - Sistema asigna a María al Grupo 1

2. **Estudiante 2** (Carlos):
   - Ve a "Unirse a Grupo"
   - Ingresa el **mismo código**: `ABC123`
   - Sistema detecta que Grupo 1 tiene espacio y asigna a Carlos al Grupo 1

3. **Estudiante 3** (Ana):
   - Ve a "Unirse a Grupo"
   - Ingresa el **mismo código**: `ABC123`
   - Sistema asigna a Ana al Grupo 1 (3/3 estudiantes, grupo completo)

4. **Estudiante 4** (nuevo):
   - Ingresa el **mismo código**: `ABC123`
   - Sistema detecta que Grupo 1 está lleno
   - **Asigna automáticamente al Grupo 2** (asignación aleatoria)

### Escenario 4: Iniciar Batalla

**Como Maestro:**

1. Click en "Abrir" en la batalla creada

2. Verás:
   - Estado: "Esperando"
   - Grupos y sus miembros
   - Ranking (todos en 0 puntos)

3. Click en "Iniciar Batalla"

4. Estado cambia a "En Curso"

5. Se muestra la pregunta actual con sus respuestas de colores

### Escenario 5: Estudiantes Responden

**Como Estudiantes (simultáneamente):**

1. Ven la pregunta actual

2. Cada grupo selecciona una respuesta

3. Los colores ayudan a identificar las opciones:
   - 🔴 Rojo
   - 🔵 Azul
   - 🟢 Verde
   - 🟡 Amarillo

4. Al seleccionar, ven feedback inmediato:
   - ✅ Verde si es correcta (+100 puntos)
   - ❌ Rojo si es incorrecta (0 puntos)

5. El ranking se actualiza en tiempo real

### Escenario 6: Avanzar Rondas

**Como Maestro:**

1. Después de que los grupos respondan

2. Click en "Siguiente Pregunta"

3. Se avanza a la ronda 2/10

4. Repetir hasta completar las 10 rondas

5. En la última ronda, botón dice "Finalizar Batalla"

### Escenario 7: Finalizar y Ver Resultados

**Como Maestro:**

1. Click en "Finalizar Batalla"

2. Estado cambia a "Finalizada"

3. Se muestra el ranking final con:
   - Posición de cada grupo
   - Puntuación total
   - Respuestas correctas

**Como Estudiantes:**

1. Ven pantalla de batalla finalizada

2. Muestra:
   - Su grupo
   - Puntuación final
   - Posición en el ranking

## Verificación de Funcionalidades

### ✅ Asignación Aleatoria

- [ ] Múltiples estudiantes usan el mismo código
- [ ] El sistema los distribuye automáticamente en grupos disponibles
- [ ] Cuando un grupo se llena (ej: 3/3), el siguiente estudiante va a otro grupo

### ✅ Rondas (5-20)

- [ ] Maestro puede configurar entre 5 y 20 rondas
- [ ] Necesita al menos tantas preguntas como rondas
- [ ] El sistema muestra "Ronda X de Y"

### ✅ Estudiantes por Grupo (2-10)

- [ ] Maestro configura cuántos estudiantes por grupo
- [ ] El sistema respeta el límite
- [ ] Grupos se marcan como "llenos" automáticamente

### ✅ WebSocket en Tiempo Real

- [ ] El ranking se actualiza sin refrescar
- [ ] Cuando el maestro avanza la pregunta, estudiantes ven el cambio
- [ ] Las respuestas actualizan los puntajes instantáneamente

### ✅ Respuestas con Colores

- [ ] Cada respuesta tiene un color asignado
- [ ] Los colores son consistentes
- [ ] Ayuda a identificar opciones rápidamente

## Comandos Útiles

```bash
# Ver logs del backend
cd backend
npm run dev

# Ver base de datos
npx prisma studio

# Resetear base de datos
npx prisma db push --force-reset

# Ver tablas
psql -U postgres edubattle
\dt
SELECT * FROM "Battle";
SELECT * FROM "BattleGroup";
SELECT * FROM "GroupMember";
```

## Solución de Problemas

### Error: "Cannot connect to database"
```bash
# Verifica que PostgreSQL esté corriendo
pg_ctl status

# Inicia PostgreSQL
pg_ctl start
```

### Error: "Port 3001 already in use"
```bash
# Encuentra el proceso
lsof -i :3001

# Mata el proceso
kill -9 <PID>
```

### Error: "Token invalid"
```bash
# Limpia el localStorage en el navegador
# F12 > Application > LocalStorage > Clear
```

## Casos de Prueba Adicionales

### Test 1: Límite de Grupos
- Crear batalla con 10 grupos
- Verificar que no se puedan crear más

### Test 2: Límite de Rondas
- Intentar crear batalla con 4 rondas (debe fallar, mínimo 5)
- Intentar crear batalla con 21 rondas (debe fallar, máximo 20)

### Test 3: Estudiantes por Grupo
- Configurar 2 estudiantes por grupo
- Tercer estudiante debe ir a otro grupo automáticamente

### Test 4: Persistencia
- Crear batalla
- Refrescar página
- Verificar que la batalla sigue ahí

## Resultado Esperado

✅ Sistema completamente funcional con:
- Registro y autenticación
- Creación de batallas con 5-20 rondas
- Configuración de estudiantes por grupo (2-10)
- Asignación aleatoria automática
- WebSocket para actualizaciones en tiempo real
- Ranking dinámico
- Respuestas con feedback inmediato
