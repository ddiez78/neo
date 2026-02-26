/**
 * StoryBible & Export Router - Procedimientos tRPC para Story Bible y exportación
 */

import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import * as db from "../db";
import { TRPCError } from "@trpc/server";
import { uploadExport } from "../services/storageService";

export const storyBibleAndExportRouter = router({
  /**
   * Obtener Story Bible completa de un proyecto
   */
  getStoryBible: protectedProcedure
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

        const storyBible = await db.getProjectStoryBible(input.projectId);
        if (!storyBible) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Story Bible not found for this project",
          });
        }

        // Obtener personajes, locaciones y props
        const characters = await db.getProjectCharacters(input.projectId);
        const locations = await db.getProjectLocations(input.projectId);
        const props = await db.getProjectProps(input.projectId);

        return {
          storyBible,
          characters,
          locations,
          props,
        };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        console.error("[StoryBible] Error getting story bible:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to get story bible",
        });
      }
    }),

  /**
   * Obtener Scene Breakdown completo de un proyecto
   */
  getSceneBreakdown: protectedProcedure
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

        const scenes = await db.getProjectScenes(input.projectId);

        if (scenes.length === 0) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "No scenes found for this project",
          });
        }

        // Calcular duración total
        const totalSeconds = scenes.length * 10;
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        const totalDuration = `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;

        return {
          scenes,
          totalDuration,
          totalScenes: scenes.length,
        };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        console.error("[SceneBreakdown] Error getting scene breakdown:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to get scene breakdown",
        });
      }
    }),

  /**
   * Generar y exportar proyecto
   */
  generateExport: protectedProcedure
    .input(
      z.object({
        projectId: z.number(),
        format: z.enum(["text", "json", "markdown"]),
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

        // Obtener Story Bible
        const storyBible = await db.getProjectStoryBible(input.projectId);
        if (!storyBible) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Story Bible not found for this project",
          });
        }

        // Obtener escenas
        const scenes = await db.getProjectScenes(input.projectId);
        if (scenes.length === 0) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "No scenes found for this project",
          });
        }

        // Obtener personajes, locaciones y props
        const characters = await db.getProjectCharacters(input.projectId);
        const locations = await db.getProjectLocations(input.projectId);
        const props = await db.getProjectProps(input.projectId);

        // Generar contenido de exportación
        const exportContent = generateExportContent(
          project,
          {
            characters,
            locations,
            props,
          },
          scenes,
          input.format
        );

        // Subir archivo a S3
        const uploadResult = await uploadExport(
          input.projectId,
          exportContent,
          input.format
        );

        // Guardar registro de exportación
        await db.createExport(
          input.projectId,
          input.format,
          uploadResult.url,
          uploadResult.key
        );

        return {
          success: true,
          downloadUrl: uploadResult.url,
          fileName: `${project.title}-export.${input.format === "text" ? "txt" : input.format}`,
        };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        console.error("[Export] Error generating export:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to generate export",
        });
      }
    }),
});

/**
 * Genera contenido de exportación en el formato especificado
 */
function generateExportContent(
  project: any,
  storyBible: any,
  scenes: any[],
  format: "text" | "json" | "markdown"
): string {
  if (format === "json") {
    return JSON.stringify(
      {
        project: {
          title: project.title,
          description: project.description,
          createdAt: project.createdAt,
        },
        storyBible,
        sceneBreakdown: scenes,
      },
      null,
      2
    );
  }

  if (format === "markdown") {
    return generateMarkdownExport(project, storyBible, scenes);
  }

  // Formato texto plano (default)
  return generateTextExport(project, storyBible, scenes);
}

/**
 * Genera exportación en formato texto plano
 */
function generateTextExport(project: any, storyBible: any, scenes: any[]): string {
  let content = "";

  // Encabezado
  content += `PROJECT: ${project.title}\n`;
  if (project.description) {
    content += `DESCRIPTION: ${project.description}\n`;
  }
  content += `CREATED: ${new Date(project.createdAt).toISOString()}\n`;
  content += "\n";
  content += "=".repeat(80) + "\n";
  content += "STORY BIBLE\n";
  content += "=".repeat(80) + "\n\n";

  // Personajes
  content += "CHARACTERS\n";
  content += "-".repeat(40) + "\n";
  storyBible.characters.forEach((char: any) => {
    content += `\nName: ${char.name}\n`;
    if (char.species) content += `Species/Age: ${char.species} (${char.ageVibe})\n`;
    if (char.visualTraits) content += `Visual Traits: ${char.visualTraits}\n`;
    if (char.outfit) {
      const outfit = typeof char.outfit === "string" ? JSON.parse(char.outfit) : char.outfit;
      if (outfit.colors) content += `Colors: ${outfit.colors.join(", ")}\n`;
      if (outfit.clothing) content += `Clothing: ${outfit.clothing.join(", ")}\n`;
    }
    if (char.personalityVibe) content += `Personality: ${char.personalityVibe}\n`;
  });

  content += "\n";

  // Locaciones
  content += "LOCATIONS\n";
  content += "-".repeat(40) + "\n";
  storyBible.locations.forEach((loc: any) => {
    content += `\n${loc.name}\n${loc.visualDescription}\n`;
  });

  content += "\n";

  // Props
  if (storyBible.props && storyBible.props.length > 0) {
    content += "PROPS\n";
    content += "-".repeat(40) + "\n";
    storyBible.props.forEach((prop: any) => {
      content += `\n${prop.name}: ${prop.description}`;
      if (prop.usedBy) content += ` (Used by: ${prop.usedBy})`;
      content += "\n";
    });
    content += "\n";
  }

  // Scene Breakdown
  content += "=".repeat(80) + "\n";
  content += "SCENE BREAKDOWN\n";
  content += "=".repeat(80) + "\n\n";

  scenes.forEach((scene: any) => {
    content += `Scene${String(scene.sceneNumber).padStart(2, "0")}\n`;
    content += `TIME: ${scene.timeStart}–${scene.timeEnd}\n`;
    content += `PLACE: ${scene.place}\n`;
    content += `BEAT: ${scene.beat}\n`;
    content += `GROK_VIDEO_PROMPT: ${scene.grokVideoPrompt}\n`;
    content += `NEGATIVE: ${scene.negative}\n`;
    content += "\n";
  });

  return content;
}

/**
 * Genera exportación en formato Markdown
 */
function generateMarkdownExport(project: any, storyBible: any, scenes: any[]): string {
  let content = "";

  content += `# ${project.title}\n\n`;
  if (project.description) {
    content += `${project.description}\n\n`;
  }

  content += `**Created:** ${new Date(project.createdAt).toISOString()}\n\n`;

  // Story Bible
  content += "## Story Bible\n\n";

  content += "### Characters\n\n";
  storyBible.characters.forEach((char: any) => {
    content += `#### ${char.name}\n\n`;
    if (char.species) content += `- **Species/Age:** ${char.species} (${char.ageVibe})\n`;
    if (char.visualTraits) content += `- **Visual Traits:** ${char.visualTraits}\n`;
    if (char.outfit) {
      const outfit = typeof char.outfit === "string" ? JSON.parse(char.outfit) : char.outfit;
      if (outfit.colors) content += `- **Colors:** ${outfit.colors.join(", ")}\n`;
      if (outfit.clothing) content += `- **Clothing:** ${outfit.clothing.join(", ")}\n`;
    }
    if (char.personalityVibe) content += `- **Personality:** ${char.personalityVibe}\n`;
    content += "\n";
  });

  content += "### Locations\n\n";
  storyBible.locations.forEach((loc: any) => {
    content += `#### ${loc.name}\n\n${loc.visualDescription}\n\n`;
  });

  if (storyBible.props && storyBible.props.length > 0) {
    content += "### Props\n\n";
    storyBible.props.forEach((prop: any) => {
      content += `- **${prop.name}:** ${prop.description}`;
      if (prop.usedBy) content += ` (Used by: ${prop.usedBy})`;
      content += "\n";
    });
    content += "\n";
  }

  // Scene Breakdown
  content += "## Scene Breakdown\n\n";
  scenes.forEach((scene: any) => {
    content += `### Scene ${String(scene.sceneNumber).padStart(2, "0")}\n\n`;
    content += `- **Time:** ${scene.timeStart}–${scene.timeEnd}\n`;
    content += `- **Place:** ${scene.place}\n`;
    content += `- **Beat:** ${scene.beat}\n`;
    content += `- **Grok Video Prompt:** ${scene.grokVideoPrompt}\n`;
    content += `- **Negative:** ${scene.negative}\n\n`;
  });

  return content;
}
