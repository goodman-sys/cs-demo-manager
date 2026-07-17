/* oxlint-disable lingui/no-unlocalized-strings */
import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { getDatabase } from '../database/connection';

const listQuerySchema = z.object({
  offset: z.coerce.number().int().min(0).default(0),
  limit: z.coerce.number().int().min(1).max(200).default(50),
});

const checksumParamSchema = z.object({
  checksum: z.string().min(1),
});

export function registerDemoRoutes(app: FastifyInstance) {
  // Demo 列表
  app.get('/api/demos', async (request) => {
    const query = listQuerySchema.parse(request.query);
    const db = getDatabase();

    const demos = await db
      .selectFrom('demos')
      .selectAll()
      .orderBy('date', 'desc')
      .offset(query.offset)
      .limit(query.limit)
      .execute();

    return { demos };
  });

  // Demo 详情
  app.get('/api/demos/:checksum', async (request, reply) => {
    const { checksum } = checksumParamSchema.parse(request.params);
    const db = getDatabase();

    const demo = await db.selectFrom('demos').selectAll().where('checksum', '=', checksum).executeTakeFirst();

    if (!demo) {
      return reply.status(404).send({ error: 'Demo 未找到' });
    }

    return { demo };
  });
}
