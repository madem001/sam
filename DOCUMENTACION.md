# 📚 DOCUMENTACIÓN COMPLETA - EduBattle Arena

Plataforma educativa interactiva de batallas de trivia en tiempo real para profesores y estudiantes.

---

## 📁 Estructura del Proyecto

```
edubattle-arena/
├── src/
│   ├── frontend/              # Frontend de la aplicación
│   │   ├── components/
│   │   │   ├── student/      # Componentes de estudiantes
│   │   │   │   ├── AllForAllScreen.tsx
│   │   │   │   ├── JoinBattleScreen.tsx
│   │   │   │   ├── StudentBattleScreen.tsx
│   │   │   │   ├── TriviaScreen.tsx
│   │   │   │   ├── AchievementsScreen.tsx
│   │   │   │   └── ProfileScreen.tsx
│   │   │   ├── teacher/      # Componentes de profesores
│   │   │   │   ├── TeacherDashboard.tsx
│   │   │   │   ├── DashboardScreen.tsx
│   │   │   │   ├── BattleManagerScreen.tsx
│   │   │   │   ├── BattleControlScreen.tsx
│   │   │   │   ├── AllForAllControlScreen.tsx
│   │   │   │   ├── StudentListScreen.tsx
│   │   │   │   ├── QuestionBankScreen.tsx
│   │   │   │   ├── RewardsManagementScreen.tsx
│   │   │   │   └── TeacherProfileScreen.tsx
│   │   │   └── shared/       # Componentes compartidos
│   │   │       ├── LoginScreen.tsx
│   │   │       ├── LoadingScreen.tsx
│   │   │       ├── BottomNav.tsx
│   │   │       ├── WinnerScreen.tsx
│   │   │       └── LoserScreen.tsx
│   │   ├── lib/              # Librerías y APIs
│   │   │   ├── supabase.ts   # Cliente de Supabase
│   │   │   ├── api.ts        # API general
│   │   │   ├── battleApi.ts  # API de batallas
│   │   │   └── achievementsService.ts
│   │   └── types/            # Definiciones de tipos
│   │       ├── types.ts
│   │       └── global.d.ts
│   └── backend/              # Backend (opcional, no utilizado actualmente)
│       └── ...
├── bolt-config/              # Archivos de configuración
│   ├── metadata.json
│   └── ionic.config.json
├── supabase/                 # Migraciones de base de datos
│   └── migrations/
│       └── *.sql
├── App.tsx                   # Componente principal
├── index.tsx                 # Punto de entrada
├── api.ts                    # API mock
├── mocks.ts                  # Datos de prueba
├── styles.css                # Estilos globales
├── vite.config.ts            # Configuración de Vite
├── capacitor.config.ts       # Configuración de Capacitor
└── package.json              # Dependencias del proyecto
```

---

## 🎯 Características Principales

### Para Profesores
- ✅ Crear batallas con preguntas personalizadas (5-20 preguntas)
- ✅ Generar códigos de batalla únicos (6 caracteres)
- ✅ Panel de control en tiempo real
- ✅ Gestión de banco de preguntas
- ✅ Monitoreo de progreso y ranking en vivo
- ✅ Modo "All for All" (todos contra todos)
- ✅ Sistema de recompensas y profesor cards
- ✅ **Bloqueo de sala**: Solo un profesor puede tener un juego activo a la vez

### Para Estudiantes
- ✅ Unirse a batallas con códigos de 6 caracteres
- ✅ Responder preguntas con opciones de colores
- ✅ Sistema de puntuación en tiempo real
- ✅ Ver ranking actualizado durante la batalla
- ✅ Feedback inmediato sobre respuestas
- ✅ Colección de profesor cards
- ✅ Sistema de logros y achievements
- ✅ Perfil personalizable con avatares

---

## 🛠️ Tecnologías Utilizadas

