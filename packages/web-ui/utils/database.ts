import "server-only";
import Database from "better-sqlite3";
import path from "path";

let db: Database.Database | null = null;

export function getDb({ readonly } = { readonly: true }): Database.Database {
  if (db) return db;

  const defaultPath = path.resolve(process.cwd(), "../scraper/database.sqlite");
  const dbPath = process.env.DB_PATH ?? defaultPath;

  // opens only when first used during a request on the server
  db = new Database(dbPath, { readonly });
  return db;
}
