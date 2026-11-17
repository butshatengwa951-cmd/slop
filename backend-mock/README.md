# Mock-data backend (authentication scope)

This folder is the hardcoded-data version for local development. **Only Firebase authentication, authentication error handling, and admin route protection are implemented at this stage.** The sample staff and clock-event records are fixtures only; they are not processed or returned by the API yet.

## Local configuration

The example environment uses:
- `PORT=5000`
- `FRONTEND_URL=http://localhost:5173`

Copy `.env.example` to `.env`. Express CORS permits requests from the configured frontend origin and allows the Authorization header used for Firebase ID tokens.

## Setup

Requirements: Node.js 22 or later and a Firebase project with Authentication enabled.

1. Run `npm install`.
2. Configure `FIREBASE_PROJECT_ID` and `GOOGLE_APPLICATION_CREDENTIALS` in `.env`.
3. Keep the service-account JSON outside Git and never place Firebase Admin credentials in React.
4. Run `npm test`, then `npm start`.

Both backend variants use port 5000 because they are alternatives. Run only one at a time.

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

`GET /api/attendance/live` is protected by both authentication and admin middleware. After a valid admin token it returns HTTP 501 (`ATTENDANCE_NOT_IMPLEMENTED`). This is intentional: the endpoint and attendance processing are for a later task.

## Hardcoded sample records

The unconnected fixtures are in `src/data/mockAttendance.js`. They provide a place to prepare sample staff and clock-event records without implementing latest-event calculations or a live response yet.

## Google Sheets preparation only

`src/integrations/googleSheets.placeholder.js` is the reserved location for the future integration. The `googleapis` dependency and spreadsheet environment variables are present, but there is no API client, spreadsheet read, or attendance mapping yet.

## Tests

Run `npm test`. The tests are limited to Firebase authentication error handling and admin authorisation.
