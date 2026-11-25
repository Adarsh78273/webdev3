const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const invalid = (res, message, status = 400) => res.status(status).json({ message });

function publicUser(user) {
  return { id: user._id.toString(), username: user.username, email: user.email };
}

function createToken(user) {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.length < 32) throw new Error("JWT_SECRET must be set to at least 32 characters");
  return jwt.sign({ sub: user._id.toString() }, secret, { algorithm: "HS256", expiresIn: process.env.JWT_EXPIRES_IN || "1h" });
}

async function signup(req, res) {
  const username = typeof req.body?.username === "string" ? req.body.username.trim() : "";
  const email = typeof req.body?.email === "string" ? req.body.email.trim().toLowerCase() : "";
  const password = req.body?.password;
  if (username.length < 2 || username.length > 40) return invalid(res, "Username must be 2-40 characters");
  if (!emailPattern.test(email) || email.length > 254) return invalid(res, "A valid email address is required");
  if (typeof password !== "string" || password.length < 6 || Buffer.byteLength(password) > 72)
    return invalid(res, "Password must be 6-72 UTF-8 bytes");

  try {
    const user = await User.create({ username, email, passwordHash: await bcrypt.hash(password, 12) });
    res.status(201).json({ message: "User registered", ...publicUser(user) });
  } catch (error) {
    if (error.code !== 11000) throw error;
    invalid(res, "An account with this email already exists", 409);
  }
}

async function login(req, res) {
  const email = typeof req.body?.email === "string" ? req.body.email.trim().toLowerCase() : "";
  const { password } = req.body || {};
  if (!email || typeof password !== "string") return invalid(res, "Email and password are required");
  const user = await User.findByEmail(email);
  if (!user || !(await bcrypt.compare(password, user.passwordHash)))
    return invalid(res, "Invalid email or password", 401);
  res.json({ message: "Login successful", token: createToken(user) });
}

module.exports = { signup, login };
