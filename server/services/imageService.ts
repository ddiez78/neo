/**
 * Image Service - Generación de imágenes para escenas
 * Responsabilidades:
 * - Generación de imágenes basadas en prompts de Grok Video
 * - Mejora de prompts con detalles de Story Bible
 * - Manejo de timeouts y errores
 */

import { generateImage } from "../_core/imageGeneration";
import type { Scene, StoryBible } from "../types";

const IMAGE_GENERATION_TIMEOUT = parseInt(
  process.env.IMAGE_SERVICE_TIMEOUT || "30000"
);

/**
 * Genera una imagen para una escena específica
 * @param scene - Escena con prompt de Grok Video
 * @param storyBible - Story Bible para contexto visual
 * @returns URL de la imagen generada
 */
export async function generateSceneImage(
  scene: Scene,
  storyBible: StoryBible
): Promise<string> {
  if (!scene.grokVideoPrompt || scene.grokVideoPrompt.trim().length === 0) {
    throw new Error("Scene must have a grokVideoPrompt");
  }

  try {
    console.log(
      `[ImageService] Generating image for scene ${scene.sceneNumber}...`
    );

    // Construir prompt mejorado con contexto de Story Bible
    const enhancedPrompt = buildEnhancedPrompt(scene, storyBible);

    // Llamar al servicio de generación de imágenes de Manus
    const negativePrompt = buildNegativePrompt(scene);
    const fullPrompt = `${enhancedPrompt}\n\nNegative: ${negativePrompt}`;
    
    const result = await generateImage({
      prompt: fullPrompt,
    });

    if (!result || !result.url) {
      throw new Error("Image generation returned no URL");
    }

    console.log(
      `[ImageService] Image generated successfully: ${result.url}`
    );

    return result.url;
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : String(error);
    console.error(
      `[ImageService] Failed to generate image for scene ${scene.sceneNumber}:`,
      errorMessage
    );
    throw new Error(
      `Image generation failed: ${errorMessage}`
    );
  }
}

/**
 * Construye un prompt mejorado combinando el prompt de Grok Video con detalles de Story Bible
 * @param scene - Escena con prompt base
 * @param storyBible - Story Bible para contexto
 * @returns Prompt mejorado en inglés
 */
function buildEnhancedPrompt(scene: Scene, storyBible: StoryBible): string {
  // Extraer detalles relevantes de la Story Bible basado en la escena
  const sceneCharacters = extractCharactersForScene(scene, storyBible);
  const sceneLocation = extractLocationForScene(scene, storyBible);

  let enhancedPrompt = scene.grokVideoPrompt;

  // Agregar detalles de personajes si están presentes en la escena
  if (sceneCharacters.length > 0) {
    const characterDetails = sceneCharacters
      .map((char) => {
        const outfit = char.outfit as Record<string, unknown> | undefined;
        const colors = (outfit?.colors as string[] | undefined)?.join(", ") || "neutral";
        const clothing = (outfit?.clothing as string[] | undefined)?.join(", ") || "simple";
        return `${char.name} wearing ${clothing} in ${colors} tones`;
      })
      .join(", ");

    enhancedPrompt += `. Characters: ${characterDetails}`;
  }

  // Agregar detalles de locación
  if (sceneLocation) {
    enhancedPrompt += `. Setting: ${sceneLocation.visualDescription}`;
  }

  // Agregar estilo visual global
  enhancedPrompt +=
    `. Style: Pixar-like 3D animation, pastel color palette, warm soft lighting, gentle depth of field, cozy atmosphere. Camera: stable with slow movements only.`;

  return enhancedPrompt;
}

/**
 * Construye el prompt negativo para la generación de imágenes
 * @param scene - Escena con información negativa
 * @returns Prompt negativo
 */
function buildNegativePrompt(scene: Scene): string {
  // Usar el negativo de la escena si existe
  if (scene.negative && scene.negative.trim().length > 0) {
    return scene.negative;
  }

  // Negativo global por defecto
  return "on-screen text, subtitles, watermark, logo, deformed hands, extra limbs, distortion, hyper-realism, horror, blood, weapons, scary teeth, creepy eyes, darkness, aggressive shadows";
}

/**
 * Extrae personajes relevantes para una escena basado en el BEAT
 * @param scene - Escena
 * @param storyBible - Story Bible
 * @returns Lista de personajes relevantes
 */
function extractCharactersForScene(
  scene: Scene,
  storyBible: StoryBible
): typeof storyBible.characters {
  if (!scene.beat || !storyBible.characters) {
    return [];
  }

  const beatLower = scene.beat.toLowerCase();

  // Filtrar personajes mencionados en el beat
  return storyBible.characters.filter((char) => {
    const charNameLower = char.name.toLowerCase();
    return beatLower.includes(charNameLower);
  });
}

/**
 * Extrae la locación relevante para una escena
 * @param scene - Escena
 * @param storyBible - Story Bible
 * @returns Locación relevante
 */
function extractLocationForScene(
  scene: Scene,
  storyBible: StoryBible
): (typeof storyBible.locations)[0] | null {
  if (!scene.place || !storyBible.locations) {
    return null;
  }

  const placeLower = scene.place.toLowerCase();

  // Encontrar locación que coincida con el PLACE
  return (
    storyBible.locations.find((loc) =>
      placeLower.includes(loc.name.toLowerCase())
    ) || null
  );
}

/**
 * Valida que una escena sea apta para generación de imagen
 * @param scene - Escena a validar
 * @returns true si es válida, false en caso contrario
 */
export function validateSceneForImageGeneration(scene: Scene): boolean {
  if (!scene.grokVideoPrompt || scene.grokVideoPrompt.trim().length === 0) {
    return false;
  }

  if (scene.grokVideoPrompt.length < 50) {
    return false; // Prompt muy corto
  }

  if (scene.grokVideoPrompt.length > 1000) {
    return false; // Prompt muy largo
  }

  return true;
}

/**
 * Obtiene estadísticas del servicio
 * @returns Información de configuración
 */
export function getImageServiceStats() {
  return {
    timeout: IMAGE_GENERATION_TIMEOUT,
    maxPromptLength: 1000,
    minPromptLength: 50,
  };
}
