const INVALID_TOKEN_CODES = new Set([
  "auth/argument-error",
  "auth/invalid-id-token",
  "auth/id-token-expired",
  "auth/id-token-revoked",
  "auth/user-disabled",
  "auth/user-not-found"
]);

function sendAuthError(res, status, code, message) {
  return res.status(status).json({ error: { code, message } });
}

export function createAuthenticateFirebase({ verifyIdToken, logger = console }) {
  if (typeof verifyIdToken !== "function") {
    throw new TypeError("verifyIdToken must be a function.");
  }

  return async function authenticateFirebase(req, res, next) {
    const authorization = req.headers.authorization;

    if (!authorization) {
      return sendAuthError(
        res, 401, "AUTH_TOKEN_REQUIRED", "Authentication token is required."
      );
    }

    const match = /^Bearer\s+(\S+)$/i.exec(authorization);
    if (!match) {
      return sendAuthError(
        res, 401, "AUTH_TOKEN_INVALID_FORMAT", "Use the Bearer authentication scheme."
      );
    }

    try {
      const decodedToken = await verifyIdToken(match[1], true);
      req.user = {
        uid: decodedToken.uid,
        email: decodedToken.email ?? null,
        isAdmin: decodedToken.admin === true
      };
      return next();
    } catch (error) {
      if (INVALID_TOKEN_CODES.has(error?.code)) {
        return sendAuthError(
          res, 401, "AUTH_TOKEN_INVALID",
          "Your session is invalid or expired. Please sign in again."
        );
      }

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
