/* oxlint-disable lingui/no-unlocalized-strings */
import type { FastifyInstance } from 'fastify';
import { getDatabase } from '../database/connection';

export function registerInitRoutes(app: FastifyInstance) {
  // 应用初始化数据
  app.get('/api/init', async () => {
    const db = getDatabase();

    const [matchChecksums, maps, tags] = await Promise.all([
      db.selectFrom('matches').select(['checksum']).execute(),
      db.selectFrom('maps').selectAll().execute(),
      db.selectFrom('tags').selectAll().execute(),
    ]);

    return {
      matchChecksums: matchChecksums.map((r) => r.checksum),
      maps,
      tags,
      settings: {},
      cameras: [],
      analyses: [],
      downloads: [],
      videos: [],
      faceitAccounts: [],
      fiveEPlayAccounts: [],
      renownAccounts: [],
      ignoredSteamAccounts: [],
    };
  });
}
