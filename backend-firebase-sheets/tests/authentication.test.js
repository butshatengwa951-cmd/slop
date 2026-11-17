import test from "node:test";
import assert from "node:assert/strict";
import { createAuthenticateFirebase } from "../src/middleware/authenticateFirebase.js";
import { requireAdmin } from "../src/middleware/requireAdmin.js";

function makeResponse() {
  return {
    statusCode: 200,
    body: undefined,
    status(code) { this.statusCode = code; return this; },
    json(body) { this.body = body; return this; }
  };
}

async function runMiddleware(middleware, req) {
  const res = makeResponse();
  let nextCalled = false;
  await middleware(req, res, () => { nextCalled = true; });
  return { res, nextCalled };
}

test("missing token returns 401", async () => {
  const middleware = createAuthenticateFirebase({
    verifyIdToken: async () => ({}), logger: { error() {} }
  });
  const result = await runMiddleware(middleware, { headers: {} });
  assert.equal(result.res.statusCode, 401);
  assert.equal(result.res.body.error.code, "AUTH_TOKEN_REQUIRED");
});

test("malformed bearer header returns 401", async () => {
  const middleware = createAuthenticateFirebase({
    verifyIdToken: async () => ({}), logger: { error() {} }
  });
  const result = await runMiddleware(middleware, {
    headers: { authorization: "Basic abc123" }
  });
  assert.equal(result.res.statusCode, 401);
  assert.equal(result.res.body.error.code, "AUTH_TOKEN_INVALID_FORMAT");
});

test("expired token returns a generic 401 response", async () => {
  const middleware = createAuthenticateFirebase({
    verifyIdToken: async () => {
      const error = new Error("provider detail must not be exposed");
      error.code = "auth/id-token-expired";
      throw error;
    },
    logger: { error() {} }
  });
  const result = await runMiddleware(middleware, {
    headers: { authorization: "Bearer expired-token" }
  });
  assert.equal(result.res.statusCode, 401);
  assert.equal(result.res.body.error.code, "AUTH_TOKEN_INVALID");
  assert.equal(JSON.stringify(result.res.body).includes("provider detail"), false);
});

test("Firebase verification outage returns a safe 503", async () => {
  const middleware = createAuthenticateFirebase({
    verifyIdToken: async () => {
      const error = new Error("private upstream detail");
      error.code = "auth/internal-error";
      throw error;
    },
    logger: { error() {} }
  });
  const result = await runMiddleware(middleware, {
    headers: { authorization: "Bearer some-token" }
  });
  assert.equal(result.res.statusCode, 503);
  assert.equal(result.res.body.error.code, "AUTH_SERVICE_UNAVAILABLE");
  assert.equal(JSON.stringify(result.res.body).includes("private upstream detail"), false);
});

test("valid token is checked for revocation and adds trusted identity", async () => {
  let checkedForRevocation = false;
  const middleware = createAuthenticateFirebase({
    verifyIdToken: async (token, checkRevoked) => {
      assert.equal(token, "valid-token");
      checkedForRevocation = checkRevoked;
      return { uid: "firebase-user-123", email: "admin@example.com", admin: true };
    },
    logger: { error() {} }
  });
  const req = { headers: { authorization: "Bearer valid-token" } };
  const result = await runMiddleware(middleware, req);
  assert.equal(result.nextCalled, true);
  assert.equal(checkedForRevocation, true);
  assert.deepEqual(req.user, {
    uid: "firebase-user-123",
    email: "admin@example.com",
    isAdmin: true
  });
});

test("non-admin user receives 403", async () => {
  const result = await runMiddleware(requireAdmin, {
    user: { uid: "staff-user", isAdmin: false }
  });
  assert.equal(result.res.statusCode, 403);
  assert.equal(result.res.body.error.code, "ADMIN_REQUIRED");
  assert.equal(result.nextCalled, false);
});

test("admin user passes the role middleware", async () => {
  const result = await runMiddleware(requireAdmin, {
    user: { uid: "admin-user", isAdmin: true }
  });
  assert.equal(result.nextCalled, true);
});
