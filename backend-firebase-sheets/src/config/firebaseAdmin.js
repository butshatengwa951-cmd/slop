import { applicationDefault, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

// Firebase Admin is the trusted, server-side SDK. We use it to verify tokens
// created by Firebase Authentication in the React frontend. Never put the
// service-account private key or Firebase Admin SDK in browser code.

// Reuse an existing Firebase app if one has already been initialised.
// This prevents "app already exists" errors during development reloads/tests.
const firebaseApp = getApps()[0] ?? initializeApp({
  // applicationDefault() reads credentials from the server environment.
  // Locally, GOOGLE_APPLICATION_CREDENTIALS should point to a service-account
  // JSON file. Keep that file outside the repository and out of the frontend.
  credential: applicationDefault(),

  // Explicitly set the project ID when provided. This helps ensure that the
  // backend verifies tokens against the intended Firebase project.
  ...(process.env.FIREBASE_PROJECT_ID
    ? { projectId: process.env.FIREBASE_PROJECT_ID }
    : {})
});

// Export one reusable Auth client. Other backend files import this instance
// instead of initialising Firebase again for every request.
export const firebaseAuth = getAuth(firebaseApp);
