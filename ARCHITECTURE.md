# Neo-App: Story to Video Generator - Arquitectura Completa

**Versión:** 1.0.0  
**Última actualización:** Febrero 2026  
**Autor:** Manus AI

---

## Descripción General

Neo-App es una plataforma integral para convertir guiones maestros de historias infantiles en contenido visual estructurado. La aplicación utiliza inteligencia artificial para analizar narrativas, detectar elementos visuales (personajes, locaciones, props), y generar un plan detallado de escenas optimizadas para generadores de video (Grok Video).

El flujo principal es: **Guion → Análisis LLM → Story Bible → Scene Breakdown → Generación de Imágenes → Exportación**.

---

## Principios de Diseño

1. **Modularidad:** Separación clara entre análisis narrativo, gestión de datos, generación de contenido y presentación.
2. **Escalabilidad:** Arquitectura preparada para múltiples usuarios, proyectos concurrentes y procesamiento asincrónico.
3. **Consistencia Visual:** Sistema de Story Bible que previene alucinaciones y cambios de vestuario entre escenas.
4. **Optimización para Grok:** Prompts generados específicamente para maximizar calidad en generadores de video.
5. **Persistencia:** Base de datos relacional para proyectos, guiones, personajes, escenas y referencias visuales.

---

## Stack Tecnológico

| Capa | Tecnología | Propósito |
|------|-----------|----------|
| **Frontend** | React 19 + Vite + TypeScript | Interfaz de usuario interactiva |
| **Styling** | Tailwind CSS 4 + shadcn/ui | Diseño responsivo y componentes reutilizables |
| **Backend** | Node.js + Express + tRPC | API type-safe y lógica de negocio |
| **Base de Datos** | MySQL/TiDB + Drizzle ORM | Persistencia de proyectos, guiones, personajes |
| **LLM** | OpenAI API (gpt-4.1-mini/nano, gemini-2.5-flash) | Análisis de guiones y generación de prompts |
| **Almacenamiento** | AWS S3 (vía Manus) | Imágenes de personajes y escenas generadas |
| **Generación de Imágenes** | Manus Image Service | Creación de imágenes para escenas |
| **Autenticación** | Manus OAuth | Gestión de usuarios y sesiones |

---

## Estructura de Carpetas

