# 2. Requirements

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
