export interface BotConfig {
  openaiApiKey: string;
  openaiApiUrl: string;
  llmModel: string;
  botMode: 'auto' | 'selective';
  allowedContacts: string[];
  systemPrompt: string;
  maxContextMessages: number;
  responseTimeout: number;
  autoReadMessages: boolean;
  logLevel: string;
  dataDir: string;
  sessionDir: string;
  logDir: string;
}

export interface ConversationMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

export interface ChatContext {
  chatId: string;
  messages: ConversationMessage[];
  lastUpdated: number;
}

export interface WhatsAppMessage {
  key: {
    remoteJid: string;
    fromMe: boolean;
    id: string;
  };
  message: {
    conversation?: string;
    extendedTextMessage?: {
      text: string;
    };
  };
  messageTimestamp: number;
}

export interface BotState {
  isConnected: boolean;
  isReady: boolean;
  phoneNumber?: string;
  lastActivity: number;
}

export interface LLMResponse {
  content: string;
  tokensUsed: number;
  model: string;
}
