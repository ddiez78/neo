import { OpenAI } from 'openai';
import { ConversationMessage, LLMResponse, BotConfig } from '../types/index.js';

export class LLMService {
  private client: OpenAI;
  private config: BotConfig;

  constructor(config: BotConfig) {
    this.config = config;
    this.client = new OpenAI({
      apiKey: config.openaiApiKey,
      baseURL: config.openaiApiUrl,
    });
  }

  async generateResponse(
    userMessage: string,
    conversationHistory: ConversationMessage[]
  ): Promise<LLMResponse> {
    try {
      const messages = [
        {
          role: 'system' as const,
          content: this.config.systemPrompt,
        },
        ...conversationHistory.map(msg => ({
          role: msg.role,
          content: msg.content,
        })),
        {
          role: 'user' as const,
          content: userMessage,
        },
      ];

      const response = await this.client.chat.completions.create({
        model: this.config.llmModel,
        messages: messages,
        temperature: 0.7,
        max_tokens: 500,
      });

      const content = response.choices[0]?.message?.content || '';
      const tokensUsed = response.usage?.total_tokens || 0;

      return {
        content,
        tokensUsed,
        model: this.config.llmModel,
      };
    } catch (error) {
      console.error('Error al generar respuesta con LLM:', error);
      throw new Error(`Error en LLM: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async testConnection(): Promise<boolean> {
    try {
      const response = await this.client.chat.completions.create({
        model: this.config.llmModel,
        messages: [
          {
            role: 'user',
            content: 'Hola',
          },
        ],
        max_tokens: 10,
      });

      return !!response.choices[0]?.message?.content;
    } catch (error) {
      console.error('Error al probar conexión con LLM:', error);
      return false;
    }
  }
}
