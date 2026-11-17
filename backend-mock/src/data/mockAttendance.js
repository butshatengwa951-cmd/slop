// SAMPLE FIXTURES ONLY — these are fictional examples, not real employee records.
// This file is deliberately not imported by the live route yet. It is a place
// to keep test/demo data ready for a later attendance-processing task.

// Object.freeze() prevents accidental edits to the fixture arrays at runtime.
// Each staff member has a stable employeeId so future events can refer to them.
export const mockStaff = Object.freeze([
  { employeeId: "staff-001", name: "Alex Morgan", active: true },
  { employeeId: "staff-002", name: "Jamie Smith", active: true },
  { employeeId: "staff-003", name: "Taylor Adams", active: false },
  { employeeId: "staff-004", name: "Jordan Lee", active: true }
]);

// Clock events represent the raw history a real clock-in/out feature would store.
// An employee can have several events. No latest-event selection or IN/OUT status
// calculation is performed here; that belongs to a later service/repository task.
export const mockClockEvents = Object.freeze([
  { employeeId: "staff-001", event: "IN", timestamp: "2026-11-17T06:45:00+02:00" },
  { employeeId: "staff-001", event: "OUT", timestamp: "2026-11-17T07:15:00+02:00" },
  { employeeId: "staff-002", event: "IN", timestamp: "2026-11-17T08:10:00+02:00" },
  { employeeId: "staff-003", event: "IN", timestamp: "2026-11-17T07:30:00+02:00" }
]);
