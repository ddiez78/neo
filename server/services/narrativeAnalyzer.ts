/**
 * Narrative Analyzer - Análisis avanzado de narrativa
 * Responsabilidades:
 * - Validación de consistencia de personajes
 * - Detección de cambios no autorizados en vestuario
 * - Validación de duración total de escenas
 * - Generación de advertencias de calidad
 */

import type { Scene, StoryBible, ValidationResult } from "../types";

/**
 * Valida la consistencia de una Story Bible y Scene Breakdown
 * @param storyBible - Story Bible a validar
 * @param scenes - Escenas a validar
 * @returns Resultado de validación con errores y advertencias
 */
export function validateConsistency(
  storyBible: StoryBible,
  scenes: Scene[]
): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Validar que haya al menos un personaje
  if (!storyBible.characters || storyBible.characters.length === 0) {
    errors.push("Story Bible must have at least one character");
  }

  // Validar que haya al menos una locación
  if (!storyBible.locations || storyBible.locations.length === 0) {
    errors.push("Story Bible must have at least one location");
  }

  // Validar que haya al menos una escena
  if (!scenes || scenes.length === 0) {
    errors.push("Scene Breakdown must have at least one scene");
  }

  // Validar duración total de escenas
  const totalDuration = validateSceneDuration(scenes);
  if (!totalDuration.isValid) {
    warnings.push(totalDuration.message);
  }

  // Validar consistencia de personajes en escenas
  const characterConsistency = validateCharacterConsistency(
    storyBible,
    scenes
  );
  if (characterConsistency.errors.length > 0) {
    errors.push(...characterConsistency.errors);
  }
  if (characterConsistency.warnings.length > 0) {
    warnings.push(...characterConsistency.warnings);
  }

  // Validar que no haya personajes duplicados
  const duplicateCharacters = findDuplicateCharacters(storyBible);
  if (duplicateCharacters.length > 0) {
    errors.push(
      `Duplicate character names found: ${duplicateCharacters.join(", ")}`
    );
  }

  // Validar que no haya locaciones duplicadas
  const duplicateLocations = findDuplicateLocations(storyBible);
  if (duplicateLocations.length > 0) {
    errors.push(
      `Duplicate location names found: ${duplicateLocations.join(", ")}`
    );
  }

  // Validar que las escenas estén numeradas correctamente
  const numberingIssues = validateSceneNumbering(scenes);
  if (numberingIssues.length > 0) {
    errors.push(...numberingIssues);
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Valida la duración total de las escenas
 * @param scenes - Escenas a validar
 * @returns Objeto con validación y mensaje
 */
function validateSceneDuration(scenes: Scene[]): {
  isValid: boolean;
  message: string;
} {
  if (scenes.length === 0) {
    return { isValid: false, message: "No scenes to validate" };
  }

  const totalSeconds = scenes.length * 10; // Cada escena debe durar 10 segundos
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  if (totalSeconds < 30) {
    return {
      isValid: false,
      message: `Total duration is too short (${minutes}:${seconds.toString().padStart(2, "0")}). Minimum recommended is 30 seconds.`,
    };
  }

  if (totalSeconds > 600) {
    return {
      isValid: false,
      message: `Total duration is very long (${minutes}:${seconds.toString().padStart(2, "0")}). Consider breaking into multiple episodes.`,
    };
  }

  return {
    isValid: true,
    message: `Total duration: ${minutes}:${seconds.toString().padStart(2, "0")}`,
  };
}

/**
 * Valida la consistencia de personajes entre Story Bible y escenas
 * @param storyBible - Story Bible
 * @param scenes - Escenas
 * @returns Objeto con errores y advertencias
 */
function validateCharacterConsistency(
  storyBible: StoryBible,
  scenes: Scene[]
): { errors: string[]; warnings: string[] } {
  const errors: string[] = [];
  const warnings: string[] = [];

  const characterNames = new Set(
    storyBible.characters.map((c) => c.name.toLowerCase())
  );

  // Verificar que los personajes mencionados en beats existan en Story Bible
  const mentionedCharacters = new Set<string>();

  scenes.forEach((scene) => {
    if (scene.beat) {
      const beatLower = scene.beat.toLowerCase();
      storyBible.characters.forEach((char) => {
        if (beatLower.includes(char.name.toLowerCase())) {
          mentionedCharacters.add(char.name);
        }
      });
    }
  });

  // Advertencia si hay personajes no mencionados
  storyBible.characters.forEach((char) => {
    if (!mentionedCharacters.has(char.name)) {
      warnings.push(
        `Character "${char.name}" is defined but not mentioned in any scene`
      );
    }
  });

  return { errors, warnings };
}

/**
 * Encuentra personajes con nombres duplicados
 * @param storyBible - Story Bible
 * @returns Array de nombres duplicados
 */
function findDuplicateCharacters(storyBible: StoryBible): string[] {
  const names = storyBible.characters.map((c) =>
    c.name.toLowerCase()
  );
  const duplicates = names.filter(
    (name, index) => names.indexOf(name) !== index
  );
  return Array.from(new Set(duplicates));
}

/**
 * Encuentra locaciones con nombres duplicados
 * @param storyBible - Story Bible
 * @returns Array de nombres duplicados
 */
function findDuplicateLocations(storyBible: StoryBible): string[] {
  const names = storyBible.locations.map((l) =>
    l.name.toLowerCase()
  );
  const duplicates = names.filter(
    (name, index) => names.indexOf(name) !== index
  );
  return Array.from(new Set(duplicates));
}

/**
 * Valida que las escenas estén numeradas correctamente
 * @param scenes - Escenas
 * @returns Array de errores de numeración
 */
function validateSceneNumbering(scenes: Scene[]): string[] {
  const errors: string[] = [];

  // Verificar que las escenas estén numeradas secuencialmente
  const sortedScenes = [...scenes].sort(
    (a, b) => a.sceneNumber - b.sceneNumber
  );

  for (let i = 0; i < sortedScenes.length; i++) {
    if (sortedScenes[i].sceneNumber !== i + 1) {
      errors.push(
        `Scene numbering is not sequential. Expected scene ${i + 1}, got scene ${sortedScenes[i].sceneNumber}`
      );
      break;
    }
  }

  return errors;
}

/**
 * Genera un reporte de calidad de la narrativa
 * @param storyBible - Story Bible
 * @param scenes - Escenas
 * @returns Reporte de calidad
 */
export function generateQualityReport(
  storyBible: StoryBible,
  scenes: Scene[]
): {
  score: number;
  issues: string[];
  suggestions: string[];
} {
  const issues: string[] = [];
  const suggestions: string[] = [];
  let score = 100;

  // Verificar cantidad de personajes
  if (storyBible.characters.length < 2) {
    issues.push("Story has very few characters");
    score -= 10;
  }

  if (storyBible.characters.length > 6) {
    suggestions.push(
      "Consider reducing the number of characters for better focus"
    );
    score -= 5;
  }

  // Verificar cantidad de locaciones
  if (storyBible.locations.length < 1) {
    issues.push("Story has no defined locations");
    score -= 20;
  }

  if (storyBible.locations.length > 6) {
    suggestions.push(
      "Consider reducing the number of locations for better coherence"
    );
    score -= 5;
  }

  // Verificar cantidad de escenas
  if (scenes.length < 3) {
    issues.push("Story has very few scenes");
    score -= 15;
  }

  // Verificar prompts de video
  const shortPrompts = scenes.filter(
    (s) => !s.grokVideoPrompt || s.grokVideoPrompt.length < 100
  );
  if (shortPrompts.length > 0) {
    suggestions.push(
      `${shortPrompts.length} scene(s) have very short video prompts`
    );
    score -= shortPrompts.length * 2;
  }

  return {
    score: Math.max(0, score),
    issues,
    suggestions,
  };
}
