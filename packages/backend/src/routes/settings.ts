/* oxlint-disable lingui/no-unlocalized-strings */
import type { FastifyInstance } from 'fastify';

// P0 阶段使用内存存储
let settings: Record<string, unknown> = {};

export function registerSettingsRoutes(app: FastifyInstance) {
  // 获取设置
  app.get('/api/settings', () => {
    return { settings };
  });

  // 更新设置（合并对象）
  app.put('/api/settings', (request) => {
    const body = request.body as Record<string, unknown>;
    settings = { ...settings, ...body };
    return { settings };
  });
}
