# Firebase + Google Sheets backend (authentication first)

This is the Firebase-first backend variant. The current implementation is deliberately limited to Firebase authentication, safe authentication errors, and admin authorisation. The Google Sheets configuration is a placeholder only; the backend does not contact Google Sheets yet.

## Configure and run

The example environment file uses:

```env
PORT=5000
FRONTEND_URL=http://localhost:5173
```

1. Install dependencies with `npm install`.
2. Copy `.env.example` to `.env`.
3. Set `FIREBASE_PROJECT_ID` to your Firebase project ID.
4. Set `GOOGLE_APPLICATION_CREDENTIALS` to the absolute path of your service-account JSON file. Keep that file outside the repository.
5. Run `npm test`.
6. Run `npm start`.

Use Node.js 22 or later. Start only one backend variant at a time because both use port 5000.

## How the code works

### Firebase setup — `src/config/firebaseAdmin.js`

Initialises Firebase Admin once and exports one reusable Auth client. `applicationDefault()` reads server credentials from the environment/host. The Admin SDK is only used on the backend because its credentials must never be exposed to React.

### Token verification — `src/middleware/authenticateFirebase.js`

Contains the reusable authentication middleware factory. It checks for a Bearer token, calls the supplied verifier with revocation checking enabled, and attaches verified identity fields to `req.user`. The verifier is injected so unit tests can substitute a fake verifier and do not need live Firebase credentials.

Known token/user failures return 401. Unexpected verification failures return a generic 503. Only the provider error code is written to server logs; the raw error and token are not sent to the frontend.

### Firebase adapter — `src/middleware/firebaseAuthMiddleware.js`

Connects the reusable middleware to the real Firebase Admin `verifyIdToken()` method. This small adapter keeps Firebase-specific setup separate from the testable middleware logic.

### Admin authorisation — `src/middleware/requireAdmin.js`

Runs after token verification. It checks that `req.user.isAdmin` is exactly `true`, based on the verified Firebase custom claim. A signed-in non-admin receives 403; a request with no verified user receives 401.

### Protected route — `src/routes/attendance.routes.js`

Shows the intended middleware order: authenticate first, check the admin role second, and only then execute the route. For now it returns 501 after those checks pass. This prevents us from accidentally implying that attendance retrieval has already been implemented.

### Express application — `src/app.js`

Creates the Express app, configures CORS for the single frontend origin in `FRONTEND_URL`, permits the Authorization header, parses small JSON request bodies, mounts the attendance router, and returns a consistent 404 for unknown routes.

### Server entry point — `src/server.js`

Loads environment variables before importing/starting the app and listens on `PORT`, defaulting to 5000.

### Google Sheets placeholder — `src/integrations/googleSheets.placeholder.js`

Stores the future spreadsheet ID and range settings. It does not create a Google API client or read spreadsheet values. The `implemented: false` flag makes this limitation explicit.

### Authentication tests — `tests/authentication.test.js`

Uses Node's built-in test runner and a fake response/verifier. The tests cover missing/malformed tokens, expired/revoked tokens, Firebase outages, valid token claims, and admin/non-admin access. They test our middleware handling without calling a real Firebase project.

## Admin custom claim

A Firebase user must have the trusted custom claim `admin: true`. Assign this claim using a trusted administrative script/environment (not from React or an untrusted user request). After a claim is changed, the user's ID token must be refreshed before the new claim will appear.

## Future work boundary

Google Sheets API calls, spreadsheet schema mapping, attendance processing and the live response shape are deliberately deferred. The current protected route returns `501 ATTENDANCE_NOT_IMPLEMENTED` for an authenticated admin.
