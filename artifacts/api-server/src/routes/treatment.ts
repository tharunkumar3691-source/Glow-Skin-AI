import { Router, type IRouter } from "express";
import { GenerateTreatmentBody, GenerateTreatmentResponse } from "@workspace/api-zod";
import { invokeNovaBedrock } from "../lib/bedrock.js";

const router: IRouter = Router();

router.post("/generate-treatment", async (req, res): Promise<void> => {
  const parsed = GenerateTreatmentBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { detectedIssues, skinType } = parsed.data;
  const issuesList = detectedIssues.join(", ");
  const skinTypeText = skinType ? ` The user has ${skinType} skin.` : "";

  const prompt = `You are an expert dermatologist AI. A user's skin scan detected: ${issuesList}.${skinTypeText}

Generate a comprehensive skincare treatment plan. Respond ONLY with valid JSON matching this exact structure (no markdown, no code blocks, just raw JSON):

{
  "lifestyleAdvice": ["advice1", "advice2", "advice3"],
  "morningRoutine": ["step1", "step2", "step3", "step4"],
  "nightRoutine": ["step1", "step2", "step3", "step4"],
  "naturalTreatments": ["treatment1", "treatment2", "treatment3"],
  "homeRemedy": "one detailed home remedy description",
  "recommendedProducts": {
    "faceWash": "specific face wash recommendation",
    "moisturizer": "specific moisturizer recommendation",
    "sunscreen": "specific sunscreen recommendation",
    "treatmentCream": "specific treatment cream recommendation"
  }
}`;

  let responseText = await invokeNovaBedrock(prompt);

  responseText = responseText.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();

  let planData;
  try {
    planData = JSON.parse(responseText);
  } catch {
    planData = {
      lifestyleAdvice: [
        "Stay hydrated — drink at least 8 glasses of water daily",
        "Get 7-8 hours of sleep each night for skin repair",
        "Reduce sugar and processed food intake",
        "Manage stress through meditation or light exercise",
        "Avoid touching your face frequently",
      ],
      morningRoutine: [
        "Gentle cleanser — wash face with lukewarm water",
        "Apply Vitamin C serum for brightening",
        "Use a lightweight moisturizer suited to your skin type",
        "Apply SPF 50 broad-spectrum sunscreen",
      ],
      nightRoutine: [
        "Double cleanse — oil cleanser then gentle foam cleanser",
        "Apply niacinamide serum to treat detected issues",
        "Use a targeted treatment (retinol for dark spots/wrinkles)",
        "Apply a nourishing night moisturizer",
      ],
      naturalTreatments: [
        "Apply aloe vera gel to soothe inflammation",
        "Use green tea compresses to reduce puffiness",
        "Turmeric honey mask for brightening and antibacterial effect",
      ],
      homeRemedy: "Mix 1 teaspoon honey with 5 drops of tea tree oil. Apply to affected areas for 15 minutes then rinse with lukewarm water. Do this 3 times per week to reduce acne and soothe skin.",
      recommendedProducts: {
        faceWash: "CeraVe Hydrating Facial Cleanser or La Roche-Posay Toleriane Hydrating Gentle Cleanser",
        moisturizer: "Neutrogena Hydro Boost Water Gel or CeraVe AM Facial Moisturizing Lotion",
        sunscreen: "EltaMD UV Clear Broad-Spectrum SPF 46 or La Roche-Posay Anthelios Melt-in Milk SPF 100",
        treatmentCream: "The Ordinary Niacinamide 10% + Zinc 1% or Paula's Choice 10% Niacinamide Booster",
      },
    };
  }

  const response = GenerateTreatmentResponse.parse(planData);
  res.json(response);
});

export default router;
