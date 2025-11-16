# 🚀 Guía de Inicio Rápido - EduBattle Arena Backend

Esta guía te llevará paso a paso desde cero hasta tener el backend funcionando localmente.

## ⏱️ Tiempo Estimado: 10-15 minutos

---

## 📋 Pre-requisitos

- **Node.js 18+**: [Descargar aquí](https://nodejs.org/)
- **PostgreSQL 14+**: [Descargar aquí](https://www.postgresql.org/download/)
- Terminal / Línea de comandos

---

## 🔥 Opción 1: Script Automático (Recomendado)

### Paso 1: Ejecutar el script de setup

```bash
cd backend
chmod +x setup.sh
./setup.sh
```

El script te guiará a través de todo el proceso.

---

## 🛠️ Opción 2: Instalación Manual

### Paso 1: Instalar PostgreSQL

#### macOS (Homebrew):
```bash
brew install postgresql@14
brew services start postgresql@14
```

#### Ubuntu/Debian:
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
```

#### Windows:
Descargar instalador desde [postgresql.org](https://www.postgresql.org/download/windows/)

### Paso 2: Crear la Base de Datos

```bash
# Conectarse a PostgreSQL
psql -U postgres

# En el prompt de psql:
CREATE DATABASE edubattle_arena;
\q
```

### Paso 3: Instalar Dependencias del Proyecto

```bash
cd backend
npm install
```

### Paso 4: Configurar Variables de Entorno

```bash
# Copiar el archivo de ejemplo
cp .env.example .env

# Editar el archivo .env
nano .env  # o usa tu editor favorito
```

Actualiza estas líneas en `.env`:
```env
DATABASE_URL="postgresql://postgres:TU_PASSWORD@localhost:5432/edubattle_arena?schema=public"
JWT_SECRET=una-clave-super-secreta-aleatoria-de-minimo-32-caracteres
```

**Reemplaza:**
- `TU_PASSWORD`: Tu contraseña de PostgreSQL
- `una-clave-super-secreta...`: Una clave aleatoria segura

### Paso 5: Inicializar Prisma

```bash
# Generar cliente de Prisma
npx prisma generate

# Sincronizar schema con la base de datos
npx prisma db push
```

### Paso 6: Iniciar el Servidor

```bash
npm run dev
```

Deberías ver:
```
✅ Database connected successfully
🚀 Server running on http://localhost:3001
```

---

## ✅ Verificación

### 1. Verificar que el servidor esté corriendo

Abre en tu navegador:
```
http://localhost:3001
```

Deberías ver un mensaje de bienvenida.

### 2. Verificar las tablas en la base de datos

```bash
psql -U postgres -d edubattle_arena -c "\dt"
```

Deberías ver 15 tablas incluyendo `profiles`, `battles`, `professor_cards`, etc.

### 3. Abrir Prisma Studio (Opcional)

```bash
npx prisma studio
```

Esto abre una interfaz visual en `http://localhost:5555` para ver tus datos.

---

## 🔍 Probar la API

### Registrar un Usuario

```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "profesor@test.com",
    "password": "password123",
    "name": "Prof. Test",
    "role": "TEACHER"
  }'
```

Deberías recibir un JSON con el usuario y un token JWT.

### Login

```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "profesor@test.com",
    "password": "password123"
  }'
```

---

## 🐛 Problemas Comunes

### "Can't reach database server"

**Solución:**
```bash
# Verificar que PostgreSQL esté corriendo
sudo systemctl status postgresql

# Si no está corriendo, iniciarlo
sudo systemctl start postgresql
```

### "Database does not exist"

**Solución:**
```bash
psql -U postgres -c "CREATE DATABASE edubattle_arena;"
```

### "Invalid password for user postgres"

**Solución:**
Actualiza tu `.env` con la contraseña correcta:
```env
DATABASE_URL="postgresql://postgres:TU_PASSWORD_REAL@localhost:5432/edubattle_arena?schema=public"
```

### Puerto 3001 en uso

**Solución:**
Cambia el puerto en `.env`:
```env
PORT=3002
```

---

## 📚 Próximos Pasos

Una vez que el backend esté funcionando:

1. **Explora la API**: Revisa [API Endpoints](README.md#api-endpoints) en el README
2. **Crea datos de prueba**: Usa Prisma Studio para agregar usuarios y batallas
3. **Conecta el Frontend**: Actualiza la URL del backend en el frontend
4. **Lee la documentación completa**: Revisa el [README.md](README.md) completo

---

## 🆘 ¿Necesitas Ayuda?

Si tienes problemas:

1. Revisa la sección [Troubleshooting](README.md#troubleshooting) del README
2. Verifica los logs del servidor en la terminal
3. Asegúrate de que PostgreSQL esté corriendo
4. Verifica que el archivo `.env` esté configurado correctamente

---

## 📝 Comandos Rápidos de Referencia

```bash
# Iniciar servidor en desarrollo
npm run dev

# Ver datos visualmente
npx prisma studio

# Generar cliente Prisma
npx prisma generate

# Sincronizar schema con BD
npx prisma db push

# Resetear base de datos (CUIDADO)
npx prisma migrate reset

# Ver logs de PostgreSQL
sudo tail -f /var/log/postgresql/postgresql-14-main.log
```

---

¡Listo! Tu backend de EduBattle Arena está funcionando. 🎉
