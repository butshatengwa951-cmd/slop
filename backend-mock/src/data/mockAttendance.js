// SAMPLE FIXTURES ONLY.
// These records are intentionally not consumed by the live route yet.
// Attendance processing will be implemented in a later task.

export const mockStaff = Object.freeze([
  { employeeId: "staff-001", name: "Alex Morgan", active: true },
  { employeeId: "staff-002", name: "Jamie Smith", active: true },
  { employeeId: "staff-003", name: "Taylor Adams", active: false },
  { employeeId: "staff-004", name: "Jordan Lee", active: true }
]);

export const mockClockEvents = Object.freeze([
  { employeeId: "staff-001", event: "IN", timestamp: "2026-11-17T06:45:00+02:00" },
  { employeeId: "staff-001", event: "OUT", timestamp: "2026-11-17T07:15:00+02:00" },
  { employeeId: "staff-002", event: "IN", timestamp: "2026-11-17T08:10:00+02:00" },
  { employeeId: "staff-003", event: "IN", timestamp: "2026-11-17T07:30:00+02:00" }
]);
