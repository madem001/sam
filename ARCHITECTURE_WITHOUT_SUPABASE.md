# 🏗️ Arquitectura EduBattle Arena - PostgreSQL + Prisma (SIN Supabase)

Esta es la arquitectura limpia del proyecto usando **PostgreSQL local** con **Prisma ORM** y **backend Node.js**.

## 🎯 ¿Por Qué Sin Supabase?

**Antes (con Supabase)**:
```
Frontend → Supabase Client → Supabase Cloud → PostgreSQL (Cloud)
```
- ❌ Dependencia de servicio externo
- ❌ Requiere internet
- ❌ Límites de plan gratuito
- ❌ Menos control sobre la BD

**Ahora (sin Supabase)**:
```
Frontend → HTTP Client → Backend API (Express) → Prisma → PostgreSQL (Local)
```
- ✅ Control total
- ✅ Desarrollo offline
- ✅ Sin límites
- ✅ Más rápido (sin latencia de red)
- ✅ Aprendes más sobre arquitectura real

---

## 📦 Stack Tecnológico

### Frontend
- **React 19** - Librería UI
- **TypeScript** - Tipado estático
- **Vite** - Build tool
- **Fetch API** - HTTP client (sin axios, más ligero)
- **Socket.io Client** - WebSockets en tiempo real

### Backend
- **Node.js 18+** - Runtime
- **Express** - Framework web
- **Prisma** - ORM
- **PostgreSQL 14+** - Base de datos
- **Socket.io** - WebSockets
- **JWT** - Autenticación
- **bcryptjs** - Encriptación de contraseñas

---

## 🏢 Estructura del Proyecto

```
edubattle-arena/
│
├── 📱 FRONTEND
│   ├── lib/
│   │   ├── httpClient.ts      # Cliente HTTP (reemplaza Supabase)
│   │   ├── api.ts              # API calls al backend
│   │   └── battleApi.ts        # API específica de batallas
│   │
│   ├── components/
│   │   ├── auth/               # Login, Register
│   │   ├── battle/             # Batalla y juego
│   │   ├── profile/            # Perfil y cartas
│   │   ├── teacher/            # Panel profesor
│   │   └── shared/             # Compartidos
│   │
│   ├── types.ts                # Tipos TypeScript
│   ├── App.tsx                 # Componente principal
│   ├── index.tsx               # Entry point
│   ├── .env                    # Config (VITE_API_URL)
│   └── package.json
│
└── 🔧 BACKEND
    ├── prisma/
    │   └── schema.prisma       # 15 modelos de BD
    │
    ├── src/
    │   ├── config/
    │   │   ├── database.ts     # Prisma client
    │   │   └── constants.ts    # Constantes
    │   │
    │   ├── controllers/
    │   │   ├── authController.ts
    │   │   ├── battleController.ts
    │   │   ├── profileController.ts
    │   │   └── rewardsController.ts
    │   │
    │   ├── services/
    │   │   ├── authService.ts
    │   │   ├── battleService.ts
    │   │   └── pointsService.ts
    │   │
    │   ├── middleware/
    │   │   └── auth.ts         # JWT middleware
    │   │
    │   ├── routes/
    │   │   ├── authRoutes.ts
    │   │   ├── battleRoutes.ts
    │   │   └── profileRoutes.ts
    │   │
    │   ├── websocket/
    │   │   └── index.ts        # Socket.io
    │   │
    │   └── server.ts           # Express server
    │
    ├── .env                    # Config (DATABASE_URL, JWT_SECRET)
    └── package.json
```

---

## 🔄 Flujo de Datos Completo

### 1. Autenticación (Login)

