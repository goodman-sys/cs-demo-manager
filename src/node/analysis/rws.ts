import { db } from 'csdm/node/database/database';

type RoundRwsInput = {
  winningRoundNumbers: number[];
  plantedRounds: Set<number>;
  defusedRounds: Set<number>;
  playerDamageMap: Map<number, number>;
  teamDamageMap: Map<number, number>;
};

export function computeRws(input: RoundRwsInput): number {
  const { winningRoundNumbers, plantedRounds, defusedRounds, playerDamageMap, teamDamageMap } = input;
  if (winningRoundNumbers.length === 0) {
    return 0;
  }

  let totalRws = 0;
  for (const roundNum of winningRoundNumbers) {
    const teamDmg = teamDamageMap.get(roundNum) ?? 0;
    const playerDmg = playerDamageMap.get(roundNum) ?? 0;
    const hasBombAction = plantedRounds.has(roundNum) || defusedRounds.has(roundNum);
    const damageRatio = teamDmg > 0 ? playerDmg / teamDmg : 0;

    if (hasBombAction) {
      totalRws += 30 + damageRatio * 70;
    } else {
      totalRws += damageRatio * 100;
    }
  }

  return totalRws / winningRoundNumbers.length;
}

export async function calculateRws(checksum: string, steamId: string): Promise<number> {
  const playerRow = await db
    .selectFrom('players')
    .select('team_name as teamName')
    .where('match_checksum', '=', checksum)
    .where('steam_id', '=', steamId)
    .executeTakeFirst();

  if (!playerRow) {
    return 0;
  }

  const { teamName } = playerRow;

  const winningRounds = await db
    .selectFrom('rounds')
    .select('number')
    .where('match_checksum', '=', checksum)
    .where('winner_name', '=', teamName)
    .execute();

  if (winningRounds.length === 0) {
    return 0;
  }

  const winningRoundNumbers = winningRounds.map((r) => r.number);

  const [plantedBombs, defusedBombs, teamDamages, playerDamages] = await Promise.all([
    db
      .selectFrom('bombs_planted')
      .select(['round_number as roundNumber', 'planter_steam_id as planterSteamId'])
      .where('match_checksum', '=', checksum)
      .where('round_number', 'in', winningRoundNumbers)
      .execute(),
    db
      .selectFrom('bombs_defused')
      .select(['round_number as roundNumber', 'defuser_steam_id as defuserSteamId'])
      .where('match_checksum', '=', checksum)
      .where('round_number', 'in', winningRoundNumbers)
      .execute(),
    db
      .selectFrom('damages')
      .select(['round_number as roundNumber', db.fn.sum<number>('health_damage').as('totalDamage')])
      .where('match_checksum', '=', checksum)
      .where('attacker_team_name', '=', teamName)
      .where('round_number', 'in', winningRoundNumbers)
      .groupBy('round_number')
      .execute(),
    db
      .selectFrom('damages')
      .select(['round_number as roundNumber', db.fn.sum<number>('health_damage').as('totalDamage')])
      .where('match_checksum', '=', checksum)
      .where('attacker_steam_id', '=', steamId)
      .where('round_number', 'in', winningRoundNumbers)
      .groupBy('round_number')
      .execute(),
  ]);

  const plantedRounds = new Set<number>();
  for (const p of plantedBombs) {
    if (p.planterSteamId === steamId) {
      plantedRounds.add(p.roundNumber);
    }
  }

  const defusedRounds = new Set<number>();
  for (const d of defusedBombs) {
    if (d.defuserSteamId === steamId) {
      defusedRounds.add(d.roundNumber);
    }
  }

  const teamDamageMap = new Map<number, number>();
  for (const row of teamDamages) {
    teamDamageMap.set(row.roundNumber, row.totalDamage);
  }

  const playerDamageMap = new Map<number, number>();
  for (const row of playerDamages) {
    playerDamageMap.set(row.roundNumber, row.totalDamage);
  }

  return computeRws({
    winningRoundNumbers,
    plantedRounds,
    defusedRounds,
    playerDamageMap,
    teamDamageMap,
  });
}
