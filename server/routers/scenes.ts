/**
 * Scenes Router - Procedimientos tRPC para gestión de escenas
 */

import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import * as db from "../db";
import { TRPCError } from "@trpc/server";
import {
  generateSceneImage,
  validateSceneForImageGeneration,
} from "../services/imageService";
import {
  uploadSceneImage,
  validateImageBuffer,
} from "../services/storageService";

export const scenesRouter = router({
  /**
   * Listar escenas de un proyecto
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

        return await db.getProjectScenes(input.projectId);
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        console.error("[Scenes] Error listing scenes:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to list scenes",
        });
      }
    }),

  /**
   * Obtener detalles de una escena
   */
  get: protectedProcedure
    .input(z.object({ sceneId: z.number() }))
    .query(async ({ ctx, input }) => {
      try {
        const scene = await db.getSceneById(input.sceneId);

        if (!scene) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Scene not found",
          });
        }

        // Verificar que el proyecto pertenece al usuario
        const project = await db.getProjectById(scene.projectId);
        if (!project || project.userId !== ctx.user.id) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "You do not have access to this scene",
          });
        }

        return scene;
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        console.error("[Scenes] Error getting scene:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to get scene",
        });
      }
    }),

  /**
   * Generar imagen para una escena
   */
  generateImage: protectedProcedure
    .input(z.object({ sceneId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      try {
        const scene = await db.getSceneById(input.sceneId);

        if (!scene) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Scene not found",
          });
        }

        // Verificar que el proyecto pertenece al usuario
        const project = await db.getProjectById(scene.projectId);
        if (!project || project.userId !== ctx.user.id) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "You do not have access to this scene",
          });
        }

        // Validar que la escena tenga un prompt válido
        const sceneForValidation = {
          ...scene,
          timeStart: scene.timeStart || "00:00",
          timeEnd: scene.timeEnd || "00:10",
          place: scene.place || "EXT.UNKNOWN",
          beat: scene.beat || "",
          negative: scene.negative || "",
        };
        if (!validateSceneForImageGeneration(sceneForValidation as any)) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Scene does not have a valid video prompt",
          });
        }

        // Obtener Story Bible del proyecto
        const storyBible = await db.getProjectStoryBible(scene.projectId);
        if (!storyBible) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Story Bible not found for this project",
          });
        }

        // Obtener personajes, locaciones y props
        const characters = await db.getProjectCharacters(scene.projectId);
        const locations = await db.getProjectLocations(scene.projectId);
        const props = await db.getProjectProps(scene.projectId);

        const fullStoryBible = {
          projectId: scene.projectId,
          characters: characters as any,
          locations: locations as any,
          props: props as any,
          characterCount: characters.length,
          locationCount: locations.length,
          propCount: props.length,
        };

        // Actualizar estado a "generating"
        await db.updateScene(input.sceneId, { status: "generating" });

        // Generar imagen
        let imageUrl;
        try {
          const sceneForGeneration = {
            ...scene,
            timeStart: scene.timeStart || "00:00",
            timeEnd: scene.timeEnd || "00:10",
            place: scene.place || "EXT.UNKNOWN",
            beat: scene.beat || "",
            negative: scene.negative || "",
          };
          imageUrl = await generateSceneImage(sceneForGeneration as any, fullStoryBible);
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : String(error);
          await db.updateScene(input.sceneId, { status: "error" });
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: `Image generation failed: ${errorMessage}`,
          });
        }

        // Actualizar escena con URL de imagen
        await db.updateScene(input.sceneId, {
          generatedImageUrl: imageUrl,
          status: "completed",
        });

        return {
          success: true,
          imageUrl,
        };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        console.error("[Scenes] Error generating image:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to generate scene image",
        });
      }
    }),

  /**
   * Actualizar una escena
   */
  update: protectedProcedure
    .input(
      z.object({
        sceneId: z.number(),
        beat: z.string().optional(),
        grokVideoPrompt: z.string().optional(),
        negative: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const scene = await db.getSceneById(input.sceneId);

        if (!scene) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Scene not found",
          });
        }

        // Verificar que el proyecto pertenece al usuario
        const project = await db.getProjectById(scene.projectId);
        if (!project || project.userId !== ctx.user.id) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "You do not have access to this scene",
          });
        }

        const updates: any = {};
        if (input.beat) updates.beat = input.beat;
        if (input.grokVideoPrompt) updates.grokVideoPrompt = input.grokVideoPrompt;
        if (input.negative) updates.negative = input.negative;

        await db.updateScene(input.sceneId, updates);

        return { success: true };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        console.error("[Scenes] Error updating scene:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update scene",
        });
      }
    }),
});
