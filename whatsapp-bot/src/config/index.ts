import { BotConfig } from '../types/index.js';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '../..');

export function loadConfig(): BotConfig {
  const config: BotConfig = {
    openaiApiKey: process.env.OPENAI_API_KEY || '',
    openaiApiUrl: process.env.OPENAI_API_URL || 'https://api.openai.com/v1',
    llmModel: process.env.LLM_MODEL || 'gpt-4.1-mini',
    botMode: (process.env.BOT_MODE as 'auto' | 'selective') || 'auto',
    allowedContacts: process.env.ALLOWED_CONTACTS
      ? process.env.ALLOWED_CONTACTS.split(',').map(c => c.trim())
      : [],
    systemPrompt: process.env.SYSTEM_PROMPT || 'Eres un asistente amable y útil. Responde de manera concisa y clara.',
    maxContextMessages: parseInt(process.env.MAX_CONTEXT_MESSAGES || '10', 10),
    responseTimeout: parseInt(process.env.RESPONSE_TIMEOUT || '30000', 10),
    autoReadMessages: process.env.AUTO_READ_MESSAGES !== 'false',
    logLevel: process.env.LOG_LEVEL || 'info',
    dataDir: process.env.DATA_DIR || join(projectRoot, 'data'),
    sessionDir: process.env.SESSION_DIR || join(projectRoot, 'data', 'sessions'),
    logDir: process.env.LOG_DIR || join(projectRoot, 'logs'),
  };

  // Validación
  if (!config.openaiApiKey) {
    throw new Error('OPENAI_API_KEY no está configurada');
  }

  if (config.botMode === 'selective' && config.allowedContacts.length === 0) {
    console.warn('Modo selectivo activado pero ALLOWED_CONTACTS está vacío. El bot no responderá a ningún contacto.');
  }

  return config;
}

export function validateConfig(config: BotConfig): string[] {
  const errors: string[] = [];

  if (!config.openaiApiKey) {
    errors.push('OPENAI_API_KEY es requerida');
  }

  if (!config.openaiApiUrl) {
    errors.push('OPENAI_API_URL es requerida');
  }

  if (!config.llmModel) {
    errors.push('LLM_MODEL es requerida');
  }

  if (!['auto', 'selective'].includes(config.botMode)) {
    errors.push('BOT_MODE debe ser "auto" o "selective"');
  }

  if (config.maxContextMessages < 1) {
    errors.push('MAX_CONTEXT_MESSAGES debe ser mayor a 0');
  }

  if (config.responseTimeout < 1000) {
    errors.push('RESPONSE_TIMEOUT debe ser mayor a 1000ms');
  }

  return errors;
}
