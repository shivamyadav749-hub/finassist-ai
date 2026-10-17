# FinAssist AI — Autonomous Enterprise Financial Intelligence

FinAssist AI is an autonomous financial operations platform designed for high-growth enterprises and startups. It bridges real-time banking telemetry, automated transaction anomaly shields, and generative scenario modeling powered by Google Gemini to help executive teams anticipate cash burn shocks, eliminate duplicate SaaS expenses, and protect runway.
## 🌐 Live Demo
🚀 **Try FinAssist AI:** https://finassist-ai-2.ai.studio
---

## 1. Project Overview

FinAssist AI provides continuous financial oversight by converting raw transaction feeds into quantitative risk forecasts. Unlike traditional accounting software that operates retrospectively at month-end closing, FinAssist AI monitors daily expenditure velocity, stress-tests operational hiring and infrastructure shocks, and isolates anomalous outflows before settlement.

---

## 2. Problem Statement

Modern finance teams face critical visibility and operational bottlenecks:
* **Silent Runway Contraction**: Variable cloud hosting surges and headcount additions compound unexpectedly, reducing cash runway without early warning.
* **Vendor Billing Anomalies**: Duplicate SaaS subscriptions, unannounced price renewals, and overlapping virtual cards leak 3–7% of operational capital annually.
* **Disconnected Scenario Modeling**: CFOs spend days building manual spreadsheet forecasts for tax liabilities, vendor term renegotiations, and stress-tests.
* **Security & Multi-Tenant Exposure**: Legacy internal tooling frequently commingles financial data across unauthenticated or poorly partitioned databases.

---

## 3. Key Features

* **Autonomous Cash Runway & Burn Engine**: Real-time calculation of settled liquidity, pending receivables, monthly net burn, and exact runway horizon in months.
* **AI Copilot (Powered by Gemini 3.8-Flash)**: Server-side generative financial modeling for cash burn stress-testing, quarterly corporate tax reserve estimation, and vendor Net-45 renegotiation proposals.
* **Anomaly & Duplicate Invoice Detection**: Automated flags for duplicate charges within 48 hours, high-velocity outflows, and single-click vendor dispute generation.
* **Multi-Tenant Cloud Firestore Ledger**: Authenticated per-user transaction persistence under `users/{userId}/transactions` with real-time reactive sync.
* **Simulated OCR Invoice Scanner**: Ingests line-item receipts and parses vendor metadata directly into the verified ledger.
* **Executive CFO Briefing Export**: Downloadable board-ready risk and runway executive briefings in UTF-8 text and verified CSV formats.
* **PayPal Sandbox v2 Gateway**: End-to-end subscription simulation featuring plan tiers, prefunded buyer wallets, and server-side capture verification.

---

## 4. Technology Stack

* **Frontend Framework**: React 19, TypeScript
* **Styling & Design System**: Tailwind CSS v4, Google Material Symbols, Lucide Icons, Motion
* **Build System**: Vite 6 / 8, ESBuild
* **Backend Runtime**: Node.js, Express 4, `tsx`
* **Database & Persistence**: Google Cloud Firestore (isolated multi-region database)
* **Authentication**: Firebase Authentication (Google Identity Toolkit, Google OAuth, Email/Password)
* **AI Intelligence**: Google GenAI SDK (`@google/genai`), Model: `gemini-3.8-flash`
* **Security Middleware**: Sliding-window rate limiters, strict payload caps, HTTP security headers (`nosniff`, `SAMEORIGIN`)

---

## 5. Firebase Authentication Setup

FinAssist AI uses Firebase Authentication for authoritative identity management and session persistence.

