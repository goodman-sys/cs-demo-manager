/* oxlint-disable lingui/no-unlocalized-strings */
import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { getDatabase } from '../database/connection';

const listQuerySchema = z.object({
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  gameTypes: z.string().optional(),
  offset: z.coerce.number().int().min(0).default(0),
  limit: z.coerce.number().int().min(1).max(200).default(50),
});

const checksumParamSchema = z.object({
  checksum: z.string().min(1),
});

const heatmapQuerySchema = z.object({
  event: z.enum(['kills', 'deaths', 'shots']),
  rounds: z.string().optional(),
  sides: z.string().optional(),
  steamIds: z.string().optional(),
});

const viewer2dQuerySchema = z.object({
  roundNumber: z.coerce.number().int().min(0),
});

export function registerMatchRoutes(app: FastifyInstance) {
  // 比赛列表
  app.get('/api/matches', async (request) => {
    const query = listQuerySchema.parse(request.query);
    const db = getDatabase();

    let qb = db
      .selectFrom('matches')
      .innerJoin('demos', 'demos.checksum', 'matches.checksum')
      .select([
        'matches.checksum',
        'matches.game_type',
        'matches.game_mode',
        'matches.kill_count',
        'matches.death_count',
        'matches.winner_name',
        'matches.winner_side',
        'matches.max_rounds',
        'matches.analyze_date',
        'demos.name as demo_name',
        'demos.date as demo_date',
      ]);

    if (query.startDate) {
      qb = qb.where('demos.date', '>=', new Date(query.startDate));
    }
    if (query.endDate) {
      qb = qb.where('demos.date', '<=', new Date(query.endDate));
    }
    if (query.gameTypes) {
      const types = query.gameTypes.split(',').map((t) => Number.parseInt(t.trim(), 10));
      qb = qb.where('matches.game_type', 'in', types as Array<0 | 1 | 2 | 3 | 4 | 5 | 6>);
    }

    const matches = await qb.orderBy('demos.date', 'desc').offset(query.offset).limit(query.limit).execute();

    return { matches };
  });

  // 比赛详情
  app.get('/api/matches/:checksum', async (request, reply) => {
    const { checksum } = checksumParamSchema.parse(request.params);
    const db = getDatabase();

    const match = await db
      .selectFrom('matches')
      .innerJoin('demos', 'demos.checksum', 'matches.checksum')
      .selectAll()
      .where('matches.checksum', '=', checksum)
      .executeTakeFirst();

    if (!match) {
      return reply.status(404).send({ error: '比赛未找到' });
    }

    const [players, rounds, kills] = await Promise.all([
      db.selectFrom('players').selectAll().where('match_checksum', '=', checksum).execute(),
      db.selectFrom('rounds').selectAll().where('match_checksum', '=', checksum).orderBy('number', 'asc').execute(),
      db.selectFrom('kills').selectAll().where('match_checksum', '=', checksum).execute(),
    ]);

    return { match, players, rounds, kills };
  });

  // 热力图数据
  app.get('/api/matches/:checksum/heatmap', async (request, reply) => {
    const { checksum } = checksumParamSchema.parse(request.params);
    const query = heatmapQuerySchema.parse(request.query);
    const db = getDatabase();

    const match = await db.selectFrom('matches').select('checksum').where('checksum', '=', checksum).executeTakeFirst();
    if (!match) {
      return reply.status(404).send({ error: '比赛未找到' });
    }

    const roundNumbers = query.rounds ? query.rounds.split(',').map((r) => Number.parseInt(r.trim(), 10)) : undefined;
    const steamIds = query.steamIds ? query.steamIds.split(',').map((s) => s.trim()) : undefined;
    const sides = query.sides ? query.sides.split(',').map((s) => Number.parseInt(s.trim(), 10)) : undefined;

    let points: Array<{ x: number; y: number; z: number }>;

    if (query.event === 'kills') {
      let qb = db
        .selectFrom('kills')
        .select(['killer_x as x', 'killer_y as y', 'killer_z as z'])
        .where('match_checksum', '=', checksum);

      if (roundNumbers) qb = qb.where('round_number', 'in', roundNumbers);
      if (steamIds) qb = qb.where('killer_steam_id', 'in', steamIds);
      if (sides) qb = qb.where('killer_side', 'in', sides as Array<never>);

      points = await qb.execute();
    } else if (query.event === 'deaths') {
      let qb = db
        .selectFrom('kills')
        .select(['victim_x as x', 'victim_y as y', 'victim_z as z'])
        .where('match_checksum', '=', checksum);

      if (roundNumbers) qb = qb.where('round_number', 'in', roundNumbers);
      if (steamIds) qb = qb.where('victim_steam_id', 'in', steamIds);
      if (sides) qb = qb.where('victim_side', 'in', sides as Array<never>);

      points = await qb.execute();
    } else {
      let qb = db.selectFrom('shots').select(['x', 'y', 'z']).where('match_checksum', '=', checksum);

      if (roundNumbers) qb = qb.where('round_number', 'in', roundNumbers);
      if (steamIds) qb = qb.where('player_steam_id', 'in', steamIds);
      if (sides) qb = qb.where('player_side', 'in', sides as Array<never>);

      points = await qb.execute();
    }

    return { points };
  });

  // 2D 查看器数据
  app.get('/api/matches/:checksum/2d-viewer', async (request, reply) => {
    const { checksum } = checksumParamSchema.parse(request.params);
    const query = viewer2dQuerySchema.parse(request.query);
    const db = getDatabase();

    const match = await db.selectFrom('matches').select('checksum').where('checksum', '=', checksum).executeTakeFirst();
    if (!match) {
      return reply.status(404).send({ error: '比赛未找到' });
    }

    const [round, playerPositions, kills, shots] = await Promise.all([
      db
        .selectFrom('rounds')
        .selectAll()
        .where('match_checksum', '=', checksum)
        .where('number', '=', query.roundNumber)
        .executeTakeFirst(),
      db
        .selectFrom('player_positions')
        .selectAll()
        .where('match_checksum', '=', checksum)
        .where('round_number', '=', query.roundNumber)
        .execute(),
      db
        .selectFrom('kills')
        .selectAll()
        .where('match_checksum', '=', checksum)
        .where('round_number', '=', query.roundNumber)
        .execute(),
      db
        .selectFrom('shots')
        .selectAll()
        .where('match_checksum', '=', checksum)
        .where('round_number', '=', query.roundNumber)
        .execute(),
    ]);

    if (!round) {
      return reply.status(404).send({ error: '回合未找到' });
    }

    return { round, playerPositions, kills, shots };
  });
}
