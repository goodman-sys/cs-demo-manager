/* oxlint-disable lingui/no-unlocalized-strings */
import type { FastifyInstance } from 'fastify';
import type { WebSocket } from 'ws';

const clients = new Map<string, Set<WebSocket>>();

export function registerWebSocketHandler(app: FastifyInstance) {
  app.get('/ws', { websocket: true }, (socket, request) => {
    const processType = (request.query as Record<string, string>).process ?? 'renderer';

    if (!clients.has(processType)) {
      clients.set(processType, new Set());
    }
    clients.get(processType)!.add(socket);

    app.log.info(`WebSocket 客户端已连接: ${processType}`);

    socket.on('message', (raw: Buffer) => {
      try {
        const message = JSON.parse(raw.toString());
        app.log.info(`收到 WebSocket 消息: ${message.name}`);
        // P0 阶段：前端主要使用 REST API，WebSocket 仅用于推送
        // 后续可以在这里添加消息处理逻辑
      } catch (err) {
        app.log.error(err);
      }
    });

    socket.on('close', () => {
      clients.get(processType)?.delete(socket);
      app.log.info(`WebSocket 客户端已断开: ${processType}`);
    });
  });
}

export function broadcastToRenderers(name: string, payload?: unknown) {
  const renderers = clients.get('renderer');
  if (!renderers) return;
  const message = JSON.stringify({ name, payload });
  for (const socket of renderers) {
    socket.send(message);
  }
}
