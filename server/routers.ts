import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { projectsRouter } from "./routers/projects";
import { scriptsRouter } from "./routers/scripts";
import { charactersRouter } from "./routers/characters";
import { scenesRouter } from "./routers/scenes";
import { storyBibleAndExportRouter } from "./routers/storyBibleAndExport";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // Neo-App routers
  projects: projectsRouter,
  scripts: scriptsRouter,
  characters: charactersRouter,
  scenes: scenesRouter,
  storyBible: storyBibleAndExportRouter,
});

export type AppRouter = typeof appRouter;
