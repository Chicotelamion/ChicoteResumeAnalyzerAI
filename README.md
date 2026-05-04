# CareerPath AI

CareerPath AI is a React, Firebase, and OpenAI academic final project for resume analysis and IT job recommendation.

## Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Copy `.env.example` to `.env` and fill in Firebase and OpenAI values.

3. Enable Firebase Authentication email/password, Cloud Firestore, and Firebase Storage in your Firebase console.

4. Run the app:

   ```bash
   npm run dev
   ```

## Firebase Collections

- `users`
- `resume_profiles`
- `ai_analysis`

For production, proxy AI requests through a secure backend or Firebase Cloud Function so your API key is not exposed in browser code.