```
neo-app/
├── client/                          # Frontend React + Vite
│   ├── public/                      # Archivos estáticos (favicon, robots.txt)
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Home.tsx             # Landing / Dashboard principal
│   │   │   ├── ProjectList.tsx      # Listado de proyectos
│   │   │   ├── ScriptUpload.tsx     # Carga de guiones
│   │   │   ├── StoryBibleEditor.tsx # Gestión de personajes y elementos
│   │   │   ├── SceneBreakdown.tsx   # Visualización de escenas
│   │   │   ├── ScenePreview.tsx     # Preview de escena individual
│   │   │   └── NotFound.tsx         # Página 404
│   │   ├── components/
│   │   │   ├── DashboardLayout.tsx  # Layout principal con sidebar
│   │   │   ├── CharacterCard.tsx    # Tarjeta de personaje
│   │   │   ├── SceneCard.tsx        # Tarjeta de escena
│   │   │   ├── ImageUploader.tsx    # Componente para subir imágenes
│   │   │   ├── PromptPreview.tsx    # Vista previa de prompts
│   │   │   ├── ExportDialog.tsx     # Diálogo de exportación
│   │   │   └── ui/                  # Componentes shadcn/ui
│   │   ├── contexts/
│   │   │   ├── ThemeContext.tsx     # Tema (dark/light)
│   │   │   └── ProjectContext.tsx   # Estado global del proyecto actual
│   │   ├── hooks/
│   │   │   ├── useProject.ts        # Hook para gestionar proyecto
│   │   │   ├── useCharacters.ts     # Hook para personajes
│   │   │   └── useScenes.ts         # Hook para escenas
│   │   ├── lib/
│   │   │   ├── trpc.ts              # Cliente tRPC
│   │   │   └── utils.ts             # Utilidades
│   │   ├── App.tsx                  # Enrutador principal
│   │   ├── main.tsx                 # Punto de entrada
│   │   └── index.css                # Estilos globales
│   ├── index.html                   # Template HTML
│   ├── vite.config.ts               # Configuración Vite
│   └── tsconfig.json                # Configuración TypeScript
│
├── server/                          # Backend Node.js + Express
│   ├── routers/
│   │   ├── projects.ts              # Procedimientos para proyectos
│   │   ├── scripts.ts               # Análisis de guiones
│   │   ├── characters.ts            # Gestión de personajes
│   │   ├── scenes.ts                # Generación de escenas
│   │   └── export.ts                # Exportación de datos
│   ├── db.ts                        # Helpers de base de datos
│   ├── services/
│   │   ├── llmService.ts            # Integración con LLM
│   │   ├── imageService.ts          # Generación de imágenes
│   │   ├── storageService.ts        # Gestión de S3
│   │   └── narrativeAnalyzer.ts     # Análisis narrativo avanzado
│   ├── prompts/
│   │   ├── narrativeDirector.ts     # System prompt del Director Narrativo
│   │   └── sceneGenerator.ts        # Prompts para generación de escenas
│   ├── types/
│   │   └── index.ts                 # Tipos compartidos del backend
│   ├── _core/                       # Framework plumbing (no editar)
│   │   ├── index.ts
│   │   ├── context.ts
│   │   ├── trpc.ts
│   │   ├── env.ts
│   │   ├── oauth.ts
│   │   ├── cookies.ts
│   │   ├── llm.ts
│   │   ├── imageGeneration.ts
│   │   ├── voiceTranscription.ts
│   │   ├── notification.ts
│   │   └── systemRouter.ts
│   └── routers.ts                   # Router principal
│
├── drizzle/                         # Esquema y migraciones
│   ├── schema.ts                    # Definición de tablas
│   └── migrations/                  # Migraciones generadas
│
├── shared/                          # Código compartido
│   ├── const.ts                     # Constantes globales
│   └── types.ts                     # Tipos compartidos
│
├── storage/                         # Helpers S3
│   └── index.ts
│
├── .env.example                     # Variables de entorno de ejemplo
├── package.json                     # Dependencias y scripts
├── tsconfig.json                    # Configuración TypeScript global
├── vite.config.ts                   # Configuración Vite
├── vitest.config.ts                 # Configuración Vitest
├── ARCHITECTURE.md                  # Este archivo
├── README.md                        # Guía de inicio rápido
└── todo.md                          # Tareas del proyecto
```

---

## Modelo de Datos

### Tablas Principales

#### 1. **projects**
Almacena proyectos de historias.

```sql
CREATE TABLE projects (
  id INT PRIMARY KEY AUTO_INCREMENT,
  userId INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  status ENUM('draft', 'analyzing', 'completed', 'archived') DEFAULT 'draft',
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES users(id)
);
```

#### 2. **scripts**
Guiones maestros de historias.

```sql
CREATE TABLE scripts (
  id INT PRIMARY KEY AUTO_INCREMENT,
  projectId INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  language VARCHAR(10) DEFAULT 'es',
  status ENUM('pending', 'analyzing', 'analyzed', 'error') DEFAULT 'pending',
  analysisError TEXT,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (projectId) REFERENCES projects(id) ON DELETE CASCADE
);
```

#### 3. **storyBibles**
Story Bible generada por LLM (una por proyecto).

```sql
CREATE TABLE storyBibles (
  id INT PRIMARY KEY AUTO_INCREMENT,
  projectId INT NOT NULL UNIQUE,
  characterCount INT DEFAULT 0,
  locationCount INT DEFAULT 0,
  propCount INT DEFAULT 0,
  visualBible JSON NOT NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (projectId) REFERENCES projects(id) ON DELETE CASCADE
);
```

#### 4. **characters**
Personajes detectados o agregados manualmente.

