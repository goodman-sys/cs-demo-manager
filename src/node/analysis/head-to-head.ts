import { db } from 'csdm/node/database/database';
import type { HeadToHeadEntry } from 'csdm/node/analysis/types';

export type HeadToHeadResult = {
  matrix: Record<string, Record<string, HeadToHeadEntry>>;
  playerNames: Record<string, string>;
};

export async function calculateHeadToHead(checksum: string, steamIds: string[]): Promise<HeadToHeadResult> {
  const rows = await db
    .selectFrom('kills')
    .select(['killer_steam_id', 'victim_steam_id', 'killer_name', 'victim_name'])
    .where('match_checksum', '=', checksum)
    .where('killer_steam_id', 'in', steamIds)
    .where('victim_steam_id', 'in', steamIds)
    .whereRef('killer_steam_id', '!=', 'victim_steam_id')
    .execute();

  const playerNames: Record<string, string> = {};
  const matrix: Record<string, Record<string, HeadToHeadEntry>> = {};

  for (const steamId of steamIds) {
    matrix[steamId] = {};
    for (const otherId of steamIds) {
      if (otherId !== steamId) {
        matrix[steamId][otherId] = { kills: 0, deaths: 0 };
      }
    }
  }

  for (const row of rows) {
    const killer = row.killer_steam_id;
    const victim = row.victim_steam_id;

    playerNames[killer] = row.killer_name;
    playerNames[victim] = row.victim_name;

    matrix[killer][victim].kills += 1;
    matrix[victim][killer].deaths += 1;
  }

  return { matrix, playerNames };
}