```
┌─────────────┐
│   Usuario   │
│ ingresa     │
│ email/pass  │
└──────┬──────┘
       │
       ▼
┌─────────────────────┐
│  LoginScreen.tsx    │
│  onClick login      │
└──────┬──────────────┘
       │
       │ httpClient.post('/auth/login', { email, password })
       ▼
┌─────────────────────────────┐
│  Backend: authController    │
│  - Valida credenciales      │
│  - Genera JWT token         │
│  - Retorna { user, token }  │
└──────┬──────────────────────┘
       │
       │ Prisma query
       ▼
┌─────────────────────┐
│  PostgreSQL         │
│  SELECT * FROM      │
│  profiles           │
│  WHERE email = ?    │
└──────┬──────────────┘
       │
       │ { user data }
       ▼
┌─────────────────────┐
│  Frontend           │
│  - Guarda token     │
│  - Guarda usuario   │
│  - Redirige a Home  │
└─────────────────────┘
```

**Código**:

```typescript
// Frontend: LoginScreen.tsx
const handleLogin = async () => {
  try {
    const response = await httpClient.post('/auth/login', {
      email,
      password
    });

    // Guardar token
    setAuthToken(response.token);

    // Guardar usuario
    localStorage.setItem('user', JSON.stringify(response.user));

    // Redirigir
    navigate('/home');
  } catch (error) {
    alert('Error de login');
  }
};
```

```typescript
// Backend: authController.ts
export const login = async (req, res) => {
  const { email, password } = req.body;

  // Buscar usuario en BD
  const user = await prisma.user.findUnique({
    where: { email }
  });

  if (!user) {
    return res.status(404).json({ message: 'Usuario no encontrado' });
  }

  // Verificar contraseña
  const isValid = await bcrypt.compare(password, user.password);

  if (!isValid) {
    return res.status(401).json({ message: 'Contraseña incorrecta' });
  }

  // Generar token JWT
  const token = jwt.sign(
    { userId: user.id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );

  res.json({
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role
    },
    token
  });
};
```

---

### 2. Crear Batalla

```
┌─────────────┐
│  Profesor   │
│  crea       │
│  batalla    │
└──────┬──────┘
       │
       ▼
┌──────────────────────┐
│ CreateBattleModal    │
│ - Nombre batalla     │
│ - Preguntas          │
│ - Grupos             │
└──────┬───────────────┘
       │
       │ httpClient.post('/battles', { name, questions, groups })
       │ headers: { Authorization: 'Bearer <token>' }
       ▼
┌───────────────────────────┐
│ Backend: middleware/auth  │
│ - Verifica JWT token      │
│ - Extrae userId           │
└──────┬────────────────────┘
       │
       ▼
┌──────────────────────────────┐
│ Backend: battleController    │
│ - Crea batalla con teacherId │
│ - Crea preguntas             │
│ - Crea grupos                │
│ - Genera battle_code         │
└──────┬───────────────────────┘
       │
       │ Prisma transactions
       ▼
┌─────────────────────────────┐
│ PostgreSQL                  │
│ INSERT INTO battles (...)   │
│ INSERT INTO battle_questions│
│ INSERT INTO battle_groups   │
└──────┬──────────────────────┘
       │
       │ { battle, battleCode }
       ▼
┌─────────────────────────┐
│ Frontend                │
│ - Muestra código        │
│ - Redirige a control    │
└─────────────────────────┘
```

**Código**:

```typescript
// Frontend: CreateBattleModal.tsx
const handleCreate = async () => {
  try {
    const response = await httpClient.post('/battles', {
      name: battleName,
      questionCount: questions.length,
      groupCount,
      questions: questions.map(q => ({
        text: q.text,
        answers: q.answers,
        correctIndex: q.correctIndex
      }))
    });

    alert(`Código de batalla: ${response.battleCode}`);
    navigate(`/battle-control/${response.battle.id}`);
  } catch (error) {
    alert('Error creando batalla');
  }
};
```

