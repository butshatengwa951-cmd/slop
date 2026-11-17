import { Router } from "express";
import { authenticateFirebase } from "../middleware/authenticateFirebase.js";
import { requireAdmin } from "../middleware/requireAdmin.js";
import { getLiveAttendance } from "../data/googleSheetsAttendanceRepository.js";

const router = Router();

router.get("/live", authenticateFirebase, requireAdmin, async (req, res) => {
  try {
    const staff = await getLiveAttendance();
    const totalIn = staff.filter((employee) => employee.status === "IN").length;
    return res.status(200).json({ staff, totalIn });
  } catch (error) {
    console.error("Attendance data source request failed.", {
      code: error?.code ?? "UNKNOWN",
      status: Number.isInteger(error?.status) ? error.status : undefined
    });

    return res.status(503).json({
      error: {
        code: "ATTENDANCE_SOURCE_UNAVAILABLE",
        message: "Attendance data is temporarily unavailable. Please try again."
      }
    });
  }
});

export default router;