```sql
CREATE TABLE characters (
  id INT PRIMARY KEY AUTO_INCREMENT,
  projectId INT NOT NULL,
  name VARCHAR(255) NOT NULL,
  species VARCHAR(100),
  ageVibe VARCHAR(100),
  visualTraits TEXT,
  outfit JSON,
  personalityVibe TEXT,
  referenceImageUrl VARCHAR(500),
  referenceImageKey VARCHAR(255),
  isManuallyAdded BOOLEAN DEFAULT FALSE,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (projectId) REFERENCES projects(id) ON DELETE CASCADE
);
```

#### 5. **locations**
Locaciones del proyecto.

```sql
CREATE TABLE locations (
  id INT PRIMARY KEY AUTO_INCREMENT,
  projectId INT NOT NULL,
  name VARCHAR(255) NOT NULL,
  visualDescription TEXT NOT NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (projectId) REFERENCES projects(id) ON DELETE CASCADE
);
```

#### 6. **props**
Props/objetos utilizados en la historia.

```sql
CREATE TABLE props (
  id INT PRIMARY KEY AUTO_INCREMENT,
  projectId INT NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  usedBy VARCHAR(255),
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (projectId) REFERENCES projects(id) ON DELETE CASCADE
);
```

#### 7. **scenes**
Escenas generadas del Scene Breakdown.

```sql
CREATE TABLE scenes (
  id INT PRIMARY KEY AUTO_INCREMENT,
  projectId INT NOT NULL,
  sceneNumber INT NOT NULL,
  timeStart VARCHAR(10),
  timeEnd VARCHAR(10),
  place VARCHAR(255),
  beat TEXT,
  grokVideoPrompt TEXT NOT NULL,
  negative TEXT,
  generatedImageUrl VARCHAR(500),
  generatedImageKey VARCHAR(255),
  status ENUM('pending', 'generating', 'completed', 'error') DEFAULT 'pending',
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (projectId) REFERENCES projects(id) ON DELETE CASCADE
);
```

#### 8. **exports**
Registro de exportaciones realizadas.

```sql
CREATE TABLE exports (
  id INT PRIMARY KEY AUTO_INCREMENT,
  projectId INT NOT NULL,
  exportType ENUM('text', 'json', 'markdown') DEFAULT 'text',
  exportUrl VARCHAR(500),
  exportKey VARCHAR(255),
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (projectId) REFERENCES projects(id) ON DELETE CASCADE
);
```

---

## Flujo de Datos

### 1. Carga de Guion (Script Upload)

```
Usuario sube guion
    ↓
[Frontend] ScriptUpload.tsx valida formato
    ↓
[tRPC] scripts.upload.mutation()
    ↓
[Backend] Guarda en DB (status: 'pending')
    ↓
[Backend] Inicia análisis asincrónico
    ↓
[LLM Service] Envía guion + system prompt a OpenAI
    ↓
[LLM] Retorna Story Bible + Scene Breakdown
    ↓
[Backend] Persiste resultados en DB
    ↓
[Frontend] Recibe notificación y actualiza UI
```

### 2. Análisis de Guion (Script Analysis)

```
[Backend] scripts.analyze.mutation(scriptId)
    ↓
[LLM Service] Construye mensaje con:
  - System prompt (narrativeDirector.ts)
  - Guion del usuario
  - Instrucciones de formato
    ↓
[OpenAI] Retorna JSON estructurado:
  {
    storyBible: {
      characters: [...],
      locations: [...],
      props: [...]
    },
    sceneBreakdown: [
      {
        sceneNumber: 1,
        time: "00:00–00:10",
        place: "EXT.FOREST-DAWN",
        beat: "...",
        grokVideoPrompt: "...",
        negative: "..."
      },
      ...
    ]
  }
    ↓
[Backend] Persiste en tablas: storyBibles, characters, locations, props, scenes
    ↓
[Frontend] Visualiza Story Bible y Scene Breakdown
```

### 3. Gestión de Personajes (Character Management)

```
Usuario visualiza personajes detectados
    ↓
[Frontend] Muestra CharacterCard para cada personaje
    ↓
Usuario puede:
  a) Editar nombre, rasgos, vestuario
  b) Subir imagen de referencia
  c) Agregar personaje manual
    ↓
[tRPC] characters.update.mutation() o characters.create.mutation()
    ↓
[Backend] Actualiza DB y S3 (si hay imagen)
    ↓
[Frontend] Actualiza lista de personajes
```

