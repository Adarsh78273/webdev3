const { EventEmitter } = require("node:events");

// Domain events keep note operations separate from their real-time listeners.
module.exports = new EventEmitter();
