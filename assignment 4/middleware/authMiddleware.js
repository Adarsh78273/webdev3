const jwt = require("jsonwebtoken");
const User = require("../models/User");

function getJwtSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.length < 32) throw new Error("JWT_SECRET must be set to at least 32 characters");
  return secret;
}

async function resolveToken(token) {
  const claims = jwt.verify(token, getJwtSecret(), { algorithms: ["HS256"] });
  const user = await User.findById(claims.sub);
  if (!user) return null;
  return { id: user._id.toString(), username: user.username, email: user.email, role: user.role };
}

async function authenticate(req, res, next) {
  const header = req.get("authorization") || "";
  const match = /^Bearer\s+(.+)$/i.exec(header);
  if (!match) return res.status(401).json({ message: "A bearer token is required" });
  try {
    req.user = await resolveToken(match[1]);
    if (!req.user) return res.status(401).json({ message: "Invalid or expired token" });
    next();
  } catch (error) {
    if (error.name === "JsonWebTokenError" || error.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Invalid or expired token" });
    }
    next(error);
  }
}

function requireRole(role) {
  return (req, res, next) => req.user?.role === role
    ? next()
    : res.status(403).json({ message: "Insufficient permissions" });
}

async function authenticateSocket(socket, next) {
  const token = socket.handshake.auth?.token;
  if (typeof token !== "string" || !token) return next(new Error("Authentication required"));
  try {
    socket.user = await resolveToken(token);
    if (!socket.user) return next(new Error("Invalid or expired token"));
    next();
  } catch (error) {
    next(new Error(error.name === "JsonWebTokenError" || error.name === "TokenExpiredError" ? "Invalid or expired token" : "Authentication failed"));
  }
}

module.exports = { authenticate, authenticateSocket, requireRole };