### 4. Generación de Imágenes (Image Generation)

```
Usuario solicita generar imagen para escena
    ↓
[Frontend] SceneCard → botón "Generar Imagen"
    ↓
[tRPC] scenes.generateImage.mutation(sceneId)
    ↓
[Backend] Recupera Scene + Story Bible
    ↓
[Image Service] Construye prompt mejorado:
  - GROK_VIDEO_PROMPT de la escena
  - Detalles de personajes (vestuario, rasgos)
  - Estilo visual global (Pixar-like, pastel palette)
    ↓
[Manus Image Service] Genera imagen
    ↓
[Storage Service] Sube imagen a S3
    ↓
[Backend] Actualiza scenes.generatedImageUrl
    ↓
[Frontend] Muestra imagen generada
```

### 5. Exportación (Export)

```
Usuario solicita exportar proyecto
    ↓
[Frontend] ExportDialog → elige formato (text/json)
    ↓
[tRPC] export.generate.mutation(projectId, format)
    ↓
[Backend] Recupera:
  - Story Bible completa
  - Scene Breakdown completo
  - Imágenes generadas (URLs)
    ↓
[Backend] Formatea según tipo:
  - TEXT: Formato plano sin Markdown
  - JSON: Estructura completa
    ↓
[Storage Service] Sube archivo a S3
    ↓
[Backend] Retorna URL de descarga
    ↓
[Frontend] Ofrece descarga al usuario
```

---

## API Endpoints (tRPC)

### Projects Router

| Procedimiento | Tipo | Descripción |
|--------------|------|-------------|
| `projects.list` | Query | Listar proyectos del usuario |
| `projects.get` | Query | Obtener detalles de un proyecto |
| `projects.create` | Mutation | Crear nuevo proyecto |
| `projects.update` | Mutation | Actualizar proyecto |
| `projects.delete` | Mutation | Eliminar proyecto |

### Scripts Router

| Procedimiento | Tipo | Descripción |
|--------------|------|-------------|
| `scripts.upload` | Mutation | Subir guion maestro |
| `scripts.analyze` | Mutation | Analizar guion con LLM |
| `scripts.get` | Query | Obtener guion |

### Characters Router

| Procedimiento | Tipo | Descripción |
|--------------|------|-------------|
| `characters.list` | Query | Listar personajes del proyecto |
| `characters.get` | Query | Obtener detalles de personaje |
| `characters.create` | Mutation | Agregar personaje manual |
| `characters.update` | Mutation | Actualizar personaje |
| `characters.uploadImage` | Mutation | Subir imagen de referencia |
| `characters.delete` | Mutation | Eliminar personaje |

### Scenes Router

| Procedimiento | Tipo | Descripción |
|--------------|------|-------------|
| `scenes.list` | Query | Listar escenas del proyecto |
| `scenes.get` | Query | Obtener detalles de escena |
| `scenes.generateImage` | Mutation | Generar imagen para escena |
| `scenes.update` | Mutation | Actualizar escena |

### StoryBible Router

| Procedimiento | Tipo | Descripción |
|--------------|------|-------------|
| `storyBible.get` | Query | Obtener Story Bible completa |
| `storyBible.getBreakdown` | Query | Obtener Scene Breakdown |

### Export Router

| Procedimiento | Tipo | Descripción |
|--------------|------|-------------|
| `export.generate` | Mutation | Generar exportación |
| `export.download` | Query | Descargar archivo exportado |

---

## Servicios Backend

### LLM Service (`server/services/llmService.ts`)

Encapsula la integración con OpenAI/Gemini. Responsabilidades:

- Construir mensajes con system prompt del Director Narrativo
- Enviar solicitudes a OpenAI API
- Parsear respuestas JSON estructuradas
- Manejo de errores y reintentos
- Logging de solicitudes y respuestas

**Métodos principales:**

