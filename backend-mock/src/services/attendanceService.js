function getTimestampMilliseconds(value) {
  if (value instanceof Date) return value.getTime();

  if (typeof value === "number" && Number.isFinite(value)) {
    return Date.UTC(1899, 11, 30) + value * 86400000;
  }

  if (typeof value === "string" && value.trim()) return Date.parse(value);
  return Number.NaN;
}

export function buildLiveAttendance(staffRows, eventRows) {
  const latestByEmployee = new Map();

  for (const row of eventRows) {
    const employeeId = String(row.employeeId ?? "").trim();
    const event = String(row.event ?? "").trim().toUpperCase();
    const timestampMilliseconds = getTimestampMilliseconds(row.timestamp);

    if (!employeeId || (event !== "IN" && event !== "OUT") ||
        !Number.isFinite(timestampMilliseconds)) continue;

    const current = latestByEmployee.get(employeeId);
    if (!current || timestampMilliseconds >= current.timestampMilliseconds) {
      latestByEmployee.set(employeeId, { event, timestampMilliseconds });
    }
  }

  return staffRows
    .filter((staff) => staff.active === true)
    .map((staff) => {
      const latestEvent = latestByEmployee.get(String(staff.employeeId ?? "").trim());
      return {
        name: String(staff.name ?? "").trim(),
        status: latestEvent?.event ?? "OUT",
        lastClockEventTime: latestEvent
          ? new Date(latestEvent.timestampMilliseconds).toISOString()
          : null
      };
    });
}
