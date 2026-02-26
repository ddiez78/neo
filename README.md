# Neo-App: Story to Video Generator

**Versión:** 1.0.0  
**Descripción:** Plataforma para convertir guiones maestros de historias infantiles en contenido visual estructurado mediante inteligencia artificial.

---

## Descripción General

Neo-App es una aplicación completa que utiliza inteligencia artificial para transformar narrativas en planes visuales detallados. El flujo principal es:

1. **Carga de Guion:** Usuario sube o escribe un guion maestro de historia infantil
2. **Análisis LLM:** Sistema analiza el guion usando OpenAI/Gemini para detectar personajes, locaciones y props
3. **Story Bible:** Genera una "biblia visual" que define personajes, locaciones y elementos visuales
4. **Scene Breakdown:** Crea escenas de 10 segundos con prompts optimizados para Grok Video
5. **Gestión de Personajes:** Usuario puede editar personajes detectados, agregar manuales, subir imágenes de referencia
6. **Generación de Imágenes:** Sistema genera imágenes para cada escena usando el servicio de generación de Manus
7. **Exportación:** Exporta el plan completo en formato texto plano listo para generadores de video

---

## Stack Tecnológico

| Componente | Tecnología |
|-----------|-----------|
| Frontend | React 19 + Vite + TypeScript |
| Styling | Tailwind CSS 4 + shadcn/ui |
| Backend | Node.js + Express + tRPC |
| Base de Datos | MySQL/TiDB + Drizzle ORM |
| LLM | OpenAI API (gpt-4.1-mini/nano, gemini-2.5-flash) |
| Almacenamiento | AWS S3 (vía Manus) |
| Generación de Imágenes | Manus Image Service |
| Autenticación | Manus OAuth |

---

## Requisitos Previos

Antes de iniciar, asegúrate de tener instalado:

- **Node.js** 18+ (recomendado 22.x)
- **pnpm** 10.x (gestor de paquetes)
- **MySQL/TiDB** (base de datos local o remota)
- **Git** (para control de versiones)

Para verificar las versiones instaladas:

```bash
node --version
pnpm --version
mysql --version
```

---

## Instalación Local

### 1. Clonar el Repositorio

```bash
cd /home/ubuntu
git clone <repository-url> neo-app
cd neo-app
```

O si ya existe el directorio:

```bash
cd /home/ubuntu/neo-app
```

### 2. Instalar Dependencias

```bash
pnpm install
```

Este comando instala todas las dependencias del frontend y backend especificadas en `package.json`.

### 3. Configurar Variables de Entorno

Copia el archivo de ejemplo y configura las variables necesarias:

```bash
cp .env.example .env.local
```

Edita `.env.local` con tus valores:

```env
# Base de datos
DATABASE_URL=mysql://user:password@localhost:3306/neo_app

# OAuth (Manus)
JWT_SECRET=your-jwt-secret-key-here-min-32-chars
VITE_APP_ID=your-manus-app-id
OAUTH_SERVER_URL=https://api.manus.im
VITE_OAUTH_PORTAL_URL=https://portal.manus.im

# LLM (OpenAI)
OPENAI_API_KEY=your-openai-api-key
LLM_MODEL=gpt-4.1-mini

# Manus Services
BUILT_IN_FORGE_API_URL=https://forge.manus.im
BUILT_IN_FORGE_API_KEY=your-forge-api-key
VITE_FRONTEND_FORGE_API_URL=https://forge.manus.im
VITE_FRONTEND_FORGE_API_KEY=your-frontend-forge-api-key

# Aplicación
VITE_APP_TITLE=Neo-App
NODE_ENV=development
```

### 4. Crear Base de Datos

Si utilizas MySQL localmente:

```bash
mysql -u root -p -e "CREATE DATABASE neo_app CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
```

### 5. Ejecutar Migraciones

Genera e instala las migraciones de base de datos:

```bash
pnpm db:push
```

