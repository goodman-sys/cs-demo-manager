import { sql } from 'kysely';
import { db } from 'csdm/node/database/database';
import { applyMatchFilters, type MatchFilters } from 'csdm/node/database/match/apply-match-filters';
import type {
  PlayerAnalysisData,
  AimAnalysisData,
  EntryAnalysisData,
  TradeAnalysisData,
  UtilityAnalysisData,
  SurvivalAnalysisData,
} from 'csdm/node/analysis/types';

type AggregatedPlayerRow = {
  steamId: string;
  name: string;
  matchCount: number;
  killCount: number;
  deathCount: number;
  assistCount: number;
  headshotPercentage: number;
  hltvRating: number;
  hltvRating2: number;
  kast: number;
  firstKillCount: number;
  firstDeathCount: number;
  tradeKillCount: number;
  tradeDeathCount: number;
  mvpCount: number;
  twoKillCount: number;
  threeKillCount: number;
  fourKillCount: number;
  fiveKillCount: number;
  utilityDamage: number;
  averageDamagePerRound: number;
  killDeathRatio: number;
};

type AggregatedShotRow = {
  playerSteamId: string;
  totalShots: number;
};

type AggregatedDamageRow = {
  attackerSteamId: string;
  totalHits: number;
  headshotHits: number;
};

type AggregatedFlashRow = {
  throwerSteamId: string;
  flashCount: number;
};

type AggregatedBlindRow = {
  flasherSteamId: string;
  enemyBlinds: number;
  teammateBlinds: number;
  totalBlinds: number;
  totalDuration: number;
};

async function fetchAggregatedPlayerRow(
  steamId: string,
  filters?: MatchFilters,
): Promise<AggregatedPlayerRow | undefined> {
  const { count, avg, sum } = db.fn;

  let query = db
    .selectFrom('players')
    .innerJoin('matches', 'matches.checksum', 'players.match_checksum')
    .innerJoin('demos', 'demos.checksum', 'matches.checksum')
    .select([
      'players.steam_id as steamId',
      'players.name',
      count<number>('players.match_checksum').as('matchCount'),
      sum<number>('players.kill_count').as('killCount'),
      sum<number>('players.death_count').as('deathCount'),
      sum<number>('players.assist_count').as('assistCount'),
      avg<number>('players.headshot_percentage').as('headshotPercentage'),
      avg<number>('players.hltv_rating').as('hltvRating'),
      avg<number>('players.hltv_rating_2').as('hltvRating2'),
      avg<number>('players.kast').as('kast'),
      sum<number>('players.first_kill_count').as('firstKillCount'),
      sum<number>('players.first_death_count').as('firstDeathCount'),
      sum<number>('players.trade_kill_count').as('tradeKillCount'),
      sum<number>('players.trade_death_count').as('tradeDeathCount'),
      sum<number>('players.mvp_count').as('mvpCount'),
      sum<number>('players.two_kill_count').as('twoKillCount'),
      sum<number>('players.three_kill_count').as('threeKillCount'),
      sum<number>('players.four_kill_count').as('fourKillCount'),
      sum<number>('players.five_kill_count').as('fiveKillCount'),
      sum<number>('players.utility_damage').as('utilityDamage'),
      avg<number>('players.average_damage_per_round').as('averageDamagePerRound'),
      sql<number>`SUM(players.kill_count)::NUMERIC / NULLIF(SUM(players.death_count), 0)::NUMERIC`.as('killDeathRatio'),
    ])
    .where('players.steam_id', '=', steamId)
    .groupBy(['players.steam_id', 'players.name']);

  if (filters) {
    query = applyMatchFilters(query, filters);
  }

  return query.executeTakeFirst() as Promise<AggregatedPlayerRow | undefined>;
}

async function fetchAggregatedShotData(
  steamId: string,
  filters?: MatchFilters,
): Promise<AggregatedShotRow | undefined> {
  const { count } = db.fn;

  let query = db
    .selectFrom('shots')
    .innerJoin('matches', 'matches.checksum', 'shots.match_checksum')
    .innerJoin('demos', 'demos.checksum', 'matches.checksum')
    .select(['shots.player_steam_id as playerSteamId', count<number>('shots.id').as('totalShots')])
    .where('shots.player_steam_id', '=', steamId)
    .groupBy('shots.player_steam_id');

  if (filters) {
    query = applyMatchFilters(query, filters);
  }

  return query.executeTakeFirst() as Promise<AggregatedShotRow | undefined>;
}

async function fetchAggregatedDamageData(
  steamId: string,
  filters?: MatchFilters,
): Promise<AggregatedDamageRow | undefined> {
  const { count } = db.fn;

  let query = db
    .selectFrom('damages')
    .innerJoin('matches', 'matches.checksum', 'damages.match_checksum')
    .innerJoin('demos', 'demos.checksum', 'matches.checksum')
    .select([
      'damages.attacker_steam_id as attackerSteamId',
      count<number>('damages.id').as('totalHits'),
      sql<number>`COUNT(*) FILTER (WHERE damages.hitgroup = 1)`.as('headshotHits'),
    ])
    .where('damages.attacker_steam_id', '=', steamId)
    .groupBy('damages.attacker_steam_id');

  if (filters) {
    query = applyMatchFilters(query, filters);
  }

  return query.executeTakeFirst() as Promise<AggregatedDamageRow | undefined>;
}