```typescript
// Backend: battleController.ts
export const createBattle = async (req, res) => {
  const { name, questionCount, groupCount, questions } = req.body;
  const teacherId = req.user.userId; // Del JWT

  try {
    // Transacción para crear todo junto
    const result = await prisma.$transaction(async (tx) => {
      // 1. Crear batalla
      const battle = await tx.battle.create({
        data: {
          name,
          teacherId,
          questionCount,
          battleCode: generateCode(),
          status: 'WAITING'
        }
      });

      // 2. Crear preguntas
      await tx.battleQuestion.createMany({
        data: questions.map((q, index) => ({
          battleId: battle.id,
          questionText: q.text,
          answers: q.answers,
          correctAnswerIndex: q.correctIndex,
          questionOrder: index
        }))
      });

      // 3. Crear grupos
      await tx.battleGroup.createMany({
        data: Array.from({ length: groupCount }, (_, i) => ({
          battleId: battle.id,
          groupCode: generateCode(),
          groupName: `Grupo ${i + 1}`,
          score: 0
        }))
      });

      return battle;
    });

    res.json({
      battle: result,
      battleCode: result.battleCode
    });
  } catch (error) {
    res.status(500).json({ message: 'Error creando batalla' });
  }
};
```

---

### 3. Sistema de Puntos y Cartas

```
┌─────────────┐
│ Estudiante  │
│ completa    │
│ batalla     │
└──────┬──────┘
       │
       ▼
┌─────────────────────────┐
│ StudentBattleScreen     │
│ - Última pregunta       │
│ - Calcula ranking       │
└──────┬──────────────────┘
       │
       │ httpClient.post('/battles/:id/finish', { groupId })
       ▼
┌────────────────────────────────┐
│ Backend: battleController      │
│ - Obtiene ranking final        │
│ - Asigna puntos (1°:200, ...)  │
└──────┬─────────────────────────┘
       │
       │ Llama a pointsService
       ▼
┌────────────────────────────────┐
│ Backend: pointsService         │
│ addPointsToProfessorCard()     │
│                                │
│ 1. Busca professor_card        │
│ 2. Crea student_professor_card │
│ 3. Actualiza points            │
│ 4. Desbloquea si >= unlock    │
└──────┬─────────────────────────┘
       │
       │ Prisma queries
       ▼
┌─────────────────────────────────┐
│ PostgreSQL                      │
│ UPDATE student_professor_points │
│ SET points = points + 150       │
│ WHERE student_id = ?            │
│   AND professor_id = ?          │
└──────┬──────────────────────────┘
       │
       │ { points: 150, unlocked: true }
       ▼
┌─────────────────────────┐
│ Frontend                │
│ - Muestra WinnerScreen  │
│ - "+150 puntos!"        │
└─────────────────────────┘
```

**Código**:

```typescript
// Backend: pointsService.ts
export const addPointsToProfessorCard = async (
  studentId: string,
  teacherId: string,
  points: number
) => {
  // 1. Buscar carta del profesor
  const card = await prisma.professorCard.findFirst({
    where: { teacherId }
  });

  if (!card) {
    throw new Error('Carta de profesor no encontrada');
  }

  // 2. Crear/actualizar relación estudiante-carta
  await prisma.studentProfessorCard.upsert({
    where: {
      studentId_cardId: {
        studentId,
        cardId: card.id
      }
    },
    create: {
      studentId,
      cardId: card.id,
      unlocked: false
    },
    update: {}
  });

  // 3. Actualizar puntos
  const pointsRecord = await prisma.studentProfessorPoint.upsert({
    where: {
      studentId_professorId: {
        studentId,
        professorId: teacherId
      }
    },
    create: {
      studentId,
      professorId: teacherId,
      points
    },
    update: {
      points: {
        increment: points
      }
    }
  });

  // 4. Auto-desbloquear si alcanza unlock_points
  if (pointsRecord.points >= card.unlockPoints && !pointsRecord.unlocked) {
    await prisma.studentProfessorCard.update({
      where: {
        studentId_cardId: {
          studentId,
          cardId: card.id
        }
      },
      data: {
        unlocked: true,
        unlockedAt: new Date()
      }
    });

    await prisma.studentProfessorPoint.update({
      where: {
        studentId_professorId: {
          studentId,
          professorId: teacherId
        }
      },
      data: {
        unlocked: true
      }
    });
  }

  return pointsRecord;
};
```

---

## 🌐 API Endpoints

