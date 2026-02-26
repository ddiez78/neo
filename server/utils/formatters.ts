/**
 * Utilidades de formateo para exportación y presentación
 */

import type { Scene, Character, Location, Prop } from "../types";

/**
 * Formatea un personaje para presentación
 */
export function formatCharacterForDisplay(character: Character): string {
  let output = `${character.name}`;

  if (character.species) {
    output += ` (${character.species}`;
    if (character.ageVibe) {
      output += `, ${character.ageVibe}`;
    }
    output += ")";
  }

  return output;
}

/**
 * Formatea una escena para presentación en texto plano
 */
export function formatSceneForPlainText(scene: Scene): string {
  const sceneNum = String(scene.sceneNumber).padStart(2, "0");
  let output = `Scene${sceneNum}\n`;
  output += `TIME: ${scene.timeStart}–${scene.timeEnd}\n`;
  output += `PLACE: ${scene.place}\n`;
  output += `BEAT: ${scene.beat}\n`;
  output += `GROK_VIDEO_PROMPT: ${scene.grokVideoPrompt}\n`;
  output += `NEGATIVE: ${scene.negative}\n`;

  return output;
}

/**
 * Formatea toda la Story Bible en texto plano
 */
export function formatStoryBibleAsPlainText(
  characters: Character[],
  locations: Location[],
  props: Prop[]
): string {
  let output = "=".repeat(80) + "\n";
  output += "STORY BIBLE\n";
  output += "=".repeat(80) + "\n\n";

  // Personajes
  output += "CHARACTERS\n";
  output += "-".repeat(40) + "\n";
  characters.forEach((char) => {
    output += `\n${char.name}\n`;
    if (char.species) output += `Species: ${char.species}\n`;
    if (char.ageVibe) output += `Age Vibe: ${char.ageVibe}\n`;
    if (char.visualTraits) output += `Visual Traits: ${char.visualTraits}\n`;
    if (char.personalityVibe) output += `Personality: ${char.personalityVibe}\n`;
  });

  output += "\n\n";

  // Locaciones
  output += "LOCATIONS\n";
  output += "-".repeat(40) + "\n";
  locations.forEach((loc) => {
    output += `\n${loc.name}\n${loc.visualDescription}\n`;
  });

  output += "\n\n";

  // Props
  if (props.length > 0) {
    output += "PROPS\n";
    output += "-".repeat(40) + "\n";
    props.forEach((prop) => {
      output += `\n${prop.name}: ${prop.description}`;
      if (prop.usedBy) output += ` (Used by: ${prop.usedBy})`;
      output += "\n";
    });
    output += "\n";
  }

  return output;
}

/**
 * Formatea un Scene Breakdown completo en texto plano
 */
export function formatSceneBreakdownAsPlainText(scenes: Scene[]): string {
  let output = "=".repeat(80) + "\n";
  output += "SCENE BREAKDOWN\n";
  output += "=".repeat(80) + "\n\n";

  scenes.forEach((scene) => {
    output += formatSceneForPlainText(scene);
    output += "\n";
  });

  return output;
}

/**
 * Formatea un proyecto completo para exportación en texto plano
 */
export function formatProjectAsPlainText(
  projectTitle: string,
  projectDescription: string | null | undefined,
  characters: Character[],
  locations: Location[],
  props: Prop[],
  scenes: Scene[]
): string {
  let output = "";

  // Encabezado
  output += `PROJECT: ${projectTitle}\n`;
  if (projectDescription) {
    output += `DESCRIPTION: ${projectDescription}\n`;
  }
  output += "\n";

  // Story Bible
  output += formatStoryBibleAsPlainText(characters, locations, props);

  // Scene Breakdown
  output += formatSceneBreakdownAsPlainText(scenes);

  return output;
}

/**
 * Genera un nombre de archivo para exportación
 */
export function generateExportFileName(
  projectTitle: string,
  format: "text" | "json" | "markdown"
): string {
  const sanitized = projectTitle
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  const timestamp = new Date().toISOString().split("T")[0];
  const extension = format === "text" ? "txt" : format;

  return `${sanitized}-${timestamp}.${extension}`;
}

/**
 * Formatea una duración en segundos a MM:SS
 */
export function formatTimeShort(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}

/**
 * Trunca una cadena a una longitud máxima
 */
export function truncateString(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3) + "...";
}

/**
 * Formatea un outfit para presentación
 */
export function formatOutfitForDisplay(outfit: any): string {
  if (!outfit) return "";

  const parts: string[] = [];

  if (outfit.colors && Array.isArray(outfit.colors)) {
    parts.push(`Colors: ${outfit.colors.join(", ")}`);
  }

  if (outfit.clothing && Array.isArray(outfit.clothing)) {
    parts.push(`Clothing: ${outfit.clothing.join(", ")}`);
  }

  if (outfit.accessories && Array.isArray(outfit.accessories)) {
    parts.push(`Accessories: ${outfit.accessories.join(", ")}`);
  }

  return parts.join(" | ");
}

/**
 * Convierte un objeto a JSON formateado
 */
export function formatAsJSON(obj: any, indent: number = 2): string {
  return JSON.stringify(obj, null, indent);
}

/**
 * Genera un resumen de estadísticas del proyecto
 */
export function generateProjectStats(
  characterCount: number,
  locationCount: number,
  propCount: number,
  sceneCount: number
): string {
  const totalDuration = sceneCount * 10;
  const minutes = Math.floor(totalDuration / 60);
  const seconds = totalDuration % 60;

  return (
    `Characters: ${characterCount} | ` +
    `Locations: ${locationCount} | ` +
    `Props: ${propCount} | ` +
    `Scenes: ${sceneCount} | ` +
    `Duration: ${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`
  );
}
