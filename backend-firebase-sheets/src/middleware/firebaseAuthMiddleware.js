import { firebaseAuth } from "../config/firebaseAdmin.js";
import { createAuthenticateFirebase } from "./authenticateFirebase.js";

// This is the adapter between our reusable middleware and the real Firebase
// Admin SDK. The factory itself does not need to know where verification comes
// from; this file supplies firebaseAuth.verifyIdToken as the implementation.
export const authenticateFirebase = createAuthenticateFirebase({
  // Pass checkRevoked through so the middleware can request revocation checks.
  verifyIdToken: (token, checkRevoked) =>
    firebaseAuth.verifyIdToken(token, checkRevoked)
});
