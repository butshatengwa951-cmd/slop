// FUTURE INTEGRATION ONLY.
// Google Sheets access is intentionally not implemented in this task.
// Add Google authentication/client creation and read operations here later.

export const googleSheetsConfig = Object.freeze({
  spreadsheetId: process.env.SHEETS_SPREADSHEET_ID ?? "",
  staffRange: process.env.SHEETS_STAFF_RANGE ?? "Staff!A:C",
  eventsRange: process.env.SHEETS_EVENTS_RANGE ?? "AttendanceEvents!A:C"
});

export function googleSheetsIntegrationStatus() {
  return {
    configured: Boolean(googleSheetsConfig.spreadsheetId),
    implemented: false
  };
}
