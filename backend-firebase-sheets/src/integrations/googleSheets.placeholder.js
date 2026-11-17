// FUTURE INTEGRATION ONLY — this file does not connect to Google Sheets.
// We reserve a dedicated integration module so future Google API code stays
// separate from Firebase authentication and route authorisation.

export const googleSheetsConfig = Object.freeze({
  // The spreadsheet ID identifies the Google Sheets document.
  spreadsheetId: process.env.SHEETS_SPREADSHEET_ID ?? "",

  // A range identifies a tab and its columns. These are suggested defaults;
  // they can be adjusted when the actual spreadsheet structure is agreed.
  staffRange: process.env.SHEETS_STAFF_RANGE ?? "Staff!A:C",
  eventsRange: process.env.SHEETS_EVENTS_RANGE ?? "AttendanceEvents!A:C"
});

// This reports whether an ID has been entered in the environment.
// "configured" does not mean the spreadsheet has been reached or tested.
export function googleSheetsIntegrationStatus() {
  return {
    configured: Boolean(googleSheetsConfig.spreadsheetId),
    implemented: false
  };
}
