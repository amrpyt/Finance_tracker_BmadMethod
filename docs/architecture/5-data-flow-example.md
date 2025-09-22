# 5. Data Flow Example
1. A user records a voice memo → Frontend sends the file to `/stt/transcribe/`.
2. The AI service returns the transcribed text.
3. The text is sent to `/text/llm/`, which returns a JSON transaction.
4. The backend saves the transaction to the database (linked to an account and user).
5. The dashboard updates, reflecting the new balance and charts.

---
