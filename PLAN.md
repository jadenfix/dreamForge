MONGODB_URI, ANTHROPIC_API_KEY, MOONDREAM_KEY are defined in secrets.env

Contonuously document this

work from this github repo:

https://github.com/jadenfix/dreamForge

Contonuously write tests throughout to make sure this will work well

Below is your fully-loaded, CEO-impressing “DreamForge” guide, now enhanced with a Claude/Anthropic LLM step (for next-level prompt refinement and dynamic orchestration), plus all the “pop” for a Node-driven full-stack role.

https://moondream.ai/ is what this should be modeled after 

⸻

1. Overview: From Prompt → Production-Grade VLMs
	•	Prompt-to-Model: Natural-language task + image → Anthropic LLM planner → Moondream inference → rich visual/text output
	•	Vertical Stack: UI, API, LLM orchestration, metering, analytics, billing-ready CLI
	•	Zero-Cost: MongoDB Atlas M0 + Vercel Free + GitHub Actions + Moondream & Anthropic free tiers

⸻

2. Tech Stack & How It Maps to the Pros

Layer	Your Choice	Moondream/Notes
Frontend	Next.js (React) + Tailwind	Their docs/playground use React SPA
Backend API	Next.js API Routes (Node.js)	Official moondream SDK + Anthropic’s @anthropic-ai/sdk
LLM Orchestration	Anthropic Claude via @anthropic-ai/sdk	Powers “prompt refinement,” dynamic reward-fn generation
ML Core	Moondream Cloud API	PyTorch + HF Transformers, quantized + RLHF pipelines
Database	MongoDB Atlas M0 (Free)	—
CI/CD & Deploy	GitHub Actions → Vercel Free Tier	Their dashboard is Elixir/Phoenix LiveView
Auth (opt.)	NextAuth.js (GitHub OAuth)	—
Monitoring	Vercel Analytics + MongoDB logging	—


⸻

3. High-Level Architecture

[Browser: React UI]
      ↓
[Vercel Next.js App]
   ├─ /           → Prompt UI + ImageUploader
   ├─ /api/dream  → Node handler w/ Anthropic & Moondream
   ├─ /api/usage  → Node handler reads Mongo logs
      ↓
[MongoDB Atlas] ← usage & audit logs
[Moondream Cloud] ← model inference endpoints
[Anthropic Claude] ← prompt-planner & meta-AI
[GitHub Actions] ↔ automatic deploys to Vercel


⸻

4. Data Flow & Smart Endpoint Mapping
	1.	User enters prompt + uploads image → React state
	2.	POST /api/dream { prompt, imageBase64 }
	3.	/api/dream handler:

import { Anthropic } from '@anthropic-ai/sdk';
import { vl } from 'moondream';
import refineRules from '../lib/refineRules.js';
import Usage from '../models/Usage.js';
import db from '../lib/mongodb.js';

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_KEY });
const dreamClient = new vl({ apiKey: process.env.MOONDREAM_KEY });

export default async function handler(req, res) {
  const { prompt, image } = req.body;
  // 1. Validate
  const data = DreamSchema.parse({ prompt, image });

  // 2. LLM-driven prompt refinement
  const planPrompt = `
  You are a router. Given the user request:
  "${data.prompt}"
  Return JSON: { "skill": one of ["detect","point","query","caption"],
                 "params": {...} }.
  `;
  const planRes = await anthropic.complete({
    model: 'claude-v1.3',
    prompt: `\n\nHuman:${planPrompt}\n\nAssistant:`,
    max_tokens_to_sample: 100,
    temperature: 0.2,
  });
  let { skill, params } = JSON.parse(planRes.completion.trim());

  // 3. Fallback to simple rules if parsing fails
  if (!['detect','point','query','caption'].includes(skill)) {
    ({ skill, params } = refineRules(data.prompt));
  }

  // 4. Call Moondream
  const start = Date.now();
  const raw = await dreamClient[skill]({
    image: Buffer.from(data.image, 'base64'),
    ...params
  });
  const duration = Date.now() - start;

  // 5. Log usage & audit trail
  await Usage.create({ skill, timestamp: new Date(), responseTime: duration, prompt: data.prompt });

  // 6. Return enriched response
  const summary = await getUsageSummary();
  res.status(200).json({ raw, summary });
}


	4.	Frontend renders based on skill:
	•	detect → bounding boxes on <canvas>
	•	point → scatterplot points
	•	query/caption → text blocks
	5.	GET /api/usage → returns { totalCalls, bySkill, history } → Chart.js/Recharts

