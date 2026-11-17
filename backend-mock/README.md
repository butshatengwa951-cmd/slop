# Mock-data backend

This local-development backend uses hardcoded staff and clock events while keeping the same response shape and Firebase authentication as the Firebase + Google Sheets backend.

## Setup

Requirements: Node.js 22 or later and a Firebase project with Authentication enabled.

Run npm install, copy .env.example to .env, configure FIREBASE_PROJECT_ID and GOOGLE_APPLICATION_CREDENTIALS, then run npm test and npm start. This server defaults to port 5001 so it can run beside the Firebase + Sheets version on port 5000.

The mock server does not disable authentication. GET /api/attendance/live still requires a valid Firebase ID token and the admin: true custom claim. Assign a claim from a trusted backend terminal using:

node scripts/set-admin.js FIREBASE_UID

Refresh the user's Firebase ID token after the claim is set. Never expose service-account credentials or admin-claim assignment in React.

## Mock data and future integration

Edit src/data/mockAttendanceRepository.js to change the hardcoded data. The route imports a repository function named getLiveAttendance() and does not know where the records come from.

A Google Sheets adapter is also included at src/data/googleSheetsAttendanceRepository.js. After configuring and sharing the spreadsheet, switch the repository import in src/routes/attendance.routes.js from mockAttendanceRepository.js to googleSheetsAttendanceRepository.js. The route and authentication middleware do not need to change.

The prepared Sheets adapter expects two tabs, both with a header row:
- Staff: employeeId, name, active
- AttendanceEvents: employeeId, event, timestamp

Valid events are IN or OUT. The latest event per employee determines current status. Deactivated staff are excluded. Staff with no valid event are returned as OUT with lastClockEventTime null.

## API contract

GET /api/attendance/live requires Authorization: Bearer <Firebase ID token>.

Success, HTTP 200:
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

Authentication error responses use an error object with code and message:
- 401: missing, malformed, invalid, expired or revoked token
- 403: verified user does not have admin: true
- 503: Firebase token verification service unavailable

Run npm test for unit tests.
