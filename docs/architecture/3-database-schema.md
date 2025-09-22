# 3. Database Schema

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
