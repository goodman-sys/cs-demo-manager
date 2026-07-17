/* oxlint-disable lingui/no-unlocalized-strings */
import Fastify from 'fastify';
import cors from '@fastify/cors';
import websocket from '@fastify/websocket';
import { config } from './config';
import { initDatabase, closeDatabase } from './database/connection';
import { registerMatchRoutes } from './routes/matches';
import { registerPlayerRoutes } from './routes/players';
import { registerTeamRoutes } from './routes/teams';
import { registerDemoRoutes } from './routes/demos';
import { registerSearchRoutes } from './routes/search';
import { registerSettingsRoutes } from './routes/settings';
import { registerInitRoutes } from './routes/init';
import { registerWebSocketHandler } from './ws/handler';

const server = Fastify({
  logger: {
    level: config.LOG_LEVEL,
  },
});

await server.register(cors, { origin: true });
await server.register(websocket);
registerWebSocketHandler(server);

server.get('/api/health', () => {
  return { status: 'ok' };
});

// 路由注册
registerMatchRoutes(server);
registerPlayerRoutes(server);
registerTeamRoutes(server);
registerDemoRoutes(server);
registerSearchRoutes(server);
registerSettingsRoutes(server);
registerInitRoutes(server);

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
