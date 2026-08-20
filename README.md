# AstroLive GrowthOS — Final Execution Guide

## What this project is

AstroLive GrowthOS is a competition prototype that combines:

1. Decision Studio — turns a real-life question into a structured Decision Map.
2. Decision Circle — lets another person add perspective, creating a utility-driven invite loop.
3. Daily Hub / 7-Day Challenge — gives the user a reason to return.
4. Cosmic Synastry — creates a social/shareable astrology experience.
5. AstroPass + Async Voice — creates lower-friction and recurring monetization paths.
6. Astrologer Co-Pilot — prepares a human astrologer with context before the live session.

The astrology calculations are simulated for the prototype. The product is demonstrating the product mechanics, not claiming scientific prediction.

## How it works

Browser
  -> frontend UI
  -> Vercel serverless API
  -> validation + prototype business logic
  -> GitHub Contents API (challenge persistence)
  -> JSON response
  -> frontend state update

The GitHub-backed JSON store is suitable for a small demo. It should be replaced with PostgreSQL/Supabase/Neon for production scale.

## Local execution

Requirements:
- Node.js 18+ (20+ recommended)
- npm

1. Extract the repository.
2. Open a terminal in the project root.
3. Install dependencies:

```bash
npm install
```

4. Configure environment variables if GitHub-backed persistence is enabled:

```env
GITHUB_TOKEN=your_fine_grained_token
GITHUB_OWNER=your_github_username
GITHUB_REPO=your_repository_name
GITHUB_BRANCH=main
GITHUB_DATA_PATH=data/store.json
```

Never commit `.env`.

5. Start:

```bash
npm start
```

6. Open:

```text
http://localhost:3000
```

7. Test the API:

```text
http://localhost:3000/api/health
```

## Vercel deployment

1. Create a public GitHub repository.
2. Push/upload the project files.
3. Import the repository into Vercel.
4. Add the same environment variables in Vercel Project Settings -> Environment Variables.
5. Deploy.
6. Open the generated Vercel URL.
7. Test `/api/health`.
8. Run the full judge demo.

## GitHub token

Use a fine-grained token with the minimum repository Contents permission required for the demo. Keep the token only in Vercel/server environment variables.

The browser must never receive the GitHub token.

## API contract

- `GET /api/health` — backend health
- `GET /api/daily` — daily demo content
- `POST /api/decision` — create Decision Map
- `POST /api/decision/:id/invite` — create Decision Circle invite
- `POST /api/challenge` — create challenge
- `POST /api/challenge/:id/complete` — complete a challenge day
- `POST /api/synastry` — create demo Synastry result
- `POST /api/voice` — create async voice request
- `POST /api/consult` — create demo consultation/match event

## Judge demo

1. Home
2. Create Career decision
3. Show Decision Map
4. Invite Circle
5. Start Day 1
6. Show Synastry/share mechanic
7. Show AstroPass/Async Voice
8. Show Co-Pilot
9. Return to Journey

Narrative:

“We are not replacing the consultation. We are building the product loop that makes the consultation more contextual, more frequent, and easier to reach organically.”

## Prototype vs production

Prototype:
- simulated astrology
- demo payment/subscription flow
- demo astrologer matching
- GitHub JSON persistence

Production:
- real astrology/ephemeris service
- PostgreSQL/Supabase/Neon
- authentication
- payments
- object storage for audio
- queue/worker for async requests
- real AstroLive consultation APIs
- analytics/experimentation
- trust and safety policies

## Security

- Never commit `.env`.
- Never expose `GITHUB_TOKEN` to client-side code.
- Do not store sensitive birth details in a public repository in production.
- Use privacy controls for social sharing.

## Submission

Before submission:
- GitHub repository: Public
- Vercel URL: Public
- PDF filename: `AstroLive_pavan_pavan.pdf`
- Test the deployed URL from an incognito browser.
