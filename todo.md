# Neo-App: Project TODO

## Fase 1: Arquitectura y Configuración (COMPLETADA)

- [x] Crear ARCHITECTURE.md con documentación completa
- [x] Crear estructura de carpetas del proyecto
- [x] Configurar package.json con dependencias
- [x] Crear .env.example con variables de entorno
- [x] Crear tipos TypeScript compartidos (server/types/index.ts)
- [x] Crear system prompt del Director Narrativo
- [x] Crear esquema de base de datos (drizzle/schema.ts)
- [x] Crear README.md con instrucciones de instalación

## Fase 2: Backend - Servicios Principales (COMPLETADA)

- [x] Implementar LLM Service (server/services/llmService.ts)
  - [x] Integración con OpenAI API
  - [x] Análisis de guiones
  - [x] Parseo de respuestas JSON
  - [x] Manejo de errores y reintentos
  
- [x] Implementar Image Service (server/services/imageService.ts)
  - [x] Generación de imágenes para escenas
  - [x] Construcción de prompts mejorados
  - [x] Manejo de timeouts

- [x] Implementar Storage Service (server/services/storageService.ts)
  - [x] Upload de imágenes de personajes
  - [x] Upload de imágenes generadas
  - [x] Upload de exportaciones
  - [x] Generación de URLs presignadas

- [x] Implementar Narrative Analyzer (server/services/narrativeAnalyzer.ts)
  - [x] Validación de consistencia
  - [x] Detección de cambios de vestuario
  - [x] Validación de duración de escenas

## Fase 3: Backend - Routers tRPC (COMPLETADA)

- [x] Implementar Projects Router (server/routers/projects.ts)
  - [x] projects.list - Listar proyectos
  - [x] projects.get - Obtener proyecto
  - [x] projects.create - Crear proyecto
  - [x] projects.update - Actualizar proyecto
  - [x] projects.delete - Eliminar proyecto

- [x] Implementar Scripts Router (server/routers/scripts.ts)
  - [x] scripts.upload - Subir guion
  - [x] scripts.analyze - Analizar con LLM
  - [x] scripts.get - Obtener guion

- [x] Implementar Characters Router (server/routers/characters.ts)
  - [x] characters.list - Listar personajes
  - [x] characters.get - Obtener personaje
  - [x] characters.create - Agregar personaje
  - [x] characters.update - Actualizar personaje
  - [x] characters.uploadImage - Subir imagen referencia
  - [x] characters.delete - Eliminar personaje

- [x] Implementar Scenes Router (server/routers/scenes.ts)
  - [x] scenes.list - Listar escenas
  - [x] scenes.get - Obtener escena
  - [x] scenes.generateImage - Generar imagen
  - [x] scenes.update - Actualizar escena

- [x] Implementar StoryBible Router (server/routers/storyBibleAndExport.ts)
  - [x] storyBible.getStoryBible - Obtener Story Bible completa
  - [x] storyBible.getSceneBreakdown - Obtener Scene Breakdown
  - [x] storyBible.generateExport - Generar exportación

## Fase 4: Backend - Helpers y Utilidades (COMPLETADA)

- [x] Actualizar server/db.ts con query helpers
  - [x] getProjectById
  - [x] getUserProjects
  - [x] getProjectCharacters
  - [x] getProjectScenes
  - [x] getStoryBible
  - [x] etc.

- [x] Crear server/utils/validators.ts
  - [x] Validar contenido de guion
  - [x] Validar estructura de Story Bible
  - [x] Validar Scene Breakdown

- [x] Crear server/utils/formatters.ts
  - [x] Formatear exportación a texto plano
  - [x] Formatear exportación a JSON
  - [x] Formatear exportación a Markdown

## Fase 5: Frontend - Páginas Principales (COMPLETADA)

- [x] Actualizar client/src/pages/Home.tsx
  - [x] Landing page / Dashboard
  - [x] Mostrar proyectos recientes
  - [x] Botones de acción principal

- [x] Crear client/src/pages/ProjectDashboard.tsx
  - [x] Listar todos los proyectos
  - [x] Filtrado y búsqueda
  - [x] Crear nuevo proyecto
  - [x] Eliminar proyecto

- [x] Crear client/src/pages/ScriptEditor.tsx
  - [x] Formulario para subir guion
  - [x] Validación de contenido
  - [x] Mostrar estado de análisis
  - [x] Indicador de progreso

- [x] Crear client/src/pages/StoryBible.tsx
  - [x] Visualizar Story Bible completa
  - [x] Editar personajes
  - [x] Subir imágenes de referencia
  - [x] Agregar personajes manuales
  - [x] Editar locaciones y props

- [x] Crear client/src/pages/SceneBreakdown.tsx
  - [x] Listar todas las escenas
  - [x] Mostrar TIME, PLACE, BEAT, GROK_VIDEO_PROMPT, NEGATIVE
  - [x] Generar imágenes para escenas
  - [x] Preview de escenas

- [x] Crear client/src/pages/ProjectDashboard.tsx
  - [x] Mostrar detalles de un proyecto
  - [x] Mostrar estadísticas
  - [x] Flujo de trabajo visual
  - [x] Acceso rápido a todas las secciones

## Fase 4: Mejoras y Optimizaciones (COMPLETADA)

- [x] Crear hooks personalizados React
  - [x] useProject: Gestión de proyectos (crear, actualizar, eliminar)
  - [x] useCharacters: Gestión de personajes (crear, actualizar, subir imagen, eliminar)
  - [x] useScenes: Gestión de escenas (generar imagen, actualizar)
  - [x] Manejo de errores y notificaciones integrado
  - [x] Invalidación de caché automática

