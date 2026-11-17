import { buildLiveAttendance } from "../services/attendanceService.js";

// Edit these fixtures when preparing dashboard UI or API integration tests.
const staff = [
  { employeeId: "staff-001", name: "Alex Morgan", active: true },
  { employeeId: "staff-002", name: "Jamie Smith", active: true },
  { employeeId: "staff-003", name: "Taylor Adams", active: false },
  { employeeId: "staff-004", name: "Jordan Lee", active: true }
];

const events = [
  { employeeId: "staff-001", event: "IN", timestamp: "2026-11-17T06:45:00+02:00" },
  { employeeId: "staff-001", event: "OUT", timestamp: "2026-11-17T07:15:00+02:00" },
  { employeeId: "staff-001", event: "IN", timestamp: "2026-11-17T07:45:00+02:00" },
  { employeeId: "staff-002", event: "IN", timestamp: "2026-11-17T08:10:00+02:00" },
  { employeeId: "staff-003", event: "IN", timestamp: "2026-11-17T07:30:00+02:00" },
  { employeeId: "staff-004", event: "OUT", timestamp: "2026-11-17T07:55:00+02:00" }
];

export async function getLiveAttendance() {
  return buildLiveAttendance(staff, events);
}
