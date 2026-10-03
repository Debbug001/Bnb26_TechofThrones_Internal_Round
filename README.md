# Roundtable: Live Captions for Group Conversations

Web app where several nearby devices join one session and get speaker-attributed live captions.

## Run it (first time)

1. `npm install`
2. `cp .env.example .env` (Windows: `copy .env.example .env`) and fill the values **in your local .env only**.
   Never commit `.env`.
3. In Supabase -> SQL Editor, run `supabase/migrations/20250101_init_sessions_and_participants.sql` once.
4. `npm run dev` (same as `npm run dev:all`): starts backend (port 5000) and frontend (port 3000).
5. Check: open http://localhost:3000 (footer shows "Connected") and http://localhost:5000/api/health.

`npm run dev:client` starts ONLY the frontend and `npm run dev:server` ONLY the backend.
If you see "connection refused" on port 5000, the backend is not running.

## Phones on the same Wi-Fi

Open `http://<your-laptop-LAN-IP>:3000` on the phone (the dev server is on 0.0.0.0 and proxies /api).
Microphone access on phones needs **https** (except on localhost), so for mic tests use a tunnel,
for example `cloudflared tunnel --url http://localhost:3000` (free), and open the https link it prints.
No `CLIENT_URL` / `VITE_API_URL` changes are needed in development.

## Environment variables (names only, see `.env.example`)

PORT, CLIENT_URL, NODE_ENV, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, LIVEKIT_URL, LIVEKIT_API_KEY,
LIVEKIT_API_SECRET, VITE_API_URL
