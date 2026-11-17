# Firebase + Google Sheets backend

Integration-ready Express backend for the attendance dashboard.

## Requirements and setup

- Node.js 22 or later
- Firebase project with Authentication enabled
- Google Cloud service identity with permission to verify Firebase ID tokens and read the spreadsheet
- Google Sheets API enabled

Run npm install, copy .env.example to .env, set FIREBASE_PROJECT_ID, GOOGLE_APPLICATION_CREDENTIALS and SHEETS_SPREADSHEET_ID, then run npm test and npm start. Share the spreadsheet with the service account as Viewer. Keep the service-account JSON outside source control; local environment files and common service-account filenames are ignored by Git.

## Google Sheets structure

Both tabs require a header row.

Staff tab, range Staff!A:C:
- A: employeeId (stable unique identifier)
- B: name
- C: active (TRUE/FALSE)

AttendanceEvents tab, range AttendanceEvents!A:C:
- A: employeeId (matches Staff.employeeId)
- B: event (exactly IN or OUT)
- C: timestamp (Google Sheets date/time cell or ISO-8601 string)

The backend reads both ranges in one batch request. The latest valid event per employee determines status. Inactive staff are excluded. Staff with no valid event are returned as OUT with lastClockEventTime null. Timestamps are returned as ISO-8601 strings. Configure different tab names/ranges using SHEETS_STAFF_RANGE and SHEETS_EVENTS_RANGE.

## Authentication

Every GET /api/attendance/live request must send Authorization: Bearer <Firebase ID token>. The server verifies the token and its revocation state. The verified Firebase custom claim admin: true is required. Missing, malformed, expired, invalid or revoked tokens receive 401. A valid non-admin receives 403. Firebase verification outages return a generic 503 without leaking internal details.

Assign an admin claim from a trusted backend environment after configuring credentials:

node scripts/set-admin.js FIREBASE_UID

Existing custom claims are preserved. After changing a claim, the client must refresh its ID token. Never assign admin claims from React or expose service credentials in the browser.

## API contract

GET /api/attendance/live

HTTP 200:
{
  "staff": [
    {
      "name": "Alex Morgan",
      "status": "IN",
      "lastClockEventTime": "2026-11-17T05:45:00.000Z"
    }
  ],
  "totalIn": 1
}

Error bodies use { "error": { "code": "...", "message": "..." } }. Expected codes include AUTH_TOKEN_REQUIRED, AUTH_TOKEN_INVALID_FORMAT, AUTH_TOKEN_INVALID, ADMIN_REQUIRED, AUTH_SERVICE_UNAVAILABLE and ATTENDANCE_SOURCE_UNAVAILABLE.

## Performance

Both sheet tabs are requested in one batch and the Google API request timeout defaults to 1500 ms. This is a design target, not a measured guarantee; measure the two-second requirement using the deployed spreadsheet, hosting region and concurrent-admin load.

## React

Get the current Firebase user's ID token using getIdToken(), then include it in the Authorization header:

fetch("http://localhost:5000/api/attendance/live", {
  headers: { Authorization: "Bearer " + token }
});

Run npm test to execute the unit tests.
