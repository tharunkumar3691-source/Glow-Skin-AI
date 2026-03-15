import { Router, type IRouter } from "express";
import { VoiceDermatologistBody, VoiceDermatologistResponse } from "@workspace/api-zod";
import { invokeNovaBedrock } from "../lib/bedrock.js";

const router: IRouter = Router();

router.post("/voice-dermatologist", async (req, res): Promise<void> => {
  const parsed = VoiceDermatologistBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { question, context } = parsed.data;
  const contextText = context ? `\n\nUser's recent skin scan context: ${context}` : "";

  const prompt = `You are a friendly, expert AI dermatologist voice assistant. Answer the following skincare question clearly and helpfully in 2-4 sentences.${contextText}

User question: "${question}"

Respond ONLY with valid JSON (no markdown, no code blocks):
{
  "answer": "your clear, helpful answer here",
  "followUpQuestions": ["follow-up question 1?", "follow-up question 2?", "follow-up question 3?"]
}`;

  let responseText = await invokeNovaBedrock(prompt);
  responseText = responseText.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();

  let data;
  try {
    data = JSON.parse(responseText);
  } catch {
    data = {
      answer: `Great question! ${question.toLowerCase().includes("acne") ? "Acne is caused by clogged pores, excess oil, bacteria, and hormonal changes. A consistent routine with a gentle cleanser, niacinamide, and non-comedogenic moisturizer can help significantly." : "For optimal skin health, follow a consistent routine with gentle cleansing, moisturizing, and daily SPF protection. Staying hydrated and getting enough sleep also make a big difference."}`,
      followUpQuestions: [
        "What ingredients should I look for in a cleanser?",
        "How often should I exfoliate?",
        "Which SPF is best for daily use?",
      ],
    };
  }

  const response = VoiceDermatologistResponse.parse(data);
  res.json(response);
});

export default router;
