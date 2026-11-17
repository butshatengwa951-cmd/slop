# Mock-data backend (authentication first)

This version is intended for early local development. It shares the same Firebase authentication and admin protection as the Firebase + Sheets version. Sample staff and clock-event records are stored as fixtures, but they are not read or processed by the live endpoint yet.

## Configure and run

The example environment file uses:

```env
PORT=5000
FRONTEND_URL=http://localhost:5173
```

1. Install dependencies with `npm install`.
2. Copy `.env.example` to `.env`.
3. Set `FIREBASE_PROJECT_ID` and `GOOGLE_APPLICATION_CREDENTIALS`.
4. Keep Firebase service-account credentials outside this repository.
5. Run `npm test`.
6. Run `npm start`.

Use Node.js 22 or later. Start only one backend variant at a time because both use port 5000.

## How the code works

The authentication files are intentionally equivalent to the Firebase + Sheets backend:

- `src/config/firebaseAdmin.js` initialises Firebase Admin once and exports a reusable Auth client.
- `src/middleware/authenticateFirebase.js` validates the Bearer header, verifies the token (including revocation), adds verified identity information to `req.user`, and maps failures to safe 401/503 responses.
- `src/middleware/firebaseAuthMiddleware.js` connects the reusable middleware to the real Firebase Admin verifier.
- `src/middleware/requireAdmin.js` allows only a verified token carrying the custom claim `admin: true`.

The Express setup in `src/app.js` permits only the configured `FRONTEND_URL` origin and the Authorization header. `src/server.js` loads `.env` and listens on port 5000.

### Hardcoded fixtures — `src/data/mockAttendance.js`

Contains example staff records and clock events. It is intentionally not imported by the attendance route yet. Later, this data can be connected to a repository/service and used to implement attendance business logic.

### Google Sheets placeholder — `src/integrations/googleSheets.placeholder.js`

Provides a named location for spreadsheet configuration. It does not connect to Google or read data. This lets us add the real integration in a later task without mixing it into authentication.

### Protected route — `src/routes/attendance.routes.js`

Runs the Firebase authentication middleware and admin check before returning `501 ATTENDANCE_NOT_IMPLEMENTED`. The endpoint is a placeholder; no sample data is returned yet.

### Authentication tests — `tests/authentication.test.js`

Uses Node's built-in test runner and injected fake verification to test authentication failures and admin access without requiring Firebase credentials or network calls.

## Why both backends use the same port

These are alternatives, not two services meant to run simultaneously. Both use `PORT=5000`, allowing the React frontend to use one API base URL whichever backend variant is active. Stop one server before starting the other.

## Future work boundary

The hardcoded fixture data and Google Sheets settings are preparation only. Latest-event calculation, staff filtering, live attendance response, total-IN calculation and real Sheets API calls are not implemented yet.