### Frontend
- **React** 18.2 - Librería UI
- **TypeScript** 5.8 - Tipado estático
- **Ionic React** 7.6 - Componentes móviles
- **Vite** 6.2 - Build tool
- **TailwindCSS** - Estilos (incluido en styles.css)

### Base de Datos
- **Supabase** - Backend as a Service
  - PostgreSQL - Base de datos relacional
  - Row Level Security (RLS) - Seguridad de datos
  - Realtime - Actualizaciones en tiempo real
  - Auth - Sistema de autenticación

---

## 🚀 Instalación y Configuración Local

### 1. Requisitos Previos

- Node.js 18+ ([Descargar](https://nodejs.org/))
- npm (incluido con Node.js)
- Cuenta de Supabase ([Crear cuenta gratis](https://supabase.com))

### 2. Configurar Proyecto de Supabase

1. **Crear un nuevo proyecto en Supabase**:
   - Ir a [https://supabase.com/dashboard](https://supabase.com/dashboard)
   - Clic en "New Project"
   - Ingresar nombre del proyecto y contraseña de base de datos
   - Seleccionar región más cercana
   - Esperar a que se complete la configuración

2. **Aplicar migraciones**:
   - Ir a SQL Editor en el dashboard de Supabase
   - Copiar y ejecutar cada archivo de `supabase/migrations/` en orden cronológico
   - Verificar que todas las tablas se hayan creado correctamente

3. **Obtener credenciales**:
   - Ir a Settings → API
   - Copiar:
     - `Project URL` (SUPABASE_URL)
     - `anon public key` (SUPABASE_ANON_KEY)

### 3. Configurar Variables de Entorno

Crear archivo `.env` en la raíz del proyecto:

```env
VITE_SUPABASE_URL=tu_project_url_aqui
VITE_SUPABASE_ANON_KEY=tu_anon_key_aqui
```

### 4. Instalar Dependencias

```bash
npm install
```

### 5. Ejecutar en Desarrollo

```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:5173`

### 6. Crear Usuarios de Prueba

1. **Registrar un profesor**:
   - Email: `profesor@test.com`
   - Contraseña: `profesor123`
   - Rol: Seleccionar "Profesor"

2. **Registrar estudiantes**:
   - Email: `estudiante1@test.com`
   - Contraseña: `estudiante123`
   - Rol: Seleccionar "Estudiante"

---

## 📊 Estructura de Base de Datos (Supabase)

### Tablas Principales

#### `profiles`
- Perfiles de usuarios (estudiantes y profesores)
- Campos: id, name, email, role, avatar_base64, professor_points, etc.

#### `battles`
- Batallas creadas por profesores
- Campos: id, teacher_id, name, status, battle_code, current_question_index, etc.

#### `battle_groups`
- Grupos dentro de batallas
- Campos: id, battle_id, group_number, score, students_count

#### `battle_questions`
- Preguntas de cada batalla
- Campos: id, battle_id, question_text, answers, correct_index, order_index

#### `battle_student_answers`
- Respuestas de estudiantes
- Campos: id, battle_id, group_id, student_id, question_id, selected_answer, is_correct, response_time

#### `all_for_all_games`
- Juegos de modo "All for All"
- Campos: id, teacher_id, word_text, word_color, correct_answer, is_active

#### `all_for_all_responses`
- Respuestas en modo "All for All"
- Campos: id, game_id, student_id, button_pressed, is_correct, rank_position, points_awarded

#### `question_sets`
- Conjuntos de preguntas guardadas
- Campos: id, teacher_id, name, questions, created_at

#### `professor_cards`
- Tarjetas de profesores coleccionables
- Campos: id, professor_id, rarity, stats

#### `student_professor_cards`
- Tarjetas que poseen los estudiantes
- Campos: student_id, card_id, obtained_at

#### `achievements`
- Logros disponibles
- Campos: id, name, description, icon, unlock_condition, points_reward

#### `student_achievements`
- Logros desbloqueados por estudiantes
- Campos: student_id, achievement_id, unlocked_at

#### `rewards`
- Sistema de recompensas
- Campos: id, teacher_id, name, description, cost_points

#### `teacher_presence`
- Sistema de presencia de profesores (para detectar juegos activos)
- Campos: teacher_id, game_id, is_online, last_heartbeat

---

## 🔐 Seguridad (Row Level Security)

Todas las tablas tienen RLS habilitado con políticas específicas:

- **Estudiantes**: Solo pueden ver y modificar sus propios datos
- **Profesores**: Pueden gestionar sus batallas y ver datos de sus estudiantes
- **Público**: Algunas vistas de solo lectura para rankings

---

## 🎮 Flujo de Uso

### Profesor

1. **Login** → Dashboard de Profesor
2. **Crear Batalla**:
   - Configurar número de preguntas
   - Agregar preguntas desde banco o crear nuevas
   - Generar códigos de grupo
3. **Iniciar Batalla**:
   - Los estudiantes se unen con códigos
   - El profesor controla el avance de preguntas
   - Ve ranking en tiempo real
4. **Finalizar Batalla**:
   - Ver resultados finales
   - Asignar puntos de profesor a estudiantes destacados

### Estudiante

1. **Login** → Dashboard de Estudiante
2. **Unirse a Batalla**:
   - Ingresar código de 6 caracteres
   - Esperar a que el profesor inicie
3. **Jugar**:
   - Responder preguntas seleccionando colores
   - Ver feedback inmediato
   - Monitorear ranking
4. **Después de la Batalla**:
   - Ver resultados finales
   - Recibir puntos de profesor
   - Desbloquear achievements

---

## 🏗️ Compilación para Producción

```bash
npm run build
```

Los archivos compilados estarán en la carpeta `dist/`

### Desplegar en Netlify/Vercel

1. Conectar repositorio de GitHub
2. Configurar variables de entorno (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY)
3. Comando de build: `npm run build`
4. Directorio de publicación: `dist`

---

## 📱 Compilación para Móvil (iOS/Android)

### Prerequisitos
- Para iOS: macOS con Xcode
- Para Android: Android Studio

### Pasos

1. **Agregar plataformas**:
```bash
npx cap add ios
npx cap add android
```

2. **Sincronizar código**:
```bash
npm run build
npx cap sync
```

3. **Abrir en IDE nativo**:
```bash
npx cap open ios     # Para iOS
npx cap open android # Para Android
```

4. **Compilar y ejecutar** desde Xcode o Android Studio

---

## 🐛 Solución de Problemas

### Problema: Error de conexión a Supabase
**Solución**: Verificar que las variables de entorno estén correctamente configuradas en `.env`

### Problema: Las migraciones no se aplican
**Solución**: Ejecutar las migraciones manualmente en orden cronológico desde el SQL Editor de Supabase

### Problema: No se actualizan los datos en tiempo real
**Solución**: Verificar que Realtime esté habilitado en las tablas necesarias desde el dashboard de Supabase

### Problema: Error al hacer build
**Solución**: Limpiar node_modules y reinstalar:
```bash
rm -rf node_modules package-lock.json
npm install
npm run build
```

---

## 📝 Notas Importantes

1. **Sistema de Bloqueo de Sala**: Solo un profesor puede tener un juego activo a la vez (tanto batallas como All for All). Si otro profesor intenta iniciar un juego mientras hay uno activo, verá el mensaje "Sala Ocupada".

2. **Presencia de Profesor**: Los profesores deben permanecer en la pantalla del juego activo. Si salen, el juego se termina automáticamente.

3. **Heartbeat System**: Los juegos activos envían un "heartbeat" cada 10 segundos para mantener la presencia activa.

4. **Sin Referencias a Bolt**: Todo el código está limpio de referencias a bolt.new u otros servicios externos.

---

## 📄 Licencia

MIT

---

## 👥 Soporte

Para reportar problemas o sugerencias, crear un issue en el repositorio del proyecto.
