import { Router } from "express";
import { authenticateFirebase } from "../middleware/firebaseAuthMiddleware.js";
import { requireAdmin } from "../middleware/requireAdmin.js";

// This router owns attendance API paths. app.js mounts it under
// "/api/attendance", making the full endpoint GET /api/attendance/live.
const router = Router();

// Middleware is evaluated left-to-right. First the Firebase token is verified;
// next the verified user must have admin: true; only then does the handler run.
router.get("/live", authenticateFirebase, requireAdmin, (req, res) => {
  // Return 501 after successful auth because attendance logic is not part of
  // the current task. The mock fixtures are intentionally not read here yet.
  return res.status(501).json({
    error: {
      code: "ATTENDANCE_NOT_IMPLEMENTED",
      message: "The live attendance endpoint has not been implemented yet."
    }
  });
});

export default router;
