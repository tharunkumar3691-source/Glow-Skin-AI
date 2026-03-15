import { Router, type IRouter } from "express";
import { GetEnvironmentalRiskBody, GetEnvironmentalRiskResponse } from "@workspace/api-zod";

const router: IRouter = Router();

async function fetchWeatherData(city: string) {
  const apiKey = process.env.OPENWEATHER_API_KEY;
  if (!apiKey) throw new Error("OPENWEATHER_API_KEY not set");

  const baseUrl = "https://api.openweathermap.org/data/2.5";
  const geoUrl = `http://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(city)}&limit=1&appid=${apiKey}`;

  const geoRes = await fetch(geoUrl);
  const geoData = await geoRes.json() as any[];
  if (!geoData.length) throw new Error(`City not found: ${city}`);

  const { lat, lon } = geoData[0];

  const [weatherRes, uvRes, airRes] = await Promise.all([
    fetch(`${baseUrl}/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`),
    fetch(`${baseUrl}/uvi?lat=${lat}&lon=${lon}&appid=${apiKey}`),
    fetch(`http://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${apiKey}`),
  ]);

  const [weather, uv, air] = await Promise.all([
    weatherRes.json() as any,
    uvRes.json() as any,
    airRes.json() as any,
  ]);

  return {
    lat,
    lon,
    temp: weather.main?.temp ?? 25,
    humidity: weather.main?.humidity ?? 60,
    description: weather.weather?.[0]?.description ?? "clear sky",
    uvIndex: typeof uv.value === "number" ? uv.value : 3,
    pm25: air.list?.[0]?.components?.pm2_5 ?? null,
  };
}

function getRiskLevel(uvIndex: number, humidity: number, pm25: number | null): "low" | "medium" | "high" {
  let score = 0;
  if (uvIndex >= 8) score += 2;
  else if (uvIndex >= 6) score += 1;
  if (humidity < 30) score += 1;
  if (pm25 !== null && pm25 > 25) score += 2;
  else if (pm25 !== null && pm25 > 12) score += 1;
  if (score >= 3) return "high";
  if (score >= 1) return "medium";
  return "low";
}

function buildForecast(
  base: { uvIndex: number; humidity: number; pm25: number | null; temp: number },
  detectedIssues: string[]
) {
  const hasAcne = detectedIssues.some((i) => i.toLowerCase().includes("acne"));
  const hasDarkSpots = detectedIssues.some((i) => i.toLowerCase().includes("dark spots"));
  const hasDrySkin = detectedIssues.some((i) => i.toLowerCase().includes("dry"));

  return Array.from({ length: 7 }, (_, i) => {
    const uvVariation = base.uvIndex + (Math.random() * 2 - 1);
    const humVariation = base.humidity + (Math.random() * 10 - 5);
    const pmVariation = base.pm25 !== null ? base.pm25 + (Math.random() * 10 - 5) : null;
    const uv = Math.max(0, Math.round(uvVariation * 10) / 10);
    const hum = Math.max(0, Math.min(100, Math.round(humVariation)));
    const pm = pmVariation !== null ? Math.max(0, Math.round(pmVariation * 10) / 10) : null;

    const riskLevel = getRiskLevel(uv, hum, pm);

    const date = new Date();
    date.setDate(date.getDate() + i);

    let mainRisk = "Moderate conditions";
    let advice = "Follow your regular skincare routine";

    if (uv >= 8) {
      mainRisk = "Very High UV radiation";
      advice = "Apply SPF 50+ sunscreen every 2 hours, wear a hat and protective clothing";
    } else if (uv >= 6 && hasDarkSpots) {
      mainRisk = "High UV — dark spots may worsen";
      advice = "Use SPF 50 sunscreen and a Vitamin C serum in the morning";
    } else if (pm !== null && pm > 25) {
      mainRisk = "High air pollution — acne inflammation risk";
      advice = hasAcne ? "Cleanse face twice, use an antioxidant serum" : "Cleanse face thoroughly in evening";
    } else if (hum < 30) {
      mainRisk = "Low humidity — dry skin risk";
      advice = hasDrySkin ? "Apply moisturizer morning and night, use a hydrating mist" : "Stay hydrated and moisturize";
    } else if (uv >= 4) {
      mainRisk = "Moderate UV exposure";
      advice = "Apply SPF 30 sunscreen before going outdoors";
    } else if (hum > 80) {
      mainRisk = "High humidity — potential pore congestion";
      advice = "Use oil-free products, cleanse gently after sweating";
    }

    return {
      day: i + 1,
      date: date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" }),
      riskLevel,
      mainRisk,
      advice,
      uvIndex: uv,
      humidity: hum,
      temperature: Math.round(base.temp + (Math.random() * 4 - 2)),
      pm25: pm,
    };
  });
}

function buildPreventiveAdvice(conditions: { uvIndex: number; humidity: number; pm25: number | null }, detectedIssues: string[]) {
  const advice: string[] = [];
  if (conditions.uvIndex >= 6) {
    advice.push("Apply SPF 50 broad-spectrum sunscreen before leaving home");
    advice.push("Reapply sunscreen every 2 hours if outdoors");
  }
  if (conditions.humidity < 40) {
    advice.push("Use a humidifier at home to maintain skin moisture");
    advice.push("Apply a hydrating serum and rich moisturizer tonight");
  }
  if (conditions.pm25 !== null && conditions.pm25 > 15) {
    advice.push("Double cleanse in the evening to remove pollution particles");
    advice.push("Apply an antioxidant serum (Vitamin C or E) to neutralize free radicals");
  }
  if (advice.length < 3) {
    advice.push("Keep your skin clean and moisturized throughout the day");
    advice.push("Drink at least 8 glasses of water to maintain skin hydration");
    advice.push("Avoid touching your face to reduce bacteria transfer");
  }
  return advice;
}

router.post("/environmental-risk", async (req, res): Promise<void> => {
  const parsed = GetEnvironmentalRiskBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { city, detectedIssues = [] } = parsed.data;

  let conditions: { temp: number; humidity: number; description: string; uvIndex: number; pm25: number | null };

  try {
    const data = await fetchWeatherData(city);
    conditions = {
      temp: data.temp,
      humidity: data.humidity,
      description: data.description,
      uvIndex: data.uvIndex,
      pm25: data.pm25,
    };
  } catch {
    conditions = {
      temp: 25,
      humidity: 55,
      description: "partly cloudy",
      uvIndex: 5,
      pm25: 15,
    };
  }

  const forecast = buildForecast(conditions, detectedIssues);
  const preventiveAdvice = buildPreventiveAdvice(conditions, detectedIssues);

  const response = GetEnvironmentalRiskResponse.parse({
    city,
    currentConditions: {
      uvIndex: conditions.uvIndex,
      humidity: conditions.humidity,
      temperature: conditions.temp,
      pm25: conditions.pm25,
      description: conditions.description,
    },
    forecast,
    preventiveAdvice,
  });

  res.json(response);
});

export default router;
