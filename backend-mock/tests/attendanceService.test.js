import test from "node:test";
import assert from "node:assert/strict";
import { buildLiveAttendance } from "../src/services/attendanceService.js";

test("selects latest event, excludes inactive staff and treats no event as OUT", () => {
  const staff = [
    { employeeId: "1", name: "Alex Morgan", active: true },
    { employeeId: "2", name: "Jamie Smith", active: true },
    { employeeId: "3", name: "Taylor Adams", active: false },
    { employeeId: "4", name: "Jordan Lee", active: true }
  ];
  const events = [
    { employeeId: "1", event: "IN", timestamp: "2026-11-17T07:00:00+02:00" },
    { employeeId: "1", event: "OUT", timestamp: "2026-11-17T08:00:00+02:00" },
    { employeeId: "1", event: "IN", timestamp: "2026-11-17T09:00:00+02:00" },
    { employeeId: "2", event: "IN", timestamp: "2026-11-17T08:30:00+02:00" },
    { employeeId: "3", event: "IN", timestamp: "2026-11-17T07:30:00+02:00" }
  ];

  const result = buildLiveAttendance(staff, events);
  assert.equal(result.length, 3);
  assert.deepEqual(result[0], {
    name: "Alex Morgan",
    status: "IN",
    lastClockEventTime: "2026-11-17T07:00:00.000Z"
  });
  assert.equal(result[1].status, "IN");
  assert.equal(result[2].status, "OUT");
  assert.equal(result[2].lastClockEventTime, null);
  assert.equal(result.filter((person) => person.status === "IN").length, 2);
});