Este comando ejecuta `drizzle-kit generate` y `drizzle-kit migrate` para sincronizar el esquema.

### 6. Iniciar el Servidor de Desarrollo

En una terminal, inicia el backend:

```bash
pnpm dev
```

El servidor estará disponible en `http://localhost:3000`.

En otra terminal, inicia el frontend (Vite):

```bash
cd client
pnpm dev
```

El frontend estará disponible en `http://localhost:5173`.

---

## Estructura del Proyecto

```
neo-app/
├── client/                    # Frontend React + Vite
│   ├── src/
│   │   ├── pages/            # Componentes de página
│   │   ├── components/       # Componentes reutilizables
│   │   ├── hooks/            # Custom hooks
│   │   ├── contexts/         # React contexts
│   │   ├── lib/              # Utilidades (tRPC client)
│   │   ├── App.tsx           # Enrutador principal
│   │   └── index.css         # Estilos globales
│   └── index.html            # Template HTML
│
├── server/                    # Backend Node.js + Express
│   ├── services/             # Lógica de negocio
│   │   ├── llmService.ts     # Integración LLM
│   │   ├── imageService.ts   # Generación de imágenes
│   │   └── storageService.ts # Gestión S3
│   ├── prompts/              # System prompts
│   ├── routers/              # Procedimientos tRPC
│   ├── types/                # Tipos TypeScript
│   ├── db.ts                 # Helpers de BD
│   ├── routers.ts            # Router principal
│   └── _core/                # Framework plumbing
│
├── drizzle/                   # Esquema y migraciones
│   └── schema.ts             # Definición de tablas
│
├── shared/                    # Código compartido
├── ARCHITECTURE.md            # Documentación de arquitectura
├── README.md                  # Este archivo
└── package.json              # Dependencias
```

---

## Flujo de Uso

### Crear un Nuevo Proyecto

1. Accede a la aplicación en `http://localhost:5173`
2. Haz clic en "Nuevo Proyecto"
3. Ingresa título y descripción
4. Haz clic en "Crear"

### Subir un Guion

1. En el proyecto, haz clic en "Subir Guion"
2. Pega o carga el texto del guion maestro
3. Haz clic en "Analizar"
4. El sistema procesará el guion y generará la Story Bible y Scene Breakdown

### Gestionar Personajes

1. En la sección "Story Bible", visualiza los personajes detectados
2. Para editar: haz clic en el personaje y modifica sus atributos
3. Para agregar imagen: haz clic en "Subir Referencia" y selecciona una imagen
4. Para agregar manual: haz clic en "Nuevo Personaje"

### Generar Imágenes

1. En "Scene Breakdown", visualiza todas las escenas
2. Para cada escena, haz clic en "Generar Imagen"
3. El sistema generará una imagen basada en el prompt de Grok Video
4. Las imágenes se almacenan en S3 y se muestran en la interfaz

### Exportar Proyecto

1. Haz clic en "Exportar"
2. Selecciona formato (Texto plano, JSON)
3. Descarga el archivo
4. El archivo contiene la Story Bible completa y Scene Breakdown listo para usar en generadores de video

---

## Comandos Disponibles

### Desarrollo

```bash
# Iniciar servidor de desarrollo (backend + frontend)
pnpm dev

# Compilar para producción
pnpm build

# Iniciar servidor de producción
pnpm start

# Verificar tipos TypeScript
pnpm check

# Formatear código
pnpm format

# Ejecutar tests
pnpm test
```

### Base de Datos

```bash
# Generar migraciones y aplicarlas
pnpm db:push

# Ver estado de la base de datos
pnpm db:studio
```

---

## Configuración de LLM

Neo-App utiliza OpenAI API para analizar guiones. Asegúrate de:

