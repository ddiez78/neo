import 'dotenv/config';
import { loadConfig, validateConfig } from './config/index.js';
import { LLMService } from './services/llmService.js';
import { ContextService } from './services/contextService.js';
import { WhatsAppService } from './services/whatsappService.js';
import fs from 'fs/promises';

async function main() {
  try {
    console.log('=== Neo-App WhatsApp Bot ===\n');

    // Cargar configuración
    console.log('Cargando configuración...');
    const config = loadConfig();

    // Validar configuración
    const errors = validateConfig(config);
    if (errors.length > 0) {
      console.error('Errores de configuración:');
      errors.forEach(err => console.error(`  - ${err}`));
      process.exit(1);
    }

    console.log(`✓ Configuración cargada`);
    console.log(`  - Modo: ${config.botMode}`);
    console.log(`  - Modelo LLM: ${config.llmModel}`);
    console.log(`  - Max contexto: ${config.maxContextMessages} mensajes`);

    // Crear directorios necesarios
    await fs.mkdir(config.dataDir, { recursive: true });
    await fs.mkdir(config.logDir, { recursive: true });
    await fs.mkdir(config.sessionDir, { recursive: true });

    // Inicializar servicios
    console.log('\nIniciando servicios...');
    const llmService = new LLMService(config);
    const contextService = new ContextService(config);
    const whatsappService = new WhatsAppService(config, llmService, contextService);

    // Probar conexión con LLM
    console.log('Probando conexión con LLM...');
    const llmConnected = await llmService.testConnection();
    if (!llmConnected) {
      console.error('✗ No se pudo conectar con el servicio de LLM');
      process.exit(1);
    }
    console.log('✓ Conexión con LLM exitosa');

    // Conectar a WhatsApp
    console.log('\nConectando a WhatsApp...');
    await whatsappService.connect();

    // Mostrar estadísticas
    setInterval(() => {
      const state = whatsappService.getState();
      const stats = contextService.getContextStats();
      console.log(`\n[${new Date().toLocaleTimeString()}] Estado: ${state.isReady ? '✓ Listo' : '⏳ Conectando'} | Chats: ${stats.totalChats} | Mensajes: ${stats.totalMessages}`);
    }, 60000);

    // Manejo de señales
    process.on('SIGINT', async () => {
      console.log('\n\nDesconectando...');
      await whatsappService.disconnect();
      process.exit(0);
    });

    process.on('SIGTERM', async () => {
      console.log('\n\nDesconectando...');
      await whatsappService.disconnect();
      process.exit(0);
    });
  } catch (error) {
    console.error('Error fatal:', error);
    process.exit(1);
  }
}

main();
