const { test, before, after } = require("node:test");
const assert = require("node:assert/strict");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Note = require("../models/Note");
const { signup, login } = require("../controllers/authController");
const { create, list, update, remove } = require("../controllers/noteController");
const { requireRole } = require("../middleware/authMiddleware");
const { app } = require("../server");

let server;
let baseUrl;

before(async () => {
  server = app.listen(0);
  await new Promise((resolve) => server.once("listening", resolve));
  baseUrl = `http://127.0.0.1:${server.address().port}`;
});

after(async () => {
  await new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
});

function response() {
  return {
    statusCode: 200,
    body: undefined,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(body) {
      this.body = body;
      return this;
    },
  };
}

test("HTTP signup validates input and protected routes require a token", async () => {
  const signupResponse = await fetch(`${baseUrl}/api/auth/signup`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ username: "victor", email: "victor@example.com", password: "12345" }),
  });
  assert.equal(signupResponse.status, 400);

  const notesResponse = await fetch(`${baseUrl}/api/notes`);
  assert.equal(notesResponse.status, 401);

  const adminResponse = await fetch(`${baseUrl}/api/admin`);
  assert.equal(adminResponse.status, 401);
});

test("signup accepts the assignment example and returns public account details", async (t) => {
  t.mock.method(bcrypt, "hash", async () => "hashed-password");
  t.mock.method(User, "create", async (user) => ({ ...user, _id: "user-1" }));
  const res = response();

  await signup({ body: { username: "victor", email: "victor@example.com", password: "123456" } }, res);

  assert.equal(res.statusCode, 201);
  assert.deepEqual(res.body, {
    message: "User registered",
    id: "user-1",
    username: "victor",
    email: "victor@example.com",
  });
});

test("login returns a signed JWT for valid credentials", async (t) => {
  const oldSecret = process.env.JWT_SECRET;
  process.env.JWT_SECRET = "test-secret-that-is-at-least-32-characters-long";
  t.after(() => {
    if (oldSecret === undefined) delete process.env.JWT_SECRET;
    else process.env.JWT_SECRET = oldSecret;
  });

  const user = { _id: "user-1", email: "victor@example.com", username: "victor", passwordHash: "hash" };
  t.mock.method(User, "findByEmail", async () => user);
  t.mock.method(bcrypt, "compare", async () => true);
  const res = response();

  await login({ body: { email: user.email, password: "123456" } }, res);

  assert.equal(res.body.message, "Login successful");
  assert.equal(jwt.verify(res.body.token, process.env.JWT_SECRET).sub, "user-1");
});

test("note handlers provide owner-scoped create, list, update, and delete", async (t) => {
  const savedNote = { _id: "note-1", ownerId: "user-1", title: "First", content: "Text" };
  const createNote = t.mock.method(Note, "create", async () => savedNote);
  const listNotes = t.mock.method(Note, "list", async () => [savedNote]);
  const updateNote = t.mock.method(Note, "update", async () => savedNote);
  const removeNote = t.mock.method(Note, "remove", async () => savedNote);
  const req = { user: { id: "user-1" }, body: { title: " First ", content: " Text " }, params: { id: "note-1" } };
  let res = response();

  await create(req, res);
  assert.equal(res.statusCode, 201);
  assert.deepEqual(createNote.mock.calls[0].arguments, ["user-1", { title: "First", content: "Text" }]);

  res = response();
  await list(req, res);
  assert.deepEqual(listNotes.mock.calls[0].arguments, ["user-1"]);
  assert.deepEqual(res.body, [savedNote]);

  res = response();
  await update(req, res);
  assert.deepEqual(updateNote.mock.calls[0].arguments, ["note-1", "user-1", { title: "First", content: "Text" }]);

  res = response();
  await remove(req, res);
  assert.deepEqual(removeNote.mock.calls[0].arguments, ["note-1", "user-1"]);
  assert.deepEqual(res.body, { message: "Note deleted" });
});

test("role middleware allows admins and rejects regular users", () => {
  const middleware = requireRole("admin");
  let nextCalled = false;
  middleware({ user: { role: "admin" } }, response(), () => { nextCalled = true; });
  assert.equal(nextCalled, true);

  const res = response();
  middleware({ user: { role: "user" } }, res, () => {});
  assert.equal(res.statusCode, 403);
});
