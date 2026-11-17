// This middleware performs authorisation, not authentication.
// It must be placed AFTER authenticateFirebase in the route's middleware chain.
export function requireAdmin(req, res, next) {
  // Defensive check: if authentication was not run first, do not grant access.
  if (!req.user) {
    return res.status(401).json({
      error: {
        code: "AUTHENTICATION_REQUIRED",
        message: "You must be authenticated."
      }
    });
  }

  // A valid token only proves who the user is. It does not automatically make
  // them an administrator. The verified Firebase custom claim must be boolean true.
  if (req.user.isAdmin !== true) {
    return res.status(403).json({
      error: {
        code: "ADMIN_REQUIRED",
        message: "You do not have permission to access this resource."
      }
    });
  }

  // The request is authenticated and the verified token grants admin access.
  return next();
}
