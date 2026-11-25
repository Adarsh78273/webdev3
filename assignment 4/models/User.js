const { getDatabase } = require("../config/db");

function users() {
  return getDatabase().collection("users");
}

async function findByEmail(email) {
  return users().findOne({ email });
}

async function findById(id) {
  const { ObjectId } = require("mongodb");
  if (!ObjectId.isValid(id)) return null;
  return users().findOne({ _id: new ObjectId(id) });
}

async function create({ username, email, passwordHash }) {
  const user = { username, email, passwordHash, role: "user", createdAt: new Date() };
  const result = await users().insertOne(user);
  return { ...user, _id: result.insertedId };
}

module.exports = { findByEmail, findById, create };
