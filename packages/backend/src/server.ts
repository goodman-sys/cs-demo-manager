/* oxlint-disable lingui/no-unlocalized-strings */
import Fastify from 'fastify';
import cors from '@fastify/cors';
import { config } from './config';
import { initDatabase, closeDatabase } from './database/connection';

const server = Fastify({
  logger: {
    level: config.LOG_LEVEL,
  },
});

await server.register(cors, { origin: true });

server.get('/api/health', () => {
  return { status: 'ok' };
});

// 路由注册 — 后续 Task 实现具体路由后取消注释
// server.register(matchRoutes);
// server.register(playerRoutes);
// server.register(statsRoutes);

async function start() {
  initDatabase();

  try {
    await server.listen({ port: config.PORT, host: '0.0.0.0' });
    server.log.info('Server started on 0.0.0.0:' + config.PORT);
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
}

async function shutdown(signal: string) {
  server.log.info(`收到 ${signal}，正在关闭...`);
  await closeDatabase();
  await server.close();
  process.exit(0);
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

await start();
