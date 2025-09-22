# 🏗️ Architecture Document

## 1. System Overview
The **AI Personal Finance Tracker SaaS** is a WebApp powered by internal AI APIs:
- 🎤 **STT**: `POST /stt/transcribe/` to convert audio to text.
- 💬 **LLM**: `POST /text/llm/` to analyze text and extract transactions.
- 📸 **OCR**: `POST /images/edit/` to extract data from receipts.

The WebApp is the user interface, supported by a Backend, Database, and a SaaS Layer (Authentication, Billing).

---

## 2. High-Level Architecture
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
   - **Implementation Note**: It's recommended to use an ORM for database management. For Node.js, **Prisma** is a suitable choice (typed, migrations, integration with Postgres/Supabase). This will simplify the code and accelerate development.

4. **AI Layer (Internal APIs)**
   - `/stt/transcribe/` → audio → text.
   - `/text/llm/` → text → transactions + advice.
   - `/images/edit/` → receipt image → transactions.

5. **Billing Layer (Stripe)**
   - Free Tier + Pro Tier.
   - Stripe Checkout + Webhooks.

---

## 3. Database Schema

### `users`
- `id` (UUID, PK)
- `email`
- `password_hash`
- `created_at`

### `accounts`
- `id` (UUID, PK)
- `user_id` (FK → users.id)
- `name` (e.g. Bank, Cash, Visa)
- `type` (bank, cash, wallet, credit_card)
- `balance` (calculated)
- `created_at`

### `transactions`
- `id` (UUID, PK)
- `user_id` (FK → users.id)
- `account_id` (FK → accounts.id)
- `amount`
- `type` (income/expense)
- `category`
- `description`
- `date`
- `created_at`

### `subscriptions`
- `id` (UUID, PK)
- `user_id` (FK → users.id)
- `plan` (free/pro)
- `status` (active/canceled)
- `renewal_date`
- `created_at`

---

## 4. API Endpoints (Backend → Frontend)

### Auth
- `POST /api/auth/signup`
- `POST /api/auth/login`
- `POST /api/auth/logout`

### Accounts
- `GET /api/accounts`
- `POST /api/accounts`
- `PUT /api/accounts/:id`
- `DELETE /api/accounts/:id`

### Transactions
- `GET /api/transactions`
- `POST /api/transactions`
- `PUT /api/transactions/:id`
- `DELETE /api/transactions/:id`

### Billing
- `POST /api/billing/checkout`
- `POST /api/billing/webhook`

---

## 5. Data Flow Example
1. A user records a voice memo → Frontend sends the file to `/stt/transcribe/`.
2. The AI service returns the transcribed text.
3. The text is sent to `/text/llm/`, which returns a JSON transaction.
4. The backend saves the transaction to the database (linked to an account and user).
5. The dashboard updates, reflecting the new balance and charts.

---

## 6. Security & Privacy
- **JWT Auth Tokens**.
- **HTTPS enforced**.
- **Row-Level Security (RLS)** in Postgres (each user sees only their data).
- **Encryption** of sensitive data (transactions, accounts).

---

## 7. Scalability Considerations
- Internal AI APIs reduce external costs.
- Supabase/Postgres are scalable.
- Stripe handles billing scale.
- A CDN (Vercel/Cloudflare) will be used for the WebApp.