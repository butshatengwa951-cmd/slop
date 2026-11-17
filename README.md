# Digital Attendance Tracking System — Backend Variants

This repository contains two alternative Node.js/Express backend starting points. Both currently focus on **Firebase authentication, authentication error handling, and admin-only route protection**.

## Choose a backend

- `backend-firebase-sheets/`: Firebase authentication with clearly marked configuration placeholders for a future Google Sheets connection.
- `backend-mock/`: the same Firebase authentication with sample staff/clock-event fixtures ready for later development. The fixtures are not used by the endpoint yet.

Run only one backend at a time: both are configured to use port 5000.

## Authentication request flow

1. React signs in with Firebase Authentication and obtains a Firebase ID token.
2. React sends the token as `Authorization: Bearer <token>`.
3. `authenticateFirebase` checks the header format and asks Firebase Admin to verify the token, including a revocation check.
4. The middleware attaches only verified identity details to `req.user`.
5. `requireAdmin` checks for the verified Firebase custom claim `admin: true`.
6. Only then does Express enter the protected route.

## Error responses

| HTTP | Error code | Meaning |
|---|---|---|
| 401 | `AUTH_TOKEN_REQUIRED` | No token was provided |
| 401 | `AUTH_TOKEN_INVALID_FORMAT` | Authorization header is not a Bearer token |
| 401 | `AUTH_TOKEN_INVALID` | Token is invalid, expired, revoked, or belongs to a disabled/missing user |
| 401 | `AUTHENTICATION_REQUIRED` | Admin middleware was reached without an authenticated identity |
| 403 | `ADMIN_REQUIRED` | User is authenticated but is not an admin |
| 503 | `AUTH_SERVICE_UNAVAILABLE` | Firebase verification could not be completed |

The response contains a stable code and a safe message. Raw Firebase errors and credential information are not returned to the browser.

## Current scope (important)

Implemented: Firebase Admin initialisation, ID-token verification, authentication error responses, verified-user context, admin-claim authorisation, CORS configuration, and authentication unit tests.

Not implemented yet: Google Sheets reads, attendance event calculations, active-staff filtering, live status results, and the total-IN count. The protected `GET /api/attendance/live` route returns HTTP 501 after an admin passes authentication. This is intentional so later attendance work remains separate.

See each folder's README for setup and a file-by-file explanation. Never commit a real `.env`, Firebase service-account JSON, or real staff data.
