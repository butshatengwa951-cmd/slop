# Firebase + Google Sheets backend (authentication scope)

This folder is the Firebase-first version. **Only Firebase authentication, authentication error handling, and admin route protection are implemented at this stage.** Google Sheets settings and a placeholder module are included for a later integration; no spreadsheet is read yet.

## Local configuration

The example environment uses:
- `PORT=5000`
- `FRONTEND_URL=http://localhost:5173`

Copy `.env.example` to `.env` and keep the values appropriate for your local React dev server. Express CORS permits requests from the configured frontend origin and allows the Authorization header used for Firebase ID tokens.

## Setup

Requirements: Node.js 22 or later and a Firebase project with Authentication enabled.

1. Run `npm install`.
2. Copy `.env.example` to `.env`.
3. Set `FIREBASE_PROJECT_ID` and `GOOGLE_APPLICATION_CREDENTIALS`.
4. Keep the service-account JSON outside Git and never place Firebase Admin credentials in React.
5. Run `npm test`, then `npm start`.

## Authentication behaviour

Every protected request must send:

`Authorization: Bearer <Firebase ID token>`

The backend verifies the Firebase ID token and checks revocation. A verified token must contain the custom claim `admin: true`.

- 401 `AUTH_TOKEN_REQUIRED`: no Authorization header.
- 401 `AUTH_TOKEN_INVALID_FORMAT`: header is not a Bearer token.
- 401 `AUTH_TOKEN_INVALID`: Firebase rejects the token (including expired or revoked tokens).
- 403 `ADMIN_REQUIRED`: token is valid but the user is not an administrator.
- 503 `AUTH_SERVICE_UNAVAILABLE`: Firebase verification cannot currently complete.

Error responses contain a stable code and a safe message. Firebase's raw error message is not returned to the client.

Custom claims must be assigned from a trusted administrative environment. Do not let the frontend assign its own role. After a claim changes, the client must refresh its Firebase ID token.

## Current route status

`GET /api/attendance/live` is protected by both authentication and admin middleware. After a valid admin token it returns HTTP 501 (`ATTENDANCE_NOT_IMPLEMENTED`). This is intentional: attendance retrieval is outside the current task.

## Google Sheets preparation only

`src/integrations/googleSheets.placeholder.js` contains the future integration configuration location. The `googleapis` dependency and spreadsheet environment variables are present, but there is no API client, spreadsheet read, error handling, or attendance mapping yet.

## Tests

Run `npm test`. The tests are limited to Firebase authentication error handling and admin authorisation.
