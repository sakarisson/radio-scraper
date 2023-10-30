import Database from "better-sqlite3";

export const database = new Database("../scraper/database.sqlite", {
  readonly: true,
});
