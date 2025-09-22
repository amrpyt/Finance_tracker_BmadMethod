# 📑 AI Personal Finance Tracker Product Requirements Document (PRD)

| Date | Version | Description | Author |
| :--- | :--- | :--- | :--- |
| 2025-09-13 | 2.0 | Added full Epic and Story Structure | John (PM) |

## 1. Goals & Background Context

* **Ease of Input**: Allow users to log transactions effortlessly with a single sentence, a voice note, or a receipt photo.
* **Automated Categorization**: Leverage AI to automatically classify transactions by type and category.
* **Multi-Account Tracking**: Enable users to add and manage multiple financial accounts (bank, cash, credit cards, etc.).
* **Lightweight Experience**: Focus on simplicity and core functionality, avoiding the complexity of traditional finance apps.

The **AI Personal Finance Tracker** is a SaaS WebApp that helps users monitor their income and expenses simply. Instead of tedious manual entry, users can write, speak, or upload a receipt. The system uses AI (STT, LLM, OCR) to automatically extract and process these transactions, providing a frictionless financial tracking experience.

## 2. Requirements

### ## Functional
1.  **Text Input**: Users can input transactions via text in both Arabic and English.
2.  **Voice Input**: Users can record their voice to create a transaction, which is processed by an STT service (`POST /stt/transcribe/`).
3.  **Receipt Image Input**: Users can upload a receipt image, which is processed by an OCR service (`POST /images/edit/`).
4.  **AI Transaction Extraction**: All inputs (text, voice, image) are processed by an LLM service (`POST /text/llm/`) to extract transaction details.
5.  **Multi-Account Management**: Users can add, edit, and delete multiple financial accounts. Each transaction must be linked to an account.
6.  **Dashboard**: The application must provide a dashboard displaying total balance, balance per account, recent transactions, and data visualizations (charts).
7.  **User Authentication**: The system will support user authentication via Email/Password and Google OAuth.
8.  **SaaS Tiers**: The application will have a Free Tier and a Pro Tier with billing managed by Stripe.

### ## Non-Functional
1.  **AI Accuracy**: The AI extraction process must achieve at least 90% accuracy in correctly identifying transaction details.
2.  **Privacy**: All user data must be encrypted and stored securely.
3.  **Multi-language Support**: The UI must support both Arabic and English from the initial launch.
4.  **Responsive WebApp**: The application must function correctly on all modern web browsers.

## 3. User Interface Design Goals

* **Chat-like Interface**: The primary input method will be a simple, conversational interface similar to WhatsApp or Telegram.
* **Account Selection**: A dropdown menu will be available for users to select the relevant account when adding a transaction.
* **Dashboard Cards**: The dashboard will use a card-based layout to display the balance for each account, plus a total balance card.
* **Visual Modes**: Both Light and Dark modes will be supported.

## 4. Epic & Story Structure

### ## Epic List
1.  **Epic 1: Foundation & User Onboarding**: Establish the core application infrastructure, user authentication, database schema, and the basic SaaS billing framework.
2.  **Epic 2: Core Financial Management**: Implement the fundamental manual finance tracking features, allowing users to manage accounts and transactions manually.
3.  **Epic 3: AI-Powered Transaction Input**: Integrate the key AI services (STT, LLM, OCR) to enable automated transaction entry.
4.  **Epic 4: Dashboard & Visualization**: Build the main user dashboard with account summaries, transaction lists, and interactive charts.

---
### ## Epic 1: Foundation & User Onboarding
**Goal**: Establish the core application infrastructure, including user authentication, database schema, and the basic SaaS billing framework. This allows users to sign up and have an active account.

**Stories**:
* **Story 1.1: Project Initialization and Core Dependency Setup**
    * As a developer, I want to initialize the project structure with Next.js and install core dependencies, so that we have a stable and correct foundation for building the application.
    * **Acceptance Criteria**:
        1.  A new Next.js application is created and can be run locally.
        2.  Tailwind CSS is installed and configured.
        3.  Direct Supabase client is installed and configured to connect to the database.
        4.  A basic health-check API endpoint (`/api/health`) is created and returns a successful response.
