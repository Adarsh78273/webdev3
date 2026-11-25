const { ObjectId } = require("mongodb");
const { getDatabase } = require("../config/db");

function notes() {
  return getDatabase().collection("notes");
}

function toPublic(note) {
  if (!note) return null;
  return { _id: note._id.toString(), title: note.title, content: note.content, ownerId: note.ownerId, createdAt: note.createdAt, updatedAt: note.updatedAt };
}

async function create(ownerId, { title, content }) {
  const note = { ownerId, title, content, createdAt: new Date(), updatedAt: new Date() };
  const result = await notes().insertOne(note);
  return toPublic({ ...note, _id: result.insertedId });
}

async function list(ownerId) {
  const records = await notes().find({ ownerId }).sort({ updatedAt: -1 }).toArray();
  return records.map(toPublic);
}

async function update(id, ownerId, changes) {
  if (!ObjectId.isValid(id)) return null;
  const result = await notes().findOneAndUpdate(
    { _id: new ObjectId(id), ownerId },
    { $set: { ...changes, updatedAt: new Date() } },
    { returnDocument: "after" },
  );
  return toPublic(result);
}

async function remove(id, ownerId) {
  if (!ObjectId.isValid(id)) return null;
  const result = await notes().findOneAndDelete({ _id: new ObjectId(id), ownerId });
  return toPublic(result);
}

module.exports = { create, list, update, remove };
