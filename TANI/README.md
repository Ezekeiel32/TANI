# Firebase Studio

## Booking System Setup (MMA Coach)

1. Copy `.env.example` to `.env` and fill variables:
   - `DATABASE_URL="file:./dev.db"`
   - `ENCRYPTION_KEY` (32‑byte hex)
   - Stripe: `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
   - Google: `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REDIRECT_URI`
   - NextAuth: `NEXTAUTH_SECRET` (generate with `openssl rand -base64 32`)
   - Email: `RESEND_API_KEY` (from resend.com)
   - Redis: `REDIS_HOST=localhost`, `REDIS_PORT=6379`
   - `NEXT_PUBLIC_URL=http://localhost:9002`

2. Install and migrate:
```bash
npm i
npm run db:migrate
npm run db:seed
```

3. Start Redis (required for job queue):
```bash
docker run -d -p 6379:6379 redis:alpine
# or install locally: sudo apt install redis-server
```

4. Start dev server + workers:
```bash
# Terminal 1
npm run dev

# Terminal 2
npm run workers:dev
```

### APIs
- `GET /api/availability?trainerId=...&serviceId=...&from=ISO&to=ISO`
- `POST /api/bookings` with `{ trainerId, userId?, serviceId, start, end, hold? }`
- `POST /api/bookings/:id/confirm`
- `POST /api/bookings/:id/cancel`
- `POST /api/stripe/setup-intent` with `{ userId, email }`
- `POST /api/stripe/webhook` (set webhook to raw body)
- `GET /api/google/oauth/start?trainerId=...` → Google consent
- `GET /api/google/oauth/callback` → stores tokens encrypted

### Next steps
- Wire Google FreeBusy into availability and push sync webhooks.
- Build booking wizard UI and trainer dashboard.

This is a NextJS starter in Firebase Studio.

To get started, take a look at src/app/page.tsx.
