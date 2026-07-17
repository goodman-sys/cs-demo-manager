/* oxlint-disable lingui/no-unlocalized-strings */
/* eslint-disable no-console */
import { createDatabaseConnection } from 'csdm/node/database/database';
import { migrateDatabase } from 'csdm/node/database/migrations/migrate-database';
import { config } from './config';

// 设置全局 logger（迁移代码需要）
(globalThis as Record<string, unknown>).logger = {
  debug: console.debug,
  info: console.info,
  warn: console.warn,
  error: console.error,
  log: console.log,
};

// 解析 DATABASE_URL
const url = new URL(config.DATABASE_URL);
createDatabaseConnection({
  hostname: url.hostname,
  port: Number(url.port) || 5432,
  username: url.username,
  password: url.password,
  database: url.pathname.slice(1),
});

console.log('正在运行数据库迁移...');
migrateDatabase()
  .then(() => {
    console.log('数据库迁移完成');
    process.exit(0);
  })
  .catch((err: unknown) => {
    console.error('迁移失败:', err);
    process.exit(1);
  });
