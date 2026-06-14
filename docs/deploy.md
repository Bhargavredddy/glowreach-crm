Deployment guide — Vercel (frontend) + Railway (backend)

This document shows a minimal, reliable path to get a live link for this repository using Vercel (Next.js frontend) and Railway (backend + Postgres).

Prerequisites
- A GitHub repository (this repo)
- Vercel account (connected to GitHub)
- Railway account (connected to GitHub)
- Repository secrets: `GEMINI_API_KEY` and any provider tokens you choose

Summary (recommended)
- Deploy `frontend/` to Vercel (Next.js native support)
- Deploy `backend/` to Railway (managed Postgres) and set `RUN_SEED=true` on the first deployment

Environment variables
- On Vercel (Frontend project):
  - `NEXT_PUBLIC_API_URL` → URL of deployed backend (e.g. `https://api.example.com`)

- On Railway (Backend project):
  - `DATABASE_URL` → Railway-managed Postgres connection string
  - `GEMINI_API_KEY` → your Gemini key
  - `RUN_SEED` → `true` (first deploy only; you can remove/disable afterwards)
  - `CHANNEL_SERVICE_URL` → URL of channel-service if deployed externally (optional)

Step-by-step (fast path)
1. Push your repo to GitHub (if not already)
2. Connect the repo to Vercel and create a project for the `frontend` folder:
   - In Vercel, create a new project from GitHub and select this repo
   - Set the framework to Next.js and the root directory to `/frontend`
   - Add `NEXT_PUBLIC_API_URL` in Vercel Environment Variables pointing to the backend URL (you can use the Railway URL later)
3. Create a Railway project and add a Managed Postgres plugin
   - Connect Railway to this GitHub repo and create a service that points to the `backend` folder
   - Set `GEMINI_API_KEY` and `RUN_SEED=true` in Railway environment variables
   - Ensure `DATABASE_URL` is set by the Railway Postgres plugin
4. Deploy backend on Railway (it will run Prisma migrations/seed if `RUN_SEED=true` is handled in `entrypoint.sh`)
5. Once backend is live, update Vercel's `NEXT_PUBLIC_API_URL` to the backend production URL and trigger a redeploy on Vercel

Notes
- `channel-service` can run as a separate Railway service or be kept internal. If Railway can't reach internal hostnames, deploy `channel-service` as its own Railway service and set `CHANNEL_SERVICE_URL` accordingly.
- If you prefer a single-provider approach, Render or Fly.io can run both frontend and backend as Docker services.

CI / GitHub Actions (optional)
- Example workflows are included in `.github/workflows/` to help automate builds:
  - `deploy-frontend-vercel.yml` — triggers Vercel deploy using Vercel Action (requires Vercel secrets)
  - `build-backend-image.yml` — builds & publishes a Docker image for the `backend` to GHCR; you can point Railway or other providers at this image

Troubleshooting
- If migrations/seed fail, check `backend/entrypoint.sh` and logs on Railway; set `RUN_SEED=false` after first successful run
- If Next.js needs runtime envs that were used at build time, set them in Vercel before building

If you want, I can:
- Configure the GitHub Actions files (already added)
- Walk you through connecting Vercel and Railway and adding the required secrets
- Deploy `channel-service` to Railway as well