* **Story 1.2: Database Schema Creation**
    * As a developer, I want to create and apply the initial database migration, so that the `users`, `accounts`, `transactions`, and `subscriptions` tables are ready in the database.
    * **Acceptance Criteria**:
        1.  SQL migration files are created that match the schema in the architecture document.
        2.  The migration can be successfully applied to the development database.
        3.  All specified tables and columns exist in the Supabase database.
* **Story 1.3: User Signup**
    * As a user, I want to be able to sign up for a new account using my email and password, so that I can start using the application.
    * **Acceptance Criteria**:
        1.  A user can submit their email and password via a signup form.
        2.  A new entry is created in the `users` table with a hashed password.
        3.  Upon successful signup, the user is automatically logged in and redirected to the dashboard.
        4.  The system prevents duplicate email signups.
* **Story 1.4: User Login and Session Management**
    * As a user, I want to log in with my email and password, so that I can access my financial data securely.
    * **Acceptance Criteria**:
        1.  A user can log in using a login form.
        2.  Upon successful login, a JWT token is generated and returned to the client.
        3.  The user is redirected to the dashboard.
        4.  The application securely handles the user's session.
* **Story 1.5: Basic Billing and Subscription Setup**
    * As a developer, I want to integrate Stripe and set up the basic subscription plans, so that new users are assigned a default plan upon signup.
    * **Acceptance Criteria**:
        1.  The Stripe SDK is integrated into the backend.
        2.  "Free" and "Pro" tier plans are created in the Stripe dashboard.
        3.  When a new user signs up, a corresponding customer is created in Stripe.
        4.  A new entry is created in the `subscriptions` table for the user, defaulting to the "Free" plan.

---
### ## Epic 2: Core Financial Management
**Goal**: Implement the fundamental manual finance tracking features. Users will be able to create and manage their financial accounts (e.g., Bank, Cash) and manually add, edit, and view transactions.

**Stories**:
* **Story 2.1: Create and View Financial Accounts**
    * As a user, I want to create and view my financial accounts, so that I can organize my transactions.
    * **Acceptance Criteria**:
        1.  A user can access a dedicated "Accounts" page.
        2.  The page displays a list of all their existing accounts (e.g., "CIB Bank", "Cash").
        3.  There is a form or button to add a new account with a name and type (e.g., bank, cash).
* **Story 2.2: Edit and Delete Financial Accounts**
    * As a user, I want to be able to edit the name or delete an existing financial account, so that I can keep my account list up to date.
    * **Acceptance Criteria**:
        1.  Each account in the list has options to "Edit" and "Delete".
        2.  Clicking "Edit" allows the user to change the account's name.
        3.  Clicking "Delete" presents a confirmation prompt before removing the account.
        4.  Deleting an account also deletes all associated transactions.
* **Story 2.3: Manually Add a Transaction**
    * As a user, I want to manually add an income or expense transaction to a specific account, so that I can log my finances.
    * **Acceptance Criteria**:
        1.  A form is available to add a new transaction.
        2.  The form includes fields for: Amount, Type (income/expense), Category, Description, Date, and associated Account.
        3.  Upon submission, the new transaction is saved to the database.
* **Story 2.4: View and Edit Transactions**
    * As a user, I want to view a list of all my transactions and be able to edit them, so that I can review and correct my financial history.
    * **Acceptance Criteria**:
        1.  A "Transactions" page displays all transactions in a table or list, sorted by date.
        2.  Each transaction entry shows all its details and has an "Edit" and "Delete" option.
        3.  Editing a transaction allows the user to modify any of its details.
        4.  Deleting a transaction requires confirmation.

