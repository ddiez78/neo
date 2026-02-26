/**
 * LLM Service - Integración con OpenAI para análisis de guiones
 * Responsabilidades:
 * - Análisis de guiones maestros
 * - Generación de Story Bible y Scene Breakdown
 * - Parseo de respuestas JSON
 * - Manejo de errores y reintentos
 */

import { OpenAI } from "openai";
import {
  NARRATIVE_DIRECTOR_SYSTEM_PROMPT,
  buildScriptAnalysisMessage,
  parseNarrativeDirectorResponse,
} from "../prompts/narrativeDirector";
import type { LLMAnalysisResult } from "../types";

// Inicializar cliente de OpenAI
let openai: OpenAI | null = null;

function getOpenAIClient(): OpenAI {
  if (!openai) {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error(
        "OPENAI_API_KEY environment variable is not set"
      );
    }
    openai = new OpenAI({ apiKey });
  }
  return openai;
}

const LLM_MODEL = process.env.LLM_MODEL || "gpt-4.1-mini";
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 1000;

/**
 * Analiza un guion maestro y genera Story Bible + Scene Breakdown
 * @param scriptContent - Contenido del guion maestro
 * @returns Resultado del análisis con Story Bible y Scene Breakdown
 */
export async function analyzeScript(
  scriptContent: string
): Promise<LLMAnalysisResult> {
  if (!scriptContent || scriptContent.trim().length === 0) {
    throw new Error("Script content cannot be empty");
  }

  if (scriptContent.length > 50000) {
    throw new Error("Script content exceeds maximum length of 50000 characters");
  }

  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      console.log(
        `[LLM] Analyzing script (attempt ${attempt}/${MAX_RETRIES})...`
      );

      const userMessage = buildScriptAnalysisMessage(scriptContent);
      const client = getOpenAIClient();

      const response = await client.chat.completions.create({
        model: LLM_MODEL,
        messages: [
          {
            role: "system",
            content: NARRATIVE_DIRECTOR_SYSTEM_PROMPT,
          },
          {
            role: "user",
            content: userMessage,
          },
        ],
        temperature: 0.7,
        max_tokens: 4000,
        response_format: {
          type: "json_schema",
          json_schema: {
            name: "narrative_analysis",
            strict: true,
            schema: {
              type: "object",
              properties: {
                storyBible: {
                  type: "object",
                  properties: {
                    characters: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          name: { type: "string" },
                          species: { type: "string" },
                          ageVibe: { type: "string" },
                          visualTraits: { type: "string" },
                          outfit: {
                            type: "object",
                            properties: {
                              colors: { type: "array", items: { type: "string" } },
                              clothing: { type: "array", items: { type: "string" } },
                              accessories: { type: "array", items: { type: "string" } },
                            },
                          },
                          personalityVibe: { type: "string" },
                        },
                        required: ["name"],
                      },
                    },
                    locations: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          name: { type: "string" },
                          visualDescription: { type: "string" },
                        },
                        required: ["name", "visualDescription"],
                      },
                    },
                    props: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          name: { type: "string" },
                          description: { type: "string" },
                          usedBy: { type: "string" },
                        },
                        required: ["name", "description"],
                      },
                    },
                  },
                  required: ["characters", "locations", "props"],
                },
                sceneBreakdown: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      sceneNumber: { type: "integer" },
                      timeStart: { type: "string" },
                      timeEnd: { type: "string" },
                      place: { type: "string" },
                      beat: { type: "string" },
                      grokVideoPrompt: { type: "string" },
                      negative: { type: "string" },
                    },
                    required: [
                      "sceneNumber",
                      "timeStart",
                      "timeEnd",
                      "place",
                      "beat",
                      "grokVideoPrompt",
                      "negative",
                    ],
                  },
                },
              },
              required: ["storyBible", "sceneBreakdown"],
            },
          },
        },
      });

      const content = response.choices[0]?.message.content;
      if (!content) {
        throw new Error("Empty response from LLM");
      }

      console.log(`[LLM] Parsing response...`);
      const parsed = parseNarrativeDirectorResponse(content);

      if (!parsed) {
        throw new Error("Failed to parse LLM response as JSON");
      }

      // Validar estructura básica
      if (!parsed.storyBible || !parsed.sceneBreakdown) {
        throw new Error("Invalid response structure: missing storyBible or sceneBreakdown");
      }

      const storyBible = parsed.storyBible as Record<string, unknown>;
      const sceneBreakdown = parsed.sceneBreakdown as unknown[];
      const characters = (storyBible.characters as unknown[]) || [];

      console.log(
        `[LLM] Analysis complete. Found ${characters.length} characters, ${sceneBreakdown.length} scenes`
      );

      return parsed as unknown as LLMAnalysisResult;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      console.error(`[LLM] Attempt ${attempt} failed:`, lastError.message);

      if (attempt < MAX_RETRIES) {
        const delay = RETRY_DELAY_MS * attempt;
        console.log(`[LLM] Retrying in ${delay}ms...`);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  throw new Error(
    `Failed to analyze script after ${MAX_RETRIES} attempts: ${lastError?.message || "Unknown error"}`
  );
}

/**
 * Valida que un guion sea apropiado para análisis
 * @param scriptContent - Contenido del guion
 * @returns true si es válido, false en caso contrario
 */
export function validateScriptContent(scriptContent: string): boolean {
  if (!scriptContent || scriptContent.trim().length === 0) {
    return false;
  }

  if (scriptContent.length < 50) {
    return false; // Guion muy corto
  }

  if (scriptContent.length > 50000) {
    return false; // Guion muy largo
  }

  return true;
}

/**
 * Obtiene estadísticas de uso de tokens
 * @returns Información de uso
 */
export function getUsageStats() {
  return {
    model: LLM_MODEL,
    maxRetries: MAX_RETRIES,
    retryDelayMs: RETRY_DELAY_MS,
  };
}
