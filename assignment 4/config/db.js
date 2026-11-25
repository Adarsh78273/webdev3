const { MongoClient } = require("mongodb");

const uri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017";
const databaseName = process.env.MONGODB_DB || "secure_connect";
const client = new MongoClient(uri, { serverSelectionTimeoutMS: 5000 });
let database;

async function connectToDatabase() {
  if (database) return database;
  await client.connect();
  database = client.db(databaseName);
  await Promise.all([
    database.collection("users").createIndex({ email: 1 }, { unique: true }),
    database.collection("notes").createIndex({ ownerId: 1, updatedAt: -1 }),
  ]);
  console.log(`Connected to MongoDB database: ${databaseName}`);
  return database;
}

function getDatabase() {
  if (!database) throw new Error("Database is not connected");
  return database;
}

async function closeDatabase() {
  if (!database) return;
  database = undefined;
  await client.close();
}

module.exports = { connectToDatabase, getDatabase, closeDatabase };
