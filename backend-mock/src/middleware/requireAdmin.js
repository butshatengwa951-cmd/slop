export function requireAdmin(req, res, next) {
  if (!req.user) {
    return res.status(401).json({
      error: {
        code: "AUTHENTICATION_REQUIRED",
        message: "You must be authenticated."
      }
    });
  }

  if (req.user.isAdmin !== true) {
    return res.status(403).json({
      error: {
        code: "ADMIN_REQUIRED",
        message: "You do not have permission to access this resource."
      }
    });
  }

  return next();
}
