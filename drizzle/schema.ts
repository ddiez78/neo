import {
  int,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  varchar,
  json,
  boolean,
} from "drizzle-orm/mysql-core";

/**
 * Esquema de base de datos para Neo-App
 * Tablas para proyectos, guiones, personajes, escenas y exportaciones
 */

// ============================================================================
// TABLA: users (heredada del template)
// ============================================================================

export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// ============================================================================
// TABLA: projects
// ============================================================================

export const projects = mysqlTable("projects", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  status: mysqlEnum("status", ["draft", "analyzing", "completed", "archived"])
    .default("draft")
    .notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Project = typeof projects.$inferSelect;
export type InsertProject = typeof projects.$inferInsert;

// ============================================================================
// TABLA: scripts
// ============================================================================

export const scripts = mysqlTable("scripts", {
  id: int("id").autoincrement().primaryKey(),
  projectId: int("projectId").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  content: text("content").notNull(),
  language: varchar("language", { length: 10 }).default("es"),
  status: mysqlEnum("status", ["pending", "analyzing", "analyzed", "error"])
    .default("pending")
    .notNull(),
  analysisError: text("analysisError"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Script = typeof scripts.$inferSelect;
export type InsertScript = typeof scripts.$inferInsert;

// ============================================================================
// TABLA: storyBibles
// ============================================================================

export const storyBibles = mysqlTable("storyBibles", {
  id: int("id").autoincrement().primaryKey(),
  projectId: int("projectId").notNull().unique(),
  characterCount: int("characterCount").default(0),
  locationCount: int("locationCount").default(0),
  propCount: int("propCount").default(0),
  visualBible: json("visualBible"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type StoryBible = typeof storyBibles.$inferSelect;
export type InsertStoryBible = typeof storyBibles.$inferInsert;

// ============================================================================
// TABLA: characters
// ============================================================================

export const characters = mysqlTable("characters", {
  id: int("id").autoincrement().primaryKey(),
  projectId: int("projectId").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  species: varchar("species", { length: 100 }),
  ageVibe: varchar("ageVibe", { length: 100 }),
  visualTraits: text("visualTraits"),
  outfit: json("outfit"),
  personalityVibe: text("personalityVibe"),
  referenceImageUrl: varchar("referenceImageUrl", { length: 500 }),
  referenceImageKey: varchar("referenceImageKey", { length: 255 }),
  isManuallyAdded: boolean("isManuallyAdded").default(false),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Character = typeof characters.$inferSelect;
export type InsertCharacter = typeof characters.$inferInsert;

// ============================================================================
// TABLA: locations
// ============================================================================

export const locations = mysqlTable("locations", {
  id: int("id").autoincrement().primaryKey(),
  projectId: int("projectId").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  visualDescription: text("visualDescription").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Location = typeof locations.$inferSelect;
export type InsertLocation = typeof locations.$inferInsert;

// ============================================================================
// TABLA: props
// ============================================================================

export const props = mysqlTable("props", {
  id: int("id").autoincrement().primaryKey(),
  projectId: int("projectId").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description").notNull(),
  usedBy: varchar("usedBy", { length: 255 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Prop = typeof props.$inferSelect;
export type InsertProp = typeof props.$inferInsert;

// ============================================================================
// TABLA: scenes
// ============================================================================

export const scenes = mysqlTable("scenes", {
  id: int("id").autoincrement().primaryKey(),
  projectId: int("projectId").notNull(),
  sceneNumber: int("sceneNumber").notNull(),
  timeStart: varchar("timeStart", { length: 10 }),
  timeEnd: varchar("timeEnd", { length: 10 }),
  place: varchar("place", { length: 255 }),
  beat: text("beat"),
  grokVideoPrompt: text("grokVideoPrompt").notNull(),
  negative: text("negative"),
  generatedImageUrl: varchar("generatedImageUrl", { length: 500 }),
  generatedImageKey: varchar("generatedImageKey", { length: 255 }),
  status: mysqlEnum("status", ["pending", "generating", "completed", "error"])
    .default("pending")
    .notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Scene = typeof scenes.$inferSelect;
export type InsertScene = typeof scenes.$inferInsert;

// ============================================================================
// TABLA: exports
// ============================================================================

export const exports = mysqlTable("exports", {
  id: int("id").autoincrement().primaryKey(),
  projectId: int("projectId").notNull(),
  exportType: mysqlEnum("exportType", ["text", "json", "markdown"])
    .default("text")
    .notNull(),
  exportUrl: varchar("exportUrl", { length: 500 }),
  exportKey: varchar("exportKey", { length: 255 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Export = typeof exports.$inferSelect;
export type InsertExport = typeof exports.$inferInsert;
