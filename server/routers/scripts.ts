/**
 * Scripts Router - Procedimientos tRPC para gestión de guiones
 */

import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import * as db from "../db";
import { TRPCError } from "@trpc/server";
import { analyzeScript, validateScriptContent } from "../services/llmService";
import { validateConsistency } from "../services/narrativeAnalyzer";

export const scriptsRouter = router({
  /**
   * Subir un nuevo guion maestro
   */
  upload: protectedProcedure
    .input(
      z.object({
        projectId: z.number(),
        title: z.string().min(3).max(255),
        content: z.string().min(50).max(50000),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        // Verificar que el proyecto existe y pertenece al usuario
        const project = await db.getProjectById(input.projectId);
        if (!project || project.userId !== ctx.user.id) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "You do not have access to this project",
          });
        }

        // Validar contenido del guion
        if (!validateScriptContent(input.content)) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Script content is invalid or too short/long",
          });
        }

        // Crear script en BD
        const result = await db.createScript(
          input.projectId,
          input.title,
          input.content
        );

        const scriptId = (result as any).insertId || 0;

        // Actualizar estado del proyecto
        await db.updateProject(input.projectId, { status: "analyzing" });

        return {
          success: true,
          scriptId,
        };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        console.error("[Scripts] Error uploading script:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to upload script",
        });
      }
    }),

  /**
   * Analizar un guion con LLM
   */
  analyze: protectedProcedure
    .input(z.object({ scriptId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      try {
        const script = await db.getScriptById(input.scriptId);

        if (!script) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Script not found",
          });
        }

        // Verificar que el proyecto pertenece al usuario
        const project = await db.getProjectById(script.projectId);
        if (!project || project.userId !== ctx.user.id) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "You do not have access to this script",
          });
        }

        // Actualizar estado a "analyzing"
        await db.updateScriptStatus(input.scriptId, "analyzing");

        // Analizar guion con LLM
        let analysisResult;
        try {
          analysisResult = await analyzeScript(script.content);
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : String(error);
          await db.updateScriptStatus(
            input.scriptId,
            "error",
            errorMessage
          );
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: `LLM analysis failed: ${errorMessage}`,
          });
        }

        // Validar consistencia de análisis
        const storyBibleForValidation = {
          projectId: script.projectId,
          characters: analysisResult.storyBible.characters,
          locations: analysisResult.storyBible.locations,
          props: analysisResult.storyBible.props,
          characterCount: analysisResult.storyBible.characters.length,
          locationCount: analysisResult.storyBible.locations.length,
          propCount: analysisResult.storyBible.props.length,
        };
        const validation = validateConsistency(
          storyBibleForValidation,
          analysisResult.sceneBreakdown
        );

        if (!validation.isValid) {
          console.warn("[Scripts] Validation warnings:", validation.warnings);
        }

        // Guardar Story Bible
        await db.createStoryBible(
          script.projectId,
          analysisResult.storyBible.characters.length,
          analysisResult.storyBible.locations.length,
          analysisResult.storyBible.props.length
        );

        // Guardar personajes
        for (const character of analysisResult.storyBible.characters) {
          await db.createCharacter(script.projectId, {
            name: character.name,
            species: character.species,
            ageVibe: character.ageVibe,
            visualTraits: character.visualTraits,
            outfit: character.outfit,
            personalityVibe: character.personalityVibe,
            isManuallyAdded: false,
          });
        }

        // Guardar locaciones
        for (const location of analysisResult.storyBible.locations) {
          await db.createLocation(
            script.projectId,
            location.name,
            location.visualDescription
          );
        }

        // Guardar props
        for (const prop of analysisResult.storyBible.props) {
          await db.createProp(
            script.projectId,
            prop.name,
            prop.description,
            prop.usedBy
          );
        }

        // Guardar escenas
        const scenesWithProjectId = analysisResult.sceneBreakdown.map(
          (scene: any) => ({
            sceneNumber: scene.sceneNumber,
            timeStart: scene.timeStart,
            timeEnd: scene.timeEnd,
            place: scene.place,
            beat: scene.beat,
            grokVideoPrompt: scene.grokVideoPrompt,
            negative: scene.negative,
            status: "pending",
          })
        );

        await db.createMultipleScenes(
          script.projectId,
          scenesWithProjectId
        );

        // Actualizar estado del script y proyecto
        await db.updateScriptStatus(input.scriptId, "analyzed");
        await db.updateProject(script.projectId, { status: "completed" });

        return {
          success: true,
          analysisResult: {
            characterCount: analysisResult.storyBible.characters.length,
            locationCount: analysisResult.storyBible.locations.length,
            propCount: analysisResult.storyBible.props.length,
            sceneCount: analysisResult.sceneBreakdown.length,
            validationWarnings: validation.warnings,
          },
        };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        console.error("[Scripts] Error analyzing script:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to analyze script",
        });
      }
    }),

  /**
   * Obtener detalles de un guion
   */
  get: protectedProcedure
    .input(z.object({ scriptId: z.number() }))
    .query(async ({ ctx, input }) => {
      try {
        const script = await db.getScriptById(input.scriptId);

        if (!script) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Script not found",
          });
        }

        // Verificar que el proyecto pertenece al usuario
        const project = await db.getProjectById(script.projectId);
        if (!project || project.userId !== ctx.user.id) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "You do not have access to this script",
          });
        }

        return script;
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        console.error("[Scripts] Error getting script:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to get script",
        });
      }
    }),

  /**
   * Listar guiones de un proyecto
   */
  listByProject: protectedProcedure
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

        return await db.getProjectScripts(input.projectId);
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        console.error("[Scripts] Error listing scripts:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to list scripts",
        });
      }
    }),
});
