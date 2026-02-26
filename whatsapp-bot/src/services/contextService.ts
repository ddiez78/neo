import { ChatContext, ConversationMessage, BotConfig } from '../types/index.js';
import fs from 'fs/promises';
import path from 'path';

export class ContextService {
  private contexts: Map<string, ChatContext> = new Map();
  private config: BotConfig;
  private persistPath: string;

  constructor(config: BotConfig) {
    this.config = config;
    this.persistPath = path.join(config.dataDir, 'contexts.json');
    this.loadContexts();
  }

  private async loadContexts(): Promise<void> {
    try {
      const data = await fs.readFile(this.persistPath, 'utf-8');
      const contexts = JSON.parse(data);
      for (const [chatId, context] of Object.entries(contexts)) {
        this.contexts.set(chatId, context as ChatContext);
      }
      console.log(`Contextos cargados: ${this.contexts.size}`);
    } catch (error) {
      console.log('No se encontraron contextos previos, iniciando con vacío');
    }
  }

  private async saveContexts(): Promise<void> {
    try {
      const contextsObj: Record<string, ChatContext> = {};
      for (const [chatId, context] of this.contexts) {
        contextsObj[chatId] = context;
      }
      await fs.writeFile(this.persistPath, JSON.stringify(contextsObj, null, 2));
    } catch (error) {
      console.error('Error al guardar contextos:', error);
    }
  }

  getContext(chatId: string): ChatContext {
    if (!this.contexts.has(chatId)) {
      this.contexts.set(chatId, {
        chatId,
        messages: [],
        lastUpdated: Date.now(),
      });
    }
    return this.contexts.get(chatId)!;
  }

  addMessage(chatId: string, role: 'user' | 'assistant', content: string): void {
    const context = this.getContext(chatId);
    context.messages.push({
      role,
      content,
      timestamp: Date.now(),
    });

    // Mantener solo los últimos N mensajes
    if (context.messages.length > this.config.maxContextMessages * 2) {
      context.messages = context.messages.slice(-this.config.maxContextMessages * 2);
    }

    context.lastUpdated = Date.now();
    this.saveContexts();
  }

  getRecentMessages(chatId: string, limit: number = this.config.maxContextMessages): ConversationMessage[] {
    const context = this.getContext(chatId);
    return context.messages.slice(-limit);
  }

  clearContext(chatId: string): void {
    this.contexts.delete(chatId);
    this.saveContexts();
  }

  clearAllContexts(): void {
    this.contexts.clear();
    this.saveContexts();
  }

  getContextStats(): { totalChats: number; totalMessages: number } {
    let totalMessages = 0;
    for (const context of this.contexts.values()) {
      totalMessages += context.messages.length;
    }
    return {
      totalChats: this.contexts.size,
      totalMessages,
    };
  }
}