⸻

5. Folder Structure & Key Modules

dreamforge/
├─ .github/workflows/ci.yml
├─ package.json      # + dependencies: next, react, moondream, @anthropic-ai/sdk, mongoose, zod, tailwind
├─ next.config.js
├─ tailwind.config.js
├─ pages/
│  ├─ index.jsx      # PromptForm + ResultOverlay + override toggle
│  ├─ usage.jsx      # Dashboard + Rate-Limit Meter
│  └─ api/
│     ├─ dream.js    # POST: `/api/dream`
│     └─ usage.js    # GET: `/api/usage`
├─ components/
│  ├─ PromptForm.jsx
│  ├─ ImageUploader.jsx
│  ├─ ResultOverlay.jsx
│  ├─ UsageChart.jsx
│  └─ HistoryFeed.jsx  # audit trail viewer
├─ lib/
│  ├─ mongodb.js     # Mongo connection
│  ├─ moondreamClient.js
│  ├─ refineRules.js # pure JS fallback
│  └─ logger.js      # Pino/Winston wrapper
└─ models/
   └─ Usage.js       # Mongoose schema: prompt, skill, time, responseTime


⸻

6. Dev Environment & Secrets

# .env.local
MONGODB_URI=<your Mongo Atlas URI>
MOONDREAM_KEY=<your Moondream API key>
ANTHROPIC_KEY=<your Anthropic API key>
NEXTAUTH_URL=http://localhost:3000   # optional

	•	Cursor Secrets: add the above three keys.
	•	Network Access: whitelist 0.0.0.0/0 in Atlas for dev.

⸻

7. CI/CD & Deploy

# .github/workflows/ci.yml
on: [push]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run lint && npm run test
      - uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-args: '--prod'

	•	Secrets: VERCEL_TOKEN, MONGODB_URI, MOONDREAM_KEY, ANTHROPIC_KEY.

⸻

8. Testing & Quality
	•	Unit: Jest for refineRules, Anthropic-fallback, API validation.
	•	Integration: Supertest for /api/dream (mock Anthropic + Moondream).
	•	Lint/Format: ESLint + Prettier.
	•	Type Safety: Add TypeScript or JSDoc.

⸻

9. Monitoring, Metering & Hardening
	•	Rate-limit /api/dream with express-rate-limit.
	•	Error-safe: try/catch around LLM & inference calls, user-friendly toasts.
	•	Sentry free tier for crash reporting.
	•	Vercel Analytics for endpoint latency.

⸻

🔥 10. Next-Level Features to Stand Out

Feature	Why It Wows Jay
Streaming Mode	Show results as soon as they arrive (stream: true)
Custom Reward UI	Slider to adjust detection confidence thresholds
Local-Cloud Toggle	USE_LOCAL_MODEL switch for Moondream Station demo
CLI Tool	npx dreamforge --file img.jpg --prompt "..."
DevContainer	.devcontainer.json for 1-click VS Code setup
Project Templates	Save/load common tasks as JSON presets
Audit History Feed	View past prompts/results, retry with 1-click
“Why?” Explanations	Use Anthropic to explain why a certain skill was chosen
Edge Functions Demo	Deploy /api/dream on Vercel Edge, benchmark latency


⸻

By adding the Anthropic LLM step, modular design, and developer-centric extras, you’re showcasing deep Node.js expertise, system maturity, and product intuition—exactly the profile Jay is looking to hire. Good luck, and happy coding!