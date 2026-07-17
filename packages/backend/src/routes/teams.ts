/* oxlint-disable lingui/no-unlocalized-strings */
import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { getDatabase } from '../database/connection';

const listQuerySchema = z.object({
  offset: z.coerce.number().int().min(0).default(0),
  limit: z.coerce.number().int().min(1).max(200).default(50),
});

const nameParamSchema = z.object({
  name: z.string().min(1),
});

export function registerTeamRoutes(app: FastifyInstance) {
  // 战队列表
  app.get('/api/teams', async (request) => {
    const query = listQuerySchema.parse(request.query);
    const db = getDatabase();

    const teams = await db
      .selectFrom('teams')
      .select(['name'])
      .distinct()
      .orderBy('name', 'asc')
      .offset(query.offset)
      .limit(query.limit)
      .execute();

    return { teams };
  });

  // 战队详情
  app.get('/api/teams/:name', async (request, reply) => {
    const { name } = nameParamSchema.parse(request.params);
    const db = getDatabase();

    const team = await db.selectFrom('teams').selectAll().where('name', '=', name).executeTakeFirst();

    if (!team) {
      return reply.status(404).send({ error: '战队未找到' });
    }

    const matches = await db
      .selectFrom('teams')
      .innerJoin('demos', 'demos.checksum', 'teams.match_checksum')
      .select([
        'teams.match_checksum',
        'teams.name',
        'teams.score',
        'teams.current_side',
        'demos.name as demo_name',
        'demos.date as demo_date',
        'demos.map_name',
      ])
      .where('teams.name', '=', name)
      .orderBy('demos.date', 'desc')
      .limit(50)
      .execute();

    return { team, matches };
  });
}
