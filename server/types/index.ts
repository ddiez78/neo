/**
 * Tipos compartidos para Neo-App
 * Utilizados en servicios, routers y base de datos
 */

// ============================================================================
// STORY BIBLE TYPES
// ============================================================================

export interface Character {
  id?: number;
  projectId?: number;
  name: string;
  species?: string;
  ageVibe?: string;
  visualTraits?: string;
  outfit?: {
    colors?: string[];
    clothing?: string[];
    accessories?: string[];
  };
  personalityVibe?: string;
  referenceImageUrl?: string;
  referenceImageKey?: string;
  isManuallyAdded?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Location {
  id?: number;
  projectId?: number;
  name: string;
  visualDescription: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Prop {
  id?: number;
  projectId?: number;
  name: string;
  description: string;
  usedBy?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface StoryBible {
  id?: number;
  projectId: number;
  characters: Character[];
  locations: Location[];
  props: Prop[];
  characterCount: number;
  locationCount: number;
  propCount: number;
  visualBible?: Record<string, unknown>;
  createdAt?: Date;
  updatedAt?: Date;
}

// ============================================================================
// SCENE BREAKDOWN TYPES
// ============================================================================

export interface Scene {
  id?: number;
  projectId?: number;
  sceneNumber: number;
  timeStart: string; // "00:00"
  timeEnd: string; // "00:10"
  place: string; // "EXT.FOREST-DAWN"
  beat: string; // Descripción de qué sucede
  grokVideoPrompt: string; // Prompt en inglés para Grok Video
  negative: string; // Elementos a evitar
  generatedImageUrl?: string;
  generatedImageKey?: string;
  status?: "pending" | "generating" | "completed" | "error";
  createdAt?: Date;
  updatedAt?: Date;
}

export interface SceneBreakdown {
  scenes: Scene[];
  totalDuration: string; // "00:XX"
  totalScenes: number;
}

// ============================================================================
// ANALYSIS RESULT TYPES
// ============================================================================

export interface LLMAnalysisResult {
  storyBible: {
    characters: Character[];
    locations: Location[];
    props: Prop[];
  };
  sceneBreakdown: Scene[];
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

// ============================================================================
// PROJECT TYPES
// ============================================================================

export interface Project {
  id?: number;
  userId?: number;
  title: string;
  description?: string;
  status?: "draft" | "analyzing" | "completed" | "archived";
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Script {
  id?: number;
  projectId: number;
  title: string;
  content: string;
  language?: string;
  status?: "pending" | "analyzing" | "analyzed" | "error";
  analysisError?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

// ============================================================================
// EXPORT TYPES
// ============================================================================

export interface ExportData {
  projectId: number;
  title: string;
  storyBible: StoryBible;
  sceneBreakdown: SceneBreakdown;
  generatedAt: Date;
}

export interface ExportRecord {
  id?: number;
  projectId: number;
  exportType: "text" | "json" | "markdown";
  exportUrl?: string;
  exportKey?: string;
  createdAt?: Date;
}

// ============================================================================
// API REQUEST/RESPONSE TYPES
// ============================================================================

export interface UploadScriptRequest {
  projectId: number;
  title: string;
  content: string;
}

export interface AnalyzeScriptRequest {
  scriptId: number;
}

export interface CreateCharacterRequest {
  projectId: number;
  name: string;
  species?: string;
  ageVibe?: string;
  visualTraits?: string;
  outfit?: Character["outfit"];
  personalityVibe?: string;
}

export interface UpdateCharacterRequest {
  characterId: number;
  name?: string;
  species?: string;
  ageVibe?: string;
  visualTraits?: string;
  outfit?: Character["outfit"];
  personalityVibe?: string;
}

export interface GenerateSceneImageRequest {
  sceneId: number;
  projectId: number;
}

export interface ExportProjectRequest {
  projectId: number;
  format: "text" | "json" | "markdown";
}

// ============================================================================
// IMAGE GENERATION TYPES
// ============================================================================

export interface ImageGenerationRequest {
  prompt: string;
  negativePrompt?: string;
  width?: number;
  height?: number;
  steps?: number;
}

export interface ImageGenerationResult {
  url: string;
  key: string;
  mimeType: string;
}

// ============================================================================
// LLM SERVICE TYPES
// ============================================================================

export interface LLMMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface LLMRequest {
  messages: LLMMessage[];
  model?: string;
  temperature?: number;
  maxTokens?: number;
  responseFormat?: {
    type: "json_schema" | "text";
    json_schema?: Record<string, unknown>;
  };
}

export interface LLMResponse {
  content: string;
  model: string;
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}
