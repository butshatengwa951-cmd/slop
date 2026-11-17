import { firebaseAuth } from "../config/firebaseAdmin.js";
import { createAuthenticateFirebase } from "./authenticateFirebase.js";

export const authenticateFirebase = createAuthenticateFirebase({
  verifyIdToken: (token, checkRevoked) =>
    firebaseAuth.verifyIdToken(token, checkRevoked)
});
