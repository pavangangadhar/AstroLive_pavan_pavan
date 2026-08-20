# AstroLive GrowthOS — Vercel + GitHub-backed Prototype

A competition-ready prototype combining the four pillars:

1. **Structural Virality** — Cosmic Synastry + Decision Circle invites
2. **Habit** — Daily Transit Hub + 7-Day Decision Loop
3. **Revenue** — AstroPass + ₹149 Async Voice
4. **USP / Supply Efficiency** — AI Astrologer Co-Pilot

## Important architecture note

GitHub is **not a production database**. For this challenge prototype, this repository uses the GitHub Contents API as a lightweight, auditable JSON datastore. Vercel hosts the frontend and serverless backend; GitHub stores `data/store.json` and the application writes demo events back to that file.

Use only synthetic/demo data in this version. Do **not** store real birth dates, birth times, phone numbers, payment data, or other sensitive user information in the GitHub-backed store. For a production launch, replace the storage adapter with Supabase, Neon/Postgres, or another proper database.

## What is included

```text
astrolive-growthos-vercel/
├── api/
│   ├── _lib/
│   │   ├── body.js
│   │   └── store.js
│   ├── health.js
│   ├── daily.js
│   ├── copilot.js
│   ├── decision.js
│   ├── decision/[id]/invite.js
│   ├── challenge.js
│   ├── challenge/[id]/complete.js
│   ├── synastry.js
│   ├── voice.js
│   └── consult.js
├── data/store.json
├── public/index.html
├── public/app.js
├── public/styles.css
├── .env.example
├── .gitignore
├── package.json
├── vercel.json
└── README.md
```

## Deploy to GitHub + Vercel

### 1. Create a GitHub repository

Create a **public** repository, for example:

`astrolive-growthos`

Upload all files from this ZIP to the repository root.

### 2. Create a GitHub fine-grained token

In GitHub, create a fine-grained personal access token with access limited to this repository and:

- Repository access: **Only the AstroLive repository**
- Repository permissions → **Contents: Read and write**

Do not put the token in frontend code, `index.html`, `app.js`, or GitHub commits.

### 3. Import the repository into Vercel

In Vercel:

- Add New Project
- Import the GitHub repository
- Framework preset: **Other**
- Build command: leave empty (or `npm run build`)
- Output directory: leave empty
- Deploy

### 4. Add Vercel Environment Variables

Add these variables for **Production, Preview and Development** as needed:

```text
GITHUB_TOKEN=your_fine_grained_token
GITHUB_OWNER=your_github_username_or_org
GITHUB_REPO=astrolive-growthos
GITHUB_BRANCH=main
GITHUB_DATA_PATH=data/store.json
```

Redeploy after adding the variables.

### 5. Test the backend

Open:

```text
https://YOUR-VERCEL-DOMAIN.vercel.app/api/health
```

A configured deployment should return something similar to:

```json
{
  "ok": true,
  "service": "AstroLive GrowthOS API",
  "storage": "github-backed"
}
```

### 6. Test the complete prototype

Use the website and verify:

- Decision Studio → Generate Map
- Invite Circle → creates an invite record in GitHub
- 7-Day Challenge → creates and completes a challenge
- Synastry → generates and stores a compatibility result
- AstroPass → interactive plan selection
- Async Voice → queues an order in GitHub
- Find Astrologer → creates a consultation event
- Co-Pilot → loads the AI context briefing
- Daily Hub → loads daily content

## How the GitHub datastore works

The serverless API never exposes `GITHUB_TOKEN` to the browser.

When a write occurs:

1. Vercel Function reads `data/store.json` through GitHub's Contents API.
2. The function modifies the JSON in memory.
3. The function commits the updated JSON back to the configured GitHub branch.
4. The frontend receives the newly created record.

This is intentionally simple and transparent for a challenge prototype. It is **not** intended for high-volume concurrent production traffic.

## Production migration

For real users, move `api/_lib/store.js` to a database adapter. The frontend and API contract can remain almost identical. Recommended production architecture:

```text
Browser
   ↓
Vercel CDN / Frontend
   ↓
Vercel Serverless Functions
   ↓
Postgres / Supabase / Neon
   ↓
Object storage for audio + generated assets
```

GitHub should remain the source-control and code-review system, not the production user database or media server.

## Demo assumptions

All astrology calculations, compatibility values, AI briefing text, pricing, and astrologer profiles in this prototype are simulated product-demo data. They are not claims about AstroLive's current internal production metrics.
