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

test("missing authorization header returns 401", async () => {
  const middleware = createAuthenticateFirebase({
    verifyIdToken: async () => ({}), logger: { error() {} }
  });
  const result = await runMiddleware(middleware, { headers: {} });
  assert.equal(result.res.statusCode, 401);
  assert.equal(result.res.body.error.code, "AUTH_TOKEN_REQUIRED");
  assert.equal(result.nextCalled, false);
});

test("malformed bearer header returns 401", async () => {
  const middleware = createAuthenticateFirebase({
    verifyIdToken: async () => ({}), logger: { error() {} }
  });
  const result = await runMiddleware(middleware, {
    headers: { authorization: "Basic token" }
  });
  assert.equal(result.res.statusCode, 401);
  assert.equal(result.res.body.error.code, "AUTH_TOKEN_INVALID_FORMAT");
});

test("expired or revoked tokens return a safe 401", async () => {
  for (const code of ["auth/id-token-expired", "auth/id-token-revoked"]) {
    const middleware = createAuthenticateFirebase({
      verifyIdToken: async () => {
        const error = new Error("internal provider detail");
        error.code = code;
        throw error;
      },
      logger: { error() {} }
    });
    const result = await runMiddleware(middleware, {
      headers: { authorization: "Bearer invalid-token" }
    });
    assert.equal(result.res.statusCode, 401);
    assert.equal(result.res.body.error.code, "AUTH_TOKEN_INVALID");
    assert.equal(JSON.stringify(result.res.body).includes("internal provider detail"), false);
  }
});

test("Firebase verification outage returns a generic 503", async () => {
  const middleware = createAuthenticateFirebase({
    verifyIdToken: async () => {
      const error = new Error("private Firebase detail");
      error.code = "auth/internal-error";
      throw error;
    },
    logger: { error() {} }
  });
  const result = await runMiddleware(middleware, {
    headers: { authorization: "Bearer token" }
  });
  assert.equal(result.res.statusCode, 503);
  assert.equal(result.res.body.error.code, "AUTH_SERVICE_UNAVAILABLE");
  assert.equal(JSON.stringify(result.res.body).includes("private Firebase detail"), false);
});

test("valid token is verified with revocation checking and trusted claims", async () => {
  let checkedForRevocation = false;
  const middleware = createAuthenticateFirebase({
    verifyIdToken: async (token, checkRevoked) => {
      assert.equal(token, "valid-token");
      checkedForRevocation = checkRevoked;
      return { uid: "admin-123", email: "admin@example.com", admin: true };
    },
    logger: { error() {} }
  });

  const req = { headers: { authorization: "Bearer valid-token" } };
  const result = await runMiddleware(middleware, req);

  assert.equal(result.nextCalled, true);
  assert.equal(checkedForRevocation, true);
  assert.deepEqual(req.user, {
    uid: "admin-123",
    email: "admin@example.com",
    isAdmin: true
  });
});

test("non-admin user receives 403", async () => {
  const result = await runMiddleware(requireAdmin, {
    user: { uid: "staff-123", isAdmin: false }
  });
  assert.equal(result.res.statusCode, 403);
  assert.equal(result.res.body.error.code, "ADMIN_REQUIRED");
  assert.equal(result.nextCalled, false);
});

test("admin user passes admin middleware", async () => {
  const result = await runMiddleware(requireAdmin, {
    user: { uid: "admin-123", isAdmin: true }
  });
  assert.equal(result.nextCalled, true);
});

test("admin middleware rejects missing authenticated identity", async () => {
  const result = await runMiddleware(requireAdmin, {});
  assert.equal(result.res.statusCode, 401);
  assert.equal(result.res.body.error.code, "AUTHENTICATION_REQUIRED");
});