### Console Configuration Steps
1. Open the [Firebase Console](https://console.firebase.google.com/).
2. Select your Firebase project.
3. In the left navigation, go to **Build** > **Authentication**.
4. In the **Sign-in method** tab:
   * **Email/Password**: Click **Email/Password**, toggle **Enable** to **ON** (leave Email link/passwordless OFF), and click **Save**.
   * **Google Sign-In**: Click **Google**, toggle **Enable** to **ON**, select your support email, and click **Save**.
5. Under the **Settings** tab > **Authorized domains**, ensure your application domains are added:
   * `localhost`
   * `127.0.0.1`
   * Your hosting or development URL (`*.run.app`)

---

## 6. Firestore Database Structure

Financial records are partitioned by user ID to guarantee strict data isolation.

```
firestore-root/
│
├── users/
│   └── {userId}/
│       ├── (Document fields: email, fullName, companyName, role, createdAt)
│       │
│       ├── transactions/
│       │   └── {transactionId}/
│       │       ├── userId: string (matches parent {userId})
│       │       ├── refId: string (e.g., "TXN-99824")
│       │       ├── counterparty: string (max 128 chars)
│       │       ├── category: "Revenue" | "Software" | "Marketing" | "Payroll" | "Office & Facilities" | "Cloud"
│       │       ├── amount: number (positive = inflow, negative = outflow)
│       │       ├── currency: string ("INR")
│       │       ├── date: string (e.g., "Today, 09:14 AM")
│       │       ├── status: "settled" | "pending" | "flagged"
│       │       ├── anomalyReason?: string (optional audit explanation)
│       │       ├── paymentMethod: string (e.g., "Corporate Visa")
│       │       ├── isDemo: boolean
│       │       └── createdAt: string (ISO timestamp)
│       │
│       └── disbursements/
│           └── {disbursementId}/
│               ├── txId: string
│               ├── title: string
│               ├── amount: number
│               ├── currency: string
│               ├── method: string
│               ├── status: "Settled" | "Denied" | "Pending"
│               └── timestamp: string
```

### Security Rules Summary (`firestore.rules`)
* Unauthenticated read and write requests are strictly rejected (`request.auth != null`).
* Users can only read, write, update, or delete records where `request.auth.uid == userId`.
* Transaction schemas enforce non-zero numeric amounts and validated categories.

---

## 7. Local Development Instructions

### Prerequisites
* Node.js 20.x or higher
* npm or bun package manager

### Installation & Launch
1. Clone the repository and navigate into the project directory:
   ```bash
   cd finassist-ai
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables (see Section 8).

4. Start the full-stack development server:
   ```bash
   npm run dev
   ```
   The application will be accessible at `http://localhost:3000`.

5. Build for production:
   ```bash
   npm run build
   ```

---

## 8. Environment Variables Required

Create a `.env` file in the root directory based on `.env.example`:

```env
# GEMINI_API_KEY: Server-side API key for Google Gemini models.
# Encapsulated strictly on the backend; never exposed to client-side code.
GEMINI_API_KEY="YOUR_GEMINI_API_KEY"

# APP_URL: Base URL where the application is hosted.
APP_URL="http://localhost:3000"
```

### Firebase Applet Configuration (`firebase-applet-config.json`)
FinAssist AI connects to Firebase using configuration stored in `firebase-applet-config.json`. Ensure this file exists with your project credentials:

```json
{
  "projectId": "YOUR_FIREBASE_PROJECT_ID",
  "appId": "YOUR_FIREBASE_APP_ID",
  "apiKey": "YOUR_FIREBASE_WEB_API_KEY",
  "authDomain": "YOUR_PROJECT.firebaseapp.com",
  "firestoreDatabaseId": "YOUR_DATABASE_ID",
  "storageBucket": "YOUR_PROJECT.firebasestorage.app",
  "messagingSenderId": "YOUR_MESSAGING_SENDER_ID",
  "oAuthClientId": "YOUR_OAUTH_CLIENT_ID.apps.googleusercontent.com"
}
```

---

## 9. Testing Instructions

FinAssist AI includes an automated end-to-end integration and security audit test suite.

### Run Automated Audit Suite
Execute the test runner using `tsx`:
```bash
npx tsx scripts/test-backend.ts
```

The test runner validates:
* Server health check (`GET /api/health`)
* Cloud Firestore live connection and security rule enforcement
* Protected endpoint authorization checks (verifying HTTP 401 on unauthenticated calls)
* Multi-tenant data isolation
* PayPal Sandbox lifecycle (order generation, server-side capture, duplicate prevention, and cancellation)
* AI Copilot rate-limiting and input validation
* Financial summary calculation consistency

### Run TypeScript Lint & Type Verification
```bash
npm run lint
```

### Run Production Build Verification
```bash
npm run build
```

---

## 10. Current Limitations & Future Improvements

### Current Limitations
1. **Firebase Email/Password Activation**: Email/Password authentication requires manual activation in the Firebase Console. A graceful fallback session is built into the demo login button to ensure uninterrupted prototype evaluation.
2. **Simulated PayPal Webhooks**: PayPal IPN/Webhooks are triggered through an internal synthetic dispatcher engine for sandbox prototyping rather than an open public endpoint.
3. **Primary Currency Focus**: Numerical modeling and visual components are currently optimized for Indian Rupees (₹ / INR).

### Future Improvements
1. **Live Plaid API Integration**: Direct read-only Open Banking API connections to automate bank account balance feeds.
2. **Multi-Currency Global Treasury**: Automated real-time conversion rates across USD, EUR, GBP, and INR.
3. **Multimodal Receipt Uploads**: Integration of Gemini 2.5 Flash / 3.8 Flash multimodal vision to extract structured PDF line items from uploaded supplier receipts.
4. **Automated Vendor Dispute Workflows**: Webhook-triggered dispute letters dispatched directly to merchant acquirers for duplicate invoices.