```typescript
analyzeScript(scriptContent: string): Promise<AnalysisResult>
generateScenePrompts(storyBible: StoryBible, scenes: Scene[]): Promise<Scene[]>
```

### Image Service (`server/services/imageService.ts`)

Genera imágenes para escenas. Responsabilidades:

- Construir prompts mejorados basados en Story Bible
- Llamar al servicio de generación de imágenes de Manus
- Manejo de timeouts y reintentos
- Logging de generaciones

**Métodos principales:**

```typescript
generateSceneImage(scene: Scene, storyBible: StoryBible): Promise<string>
```

### Storage Service (`server/services/storageService.ts`)

Gestiona almacenamiento en S3. Responsabilidades:

- Subir imágenes de personajes
- Subir imágenes generadas de escenas
- Subir archivos de exportación
- Generar URLs presignadas

**Métodos principales:**

```typescript
uploadCharacterImage(projectId: number, characterId: number, buffer: Buffer): Promise<{url: string, key: string}>
uploadSceneImage(projectId: number, sceneId: number, buffer: Buffer): Promise<{url: string, key: string}>
uploadExport(projectId: number, content: string, format: string): Promise<{url: string, key: string}>
```

### Narrative Analyzer (`server/services/narrativeAnalyzer.ts`)

Análisis avanzado de narrativa. Responsabilidades:

- Validar consistencia de personajes
- Detectar cambios no autorizados en vestuario
- Validar duración total de escenas
- Generar advertencias de calidad

**Métodos principales:**

```typescript
validateConsistency(storyBible: StoryBible, scenes: Scene[]): ValidationResult
```

---

## Flujo de Autenticación

1. Usuario accede a la aplicación
2. Si no está autenticado, se redirige a Manus OAuth
3. Después de autenticación, se establece cookie de sesión
4. Cada solicitud tRPC incluye contexto del usuario
5. Procedimientos protegidos validan `ctx.user`

---

## Mejoras Propuestas (Roadmap)

### Fase 2: Generación de Video
- Integración con Grok Video API para generar videos directamente
- Procesamiento en cola (queue) para videos de larga duración
- Previsualizaciones de video en la interfaz

### Fase 3: Colaboración
- Compartir proyectos entre usuarios
- Comentarios y sugerencias en escenas
- Control de versiones de guiones

### Fase 4: Bibliotecas Reutilizables
- Guardar personajes en biblioteca global
- Plantillas de Story Bible
- Estilos visuales predefinidos

### Fase 5: Análisis Avanzado
- Detección de problemas narrativos
- Sugerencias de mejora de pacing
- Análisis de consistencia automático

### Fase 6: Monetización
- Integración con Stripe para planes premium
- Límites de generación por plan
- Exportación a formatos profesionales

---

## Consideraciones de Seguridad

1. **Validación de Entrada:** Todos los guiones se validan antes de enviar a LLM
2. **Rate Limiting:** Límites en análisis y generación de imágenes por usuario
3. **Almacenamiento:** Imágenes se almacenan en S3 con permisos privados
4. **Autenticación:** Solo usuarios autenticados pueden acceder a sus proyectos
5. **CORS:** Configurado para aceptar solo orígenes de Manus

---

## Rendimiento y Escalabilidad

1. **Caché:** Resultados de análisis se cachean en DB
2. **Procesamiento Asincrónico:** Análisis y generación de imágenes en background
3. **Paginación:** Listados de proyectos y escenas paginados
4. **Índices:** Índices en projectId, userId para queries rápidas
5. **CDN:** Imágenes servidas desde S3 con CloudFront

---

## Monitoreo y Logging

- Logs de análisis LLM en `server/services/llmService.ts`
- Logs de generación de imágenes en `server/services/imageService.ts`
- Logs de errores en base de datos
- Notificaciones al propietario para errores críticos

---

## Documentación Adicional

- **README.md:** Guía de inicio rápido e instalación
- **Inline Comments:** Código comentado en servicios complejos
- **Type Definitions:** Tipos TypeScript para todas las estructuras

---

**Fin de Arquitectura**
