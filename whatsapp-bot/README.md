# Neo-App WhatsApp Bot

Bot de WhatsApp personal con respuesta automática usando inteligencia artificial (LLM). Utiliza Baileys para conectarse a WhatsApp Web y OpenAI (o compatible) para generar respuestas inteligentes.

## Características

- **Conexión segura a WhatsApp:** Usa Baileys para conectarse a través de WhatsApp Web sin necesidad de API oficial
- **Respuestas automáticas con LLM:** Integración con OpenAI, Gemini o cualquier API compatible
- **Contexto de conversación:** Mantiene historial de mensajes por chat para respuestas más coherentes
- **Modos de respuesta:** Auto (responde a todos) o Selectivo (solo contactos permitidos)
- **System prompt personalizable:** Define el comportamiento del bot
- **Persistencia:** Guarda contexto de conversaciones entre sesiones
- **Escaneo QR:** Conexión fácil mediante código QR desde terminal

## Requisitos

- Node.js 18+ 
- npm o pnpm
- Cuenta de WhatsApp personal
- API Key de OpenAI o servicio compatible

## Instalación

1. Navega a la carpeta del bot:
```bash
cd whatsapp-bot
```

2. Instala dependencias:
```bash
pnpm install
# o npm install
```

3. Crea archivo `.env` basado en `.env.example`:
```bash
cp .env.example .env
```

4. Configura las variables de entorno en `.env`:
```
OPENAI_API_KEY=tu_clave_api
OPENAI_API_URL=https://api.openai.com/v1
LLM_MODEL=gpt-4.1-mini
BOT_MODE=auto
SYSTEM_PROMPT=Tu prompt personalizado
```

## Configuración

### Variables de Entorno

| Variable | Descripción | Valor por defecto |
|----------|-------------|-------------------|
| `OPENAI_API_KEY` | Clave de API de OpenAI | (requerida) |
| `OPENAI_API_URL` | URL base de OpenAI | https://api.openai.com/v1 |
| `LLM_MODEL` | Modelo a usar | gpt-4.1-mini |
| `BOT_MODE` | Modo de respuesta: auto o selective | auto |
| `ALLOWED_CONTACTS` | Contactos permitidos (modo selective) | (vacío) |
| `SYSTEM_PROMPT` | Instrucción del sistema para el LLM | Asistente amable |
| `MAX_CONTEXT_MESSAGES` | Mensajes a recordar por chat | 10 |
| `RESPONSE_TIMEOUT` | Timeout para respuesta en ms | 30000 |
| `AUTO_READ_MESSAGES` | Marcar mensajes como leídos | true |

### Modos de Respuesta

**Modo Auto (por defecto):**
- El bot responde a todos los mensajes recibidos
- Útil para asistente general

**Modo Selective:**
- El bot solo responde a contactos en `ALLOWED_CONTACTS`
- Ejemplo: `ALLOWED_CONTACTS=5491234567,5491234568`
- Útil para filtrar respuestas

## Uso

### Desarrollo

```bash
pnpm dev
```

Esto iniciará el bot en modo watch. Escanea el código QR que aparecerá en terminal con tu teléfono.

### Producción

```bash
# Compilar
pnpm build

# Ejecutar
pnpm start
```

## Flujo de Funcionamiento

1. **Conexión:** Bot se conecta a WhatsApp escaneando QR
2. **Recepción:** Recibe mensajes entrantes de chats personales
3. **Procesamiento:** 
   - Extrae texto del mensaje
   - Verifica si debe responder (según modo)
   - Obtiene historial de conversación
4. **LLM:** Envía contexto + mensaje al LLM para generar respuesta
5. **Respuesta:** Envía respuesta automática al chat
6. **Persistencia:** Guarda contexto para próximos mensajes

## Estructura de Carpetas

```
whatsapp-bot/
├── src/
│   ├── config/
│   │   └── index.ts          # Carga y validación de configuración
│   ├── services/
│   │   ├── llmService.ts     # Servicio de LLM
│   │   ├── contextService.ts # Gestión de contexto de conversación
│   │   └── whatsappService.ts # Servicio principal de WhatsApp
│   ├── types/
│   │   └── index.ts          # Tipos TypeScript
│   └── index.ts              # Punto de entrada
├── data/
│   ├── sessions/             # Sesiones de Baileys (autogenerado)
│   └── contexts.json         # Contextos de conversación (autogenerado)
├── logs/                      # Archivos de log (autogenerado)
├── package.json
├── tsconfig.json
├── .env.example
└── README.md
```

## Consideraciones de Seguridad

⚠️ **IMPORTANTE:** Antes de usar este bot, considera lo siguiente:

1. **Términos de Servicio de WhatsApp:** El uso de bots automatizados puede violar los términos de servicio de WhatsApp. WhatsApp puede bloquear tu cuenta si detecta actividad automatizada.

2. **Privacidad:** El bot procesa mensajes personales. Asegúrate de que sea legal en tu jurisdicción.

3. **Datos Sensibles:** No compartas información sensible en chats con el bot activo.

4. **API Key:** Nunca compartas tu `OPENAI_API_KEY` en repositorios públicos.

5. **Rate Limiting:** WhatsApp puede limitar la cantidad de mensajes. El bot incluye timeouts para evitar bloqueos.

6. **Contexto Persistente:** El contexto se guarda localmente. Limpia `data/contexts.json` si necesitas resetear conversaciones.

## Troubleshooting

### El código QR no aparece
- Asegúrate de que la terminal soporta caracteres especiales
- Intenta con `qrcode-terminal` en una terminal diferente

### No se reciben mensajes
- Verifica que el bot esté conectado (deberías ver "✓ Conectado a WhatsApp")
- Revisa que `BOT_MODE` sea `auto` o que el contacto esté en `ALLOWED_CONTACTS`

### Error de LLM
- Verifica que `OPENAI_API_KEY` sea válida
- Comprueba que `OPENAI_API_URL` sea correcta
- Verifica que el modelo especificado exista

### Sesión expirada
- Elimina la carpeta `data/sessions/`
- Vuelve a escanear el código QR

## Logs

Los logs se guardan en la carpeta `logs/`. Puedes revisar:
- `bot.log` - Logs generales del bot
- `errors.log` - Errores y excepciones

## Mejoras Futuras

- [ ] Soporte para mensajes con imágenes
- [ ] Respuestas con imágenes generadas
- [ ] Estadísticas de uso
- [ ] Dashboard web
- [ ] Múltiples instancias
- [ ] Webhook para integraciones
- [ ] Soporte para grupos

## Licencia

MIT

## Soporte

Para reportar bugs o sugerencias, abre un issue en el repositorio principal de Neo-App.
