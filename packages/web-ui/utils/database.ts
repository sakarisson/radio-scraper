import Database from "better-sqlite3";
import path from "path";

const defaultPath = path.resolve(process.cwd(), "../scraper/database.sqlite");
export const database = new Database(process.env.DB_PATH ?? defaultPath, {
  readonly: true,
});
