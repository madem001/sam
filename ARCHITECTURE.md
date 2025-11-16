# 🏗️ Arquitectura del Proyecto EduBattle Arena

Este documento describe la arquitectura limpia y organizada del proyecto.

## 📋 Tabla de Contenidos

1. [Estructura del Proyecto](#estructura-del-proyecto)
2. [Principios de Arquitectura](#principios-de-arquitectura)
3. [Organización de Componentes](#organización-de-componentes)
4. [Flujo de Datos](#flujo-de-datos)
5. [Gestión de Estado](#gestión-de-estado)
6. [Servicios y API](#servicios-y-api)
7. [Buenas Prácticas](#buenas-prácticas)

---

## 🏢 Estructura del Proyecto

```
edubattle-arena/
├── 📱 Frontend
│   ├── components/             # Componentes de React
│   │   ├── auth/              # Autenticación
│   │   │   └── LoginScreen.tsx
│   │   ├── battle/            # Batallas y juego
│   │   │   ├── BattleLobbyScreen.tsx
│   │   │   ├── StudentBattleScreen.tsx
│   │   │   ├── QuestionScreen.tsx
│   │   │   ├── WinnerScreen.tsx
│   │   │   ├── LoserScreen.tsx
│   │   │   └── TriviaScreen.tsx
│   │   ├── profile/           # Perfil y cartas
│   │   │   ├── ProfileScreen.tsx
│   │   │   ├── EditProfileModal.tsx
│   │   │   ├── ParallaxAvatar.tsx
│   │   │   ├── ProfessorCard.tsx
│   │   │   ├── ProfessorCardDetailModal.tsx
│   │   │   └── ProfessorDetailOverlay.tsx
│   │   ├── teacher/           # Panel de profesor
│   │   │   ├── TeacherDashboard.tsx
│   │   │   ├── DashboardScreen.tsx
│   │   │   ├── BattleManagerScreen.tsx
│   │   │   ├── BattleControlScreen.tsx
│   │   │   ├── CreateBattleModal.tsx
│   │   │   ├── QuestionBankScreen.tsx
│   │   │   ├── RewardsManagementScreen.tsx
│   │   │   ├── StudentListScreen.tsx
│   │   │   ├── InviteStudentsModal.tsx
│   │   │   ├── TeacherProfileScreen.tsx
│   │   │   └── TeacherBottomNav.tsx
│   │   └── shared/            # Componentes compartidos
│   │       ├── BottomNav.tsx
│   │       ├── LoadingScreen.tsx
│   │       ├── NotificationsPanel.tsx
│   │       ├── PlaceholderScreen.tsx
│   │       └── AchievementsScreen.tsx
│   ├── lib/                   # Librerías y utilidades
│   │   ├── supabase.ts        # Cliente de Supabase
│   │   ├── api.ts             # API general (auth, questions, etc.)
│   │   └── battleApi.ts       # API específica de batallas
│   ├── types/                 # Definiciones de tipos TypeScript
│   │   └── global.d.ts        # Tipos globales
│   ├── App.tsx                # Componente principal
│   ├── index.tsx              # Punto de entrada
│   └── styles.css             # Estilos globales
│
└── 🔧 Backend (Node.js + Prisma)
    ├── prisma/
    │   └── schema.prisma      # Schema de la base de datos
    ├── src/
    │   ├── config/
    │   ├── controllers/
    │   ├── middleware/
    │   ├── routes/
    │   ├── services/
    │   ├── types/
    │   ├── websocket/
    │   └── server.ts
    └── .env                   # Variables de entorno
```

---

## 🎯 Principios de Arquitectura

### 1. **Separación de Responsabilidades**

Cada capa tiene una responsabilidad única:

- **Componentes**: UI y lógica de presentación
- **Servicios (lib/)**: Lógica de negocio y llamadas a API
- **Tipos**: Definiciones de tipos compartidos
- **Backend**: Lógica de servidor y acceso a datos

### 2. **Unidireccionalidad del Flujo de Datos**

```
Usuario → Componente → Servicio → Supabase → Base de Datos
                                      ↓
                         ← ← ← ← ← ← Respuesta
```

### 3. **Componentes Reutilizables**

Los componentes se organizan por contexto funcional, no por tipo técnico:

```
❌ MAL:
components/
├── buttons/
├── modals/
└── forms/

✅ BIEN:
components/
├── auth/        (LoginScreen, RegisterScreen)
├── battle/      (BattleScreen, QuestionScreen)
└── profile/     (ProfileScreen, EditModal)
```

---

## 🧩 Organización de Componentes

### Componentes de Autenticación (`auth/`)

**Responsabilidad**: Manejo de login y registro

- `LoginScreen.tsx`: Pantalla de inicio de sesión

**Dependencias**:
- `lib/api.ts` → authApi.login()
- Supabase Auth

### Componentes de Batalla (`battle/`)

**Responsabilidad**: Juego y competencia

- `BattleLobbyScreen.tsx`: Sala de espera
- `StudentBattleScreen.tsx`: Vista de batalla para estudiantes
- `QuestionScreen.tsx`: Pantalla de preguntas
- `WinnerScreen.tsx`: Pantalla de victoria
- `LoserScreen.tsx`: Pantalla de derrota
- `TriviaScreen.tsx`: Modo trivia

**Flujo de Batalla**:
```
1. JoinBattleScreen → Estudiante ingresa código
2. BattleLobbyScreen → Espera que inicie el profesor
3. StudentBattleScreen → Batalla en curso
4. QuestionScreen → Muestra preguntas
5. WinnerScreen/LoserScreen → Resultado
```

### Componentes de Perfil (`profile/`)

**Responsabilidad**: Perfil de usuario y cartas de profesores

- `ProfileScreen.tsx`: Perfil principal
- `EditProfileModal.tsx`: Editar perfil
- `ParallaxAvatar.tsx`: Avatar con efecto parallax
- `ProfessorCard.tsx`: Carta de profesor coleccionable
- `ProfessorCardDetailModal.tsx`: Modal con detalles y recompensas
- `ProfessorDetailOverlay.tsx`: Overlay de detalles

**Sistema de Cartas**:
```
1. Estudiante gana batalla
2. addPointsToProfessorCard(studentId, teacherId, points)
3. Se acumulan puntos en student_professor_points
4. Al alcanzar unlock_points → Carta desbloqueada
5. Estudiante puede canjear recompensas
```

### Componentes de Profesor (`teacher/`)

**Responsabilidad**: Panel de administración para profesores

- `TeacherDashboard.tsx`: Dashboard principal
- `BattleManagerScreen.tsx`: Gestión de batallas
- `BattleControlScreen.tsx`: Control de batalla en vivo
- `CreateBattleModal.tsx`: Crear nueva batalla
- `QuestionBankScreen.tsx`: Banco de preguntas
- `RewardsManagementScreen.tsx`: Gestión de recompensas
- `StudentListScreen.tsx`: Lista de estudiantes
- `TeacherBottomNav.tsx`: Navegación inferior

**Flujo de Creación de Batalla**:
```
1. CreateBattleModal → Configurar batalla
2. Seleccionar preguntas del banco
3. Crear grupos automáticamente
4. Generar código de batalla
5. BattleControlScreen → Iniciar y controlar
```

### Componentes Compartidos (`shared/`)

**Responsabilidad**: Componentes reutilizables

- `BottomNav.tsx`: Navegación inferior
- `LoadingScreen.tsx`: Pantalla de carga
- `NotificationsPanel.tsx`: Panel de notificaciones
- `PlaceholderScreen.tsx`: Pantalla placeholder
- `AchievementsScreen.tsx`: Pantalla de logros

---

## 🔄 Flujo de Datos

### 1. Autenticación

```typescript
// LoginScreen.tsx
const handleLogin = async () => {
  const { user, token } = await authApi.login(email, password);
  localStorage.setItem('token', token);
  setCurrentUser(user);
};
```

### 2. Crear Batalla

```typescript
// CreateBattleModal.tsx
const handleCreate = async () => {
  const battle = await battleApi.createFullBattle(
    teacherId,
    battleName,
    questionCount,
    groupCount,
    questions
  );
  // battle.battleCode → Compartir con estudiantes
};
```

### 3. Unirse a Batalla

```typescript
// JoinBattleScreen.tsx
const handleJoin = async () => {
  const { battle, group } = await battleApi.joinBattleWithCode(
    battleCode,
    studentId,
    studentName
  );
  // Redirigir a BattleLobbyScreen
};
```

### 4. Responder Pregunta

```typescript
// StudentBattleScreen.tsx
const handleAnswer = async (answerIndex: number) => {
  const isCorrect = await battleApi.submitAnswer(
    battleId,
    groupId,
    questionId,
    answerIndex,
    responseTime
  );

  if (lastQuestion) {
    const points = await battleApi.calculateFinalPoints(battleId, groupId);
    await battleApi.addPointsToProfessorCard(studentId, teacherId, points);
  }
};
```

### 5. Sistema de Puntos y Cartas

```typescript
// lib/api.ts - professorCardsApi
export const addPointsToProfessorCard = async (
  studentId: string,
  teacherId: string,
  points: number
) => {
  // 1. Buscar carta del profesor
  const card = await getCardByTeacherId(teacherId);

  // 2. Crear/actualizar student_professor_card
  await upsertStudentCard(studentId, card.id);

  // 3. Actualizar puntos en student_professor_points
  const currentPoints = await getPoints(studentId, teacherId);
  const newPoints = currentPoints + points;
  await updatePoints(studentId, teacherId, newPoints);

  // 4. Auto-desbloquear si alcanza unlock_points
  if (newPoints >= card.unlock_points) {
    await unlockCard(studentId, card.id);
  }
};
```

---

## 📊 Gestión de Estado

### Estado Local (useState)

Usado para estado específico de un componente:

```typescript
const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
const [timeRemaining, setTimeRemaining] = useState(60);
```

### Estado Prop Drilling

Pasar estado de padre a hijo:

```typescript
// App.tsx
<StudentBattleScreen
  groupId={groupId}
  battleId={battleId}
  studentId={currentUser.id}
  onBack={() => setScreen(Screen.Home)}
/>
```

### Estado Global (localStorage)

Para datos que persisten entre sesiones:

```typescript
localStorage.setItem('currentUser', JSON.stringify(user));
localStorage.setItem('token', token);
```

---

## 🌐 Servicios y API

### lib/supabase.ts

**Cliente de Supabase**:

```typescript
import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.VITE_SUPABASE_ANON_KEY!
);
```

### lib/api.ts

**API General**:

```typescript
export const authApi = {
  login: async (email, password) => { ... },
  register: async (data) => { ... },
  updateProfile: async (userId, data) => { ... }
};

export const questionBankApi = {
  getQuestionSets: async (teacherId) => { ... },
  createQuestion: async (data) => { ... }
};

export const professorCardsApi = {
  getStudentCards: async (studentId) => { ... },
  addPointsToProfessorCard: async (studentId, teacherId, points) => { ... }
};

export const rewardsApi = {
  getRewardsByTeacher: async (teacherId) => { ... },
  createReward: async (data) => { ... },
  redeemReward: async (studentId, rewardId) => { ... }
};
```

### lib/battleApi.ts

**API Específica de Batallas**:

```typescript
export const createFullBattle = async (...) => { ... };
export const joinBattleWithCode = async (...) => { ... };
export const getBattleState = async (battleId) => { ... };
export const submitAnswer = async (...) => { ... };
export const calculateFinalPoints = async (battleId, groupId) => { ... };
export const addPointsToProfessorCard = async (...) => { ... };
```

---

## ✅ Buenas Prácticas

### 1. **Nombres Descriptivos**

```typescript
// ❌ MAL
const d = await api.get();
const x = d.map(y => y.id);

// ✅ BIEN
const battles = await battleApi.getBattles(teacherId);
const battleIds = battles.map(battle => battle.id);
```

### 2. **Async/Await Limpio**

```typescript
// ❌ MAL
api.get().then(data => {
  process(data).then(result => {
    save(result).then(() => {
      console.log('done');
    });
  });
});

// ✅ BIEN
try {
  const data = await api.get();
  const result = await process(data);
  await save(result);
  console.log('done');
} catch (error) {
  console.error('Error:', error);
}
```

### 3. **Componentes Pequeños**

```typescript
// ❌ MAL: Componente gigante de 500 líneas

// ✅ BIEN: Dividir en componentes más pequeños
<BattleScreen>
  <BattleHeader />
  <QuestionDisplay />
  <AnswerOptions />
  <BattleTimer />
  <ScoreBoard />
</BattleScreen>
```

### 4. **Tipos Explícitos**

```typescript
// ❌ MAL
const handleSubmit = (data: any) => { ... }

// ✅ BIEN
interface SubmitData {
  battleId: string;
  answer: number;
}

const handleSubmit = (data: SubmitData) => { ... }
```

### 5. **Manejo de Errores**

```typescript
// ✅ BIEN
try {
  const result = await api.createBattle(data);
  console.log('✅ Batalla creada:', result);
} catch (error) {
  console.error('❌ Error creando batalla:', error);
  alert('No se pudo crear la batalla');
}
```

### 6. **Logging Consistente**

```typescript
// Usar emojis para identificar rápidamente el tipo de log
console.log('🚀 [BATTLE] Iniciando batalla:', battleId);
console.log('✅ [BATTLE] Batalla creada exitosamente');
console.log('❌ [BATTLE] Error:', error);
console.log('📊 [POINTS] Puntos calculados:', points);
console.log('🎯 [API] Request:', { url, method, data });
```

### 7. **Constantes en Mayúsculas**

```typescript
// constants.ts
export const MAX_STUDENTS_PER_GROUP = 4;
export const DEFAULT_QUESTION_TIME_LIMIT = 60;
export const POINTS_FOR_FIRST_PLACE = 200;
export const POINTS_FOR_SECOND_PLACE = 150;
export const POINTS_FOR_THIRD_PLACE = 100;
```

---

## 🔐 Seguridad

### 1. **Nunca Exponer Secretos**

```typescript
// ❌ MAL
const API_KEY = 'sk_live_123456789';

// ✅ BIEN
const API_KEY = process.env.VITE_API_KEY;
```

### 2. **Validación de Datos**

```typescript
// ✅ BIEN
const handleSubmit = async (email: string, password: string) => {
  if (!email || !password) {
    throw new Error('Email y contraseña son requeridos');
  }

  if (password.length < 6) {
    throw new Error('La contraseña debe tener al menos 6 caracteres');
  }

  // ...
};
```

### 3. **Sanitización**

```typescript
// ✅ BIEN
const sanitizeName = (name: string) => {
  return name.trim().replace(/[<>]/g, '');
};
```

---

## 📚 Recursos

- [React Documentation](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Supabase Documentation](https://supabase.com/docs)
- [Prisma Documentation](https://www.prisma.io/docs)

---

Esta arquitectura asegura:

✅ **Mantenibilidad**: Código organizado y fácil de entender
✅ **Escalabilidad**: Fácil agregar nuevas features
✅ **Testabilidad**: Componentes y servicios aislados
✅ **Rendimiento**: Optimizaciones en los puntos correctos
✅ **Seguridad**: Buenas prácticas implementadas

¡Sigue esta arquitectura para mantener el proyecto limpio y profesional!
