/**
 * Storage Service - Gestión de almacenamiento en S3
 * Responsabilidades:
 * - Upload de imágenes de personajes
 * - Upload de imágenes generadas
 * - Upload de exportaciones
 * - Generación de URLs presignadas
 */

import { storagePut, storageGet } from "../storage";
import { nanoid } from "nanoid";

const STORAGE_BUCKET = process.env.S3_BUCKET || "neo-app-storage";

/**
 * Sube una imagen de referencia de personaje a S3
 * @param projectId - ID del proyecto
 * @param characterId - ID del personaje
 * @param buffer - Buffer de la imagen
 * @param mimeType - Tipo MIME de la imagen
 * @returns Objeto con URL y key
 */
export async function uploadCharacterImage(
  projectId: number,
  characterId: number,
  buffer: Buffer,
  mimeType: string = "image/jpeg"
): Promise<{ url: string; key: string }> {
  try {
    console.log(
      `[StorageService] Uploading character image for project ${projectId}, character ${characterId}...`
    );

    const fileKey = `projects/${projectId}/characters/${characterId}/reference-${nanoid()}.jpg`;

    const result = await storagePut(fileKey, buffer, mimeType);

    console.log(
      `[StorageService] Character image uploaded: ${result.url}`
    );

    return {
      url: result.url,
      key: fileKey,
    };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : String(error);
    console.error(
      `[StorageService] Failed to upload character image:`,
      errorMessage
    );
    throw new Error(`Character image upload failed: ${errorMessage}`);
  }
}

/**
 * Sube una imagen generada de escena a S3
 * @param projectId - ID del proyecto
 * @param sceneId - ID de la escena
 * @param buffer - Buffer de la imagen
 * @param mimeType - Tipo MIME de la imagen
 * @returns Objeto con URL y key
 */
export async function uploadSceneImage(
  projectId: number,
  sceneId: number,
  buffer: Buffer,
  mimeType: string = "image/jpeg"
): Promise<{ url: string; key: string }> {
  try {
    console.log(
      `[StorageService] Uploading scene image for project ${projectId}, scene ${sceneId}...`
    );

    const fileKey = `projects/${projectId}/scenes/${sceneId}/generated-${nanoid()}.jpg`;

    const result = await storagePut(fileKey, buffer, mimeType);

    console.log(
      `[StorageService] Scene image uploaded: ${result.url}`
    );

    return {
      url: result.url,
      key: fileKey,
    };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : String(error);
    console.error(
      `[StorageService] Failed to upload scene image:`,
      errorMessage
    );
    throw new Error(`Scene image upload failed: ${errorMessage}`);
  }
}

/**
 * Sube un archivo de exportación a S3
 * @param projectId - ID del proyecto
 * @param content - Contenido del archivo
 * @param format - Formato del archivo (text, json, markdown)
 * @returns Objeto con URL y key
 */
export async function uploadExport(
  projectId: number,
  content: string,
  format: "text" | "json" | "markdown"
): Promise<{ url: string; key: string }> {
  try {
    console.log(
      `[StorageService] Uploading export for project ${projectId} (format: ${format})...`
    );

    const extension = format === "text" ? "txt" : format;
    const fileKey = `projects/${projectId}/exports/export-${nanoid()}.${extension}`;
    const mimeType =
      format === "json"
        ? "application/json"
        : format === "markdown"
          ? "text/markdown"
          : "text/plain";

    const result = await storagePut(fileKey, content, mimeType);

    console.log(
      `[StorageService] Export uploaded: ${result.url}`
    );

    return {
      url: result.url,
      key: fileKey,
    };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : String(error);
    console.error(
      `[StorageService] Failed to upload export:`,
      errorMessage
    );
    throw new Error(`Export upload failed: ${errorMessage}`);
  }
}

/**
 * Obtiene una URL presignada para acceso temporal a un archivo
 * @param fileKey - Clave del archivo en S3
 * @returns URL presignada
 */
export async function getPresignedUrl(
  fileKey: string
): Promise<string> {
  try {
    console.log(
      `[StorageService] Generating presigned URL for ${fileKey}...`
    );

    const result = await storageGet(fileKey);

    return result.url;
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : String(error);
    console.error(
      `[StorageService] Failed to generate presigned URL:`,
      errorMessage
    );
    throw new Error(`Presigned URL generation failed: ${errorMessage}`);
  }
}

/**
 * Valida que un buffer sea una imagen válida
 * @param buffer - Buffer a validar
 * @param maxSizeMB - Tamaño máximo en MB
 * @returns true si es válido
 */
export function validateImageBuffer(
  buffer: Buffer,
  maxSizeMB: number = 10
): boolean {
  const maxSizeBytes = maxSizeMB * 1024 * 1024;

  if (buffer.length === 0) {
    return false;
  }

  if (buffer.length > maxSizeBytes) {
    return false;
  }

  // Validar que sea una imagen (JPEG, PNG, WebP)
  const jpegMagic = Buffer.from([0xff, 0xd8, 0xff]);
  const pngMagic = Buffer.from([0x89, 0x50, 0x4e, 0x47]);
  const webpMagic = Buffer.from([0x52, 0x49, 0x46, 0x46]);

  const isJpeg = buffer.subarray(0, 3).equals(jpegMagic);
  const isPng = buffer.subarray(0, 4).equals(pngMagic);
  const isWebp =
    buffer.subarray(0, 4).equals(webpMagic) &&
    buffer.subarray(8, 12).equals(Buffer.from([0x57, 0x45, 0x42, 0x50]));

  return isJpeg || isPng || isWebp;
}

/**
 * Obtiene estadísticas del servicio
 * @returns Información de configuración
 */
export function getStorageServiceStats() {
  return {
    bucket: STORAGE_BUCKET,
    maxImageSizeMB: 10,
    supportedFormats: ["image/jpeg", "image/png", "image/webp"],
  };
}
