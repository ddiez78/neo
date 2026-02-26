import makeWASocket, { DisconnectReason, useMultiFileAuthState } from '@whiskeysockets/baileys';
import { Boom } from '@hapi/boom';
import qrcode from 'qrcode-terminal';
import { BotConfig, BotState, WhatsAppMessage } from '../types/index.js';
import { LLMService } from './llmService.js';
import { ContextService } from './contextService.js';
import fs from 'fs/promises';
import path from 'path';

export class WhatsAppService {
  private config: BotConfig;
  private llmService: LLMService;
  private contextService: ContextService;
  private state: BotState = {
    isConnected: false,
    isReady: false,
    lastActivity: Date.now(),
  };
  private socket: any = null;

  constructor(config: BotConfig, llmService: LLMService, contextService: ContextService) {
    this.config = config;
    this.llmService = llmService;
    this.contextService = contextService;
  }

  async connect(): Promise<void> {
    try {
      await fs.mkdir(this.config.sessionDir, { recursive: true });

      const { state: authState, saveCreds } = await useMultiFileAuthState(this.config.sessionDir);

      this.socket = makeWASocket({
        auth: authState,
        printQRInTerminal: true,
        logger: undefined, // Desactivar logs de Baileys
      });

      // Evento de QR
      this.socket.ev.on('connection.update', (update: any) => {
        const { connection, lastDisconnect, qr } = update;

        if (qr) {
          console.log('\n=== ESCANEA ESTE CÓDIGO QR CON TU TELÉFONO ===\n');
          qrcode.generate(qr, { small: true });
        }

        if (connection === 'connecting') {
          console.log('Conectando...');
        }

        if (connection === 'open') {
          console.log('✓ Conectado a WhatsApp');
          this.state.isConnected = true;
          this.state.isReady = true;
        }

        if (connection === 'close') {
          const shouldReconnect = (lastDisconnect?.error as Boom)?.output?.statusCode !== DisconnectReason.loggedOut;
          console.log('Desconectado del servidor, reconectando:', shouldReconnect);
          this.state.isConnected = false;
          if (shouldReconnect) {
            this.connect();
          }
        }
      });

      // Evento de credenciales
      this.socket.ev.on('creds.update', saveCreds);

      // Evento de mensajes
      this.socket.ev.on('messages.upsert', async (m: any) => {
        await this.handleMessages(m);
      });

      console.log('Servicio de WhatsApp iniciado');
    } catch (error) {
      console.error('Error al conectar a WhatsApp:', error);
      throw error;
    }
  }

  private async handleMessages(m: any): Promise<void> {
    try {
      const messages = m.messages || [];

      for (const msg of messages) {
        // Ignorar mensajes propios
        if (msg.key.fromMe) {
          continue;
        }

        // Ignorar mensajes de grupos (opcional)
        const isGroup = msg.key.remoteJid?.endsWith('@g.us');
        if (isGroup) {
          continue;
        }

        const chatId = msg.key.remoteJid;
        const messageText = this.extractMessageText(msg);

        if (!messageText) {
          continue;
        }

        console.log(`📨 Mensaje de ${chatId}: ${messageText}`);

        // Verificar si debe responder
        if (!this.shouldRespond(chatId)) {
          console.log(`⏭️  Ignorando mensaje de ${chatId} (no permitido)`);
          continue;
        }

        // Marcar como leído
        if (this.config.autoReadMessages) {
          await this.socket.readMessages([msg.key]);
        }

        // Generar respuesta
        const response = await this.generateResponse(chatId, messageText);

        // Enviar respuesta
        if (response) {
          await this.socket.sendMessage(chatId, { text: response });
          console.log(`✓ Respuesta enviada a ${chatId}`);
        }
      }
    } catch (error) {
      console.error('Error al procesar mensajes:', error);
    }
  }

  private extractMessageText(msg: WhatsAppMessage): string | null {
    if (msg.message?.conversation) {
      return msg.message.conversation;
    }
    if (msg.message?.extendedTextMessage?.text) {
      return msg.message.extendedTextMessage.text;
    }
    return null;
  }

  private shouldRespond(chatId: string): boolean {
    if (this.config.botMode === 'auto') {
      return true;
    }

    // Modo selectivo
    return this.config.allowedContacts.some(contact => chatId.includes(contact));
  }

  private async generateResponse(chatId: string, userMessage: string): Promise<string | null> {
    try {
      // Agregar mensaje del usuario al contexto
      this.contextService.addMessage(chatId, 'user', userMessage);

      // Obtener historial reciente
      const recentMessages = this.contextService.getRecentMessages(chatId);

      // Generar respuesta con LLM
      const llmResponse = await this.llmService.generateResponse(userMessage, recentMessages);

      // Agregar respuesta al contexto
      this.contextService.addMessage(chatId, 'assistant', llmResponse.content);

      return llmResponse.content;
    } catch (error) {
      console.error('Error al generar respuesta:', error);
      return 'Disculpa, hubo un error al procesar tu mensaje. Intenta de nuevo.';
    }
  }

  getState(): BotState {
    return this.state;
  }

  async disconnect(): Promise<void> {
    if (this.socket) {
      await this.socket.end();
      this.state.isConnected = false;
      this.state.isReady = false;
      console.log('Desconectado de WhatsApp');
    }
  }
}
