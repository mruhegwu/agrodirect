import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { SCHEMA_SQL } from './schemaSql';

const dbDir = path.resolve(__dirname, '../../data');
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const dbPath = path.join(dbDir, 'agrodirect.sqlite');
export const db = new Database(dbPath);

// Enable foreign keys & WAL mode for high concurrency
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// Initialize schema
export function initDatabase() {
  db.exec(SCHEMA_SQL);
}

// Helper to generate UUIDs
export const generateUUID = () => uuidv4();

// Query helpers with JSON parsing/serialization where appropriate
export const queryHelpers = {
  getOne<T>(sql: string, params: any[] = []): T | undefined {
    const stmt = db.prepare(sql);
    return stmt.get(...params) as T | undefined;
  },

  getAll<T>(sql: string, params: any[] = []): T[] {
    const stmt = db.prepare(sql);
    return stmt.all(...params) as T[];
  },

  execute(sql: string, params: any[] = []) {
    const stmt = db.prepare(sql);
    return stmt.run(...params);
  },

  transaction<T>(fn: () => T): T {
    const runInTx = db.transaction(fn);
    return runInTx();
  }
};

// Safe JSON serialization/deserialization utilities
export function safeJsonParse<T>(val: any, fallback: T): T {
  if (!val) return fallback;
  if (typeof val === 'object') return val as T;
  try {
    return JSON.parse(val) as T;
  } catch (err) {
    return fallback;
  }
}

export function safeJsonStringify(val: any): string {
  if (typeof val === 'string') return val;
  try {
    return JSON.stringify(val);
  } catch {
    return '{}';
  }
}
