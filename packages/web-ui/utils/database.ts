import "server-only";
import Database from "better-sqlite3";
import path from "path";
import fs from "fs";

let _db: Database.Database | null = null;

/**
 * Returns a DB instance or null when the file/dir does not exist (e.g. during build).
 * Do not create files/dirs here; web runs read-only. Runtime creation happens in prestart.
 */
export function tryGetDb(readonly = true): Database.Database | null {
  if (_db) return _db;

  const defaultPath = path.resolve(process.cwd(), "../scraper/database.sqlite");
  const dbPath = process.env.DB_PATH ?? defaultPath;

  // if directory or file is missing (common in build), bail out gracefully
  if (!fs.existsSync(path.dirname(dbPath)) || !fs.existsSync(dbPath)) {
    return null;
  }

  _db = new Database(dbPath, { readonly });
  return _db;
}

/** For places where you want a hard failure if DB is missing at runtime */
export function getDb(readonly = true): Database.Database {
  const db = tryGetDb(readonly);
  if (!db) {
    throw new Error(
      "Database not available. Is the scraper initialized and DB_PATH mounted?"
    );
  }
  return db;
}
