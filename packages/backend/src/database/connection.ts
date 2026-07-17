import { Pool } from 'pg';
import { Kysely, PostgresDialect } from 'kysely';
import { config } from '../config';
import type { Database } from './schema';

let db: Kysely<Database> | undefined;

export function initDatabase() {
  const dialect = new PostgresDialect({
    pool: new Pool({
      connectionString: config.DATABASE_URL,
      connectionTimeoutMillis: 10_000,
    }),
  });

  db = new Kysely<Database>({ dialect });
}

export function getDatabase(): Kysely<Database> {
  if (!db) {
    throw new Error('数据库未初始化，请先调用 initDatabase()');
  }
  return db;
}

export async function closeDatabase() {
  if (db) {
    await db.destroy();
    db = undefined;
  }
}
