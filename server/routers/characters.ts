/**
 * Characters Router - Procedimientos tRPC para gestión de personajes
 */

import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import * as db from "../db";
import { TRPCError } from "@trpc/server";
import {
  uploadCharacterImage,
  validateImageBuffer,
} from "../services/storageService";

export const charactersRouter = router({
  /**
   * Listar personajes de un proyecto
   */
  list: protectedProcedure
    .input(z.object({ projectId: z.number() }))
    .query(async ({ ctx, input }) => {
      try {
        // Verificar que el proyecto pertenece al usuario
        const project = await db.getProjectById(input.projectId);
        if (!project || project.userId !== ctx.user.id) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "You do not have access to this project",
          });
        }

        return await db.getProjectCharacters(input.projectId);
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        console.error("[Characters] Error listing characters:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to list characters",
        });
      }
    }),

  /**
   * Obtener detalles de un personaje
   */
  get: protectedProcedure
    .input(z.object({ characterId: z.number() }))
    .query(async ({ ctx, input }) => {
      try {
        const character = await db.getCharacterById(input.characterId);

        if (!character) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Character not found",
          });
        }

        // Verificar que el proyecto pertenece al usuario
        const project = await db.getProjectById(character.projectId);
        if (!project || project.userId !== ctx.user.id) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "You do not have access to this character",
          });
        }

        return character;
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        console.error("[Characters] Error getting character:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to get character",
        });
      }
    }),

  /**
   * Crear un personaje manual
   */
  create: protectedProcedure
    .input(
      z.object({
        projectId: z.number(),
        name: z.string().min(1).max(255),
        species: z.string().optional(),
        ageVibe: z.string().optional(),
        visualTraits: z.string().optional(),
        outfit: z.any().optional(),
        personalityVibe: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        // Verificar que el proyecto pertenece al usuario
        const project = await db.getProjectById(input.projectId);
        if (!project || project.userId !== ctx.user.id) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "You do not have access to this project",
          });
        }

        const result = await db.createCharacter(input.projectId, {
          name: input.name,
          species: input.species,
          ageVibe: input.ageVibe,
          visualTraits: input.visualTraits,
          outfit: input.outfit,
          personalityVibe: input.personalityVibe,
          isManuallyAdded: true,
        });

        const characterId = (result as any).insertId || 0;

        return {
          success: true,
          characterId,
        };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        console.error("[Characters] Error creating character:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create character",
        });
      }
    }),

  /**
   * Actualizar un personaje
   */
  update: protectedProcedure
    .input(
      z.object({
        characterId: z.number(),
        name: z.string().min(1).max(255).optional(),
        species: z.string().optional(),
        ageVibe: z.string().optional(),
        visualTraits: z.string().optional(),
        outfit: z.any().optional(),
        personalityVibe: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const character = await db.getCharacterById(input.characterId);

        if (!character) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Character not found",
          });
        }

        // Verificar que el proyecto pertenece al usuario
        const project = await db.getProjectById(character.projectId);
        if (!project || project.userId !== ctx.user.id) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "You do not have access to this character",
          });
        }

        const updates: any = {};
        if (input.name) updates.name = input.name;
        if (input.species) updates.species = input.species;
        if (input.ageVibe) updates.ageVibe = input.ageVibe;
        if (input.visualTraits) updates.visualTraits = input.visualTraits;
        if (input.outfit) updates.outfit = input.outfit;
        if (input.personalityVibe) updates.personalityVibe = input.personalityVibe;

        await db.updateCharacter(input.characterId, updates);

        return { success: true };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        console.error("[Characters] Error updating character:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update character",
        });
      }
    }),

  /**
   * Subir imagen de referencia de personaje
   */
  uploadImage: protectedProcedure
    .input(
      z.object({
        characterId: z.number(),
        imageBuffer: z.instanceof(Buffer),
        mimeType: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const character = await db.getCharacterById(input.characterId);

        if (!character) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Character not found",
          });
        }

        // Verificar que el proyecto pertenece al usuario
        const project = await db.getProjectById(character.projectId);
        if (!project || project.userId !== ctx.user.id) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "You do not have access to this character",
          });
        }

        // Validar imagen
        if (!validateImageBuffer(input.imageBuffer)) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Invalid image file",
          });
        }

        // Subir imagen a S3
        const uploadResult = await uploadCharacterImage(
          character.projectId,
          input.characterId,
          input.imageBuffer,
          input.mimeType || "image/jpeg"
        );

        // Actualizar personaje con URL de imagen
        await db.updateCharacter(input.characterId, {
          referenceImageUrl: uploadResult.url,
          referenceImageKey: uploadResult.key,
        });

        return {
          success: true,
          imageUrl: uploadResult.url,
        };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        console.error("[Characters] Error uploading image:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to upload character image",
        });
      }
    }),

  /**
   * Eliminar un personaje
   */
  delete: protectedProcedure
    .input(z.object({ characterId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      try {
        const character = await db.getCharacterById(input.characterId);

        if (!character) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Character not found",
          });
        }

        // Verificar que el proyecto pertenece al usuario
        const project = await db.getProjectById(character.projectId);
        if (!project || project.userId !== ctx.user.id) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "You do not have access to this character",
          });
        }

        await db.deleteCharacter(input.characterId);

        return { success: true };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        console.error("[Characters] Error deleting character:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to delete character",
        });
      }
    }),
});
