# 1. System Overview
The **AI Personal Finance Tracker SaaS** is a WebApp powered by internal AI APIs:
- 🎤 **STT**: `POST /stt/transcribe/` to convert audio to text.
- 💬 **LLM**: `POST /text/llm/` to analyze text and extract transactions.
- 📸 **OCR**: `POST /images/edit/` to extract data from receipts.

The WebApp is the user interface, supported by a Backend, Database, and a SaaS Layer (Authentication, Billing).

---