async function fetchAggregatedFlashData(
  steamId: string,
  filters?: MatchFilters,
): Promise<AggregatedFlashRow | undefined> {
  const { count } = db.fn;

  let query = db
    .selectFrom('flashbangs_explode')
    .innerJoin('matches', 'matches.checksum', 'flashbangs_explode.match_checksum')
    .innerJoin('demos', 'demos.checksum', 'matches.checksum')
    .select([
      'flashbangs_explode.thrower_steam_id as throwerSteamId',
      count<number>('flashbangs_explode.id').as('flashCount'),
    ])
    .where('flashbangs_explode.thrower_steam_id', '=', steamId)
    .groupBy('flashbangs_explode.thrower_steam_id');

  if (filters) {
    query = applyMatchFilters(query, filters);
  }

  return query.executeTakeFirst() as Promise<AggregatedFlashRow | undefined>;
}

async function fetchAggregatedBlindData(
  steamId: string,
  filters?: MatchFilters,
): Promise<AggregatedBlindRow | undefined> {
  let query = db
    .selectFrom('player_blinds')
    .innerJoin('matches', 'matches.checksum', 'player_blinds.match_checksum')
    .innerJoin('demos', 'demos.checksum', 'matches.checksum')
    .select([
      'player_blinds.flasher_steam_id as flasherSteamId',
      sql<number>`COUNT(*) FILTER (WHERE player_blinds.flasher_side <> player_blinds.flashed_side)`.as('enemyBlinds'),
      sql<number>`COUNT(*) FILTER (WHERE player_blinds.flasher_side = player_blinds.flashed_side)`.as('teammateBlinds'),
      sql<number>`COUNT(*)`.as('totalBlinds'),
      sql<number>`COALESCE(SUM(player_blinds.duration), 0)`.as('totalDuration'),
    ])
    .where('player_blinds.flasher_steam_id', '=', steamId)
    .groupBy('player_blinds.flasher_steam_id');

  if (filters) {
    query = applyMatchFilters(query, filters);
  }

  return query.executeTakeFirst() as Promise<AggregatedBlindRow | undefined>;
}

function buildAimData(totalShots: number, totalHits: number, headshotHits: number): AimAnalysisData {
  const hitRate = totalShots > 0 ? (totalHits / totalShots) * 100 : 0;
  const accuracy = hitRate;
  const preciseHeadshotRate = totalHits > 0 ? (headshotHits / totalHits) * 100 : 0;

  return {
    hitRate,
    accuracy,
    sprayAccuracy: 0,
    counterStrafeRate: 0,
    preciseHeadshotRate,
    averageDamageTimeTicks: 0,
  };
}

function buildEntryData(player: AggregatedPlayerRow): EntryAnalysisData {
  const firstKillCount = player.firstKillCount;
  const firstDeathCount = player.firstDeathCount;
  const totalEntryDuels = firstKillCount + firstDeathCount;
  const firstKillRate = totalEntryDuels > 0 ? (firstKillCount / totalEntryDuels) * 100 : 0;

  return {
    firstKillCount,
    firstDeathCount,
    firstKillRate,
    firstKillTradeRate: 0,
    topFirstKillWeapon: '',
  };
}

function buildTradeData(player: AggregatedPlayerRow): TradeAnalysisData {
  const tradeKillCount = player.tradeKillCount;
  const tradeDeathCount = player.tradeDeathCount;
  const tradeOpportunities = tradeKillCount + tradeDeathCount;
  const tradeSuccessRate = tradeOpportunities > 0 ? (tradeKillCount / tradeOpportunities) * 100 : 0;

  return {
    tradeKillCount,
    tradeDeathCount,
    tradeOpportunities,
    tradeSuccessRate,
    createOpportunities: 0,
    teammateTradeSuccessRate: 0,
  };
}

function buildUtilityData(
  flashData: AggregatedFlashRow | undefined,
  blindData: AggregatedBlindRow | undefined,
  utilityDamage: number,
): UtilityAnalysisData {
  const flashCount = flashData?.flashCount ?? 0;
  const enemyBlinds = blindData?.enemyBlinds ?? 0;
  const teammateBlinds = blindData?.teammateBlinds ?? 0;
  const totalBlinds = blindData?.totalBlinds ?? 0;
  const totalDuration = blindData?.totalDuration ?? 0;

  const avgEnemiesFlashed = flashCount > 0 ? enemyBlinds / flashCount : 0;
  const avgTeammatesFlashed = flashCount > 0 ? teammateBlinds / flashCount : 0;
  const avgFlashDuration = totalBlinds > 0 ? totalDuration / totalBlinds : 0;

  return {
    flashAssists: 0,
    avgEnemiesFlashed,
    avgTeammatesFlashed,
    avgFlashDuration,
    utilityDamage,
    wastedUtilityValue: 0,
  };
}

