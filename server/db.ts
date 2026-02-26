import { eq, and, desc } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  InsertUser,
  users,
  projects,
  scripts,
  characters,
  locations,
  props,
  scenes,
  storyBibles,
  exports,
} from "../drizzle/schema";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

// ============================================================================
// USER HELPERS
// ============================================================================

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = "admin";
      updateSet.role = "admin";
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db
    .select()
    .from(users)
    .where(eq(users.openId, openId))
    .limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// ============================================================================
// PROJECT HELPERS
// ============================================================================

export async function getUserProjects(userId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(projects)
    .where(eq(projects.userId, userId))
    .orderBy(desc(projects.createdAt));
}

export async function getProjectById(projectId: number) {
  const db = await getDb();
  if (!db) return null;

  const result = await db
    .select()
    .from(projects)
    .where(eq(projects.id, projectId))
    .limit(1);

  return result.length > 0 ? result[0] : null;
}

export async function createProject(
  userId: number,
  title: string,
  description?: string
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(projects).values({
    userId,
    title,
    description,
    status: "draft",
  });

  return result;
}

export async function updateProject(
  projectId: number,
  updates: { title?: string; description?: string; status?: "draft" | "analyzing" | "completed" | "archived" }
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db
    .update(projects)
    .set(updates)
    .where(eq(projects.id, projectId));
}

export async function deleteProject(projectId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db.delete(projects).where(eq(projects.id, projectId));
}

// ============================================================================
// SCRIPT HELPERS
// ============================================================================

export async function getProjectScripts(projectId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(scripts)
    .where(eq(scripts.projectId, projectId))
    .orderBy(desc(scripts.createdAt));
}

export async function getScriptById(scriptId: number) {
  const db = await getDb();
  if (!db) return null;

  const result = await db
    .select()
    .from(scripts)
    .where(eq(scripts.id, scriptId))
    .limit(1);

  return result.length > 0 ? result[0] : null;
}

export async function createScript(
  projectId: number,
  title: string,
  content: string
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db.insert(scripts).values({
    projectId,
    title,
    content,
    status: "pending",
  });
}

export async function updateScriptStatus(
  scriptId: number,
  status: "pending" | "analyzing" | "analyzed" | "error",
  error?: string
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db
    .update(scripts)
    .set({ status, analysisError: error })
    .where(eq(scripts.id, scriptId));
}

// ============================================================================
// CHARACTER HELPERS
// ============================================================================

export async function getProjectCharacters(projectId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(characters)
    .where(eq(characters.projectId, projectId))
    .orderBy(desc(characters.createdAt));
}

export async function getCharacterById(characterId: number) {
  const db = await getDb();
  if (!db) return null;

  const result = await db
    .select()
    .from(characters)
    .where(eq(characters.id, characterId))
    .limit(1);

  return result.length > 0 ? result[0] : null;
}

export async function createCharacter(projectId: number, characterData: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db.insert(characters).values({
    projectId,
    ...characterData,
  });
}

export async function updateCharacter(characterId: number, updates: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db
    .update(characters)
    .set(updates)
    .where(eq(characters.id, characterId));
}

export async function deleteCharacter(characterId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db.delete(characters).where(eq(characters.id, characterId));
}

// ============================================================================
// LOCATION HELPERS
// ============================================================================

export async function getProjectLocations(projectId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(locations)
    .where(eq(locations.projectId, projectId));
}

export async function createLocation(
  projectId: number,
  name: string,
  visualDescription: string
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db.insert(locations).values({
    projectId,
    name,
    visualDescription,
  });
}

// ============================================================================
// PROP HELPERS
// ============================================================================

export async function getProjectProps(projectId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(props)
    .where(eq(props.projectId, projectId));
}

export async function createProp(
  projectId: number,
  name: string,
  description: string,
  usedBy?: string
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db.insert(props).values({
    projectId,
    name,
    description,
    usedBy,
  });
}

// ============================================================================
// SCENE HELPERS
// ============================================================================

export async function getProjectScenes(projectId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(scenes)
    .where(eq(scenes.projectId, projectId))
    .orderBy(scenes.sceneNumber);
}

export async function getSceneById(sceneId: number) {
  const db = await getDb();
  if (!db) return null;

  const result = await db
    .select()
    .from(scenes)
    .where(eq(scenes.id, sceneId))
    .limit(1);

  return result.length > 0 ? result[0] : null;
}

export async function createScene(projectId: number, sceneData: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db.insert(scenes).values({
    projectId,
    ...sceneData,
  });
}

export async function createMultipleScenes(
  projectId: number,
  scenesData: any[]
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db.insert(scenes).values(
    scenesData.map((scene) => ({
      projectId,
      ...scene,
    }))
  );
}

export async function updateScene(sceneId: number, updates: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db
    .update(scenes)
    .set(updates)
    .where(eq(scenes.id, sceneId));
}

// ============================================================================
// STORY BIBLE HELPERS
// ============================================================================

export async function getProjectStoryBible(projectId: number) {
  const db = await getDb();
  if (!db) return null;

  const result = await db
    .select()
    .from(storyBibles)
    .where(eq(storyBibles.projectId, projectId))
    .limit(1);

  return result.length > 0 ? result[0] : null;
}

export async function createStoryBible(
  projectId: number,
  characterCount: number,
  locationCount: number,
  propCount: number,
  visualBible?: any
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db.insert(storyBibles).values({
    projectId,
    characterCount,
    locationCount,
    propCount,
    visualBible,
  });
}

export async function updateStoryBible(
  projectId: number,
  updates: { characterCount?: number; locationCount?: number; propCount?: number }
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db
    .update(storyBibles)
    .set(updates)
    .where(eq(storyBibles.projectId, projectId));
}

// ============================================================================
// EXPORT HELPERS
// ============================================================================

export async function createExport(
  projectId: number,
  exportType: "text" | "json" | "markdown",
  exportUrl?: string,
  exportKey?: string
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db.insert(exports).values({
    projectId,
    exportType: exportType,
    exportUrl,
    exportKey,
  });
}

export async function getProjectExports(projectId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(exports)
    .where(eq(exports.projectId, projectId))
    .orderBy(desc(exports.createdAt));
}