- [x] Validación de imágenes
  - [x] Componente ImageUploadField con preview en tiempo real
  - [x] Validación de tipo de archivo (JPEG, PNG, WebP)
  - [x] Validación de tamaño (máximo 5MB configurable)
  - [x] Drag & drop support
  - [x] Mensajes de error claros
  - [x] Indicadores visuales de estado

- [x] Búsqueda y filtrado de proyectos
  - [x] Campo de búsqueda por título y descripción
  - [x] Filtrado por estado (Borrador, Analizando, Completado)
  - [x] Contador dinámico de resultados
  - [x] Botón para limpiar filtros
  - [x] Interfaz responsive

- [x] Verificación de compilación
  - [x] Build exitoso sin errores TypeScript
  - [x] Advertencia de chunk size (optimizable en futuro)
  - [x] Todos los módulos transformados correctamente

## Fase 6: Frontend - Componentes Reutilizables

- [ ] Crear client/src/components/CharacterCard.tsx
  - [ ] Mostrar información de personaje
  - [ ] Botón para editar
  - [ ] Mostrar imagen de referencia

- [ ] Crear client/src/components/SceneCard.tsx
  - [ ] Mostrar información de escena
  - [ ] Mostrar imagen generada
  - [ ] Botón para generar imagen
  - [ ] Botón para editar

- [ ] Crear client/src/components/ImageUploader.tsx
  - [ ] Componente reutilizable para subir imágenes
  - [ ] Preview de imagen
  - [ ] Validación de tamaño

- [ ] Crear client/src/components/PromptPreview.tsx
  - [ ] Mostrar prompt de video
  - [ ] Copiar al portapapeles
  - [ ] Mostrar contador de caracteres

- [ ] Crear client/src/components/ExportDialog.tsx
  - [ ] Diálogo para seleccionar formato
  - [ ] Mostrar vista previa
  - [ ] Botón de descarga

- [ ] Crear client/src/components/LoadingSpinner.tsx
  - [ ] Indicador de carga reutilizable

## Fase 7: Frontend - Hooks y Contextos

- [ ] Crear client/src/hooks/useProject.ts
  - [ ] Hook para gestionar proyecto actual
  - [ ] Cargar datos del proyecto
  - [ ] Actualizar proyecto

- [ ] Crear client/src/hooks/useCharacters.ts
  - [ ] Hook para gestionar personajes
  - [ ] Listar personajes
  - [ ] Agregar/editar/eliminar

- [ ] Crear client/src/hooks/useScenes.ts
  - [ ] Hook para gestionar escenas
  - [ ] Listar escenas
  - [ ] Generar imágenes

- [ ] Crear client/src/contexts/ProjectContext.tsx
  - [ ] Contexto global del proyecto actual
  - [ ] Compartir Story Bible
  - [ ] Compartir Scene Breakdown

## Fase 8: Frontend - Diseño y Estilos

- [ ] Definir paleta de colores en client/src/index.css
  - [ ] Colores primarios
  - [ ] Colores secundarios
  - [ ] Colores de estado

- [ ] Crear componentes de layout
  - [ ] Header con navegación
  - [ ] Sidebar de navegación
  - [ ] Footer

- [ ] Implementar responsive design
  - [ ] Mobile first
  - [ ] Breakpoints Tailwind
  - [ ] Pruebas en diferentes dispositivos

## Fase 9: Testing

- [ ] Crear tests para LLM Service
  - [ ] Análisis de guion
  - [ ] Parseo de respuestas
  - [ ] Manejo de errores

- [ ] Crear tests para Image Service
  - [ ] Generación de imágenes
  - [ ] Construcción de prompts

- [ ] Crear tests para routers tRPC
  - [ ] Procedimientos protegidos
  - [ ] Validación de entrada
  - [ ] Respuestas correctas

- [ ] Crear tests para componentes React
  - [ ] Renderizado correcto
  - [ ] Interacciones de usuario
  - [ ] Llamadas a tRPC

## Fase 10: Integración y Pulido

- [ ] Integración end-to-end
  - [ ] Flujo completo: guion → Story Bible → escenas → exportación
  - [ ] Pruebas manuales en navegador

- [ ] Optimización de rendimiento
  - [ ] Caché de resultados
  - [ ] Paginación de listados
  - [ ] Lazy loading de imágenes

- [ ] Manejo de errores
  - [ ] Mensajes de error claros
  - [ ] Toast notifications
  - [ ] Recuperación de errores

- [ ] Documentación de código
  - [ ] Comentarios en servicios complejos
  - [ ] JSDoc en funciones públicas
  - [ ] Ejemplos de uso

## Fase 11: Despliegue

- [ ] Preparar para producción
  - [ ] Build optimizado
  - [ ] Variables de entorno
  - [ ] Configuración de CORS

- [ ] Documentación de despliegue
  - [ ] Instrucciones para Manus
  - [ ] Instrucciones para OpenCode/Antigravity
  - [ ] Configuración de dominio

## Mejoras Futuras (Roadmap)

- [ ] Generación de video (Grok Video API)
- [ ] Colaboración entre usuarios
- [ ] Bibliotecas reutilizables de personajes
- [ ] Análisis narrativo avanzado
- [ ] Integración con Stripe para planes premium
- [ ] Exportación a formatos profesionales
- [ ] Soporte para múltiples idiomas
- [ ] Sistema de plantillas de Story Bible
