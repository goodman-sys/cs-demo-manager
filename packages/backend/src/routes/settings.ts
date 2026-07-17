/* oxlint-disable lingui/no-unlocalized-strings */
import type { FastifyInstance } from 'fastify';
import { defaultSettings } from 'csdm/node/settings/default-settings';
import type { Settings } from 'csdm/node/settings/settings';

// P0 阶段使用内存存储，初始值为默认设置
let settings: Settings = { ...defaultSettings };

export function registerSettingsRoutes(app: FastifyInstance) {
  // 获取设置
  app.get('/api/settings', () => {
    return { settings };
  });

  // 更新设置（合并对象）
  app.put('/api/settings', (request) => {
    const body = request.body as Record<string, unknown>;
    settings = { ...settings, ...body } as Settings;
    return { settings };
  });
}
