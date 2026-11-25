require("dotenv").config();

const http = require("http");
const express = require("express");
const { Server } = require("socket.io");
const { connectToDatabase } = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const noteRoutes = require("./routes/noteRoutes");
const { authenticate, authenticateSocket, requireRole } = require("./middleware/authMiddleware");
const events = require("./services/eventService");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: process.env.CLIENT_ORIGIN || "*" },
});

app.disable("x-powered-by");
app.use(express.json({ limit: "16kb" }));
app.use("/api/auth", authRoutes);
app.use("/api/notes", noteRoutes);
app.get("/api/admin", authenticate, requireRole("admin"), (req, res) =>
  res.json({ message: "Admin access granted", user: req.user }));

app.use((req, res) => res.status(404).json({ message: "Route not found" }));
app.use((err, req, res, next) => {
  if (res.headersSent) return next(err);
  if (err.type === "entity.parse.failed") return res.status(400).json({ message: "Request body must be valid JSON" });
  if (err.type === "entity.too.large") return res.status(413).json({ message: "Request body is too large" });
  console.error(err);
  res.status(500).json({ message: "Internal server error" });
});

io.use(authenticateSocket);
io.on("connection", (socket) => {
  socket.join("general");
  console.log(`${socket.user.username} connected to chat`);

  socket.on("chat:message", (payload) => {
    const content = typeof payload?.content === "string" ? payload.content.trim() : "";
    if (!content || content.length > 2000) return;

    io.to("general").emit("chat:message", {
      content,
      username: socket.user.username,
      sentAt: new Date().toISOString(),
    });
  });
});

events.on("note:created", (note) => console.log(`Note created: ${note._id}`));

const port = Number(process.env.PORT) || 5000;

async function start() {
  await connectToDatabase();
  await new Promise((resolve) => server.listen(port, resolve));
  console.log(`Server running on http://localhost:${port}`);
}

if (require.main === module) {
  start().catch((error) => {
    console.error("Unable to start server:", error.message);
    process.exitCode = 1;
  });
}

module.exports = { app, start };
