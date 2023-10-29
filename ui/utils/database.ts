import Database from "better-sqlite3";

export const database = new Database("../../database.sqlite", {
  readonly: true,
});
