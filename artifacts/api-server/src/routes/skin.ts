import { Router, type IRouter } from "express";
import { db, skinAnalysisTable } from "@workspace/db";
import { desc } from "drizzle-orm";
import {
  AnalyzeSkinBody,
  AnalyzeSkinResponse,
  ListAnalysesResponse,
} from "@workspace/api-zod";
import { analyzeSkinImage } from "../lib/skinAnalysis.js";

const router: IRouter = Router();

router.post("/analyze-skin", async (req, res): Promise<void> => {
  const parsed = AnalyzeSkinBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { imageBase64, skinType } = parsed.data;

  const analysis = await analyzeSkinImage(imageBase64);

  const issueNames = analysis.detectedIssues.map((i) => i.name);

  const [record] = await db
    .insert(skinAnalysisTable)
    .values({
      healthScore: analysis.healthScore,
      detectedIssues: issueNames,
      recoveryDays: analysis.recoveryDays,
    })
    .returning();

  const response = AnalyzeSkinResponse.parse({
    analysisId: record.analysisId,
    detectedIssues: analysis.detectedIssues,
    healthScore: analysis.healthScore,
    recoveryDays: analysis.recoveryDays,
    scoreLabel: analysis.scoreLabel,
  });

  res.json(response);
});

router.get("/analyses", async (_req, res): Promise<void> => {
  const rows = await db
    .select()
    .from(skinAnalysisTable)
    .orderBy(desc(skinAnalysisTable.createdAt))
    .limit(20);

  const result = ListAnalysesResponse.parse(
    rows.map((r) => ({
      analysisId: r.analysisId,
      healthScore: r.healthScore,
      detectedIssues: r.detectedIssues as string[],
      recoveryDays: r.recoveryDays,
      createdAt: r.createdAt.toISOString(),
    }))
  );

  res.json(result);
});

export default router;
