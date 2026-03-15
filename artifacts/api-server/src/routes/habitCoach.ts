import { Router, type IRouter } from "express";
import { SkinHabitCoachBody, SkinHabitCoachResponse } from "@workspace/api-zod";
import { invokeNovaBedrock } from "../lib/bedrock.js";

const router: IRouter = Router();

router.post("/skin-habit-coach", async (req, res): Promise<void> => {
  const parsed = SkinHabitCoachBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { detectedIssues, environmentalRisks = [], skinType } = parsed.data;
  const issuesList = detectedIssues.join(", ");
  const envList = environmentalRisks.join(", ");
  const skinText = skinType ? ` Skin type: ${skinType}.` : "";

  const prompt = `You are a professional skin habit coach AI. Create a personalized daily skincare plan.

Detected skin issues: ${issuesList}
Environmental risks: ${envList || "none specified"}${skinText}

Respond ONLY with valid JSON (no markdown, no code blocks):
{
  "morningRoutine": [
    {"step": "step description", "reason": "why this step helps"},
    {"step": "step description", "reason": "why this step helps"}
  ],
  "afternoonProtection": [
    {"step": "step description", "reason": "why this step helps"},
    {"step": "step description", "reason": "why this step helps"}
  ],
  "nightRoutine": [
    {"step": "step description", "reason": "why this step helps"},
    {"step": "step description", "reason": "why this step helps"}
  ],
  "healthyHabits": ["habit1", "habit2", "habit3", "habit4"]
}`;

  let responseText = await invokeNovaBedrock(prompt);
  responseText = responseText.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();

  let data;
  try {
    data = JSON.parse(responseText);
  } catch {
    data = {
      morningRoutine: [
        { step: "Gentle cleanser — wash face with lukewarm water", reason: "Removes overnight oil and impurities without stripping moisture" },
        { step: "Vitamin C serum — apply 2-3 drops to face and neck", reason: "Brightens dark spots and protects against UV damage" },
        { step: "Lightweight moisturizer — pat gently into skin", reason: "Locks in hydration and creates a protective barrier" },
        { step: "SPF 50 broad-spectrum sunscreen", reason: "Prevents UV-induced damage and slows dark spot formation" },
      ],
      afternoonProtection: [
        { step: "Reapply sunscreen — especially after sweating", reason: "Sunscreen effectiveness decreases over time" },
        { step: "Hydrating facial mist — spray lightly", reason: "Refreshes skin and maintains moisture levels throughout the day" },
      ],
      nightRoutine: [
        { step: "Oil-based cleanser — removes makeup and sunscreen", reason: "Thorough cleansing prevents clogged pores" },
        { step: "Gentle foaming cleanser — second cleanse", reason: "Removes remaining impurities and prepares skin for actives" },
        { step: "Niacinamide serum — apply to whole face", reason: "Reduces acne, dark spots, and balances oil production" },
        { step: "Rich night moisturizer — seal everything in", reason: "Supports skin repair and regeneration during sleep" },
      ],
      healthyHabits: [
        "Drink at least 8 glasses of water daily for skin hydration",
        "Sleep 7-8 hours nightly to allow skin cells to repair",
        "Avoid touching your face to prevent bacteria transfer",
        "Change pillowcases every 2-3 days to reduce acne-causing bacteria",
        "Eat antioxidant-rich foods: berries, leafy greens, nuts",
        "Manage stress with yoga, meditation, or regular exercise",
      ],
    };
  }

  const response = SkinHabitCoachResponse.parse(data);
  res.json(response);
});

export default router;
