import { applicationDefault, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

const firebaseApp = getApps()[0] ?? initializeApp({
  credential: applicationDefault(),
  ...(process.env.FIREBASE_PROJECT_ID
    ? { projectId: process.env.FIREBASE_PROJECT_ID }
    : {})
});

export const firebaseAuth = getAuth(firebaseApp);
