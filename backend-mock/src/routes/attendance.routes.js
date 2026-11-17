import { Router } from "express";
import { authenticateFirebase } from "../middleware/firebaseAuthMiddleware.js";
import { requireAdmin } from "../middleware/requireAdmin.js";

const router = Router();

// Authentication and admin authorisation are active.
// Hardcoded fixtures and attendance processing are reserved for a later task.
router.get("/live", authenticateFirebase, requireAdmin, (req, res) => {
  return res.status(501).json({
    error: {
      code: "ATTENDANCE_NOT_IMPLEMENTED",
      message: "The live attendance endpoint has not been implemented yet."
    }
  });
});

export default router;
