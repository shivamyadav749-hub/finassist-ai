Project Overview: Autonomous financial operations and cash runway modeling for high-growth enterprises.
Problem Statement: Financial blind spots, duplicate SaaS billings, unannounced runway shocks, and multi-tenant security vulnerabilities.
Key Features: Live runway engine, Gemini 3.8-Flash AI Copilot, anomaly detection shield, Cloud Firestore multi-tenant ledger, simulated OCR invoice ingestion, executive CFO briefings, and PayPal Sandbox v2 gateway.
Technology Stack: React 19, TypeScript, Tailwind CSS v4, Node.js/Express, Cloud Firestore, Firebase Auth, and Google GenAI SDK.
Firebase Authentication Setup: Detailed instructions for enabling Email/Password and Google Sign-In in the Firebase Console along with authorized domain configuration.
Firestore Database Structure: Document hierarchy (users/{userId}/transactions/{transactionId}, users/{userId}/disbursements/{disbursementId}) and security rules overview.
Local Development Instructions: Prerequisites, dependency installation, dev server startup (npm run dev), and production build commands.
Environment Variables: Placeholders for GEMINI_API_KEY, APP_URL, and sanitized firebase-applet-config.json template (zero secrets exposed).
Testing Instructions: Commands and coverage details for the automated integration audit suite (npx tsx scripts/test-backend.ts), linting, and build verification.
Current Limitations & Future Improvements: Notes on Firebase console provider activation, simulated PayPal webhooks, and upcoming milestones (Plaid open banking feeds, multimodal receipt parsing, multi-currency treasury).
