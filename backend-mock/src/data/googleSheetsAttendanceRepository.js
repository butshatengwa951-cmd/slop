import { google } from "googleapis";
import { buildLiveAttendance } from "../services/attendanceService.js";

const googleAuth = new google.auth.GoogleAuth({
  scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"]
});
const sheets = google.sheets({ version: "v4", auth: googleAuth });

function isActive(value) {
  return ["true", "1", "yes", "active"].includes(
    String(value ?? "").trim().toLowerCase()
  );
}

function createSourceError(status) {
  const error = new Error("Attendance data source unavailable.");
  error.code = "ATTENDANCE_SOURCE_UNAVAILABLE";
  if (Number.isInteger(status)) error.status = status;
  return error;
}

// Prepared adapter; the mock route does not import this file by default.
export async function getLiveAttendance() {
  const spreadsheetId = process.env.SHEETS_SPREADSHEET_ID;
  if (!spreadsheetId) throw createSourceError();

  const staffRange = process.env.SHEETS_STAFF_RANGE || "Staff!A:C";
  const eventsRange = process.env.SHEETS_EVENTS_RANGE || "AttendanceEvents!A:C";
  const configuredTimeout = Number(process.env.SHEETS_REQUEST_TIMEOUT_MS || 1500);
  const timeout = Number.isFinite(configuredTimeout)
    ? Math.min(Math.max(configuredTimeout, 250), 1800)
    : 1500;

  try {
    const response = await sheets.spreadsheets.values.batchGet(
      {
        spreadsheetId,
        ranges: [staffRange, eventsRange],
        valueRenderOption: "UNFORMATTED_VALUE"
      },
      { timeout }
    );

    const ranges = response.data.valueRanges ?? [];
    const staffValues = ranges[0]?.values ?? [];
    const eventValues = ranges[1]?.values ?? [];

    const staffRows = staffValues.slice(1).map((row) => ({
      employeeId: row[0],
      name: row[1],
      active: isActive(row[2])
    }));
    const eventRows = eventValues.slice(1).map((row) => ({
      employeeId: row[0],
      event: row[1],
      timestamp: row[2]
    }));

    return buildLiveAttendance(staffRows, eventRows);
  } catch (error) {
    const status = Number.isInteger(error?.response?.status)
      ? error.response.status
      : undefined;
    throw createSourceError(status);
  }
}
