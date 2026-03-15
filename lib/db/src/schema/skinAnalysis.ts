import { pgTable, serial, text, real, integer, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const usersTable = pgTable("users", {
  userId: serial("user_id").primaryKey(),
  email: text("email"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const skinAnalysisTable = pgTable("skin_analysis", {
  analysisId: serial("analysis_id").primaryKey(),
  userId: integer("user_id"),
  healthScore: real("health_score").notNull(),
  detectedIssues: jsonb("detected_issues").notNull().$type<string[]>(),
  recommendedTreatment: text("recommended_treatment"),
  recoveryDays: integer("recovery_days").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertSkinAnalysisSchema = createInsertSchema(skinAnalysisTable).omit({ analysisId: true, createdAt: true });
export type InsertSkinAnalysis = z.infer<typeof insertSkinAnalysisSchema>;
export type SkinAnalysis = typeof skinAnalysisTable.$inferSelect;
