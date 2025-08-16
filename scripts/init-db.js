// creates the DB file if missing and applies safe pragmas
const fs = require("fs");
const path = require("path");
const Database = require("better-sqlite3");

const DB_PATH =
  process.env.DB_PATH ||
  path.resolve(__dirname, "../packages/scraper/database.sqlite");

// make sure the parent directory exists (e.g. /data)
const dir = path.dirname(DB_PATH);
if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

// open will create the file if it doesn't exist
const db = new Database(DB_PATH);

// pragmas for mixed read/write with one writer (the scraper)
db.pragma("journal_mode = WAL");
db.pragma("synchronous = NORMAL");

// optional no-op read to ensure the file is fully materialized
db.pragma("user_version");
db.close();

console.log(`[init-db] ensured SQLite at ${DB_PATH}`);
