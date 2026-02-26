/**
 * Validadores y utilidades de formato
 */

import type { Scene, Character } from "../types";

/**
 * Valida que un nombre sea válido
 */
export function isValidName(name: string): boolean {
  if (!name || name.trim().length === 0) return false;
  if (name.length > 255) return false;
  return true;
}

/**
 * Valida que un email sea válido
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Valida que un URL sea válido
 */
export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Valida que un tiempo esté en formato HH:MM
 */
export function isValidTimeFormat(time: string): boolean {
  const timeRegex = /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/;
  return timeRegex.test(time);
}

/**
 * Valida que una escena tenga todos los campos requeridos
 */
export function isValidScene(scene: Partial<Scene>): boolean {
  if (!scene.sceneNumber || scene.sceneNumber < 1) return false;
  if (!scene.timeStart || !isValidTimeFormat(scene.timeStart)) return false;
  if (!scene.timeEnd || !isValidTimeFormat(scene.timeEnd)) return false;
  if (!scene.place || scene.place.trim().length === 0) return false;
  if (!scene.grokVideoPrompt || scene.grokVideoPrompt.trim().length === 0) {
    return false;
  }
  return true;
}

/**
 * Valida que un personaje tenga al menos un nombre
 */
export function isValidCharacter(character: Partial<Character>): boolean {
  if (!character.name || character.name.trim().length === 0) return false;
  if (character.name.length > 255) return false;
  return true;
}

/**
 * Sanitiza una cadena de texto
 */
export function sanitizeString(text: string): string {
  return text
    .trim()
    .replace(/\s+/g, " ")
    .substring(0, 10000);
}

/**
 * Formatea una duración en segundos a HH:MM:SS
 */
export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  return [hours, minutes, secs]
    .map((val) => String(val).padStart(2, "0"))
    .join(":");
}

/**
 * Calcula la duración total de un Scene Breakdown
 */
export function calculateTotalDuration(sceneCount: number): string {
  const totalSeconds = sceneCount * 10;
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

/**
 * Valida que dos tiempos sean consecutivos
 */
export function areTimesConsecutive(
  timeEnd: string,
  nextTimeStart: string
): boolean {
  const [endHours, endMinutes] = timeEnd.split(":").map(Number);
  const [startHours, startMinutes] = nextTimeStart.split(":").map(Number);

  const endTotalSeconds = endHours * 3600 + endMinutes * 60;
  const startTotalSeconds = startHours * 3600 + startMinutes * 60;

  return startTotalSeconds === endTotalSeconds;
}

/**
 * Genera un número de escena formateado
 */
export function formatSceneNumber(sceneNumber: number): string {
  return `Scene${String(sceneNumber).padStart(2, "0")}`;
}

/**
 * Valida que un prompt de Grok Video sea válido
 */
export function isValidGrokPrompt(prompt: string): boolean {
  if (!prompt || prompt.trim().length === 0) return false;
  if (prompt.length < 50) return false; // Demasiado corto
  if (prompt.length > 1000) return false; // Demasiado largo
  if (prompt.includes("[") || prompt.includes("]")) return false; // Sin corchetes
  if (prompt.includes("watermark") || prompt.includes("text")) return false; // Sin texto en pantalla
  return true;
}

/**
 * Valida que un negativo sea válido
 */
export function isValidNegative(negative: string): boolean {
  if (!negative || negative.trim().length === 0) return false;
  if (negative.length > 500) return false;
  return true;
}

/**
 * Extrae palabras clave de un prompt
 */
export function extractKeywords(text: string): string[] {
  const stopWords = new Set([
    "the",
    "a",
    "an",
    "and",
    "or",
    "but",
    "in",
    "on",
    "at",
    "to",
    "for",
    "of",
    "with",
    "by",
    "from",
  ]);

  return text
    .toLowerCase()
    .split(/\s+/)
    .filter((word) => word.length > 3 && !stopWords.has(word))
    .slice(0, 10);
}

/**
 * Valida que un proyecto tenga un título válido
 */
export function isValidProjectTitle(title: string): boolean {
  if (!title || title.trim().length === 0) return false;
  if (title.length < 3) return false;
  if (title.length > 255) return false;
  return true;
}

/**
 * Valida que una descripción sea válida
 */
export function isValidDescription(description: string): boolean {
  if (!description || description.trim().length === 0) return true; // Opcional
  if (description.length > 1000) return false;
  return true;
}
