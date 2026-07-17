/* oxlint-disable lingui/no-unlocalized-strings */
import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { getDatabase } from '../database/connection';

const listQuerySchema = z.object({
  offset: z.coerce.number().int().min(0).default(0),
  limit: z.coerce.number().int().min(1).max(200).default(50),
});

const steamIdParamSchema = z.object({
  steamId: z.string().min(1),
});

export function registerPlayerRoutes(app: FastifyInstance) {
  // 玩家列表
  app.get('/api/players', async (request) => {
    const query = listQuerySchema.parse(request.query);
    const db = getDatabase();

    const players = await db
      .selectFrom('steam_accounts')
      .select(['steam_id', 'name', 'avatar'])
      .orderBy('name', 'asc')
      .offset(query.offset)
      .limit(query.limit)
      .execute();

    return { players };
  });

  // 玩家详情
  app.get('/api/players/:steamId', async (request, reply) => {
    const { steamId } = steamIdParamSchema.parse(request.params);
    const db = getDatabase();

    const player = await db.selectFrom('steam_accounts').selectAll().where('steam_id', '=', steamId).executeTakeFirst();

    if (!player) {
      return reply.status(404).send({ error: '玩家未找到' });
    }

    const recentMatches = await db
      .selectFrom('players')
      .innerJoin('matches', 'matches.checksum', 'players.match_checksum')
      .innerJoin('demos', 'demos.checksum', 'players.match_checksum')
      .select([
        'players.match_checksum',
        'players.kill_count',
        'players.death_count',
        'players.assist_count',
        'players.hltv_rating_2',
        'players.team_name',
        'matches.game_type',
        'matches.winner_name',
        'demos.name as demo_name',
        'demos.date as demo_date',
        'demos.map_name',
      ])
      .where('players.steam_id', '=', steamId)
      .orderBy('demos.date', 'desc')
      .limit(20)
      .execute();

    return { player, recentMatches };
  });

  // 玩家热力图
  app.get('/api/players/:steamId/heatmap', async (request, reply) => {
    const { steamId } = steamIdParamSchema.parse(request.params);
    const db = getDatabase();

    const exists = await db
      .selectFrom('steam_accounts')
      .select('steam_id')
      .where('steam_id', '=', steamId)
      .executeTakeFirst();

    if (!exists) {
      return reply.status(404).send({ error: '玩家未找到' });
    }

    const points = await db
      .selectFrom('player_positions')
      .select(['x', 'y', 'z'])
      .where('player_steam_id', '=', steamId)
      .execute();

    return { points };
  });
}
