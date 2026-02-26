/**
 * Projects Router - Procedimientos tRPC para gestión de proyectos
 */

import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import * as db from "../db";
import { TRPCError } from "@trpc/server";

export const projectsRouter = router({
  /**
   * Listar proyectos del usuario autenticado
   */
  list: protectedProcedure.query(async ({ ctx }) => {
    try {
      const userProjects = await db.getUserProjects(ctx.user.id);
      return userProjects;
    } catch (error) {
      console.error("[Projects] Error listing projects:", error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to list projects",
      });
    }
  }),

  /**
   * Obtener detalles de un proyecto específico
   */
  get: protectedProcedure
    .input(z.object({ projectId: z.number() }))
    .query(async ({ ctx, input }) => {
      try {
        const project = await db.getProjectById(input.projectId);

        if (!project) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Project not found",
          });
        }

        // Verificar que el usuario sea el propietario
        if (project.userId !== ctx.user.id) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "You do not have access to this project",
          });
        }

        return project;
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        console.error("[Projects] Error getting project:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to get project",
        });
      }
    }),

  /**
   * Crear un nuevo proyecto
   */
  create: protectedProcedure
    .input(
      z.object({
        title: z.string().min(3).max(255),
        description: z.string().max(1000).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const result = await db.createProject(
          ctx.user.id,
          input.title,
          input.description
        );

        const projectId = (result as any).insertId || 0;

        return {
          success: true,
          projectId,
        };
      } catch (error) {
        console.error("[Projects] Error creating project:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create project",
        });
      }
    }),

  /**
   * Actualizar un proyecto
   */
  update: protectedProcedure
    .input(
      z.object({
        projectId: z.number(),
        title: z.string().min(3).max(255).optional(),
        description: z.string().max(1000).optional(),
        status: z
          .enum(["draft", "analyzing", "completed", "archived"])
          .optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const project = await db.getProjectById(input.projectId);

        if (!project) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Project not found",
          });
        }

        if (project.userId !== ctx.user.id) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "You do not have access to this project",
          });
        }

        const updates: any = {};
        if (input.title) updates.title = input.title;
        if (input.description) updates.description = input.description;
        if (input.status) updates.status = input.status;

        await db.updateProject(input.projectId, updates);

        return { success: true };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        console.error("[Projects] Error updating project:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update project",
        });
      }
    }),

  /**
   * Eliminar un proyecto
   */
  delete: protectedProcedure
    .input(z.object({ projectId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      try {
        const project = await db.getProjectById(input.projectId);

        if (!project) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Project not found",
          });
        }

        if (project.userId !== ctx.user.id) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "You do not have access to this project",
          });
        }

        await db.deleteProject(input.projectId);

        return { success: true };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        console.error("[Projects] Error deleting project:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to delete project",
        });
      }
    }),
});