---
### ## Epic 3: AI-Powered Transaction Input
**Goal**: Integrate the key AI services (STT, LLM, OCR) to enable users to automatically create transactions from plain text, voice recordings, and receipt images.

**Stories**:
* **Story 3.1: Transaction Creation via Simple Text Input**
    * As a user, I want to type a simple sentence into the chat interface to create a transaction, so that I can log expenses quickly.
    * **Acceptance Criteria**:
        1.  The main dashboard has a text input field.
        2.  Typing a phrase like "50 EGP for lunch at McDonalds" and submitting it sends the text to the `/text/llm/` API.
        3.  The system uses the API's JSON response to create a transaction draft.
* **Story 3.2: Transaction Creation via Voice Input**
    * As a user, I want to record a voice note to create a transaction, so I can log expenses hands-free.
    * **Acceptance Criteria**:
        1.  The chat interface has a "record voice" button.
        2.  The recorded audio is sent to the `/stt/transcribe/` API.
        3.  The transcribed text is then processed by the same logic as in Story 3.1.
* **Story 3.3: Transaction Creation via Receipt Upload**
    * As a user, I want to upload a picture of a receipt to create a transaction, so I don't have to type anything.
    * **Acceptance Criteria**:
        1.  The chat interface has an "upload image" button.
        2.  The uploaded image is sent to the `/images/edit/` API for OCR processing.
        3.  The extracted data is used to create a transaction draft.
* **Story 3.4: AI Transaction Confirmation UI**
    * As a user, after an AI-powered input, I want to review and confirm the extracted transaction details before it's saved, so I can ensure its accuracy.
    * **Acceptance Criteria**:
        1.  After any AI input (text, voice, or image), a confirmation modal or UI element appears.
        2.  This UI displays the extracted amount, category, description, etc., in editable fields.
        3.  The user can correct any details and must click a "Confirm" or "Save" button to finalize the transaction.

---
### ## Epic 4: Dashboard & Visualization
**Goal**: Build the main user dashboard, providing a clear overview of financial health with account balances, transaction lists, and interactive charts.

**Stories**:
* **Story 4.1: Display Account Balances**
    * As a user, I want to see the current balance for each of my accounts and my total net worth on the dashboard, so I can get a quick financial overview.
    * **Acceptance Criteria**:
        1.  The dashboard displays a card for each financial account showing its current balance.
        2.  A main card displays the total balance across all accounts.
        3.  Balances are recalculated and updated automatically whenever a transaction is added, edited, or deleted.
* **Story 4.2: Display Recent Transactions Feed**
    * As a user, I want to see a list of my most recent transactions on the dashboard, so I can stay up-to-date with my spending.
    * **Acceptance Criteria**:
        1.  A section on the dashboard shows the 10 most recent transactions from all accounts.
        2.  Each item in the list displays the description, amount, and date.
* **Story 4.3: Expense by Category Pie Chart**
    * As a user, I want to see a pie chart of my expenses broken down by category for the current month, so I can understand where my money is going.
    * **Acceptance Criteria**:
        1.  The dashboard includes a pie chart visualization.
        2.  The chart aggregates all expenses from the current calendar month and groups them by category.
        3.  Hovering over a slice shows the category name and total amount spent.
* **Story 4.4: Income vs. Expense Trend Chart**
    * As a user, I want to see a simple line or bar chart comparing my total income versus total expenses over time, so I can track my financial trends.
    * **Acceptance Criteria**:
        1.  The dashboard includes a line or bar chart.
        2.  The chart displays total income and total expenses for a specific period (e.g., last 30 days).
        3.  The chart has a clear legend and axis labels.

## 5. Next Steps

**Architect Handoff**: This PRD is now ready for the Architect. Please review the requirements, technical constraints from the original architecture document, and the proposed epics and stories. Your next step is to create the detailed architecture document, ensuring the technical design supports every feature and follows the specified constraints.