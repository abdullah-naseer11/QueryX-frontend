# QueryX AI - Frontend (connected to the Database Architect AI backend)

Next.js + React + Three.js.

## Pages
- `/` landing page with the 3D scene and **Get started**
- `/dashboard`
  - **Overview**: real counts from the API, AI Copilot (writes a migration from plain English), recent activity
  - **Migrations**: propose, test in sandbox, approve, apply, roll back (live status over WebSocket)
  - **Schema explorer**: tables, columns and keys read from the database
  - Query optimizer, Security auditor, Activity logs, Settings: not built yet (the backend does not have them)
  - The latency chart is sample data and is labelled as such

## Run
1. Start the backend (in the backend folder): `docker compose up -d`, then `uvicorn app.api.main:app --reload`
2. Copy `.env.local.example` to `.env.local` (the key must match `API_KEY` in the backend `.env`)
3. `npm install`, then `npm run dev`
4. Open http://localhost:3000

## Important
`NEXT_PUBLIC_API_KEY` is visible to anyone who opens the site in a browser. That is fine on your own computer.
Before putting this on the internet, add a login and keep the key on a server.
