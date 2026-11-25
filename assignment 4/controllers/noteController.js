const Note = require("../models/Note");
const events = require("../services/eventService");

function validateNoteBody(body, partial = false) {
  if (!body || typeof body !== "object" || Array.isArray(body)) return { error: "A JSON object is required" };
  const result = {};
  for (const field of ["title", "content"]) {
    if (!(field in body)) continue;
    if (typeof body[field] !== "string") return { error: `${field} must be text` };
    const value = body[field].trim();
    const limit = field === "title" ? 120 : 10000;
    if ((!value && field === "title") || value.length > limit) return { error: `${field} must be ${field === "title" ? "1-120" : "0-10000"} characters` };
    result[field] = value;
  }
  if (!partial && (!result.title || !("content" in result))) return { error: "Title and content are required" };
  if (partial && Object.keys(result).length === 0) return { error: "Provide a title or content to update" };
  return { value: result };
}

async function create(req, res) {
  const parsed = validateNoteBody(req.body);
  if (parsed.error) return res.status(400).json({ message: parsed.error });
  const note = await Note.create(req.user.id, parsed.value);
  events.emit("note:created", note);
  res.status(201).json(note);
}

async function list(req, res) { res.json(await Note.list(req.user.id)); }

async function update(req, res) {
  const parsed = validateNoteBody(req.body, true);
  if (parsed.error) return res.status(400).json({ message: parsed.error });
  const note = await Note.update(req.params.id, req.user.id, parsed.value);
  if (!note) return res.status(404).json({ message: "Note not found" });
  res.json(note);
}

async function remove(req, res) {
  const note = await Note.remove(req.params.id, req.user.id);
  if (!note) return res.status(404).json({ message: "Note not found" });
  res.json({ message: "Note deleted" });
}

module.exports = { create, list, update, remove };
