import "dotenv/config";
import path from "node:path";
import fs from "node:fs";
import { DatabaseSync } from "node:sqlite";
import { drizzle } from "drizzle-orm/node-sqlite";

const dbPath = process.env.DATABASE_URL ?? "./data/agrahari-gas.db";
const resolvedPath = path.resolve(process.cwd(), dbPath);

fs.mkdirSync(path.dirname(resolvedPath), { recursive: true });

const sqlite = new DatabaseSync(resolvedPath);
sqlite.exec("PRAGMA journal_mode = WAL;");

export const db = drizzle({ client: sqlite });
