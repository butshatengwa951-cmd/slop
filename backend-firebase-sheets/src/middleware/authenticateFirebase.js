// Firebase Admin uses these error codes for tokens/accounts that cannot be
// authenticated. They are treated as 401 responses because the request's
// credentials are missing, invalid, expired, revoked, or no longer usable.
const INVALID_TOKEN_CODES = new Set([
  "auth/argument-error",
  "auth/invalid-id-token",
  "auth/id-token-expired",
  "auth/id-token-revoked",
  "auth/user-disabled",
  "auth/user-not-found"
]);

// Use one response shape for every authentication error. The frontend can
// switch on "code" instead of trying to interpret different error messages.
function sendAuthError(res, status, code, message) {
  return res.status(status).json({ error: { code, message } });
}

// This factory receives the token-verification function as a dependency.
// Injecting it makes the middleware testable: tests can use a fake verifier
// without contacting Firebase or requiring real credentials.
export function createAuthenticateFirebase({ verifyIdToken, logger = console }) {
  if (typeof verifyIdToken !== "function") {
    throw new TypeError("verifyIdToken must be a function.");
  }

  return async function authenticateFirebase(req, res, next) {
    // React sends its Firebase ID token in the Authorization HTTP header.
    const authorization = req.headers.authorization;

    // No header means no credentials were provided. Stop here rather than
    // calling Firebase with an empty value.
    if (!authorization) {
      return sendAuthError(
        res, 401, "AUTH_TOKEN_REQUIRED", "Authentication token is required."
      );
    }

    // Only accept the standard "Bearer <token>" format. This also prevents
    // accidentally treating Basic auth or an empty Bearer value as an ID token.
    const match = /^Bearer\s+(\S+)$/i.exec(authorization);
    if (!match) {
      return sendAuthError(
        res, 401, "AUTH_TOKEN_INVALID_FORMAT", "Use the Bearer authentication scheme."
      );
    }

    try {
      // verifyIdToken validates the token's signature, expiry, issuer and audience.
      // The second argument (true) also asks Firebase Admin to check revocation.
      const decodedToken = await verifyIdToken(match[1], true);

      // Attach identity only after verification succeeds. Downstream middleware
      // uses this trusted object; it must never use a role sent by the browser.
      req.user = {
        uid: decodedToken.uid,
        email: decodedToken.email ?? null,

        // The admin flag comes from a Firebase custom claim in the verified token.
        // Strict comparison means only the boolean value true grants admin access.
        isAdmin: decodedToken.admin === true
      };

      // Authentication succeeded. Let Express continue to the next middleware.
      return next();
    } catch (error) {
      // Known token/account errors mean the caller must sign in again.
      // Do not include Firebase's raw error message in the response.
      if (INVALID_TOKEN_CODES.has(error?.code)) {
        return sendAuthError(
          res, 401, "AUTH_TOKEN_INVALID",
          "Your session is invalid or expired. Please sign in again."
        );
      }

      // An unexpected Firebase error may indicate a temporary service outage.
      // Return 503 rather than incorrectly telling a valid user their token is bad.
      // Log only the error code; never log the ID token or private provider details.
      logger.error("Firebase token verification unavailable.", {
        code: error?.code ?? "UNKNOWN"
      });

      return sendAuthError(
        res, 503, "AUTH_SERVICE_UNAVAILABLE",
        "Authentication is temporarily unavailable. Please try again."
      );
    }
  };
}
