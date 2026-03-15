# GlowSkin AI

## Overview

GlowSkin AI is an AI-powered skincare assistant that analyzes face images, detects skin issues, generates personalized treatment plans, and provides environmental skin risk forecasts. Powered by Amazon Bedrock Nova Lite.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **Frontend**: React + Vite (artifacts/glowskin-ai) — TailwindCSS, shadcn/ui, Zustand, Chart.js, Framer Motion
- **API framework**: Express 5 (artifacts/api-server)
- **Database**: PostgreSQL + Drizzle ORM
- **AI**: Amazon Bedrock Nova Lite (via @aws-sdk/client-bedrock-runtime)
- **Image analysis**: Jimp (server-side pixel analysis)
- **Environmental data**: OpenWeatherMap API
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)

## Structure

```text
artifacts-monorepo/
├── artifacts/
│   ├── api-server/         # Express API server
│   │   └── src/
│   │       ├── lib/
│   │       │   ├── bedrock.ts      # Amazon Bedrock Nova Lite client
│   │       │   └── skinAnalysis.ts # Jimp-based image pixel analysis
│   │       └── routes/
│   │           ├── skin.ts         # POST /analyze-skin, GET /analyses
│   │           ├── treatment.ts    # POST /generate-treatment
│   │           ├── environmental.ts # POST /environmental-risk
│   │           ├── voice.ts        # POST /voice-dermatologist
│   │           └── habitCoach.ts   # POST /skin-habit-coach
│   └── glowskin-ai/        # React + Vite frontend
│       └── src/
│           ├── pages/
│           │   ├── home.tsx
│           │   ├── scan.tsx          # Webcam + image upload
│           │   ├── results.tsx       # AI dashboard + treatment
│           │   ├── environmental-risk.tsx
│           │   ├── habit-coach.tsx
│           │   └── voice.tsx         # Voice dermatologist
│           ├── store/
│           │   └── use-skin-store.ts # Zustand store
│           └── hooks/
│               └── use-speech-recognition.ts
├── lib/
│   ├── api-spec/           # OpenAPI spec + Orval codegen config
│   ├── api-client-react/   # Generated React Query hooks
│   ├── api-zod/            # Generated Zod schemas from OpenAPI
│   └── db/
│       └── src/schema/
│           └── skinAnalysis.ts  # users + skin_analysis tables
```

## Environment Variables Required

- `AWS_ACCESS_KEY_ID` — AWS credentials for Bedrock
- `AWS_SECRET_ACCESS_KEY` — AWS credentials for Bedrock
- `AWS_REGION` — Set to `us-east-1`
- `OPENWEATHER_API_KEY` — OpenWeatherMap API key
- `DATABASE_URL` — Auto-provisioned by Replit

## Features

1. **Skin Scan** — Webcam capture or image upload, skin type selector, Jimp pixel analysis
2. **Skin Health Score** — 0-100 score, color-coded gauge chart
3. **AI Treatment Generation** — Bedrock Nova Lite generates morning/night routines, product recommendations
4. **Recovery Prediction** — Estimated recovery days based on health score
5. **Environmental Risk Predictor** — 7-day forecast using OpenWeatherMap data
6. **Voice Dermatologist** — Web Speech API for STT + Bedrock Nova Lite answers
7. **AI Skin Habit Coach** — Personalized daily routines (morning, afternoon, night) + healthy habits
8. **AI Skin Intelligence Dashboard** — 3-step card overview on Results page

## Database Tables

- `users` — user_id, email, created_at
- `skin_analysis` — analysis_id, user_id, health_score, detected_issues (jsonb), recommended_treatment, recovery_days, created_at

## API Endpoints

- `POST /api/analyze-skin` — Analyze face image, returns issues + health score
- `POST /api/generate-treatment` — Bedrock generates treatment plan
- `POST /api/environmental-risk` — Fetches weather data, builds 7-day forecast
- `POST /api/voice-dermatologist` — Answers skincare questions via Bedrock
- `POST /api/skin-habit-coach` — Generates personalized daily habit plan
- `GET /api/analyses` — Lists past analyses

## Running

- Frontend: `pnpm --filter @workspace/glowskin-ai run dev`
- API server: `pnpm --filter @workspace/api-server run dev`
- DB push: `pnpm --filter @workspace/db run push`
- Codegen: `pnpm --filter @workspace/api-spec run codegen`