function buildSurvivalData(player: AggregatedPlayerRow): SurvivalAnalysisData {
  return {
    kast: player.kast,
    deathPositionEntropy: 0,
    clutchWinRate: 0,
    clutchParticipationRate: 0,
  };
}

/**
 * 从数据库查询指定玩家跨多场比赛的聚合数据，用于趋势分析。
 * 聚合 players、shots、damages、flashbangs_explode、player_blinds 表。
 * matchCount 必须大于 1 才返回有效数据。
 */
export async function fetchPlayerAnalysisData(steamId: string, filters?: MatchFilters): Promise<PlayerAnalysisData> {
  const [playerRow, shotData, damageData, flashData, blindData] = await Promise.all([
    fetchAggregatedPlayerRow(steamId, filters),
    fetchAggregatedShotData(steamId, filters),
    fetchAggregatedDamageData(steamId, filters),
    fetchAggregatedFlashData(steamId, filters),
    fetchAggregatedBlindData(steamId, filters),
  ]);

  if (!playerRow || playerRow.matchCount <= 1) {
    return buildDefaultPlayerAnalysisData(steamId);
  }

  const totalShots = shotData?.totalShots ?? 0;
  const totalHits = damageData?.totalHits ?? 0;
  const headshotHits = damageData?.headshotHits ?? 0;

  const aim = buildAimData(totalShots, totalHits, headshotHits);
  const entry = buildEntryData(playerRow);
  const trade = buildTradeData(playerRow);
  const utility = buildUtilityData(flashData, blindData, playerRow.utilityDamage);
  const survival = buildSurvivalData(playerRow);

  return {
    steamId: playerRow.steamId,
    playerName: playerRow.name,
    rank: '',
    matchCount: playerRow.matchCount,
    kills: playerRow.killCount,
    deaths: playerRow.deathCount,
    assists: playerRow.assistCount,
    kd: playerRow.killDeathRatio,
    adr: playerRow.averageDamagePerRound,
    headshotPercentage: playerRow.headshotPercentage,
    hltvRating: playerRow.hltvRating,
    hltvRating2: playerRow.hltvRating2,
    rws: 0,
    twoKillCount: playerRow.twoKillCount,
    threeKillCount: playerRow.threeKillCount,
    fourKillCount: playerRow.fourKillCount,
    fiveKillCount: playerRow.fiveKillCount,
    firstKillCount: playerRow.firstKillCount,
    firstDeathCount: playerRow.firstDeathCount,
    kast: playerRow.kast,
    tradeKillCount: playerRow.tradeKillCount,
    tradeDeathCount: playerRow.tradeDeathCount,
    mvpCount: playerRow.mvpCount,
    averageMoneySpentPerRound: 0,
    utilityDamage: playerRow.utilityDamage,
    enemiesFlashedCount: blindData?.enemyBlinds ?? 0,
    avgKillDistance: 0,
    aim,
    entry,
    trade,
    utility,
    survival,
  };
}

function buildDefaultPlayerAnalysisData(steamId: string): PlayerAnalysisData {
  return {
    steamId,
    playerName: '',
    rank: '',
    matchCount: 0,
    kills: 0,
    deaths: 0,
    assists: 0,
    kd: 0,
    adr: 0,
    headshotPercentage: 0,
    hltvRating: 0,
    hltvRating2: 0,
    rws: 0,
    twoKillCount: 0,
    threeKillCount: 0,
    fourKillCount: 0,
    fiveKillCount: 0,
    firstKillCount: 0,
    firstDeathCount: 0,
    kast: 0,
    tradeKillCount: 0,
    tradeDeathCount: 0,
    mvpCount: 0,
    averageMoneySpentPerRound: 0,
    utilityDamage: 0,
    enemiesFlashedCount: 0,
    avgKillDistance: 0,
    aim: {
      hitRate: 0,
      accuracy: 0,
      sprayAccuracy: 0,
      counterStrafeRate: 0,
      preciseHeadshotRate: 0,
      averageDamageTimeTicks: 0,
    },
    entry: {
      firstKillCount: 0,
      firstDeathCount: 0,
      firstKillRate: 0,
      firstKillTradeRate: 0,
      topFirstKillWeapon: '',
    },
    trade: {
      tradeKillCount: 0,
      tradeDeathCount: 0,
      tradeOpportunities: 0,
      tradeSuccessRate: 0,
      createOpportunities: 0,
      teammateTradeSuccessRate: 0,
    },
    utility: {
      flashAssists: 0,
      avgEnemiesFlashed: 0,
      avgTeammatesFlashed: 0,
      avgFlashDuration: 0,
      utilityDamage: 0,
      wastedUtilityValue: 0,
    },
    survival: {
      kast: 0,
      deathPositionEntropy: 0,
      clutchWinRate: 0,
      clutchParticipationRate: 0,
    },
  };
}
