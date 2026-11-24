
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
require("dotenv").config();

// Initialize Express
const app = express();

// Create HTTP server
const server = http.createServer(app);

// Initialize Socket.IO
const io = new Server(server);

// Middleware
app.use(express.json());

// Basic route
app.get("/", (req, res) => {
    res.send("Secure Connect Server is Running!");
});

// Socket.IO connection
io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    socket.on("disconnect", () => {
        console.log("User disconnected:", socket.id);
    });
});

// Start server
const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
