import { Router } from "express";
import { authenticateFirebase } from "../middleware/firebaseAuthMiddleware.js";
import { requireAdmin } from "../middleware/requireAdmin.js";

// A Router groups related endpoints. app.js mounts this router under
// "/api/attendance", so the full path below becomes GET /api/attendance/live.
const router = Router();

// Express executes route middleware from left to right:
// 1. authenticateFirebase verifies who sent the request.
// 2. requireAdmin checks if that verified user has the admin claim.
// 3. The handler runs only if both middleware functions call next().
router.get("/live", authenticateFirebase, requireAdmin, (req, res) => {
  // HTTP 501 means the route exists but its feature has not been implemented.
  // This is intentional: this task is limited to authentication and its errors.
  // We do not read mock data or Google Sheets and do not calculate attendance yet.
  return res.status(501).json({
    error: {
      code: "ATTENDANCE_NOT_IMPLEMENTED",
      message: "The live attendance endpoint has not been implemented yet."
    }
  });
});

export default router;
