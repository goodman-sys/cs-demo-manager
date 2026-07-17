/* oxlint-disable lingui/no-unlocalized-strings */
import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { getDatabase } from '../database/connection';

const searchQuerySchema = z.object({
  q: z.string().min(1),
  type: z.enum(['players', 'events', 'maps']).optional(),
});

export function registerSearchRoutes(app: FastifyInstance) {
  // 全局搜索
  app.get('/api/search', async (request) => {
    const query = searchQuerySchema.parse(request.query);
    const db = getDatabase();
    const pattern = `%${query.q}%`;

    if (query.type === 'players') {
      const players = await db
        .selectFrom('steam_accounts')
        .select(['steam_id', 'name', 'avatar'])
        .where('name', 'ilike', pattern)
        .limit(20)
        .execute();

      return { players, maps: [] };
    }

    if (query.type === 'maps') {
      const maps = await db
        .selectFrom('maps')
        .select(['name', 'game'])
        .where('name', 'ilike', pattern)
        .limit(20)
        .execute();

      return { players: [], maps };
    }

    // 默认同时搜索 players 和 maps
    const [players, maps] = await Promise.all([
      db
        .selectFrom('steam_accounts')
        .select(['steam_id', 'name', 'avatar'])
        .where('name', 'ilike', pattern)
        .limit(10)
        .execute(),
      db.selectFrom('maps').select(['name', 'game']).where('name', 'ilike', pattern).limit(10).execute(),
    ]);

    return { players, maps };
  });
}
