# 2. High-Level Architecture
**Layers:**
1. **Frontend (WebApp)**
   - Next.js + Tailwind (UI).
   - React Query / SWR for data management.
   - Auth flow (Login/Signup).
   - Dashboard (Charts, Accounts, Transactions).

2. **Backend (API Layer)**
   - Node.js (Express/Fastify) or Python (FastAPI).
   - Routes:
     - `/api/auth/*` → Login/Signup.
     - `/api/transactions/*` → CRUD for transactions.
     - `/api/accounts/*` → Account management.
     - `/api/billing/*` → Stripe webhooks + subscription management.
   - Integrates with internal AI APIs.

3. **Database (Supabase/Postgres)**
   - Main tables: `users`, `accounts`, `transactions`, `subscriptions`.
   - **Implementation Note**: It's recommended to use direct Supabase client for database management. This provides direct control with typed queries and eliminates ORM complexity, accelerating development.

4. **AI Layer (Internal APIs)**
   - `/stt/transcribe/` → audio → text.
   - `/text/llm/` → text → transactions + advice.
   - `/images/edit/` → receipt image → transactions.

5. **Billing Layer (Stripe)**
   - Free Tier + Pro Tier.
   - Stripe Checkout + Webhooks.

---