1. **Obtener API Key:** Regístrate en [OpenAI](https://platform.openai.com) y obtén tu API key
2. **Configurar en .env.local:** `OPENAI_API_KEY=sk-...`
3. **Seleccionar Modelo:** Puedes usar `gpt-4.1-mini`, `gpt-4.1-nano` o `gemini-2.5-flash`

El sistema utilizará automáticamente el modelo configurado en `LLM_MODEL`.

---

## Almacenamiento de Imágenes

Las imágenes se almacenan en AWS S3 mediante el proxy de Manus:

1. **Imágenes de Personajes:** Se suben cuando el usuario agrega una referencia visual
2. **Imágenes Generadas:** Se crean automáticamente para cada escena
3. **URLs Públicas:** Se devuelven como CDN URLs para acceso rápido

Las credenciales de S3 se inyectan automáticamente en el backend.

---

## Autenticación

Neo-App utiliza Manus OAuth para autenticación:

1. Usuario accede a la aplicación
2. Si no está autenticado, se redirige a Manus OAuth
3. Después de autenticación, se establece una cookie de sesión
4. Cada solicitud tRPC incluye el contexto del usuario autenticado

No es necesario configurar manualmente OAuth; el template ya incluye toda la integración.

---

## Troubleshooting

### Error: "Cannot connect to database"

**Solución:**
- Verifica que MySQL esté corriendo: `mysql -u root -p`
- Comprueba la `DATABASE_URL` en `.env.local`
- Asegúrate de que la base de datos existe: `CREATE DATABASE neo_app;`

### Error: "OpenAI API key not found"

**Solución:**
- Verifica que `OPENAI_API_KEY` está en `.env.local`
- Comprueba que la clave es válida en [OpenAI Dashboard](https://platform.openai.com/account/api-keys)
- Reinicia el servidor: `pnpm dev`

### Error: "Cannot generate image"

**Solución:**
- Verifica que `BUILT_IN_FORGE_API_KEY` está configurado
- Comprueba que tienes créditos disponibles en Manus
- Revisa los logs del servidor para más detalles

### Puerto 3000 o 5173 ya en uso

**Solución:**
```bash
# Encontrar proceso usando puerto 3000
lsof -i :3000

# Matar el proceso
kill -9 <PID>

# O usar puertos diferentes
SERVER_PORT=3001 pnpm dev
```

---

## Desarrollo

### Agregar Nueva Página

1. Crea archivo en `client/src/pages/NuevaPage.tsx`
2. Implementa componente React
3. Registra ruta en `client/src/App.tsx`
4. Usa hooks de tRPC para datos: `trpc.feature.useQuery()`

### Agregar Nuevo Procedimiento tRPC

1. Define tipos en `server/types/index.ts`
2. Crea router en `server/routers/feature.ts`
3. Registra en `server/routers.ts`
4. Usa en frontend: `trpc.feature.useMutation()`

### Agregar Nueva Tabla

1. Define tabla en `drizzle/schema.ts`
2. Ejecuta `pnpm db:push`
3. Crea helpers en `server/db.ts`
4. Usa en procedimientos tRPC

### Escribir Tests

```bash
# Crear archivo: server/feature.test.ts
# Ejecutar tests
pnpm test

# Ver cobertura
pnpm test --coverage
```

---

## Mejoras Futuras

La arquitectura está diseñada para soportar:

- **Generación de Video:** Integración con Grok Video API
- **Colaboración:** Compartir proyectos entre usuarios
- **Bibliotecas:** Guardar personajes y estilos reutilizables
- **Análisis Avanzado:** Detección de problemas narrativos
- **Monetización:** Planes premium con Stripe

---

## Documentación Adicional

- **ARCHITECTURE.md:** Documentación completa de arquitectura, modelos de datos, flujos y APIs
- **Inline Comments:** Código comentado en servicios complejos
- **Type Definitions:** Tipos TypeScript para todas las estructuras

---

## Licencia

MIT

---

## Soporte

Para reportar problemas o sugerencias, por favor abre un issue en el repositorio o contacta al equipo de desarrollo.

---

**Última actualización:** Febrero 2026  
**Mantenedor:** Manus AI