### Autenticación

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/api/auth/register` | Registrar usuario |
| POST | `/api/auth/login` | Iniciar sesión |
| GET | `/api/auth/me` | Obtener usuario actual |
| PATCH | `/api/auth/profile` | Actualizar perfil |

### Batallas

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/api/battles` | Crear batalla |
| GET | `/api/battles/teacher` | Batallas del profesor |
| GET | `/api/battles/:id` | Obtener batalla |
| POST | `/api/battles/join` | Unirse con código |
| POST | `/api/battles/:id/start` | Iniciar batalla |
| POST | `/api/battles/:id/answer` | Enviar respuesta |
| GET | `/api/battles/:id/groups` | Grupos de batalla |

### Perfil y Cartas

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/profile/cards` | Cartas del estudiante |
| POST | `/api/profile/cards/:id/redeem` | Canjear recompensa |
| GET | `/api/profile/rewards/:teacherId` | Recompensas disponibles |

### Profesor

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/teacher/students` | Lista de estudiantes |
| GET | `/api/teacher/questions` | Banco de preguntas |
| POST | `/api/teacher/questions` | Crear pregunta |
| GET | `/api/teacher/rewards` | Recompensas |
| POST | `/api/teacher/rewards` | Crear recompensa |

---

## 🔐 Autenticación con JWT

### Flujo:

```
1. Login exitoso → Backend genera JWT
2. Frontend guarda token en localStorage
3. Cada request incluye: Authorization: Bearer <token>
4. Middleware verifica token
5. Si válido → Continúa al controller
6. Si inválido → 401 Unauthorized
```

### Middleware:

```typescript
// middleware/auth.ts
export const authenticate = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'No autorizado' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { userId, role }
    next();
  } catch (error) {
    res.status(401).json({ message: 'Token inválido' });
  }
};
```

### Uso:

```typescript
// routes/battleRoutes.ts
router.post('/battles', authenticate, createBattle);
router.get('/battles/teacher', authenticate, getTeacherBattles);
```

---

## 📁 Variables de Entorno

### Frontend (.env)

```env
VITE_API_URL=http://localhost:3001/api
VITE_WS_URL=http://localhost:3001
```

### Backend (.env)

```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/edubattle_arena"
JWT_SECRET=tu-clave-super-secreta-minimo-32-caracteres
JWT_EXPIRES_IN=7d
PORT=3001
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173
```

---

## 🚀 Comandos para Iniciar

### 1. Backend

```bash
cd backend

# Primera vez
npm install
cp .env.example .env
# (Editar .env con tus credenciales)
npx prisma generate
npx prisma db push

# Iniciar
npm run dev
# → http://localhost:3001
```

### 2. Frontend

```bash
# Raíz del proyecto
npm install
cp .env.example .env

# Iniciar
npm run dev
# → http://localhost:5173
```

---

## ✅ Ventajas de Esta Arquitectura

1. **Control Total** - Controlas tu infraestructura
2. **Offline** - No necesitas internet para desarrollar
3. **Aprendizaje** - Entiendes mejor cómo funciona todo
4. **Escalable** - Puedes optimizar y escalar como quieras
5. **Sin Límites** - No hay restricciones de plan gratuito
6. **Más Rápido** - Sin latencia de red
7. **Más Seguro** - Tus datos están en tu servidor
8. **Profesional** - Arquitectura real de producción

---

## 📚 Comparación Final

| Aspecto | Con Supabase | Sin Supabase (Actual) |
|---------|--------------|----------------------|
| **Setup** | Más rápido | Requiere setup manual |
| **Dependencias** | Supabase Cloud | PostgreSQL local |
| **Internet** | Requerido | No requerido |
| **Costo** | Límites gratis | Gratis total |
| **Control** | Limitado | Total |
| **Aprendizaje** | Menos | Mucho más |
| **Producción** | Listo | Requiere deploy |
| **Escalabilidad** | Limitada | Ilimitada |

---

¡Esta es la arquitectura profesional y completa sin Supabase! 🎉
