# Digital Attendance Tracking System — Backend Variants

This repository currently focuses on **Firebase authentication and authentication error handling only**.

There are two backend starting points:

- `backend-firebase-sheets/`: prepared for Firebase Admin authentication and a future Google Sheets connection.
- `backend-mock/`: the same authentication and protected route, with sample hardcoded staff/clock-event fixtures for later development.

## Current scope

Implemented in both folders:
- Firebase ID-token verification, including revocation checks.
- Safe responses for missing, malformed, invalid, expired, and revoked tokens.
- Generic handling for Firebase verification outages.
- Admin-only route protection using the verified Firebase custom claim `admin: true`.
- Unit tests for authentication and admin middleware.

Intentionally not implemented yet:
- Reading data from Google Sheets.
- Attendance-event processing or latest-event calculations.
- Live staff status response and IN count.
- Any attendance business logic.

The `GET /api/attendance/live` route is a protected placeholder and returns HTTP 501 after authentication succeeds. This is deliberate.

See each backend folder's README for setup instructions. Never commit Firebase service-account credentials, environment files, or real staff records.
