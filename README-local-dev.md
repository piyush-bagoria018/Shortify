Local development guide

Backend (Express)

- Copy backend/.env.example to backend/.env and fill values.
- Ensure PORT=5000 for local and NODE_ENV=development.
- Run: npm install
- Start dev: npm run dev
  - API: http://localhost:5000
  - Health: http://localhost:5000/health

Frontend (Next.js)

- Copy frontend/.env.local.example to frontend/.env.local
- Set NEXT_PUBLIC_API_BASE_URL=http://localhost:5000/api/v1
- Run: npm install
- Start dev: npm run dev
  - App: http://localhost:3000

Notes

- In development, backend CORS allows all origins, simplifying local testing.
- In production, set backend CORS_ORIGIN to your Vercel domain; credentials/Authorization are supported.
- Frontend uses Bearer tokens from localStorage for auth; cookies are optional and may be blocked cross-site.
