# FinAssist AI — Firebase Authentication & Firestore Migration Implementation Plan

This plan details the step-by-step implementation for migrating **FinAssist AI** from mock backend authentication and in-memory array storage to **Firebase Authentication** and persistent per-user **Cloud Firestore** storage, while preserving all existing UI and design aesthetics.

---

## 1. Firebase Console Configuration Required

Before or alongside testing, ensure the following configurations are active in your [Firebase Console](https://console.firebase.google.com/):

### A. Authentication Providers
1. Open the Firebase Console and select your project (`ai-studio-finassistai-dbf5e6c2-0bed-4d53-9938-536eab26b103`).
2. Navigate to **Build > Authentication > Sign-in method**.
3. **Email/Password**:
   - Click on **Email/Password**.
   - Enable **Email/Password** (Passwordless can remain off).
   - Click **Save**.
4. **Google**:
   - Click on **Google**.
   - Enable **Google**.
   - Select your project support email and click **Save**.
5. **Authorized Domains**:
   - Under **Authentication > Settings > Authorized domains**, ensure `localhost` and your application preview domain (`*.run.app`) are listed (added by default by Firebase/Google Cloud).

### B. Cloud Firestore
- The Firestore database instance (`ai-studio-finassistai-dbf5e6c2-0bed-4d53-9938-536eab26b103`) is already provisioned and connected.
- Security rules will be updated and deployed to enforce per-user isolation under `users/{userId}/transactions/{transactionId}`.

---

## 2. Architecture & Data Flow

```
┌────────────────────────────────────────────────────────┐
│               FinAssist AI Frontend (React)            │
└────────────────────────────────────────────────────────┘
          │                                  │
          │ (1) Firebase Auth                │ (2) Firestore SDK
          ▼                                  ▼
┌─────────────────────────┐        ┌───────────────────────────────────┐
│  Firebase Authentication│        │          Cloud Firestore          │
│ - signInWithEmailAndPass│        │                                   │
│ - createUserWithEmail...│        │ Path:                             │
│ - signInWithPopup(Google│        │ users/{userId}/transactions/{txId}│
│ - onAuthStateChanged    │        │                                   │
└─────────────────────────┘        │ Security:                         │
                                   │ Only request.auth.uid == userId   │
                                   └───────────────────────────────────┘
```

---

## 3. Implementation Phases

### Phase 1: Firebase Authentication
1. **Firebase Client SDK (`src/lib/firebase.ts`)**:
   - Export Firebase Auth functions: `createUserWithEmailAndPassword`, `signInWithEmailAndPassword`, `signOut`, `updateProfile`, `onAuthStateChanged`.
   - Ensure `auth` is configured with browser local persistence (`browserLocalPersistence`).

2. **Authentication View (`src/views/AuthView.tsx`)**:
   - Replace `/api/auth/login` and `/api/auth/register` calls with native `signInWithEmailAndPassword` and `createUserWithEmailAndPassword`.
   - On registration, call `updateProfile(userCredential.user, { displayName: fullName })` to associate the user's name.
   - Maintain Google Sign-In with `signInWithPopup(auth, googleProvider)`.
   - Support one-click demo login via a dedicated demo credential or Firebase anonymous/demo auth so existing demo buttons continue working seamlessly without mock synthetic tokens.
   - Map Firebase Auth error codes (e.g., `auth/user-not-found`, `auth/wrong-password`, `auth/email-already-in-use`, `auth/weak-password`) to clean, user-friendly messages.
   - Keep the existing UI layout, styling, inputs, and animations completely unchanged.

3. **Session Management (`src/App.tsx`)**:
   - Rely strictly on `onAuthStateChanged(auth, (fbUser) => { ... })` for authoritative session state.
   - Remove synthetic mock tokens (`token_usr_...`).
   - Wire `handleSignOut` to `signOut(auth)`.

---

### Phase 2: Firestore Transactions
1. **Firestore Client Service (`src/lib/transactions.ts`)**:
   - Create typed functions interacting directly with Firestore:
     - `subscribeUserTransactions(userId, onUpdate, onError)`: Real-time listener (`onSnapshot`) querying `users/{userId}/transactions` ordered by date/creation timestamp.
     - `addUserTransaction(userId, txData)`: `addDoc(collection(db, 'users', userId, 'transactions'), payload)`.
     - `updateUserTransaction(userId, txId, updates)`: `updateDoc(doc(db, 'users', userId, 'transactions', txId), updates)`.
     - `deleteUserTransaction(userId, txId)`: `deleteDoc(doc(db, 'users', userId, 'transactions', txId))`.
     - `seedUserDefaultTransactions(userId)`: If a newly registered user has 0 transactions, seed their private Firestore collection with initial verified ledger items so their dashboard is populated with realistic baseline data.

2. **Integration into App State & Views**:
   - In `src/App.tsx`, connect transaction state directly to the active `user.id`'s Firestore subscription.
   - Wire `handleAddTransaction` to `addUserTransaction(user.id, tx)`.
   - Ensure transaction editing, status updates (settled, flagged, pending), and deletion update Firestore directly.
   - Update summary metrics computation (`settledLiquidity`, `netCashFlow`, `runwayMonths`) to dynamically compute from the user's real Firestore transactions.
   - Remove dependency on the in-memory `transactions` array in `server.ts`.

---

### Phase 3: Security & `firestore.rules`
1. **Update `firestore.rules`**:
   - Enforce owner-only access for each user's root document and subcollections:
     ```javascript
     match /users/{userId} {
       allow get, update: if request.auth != null && request.auth.uid == userId;
       allow create: if request.auth != null && request.auth.uid == userId;
       allow delete: if false;

       match /transactions/{transactionId} {
         allow read, write: if request.auth != null && request.auth.uid == userId;
       }
     }
     ```
   - Validate incoming transaction fields:
     - `userId`: must match `request.auth.uid`.
     - `amount`: must be a valid number.
     - `counterparty`: non-empty string.
     - `status`: one of `['settled', 'pending', 'flagged']`.
   - Maintain safety-net default deny: `match /{document=**} { allow read, write: if false; }`.
   - Maintain minimal health-check read: `match /test/{docId} { allow read: if true; }`.
2. **Deploy Rules**:
   - Deploy the updated rules to the live project and verify permissions via script.

---

### Phase 4: Verification & Testing
1. **Syntax & Compilation**:
   - Run `lint_applet` and `compile_applet` to ensure zero TypeScript or bundling errors.
2. **Authentication Verification**:
   - Test email/password user creation and login.
   - Verify `onAuthStateChanged` triggers with valid `uid`.
   - Verify sign-out clears auth state.
3. **Firestore Operations Verification**:
   - Test adding a transaction and confirm document creation under `users/{userId}/transactions`.
   - Verify transactions persist across page reloads and server restarts.
   - Verify user A cannot view or read user B's transaction collection.
4. **Final Status Report**:
   - Document verified functionalities and any remaining tests requiring browser manual interaction (such as interactive Google OAuth popups).
