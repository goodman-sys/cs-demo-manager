import { db } from 'csdm/node/database/database';
import type {
  PlayerAnalysisData,
  AimAnalysisData,
  EntryAnalysisData,
  TradeAnalysisData,
  UtilityAnalysisData,
  SurvivalAnalysisData,
} from 'csdm/node/analysis/types';

type PlayerRow = {
  steamId: string;
  name: string;
  rank: number;
  killCount: number;
  deathCount: number;
  assistCount: number;
  killDeathRatio: number;
  averageDamagePerRound: number;
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
};

type ShotRow = {
  weaponName: string;
  playerVelocityX: number;
  playerVelocityY: number;
  playerVelocityZ: number;
  recoilIndex: number;
  tick: number;
};

type DamageRow = {
  hitgroup: number;
  weaponName: string;
  healthDamage: number;
  tick: number;
  victimSteamId: string;
  attackerSteamId: string;
};

type FlashbangRow = {
  flashbangId: number | string;
  throwerSteamId: string;
  tick: number;
};

type BlindRow = {
  duration: number;
  flasherSteamId: string;
  flashedSteamId: string;
  flashedSide: number;
  flasherSide: number;
};

/**
 * 获取单场比赛所有玩家的分析数据。
 * 查询 players、shots、damages、flashbangs_explode、player_blinds、kills 表，
 * 计算衍生指标后返回 PlayerAnalysisData 数组。
 */
export async function fetchMatchAnalysisData(matchChecksum: string): Promise<PlayerAnalysisData[]> {
  const [playerRows, shotRows, damageRows, flashbangRows, blindRows] = await Promise.all([
    fetchPlayerRows(matchChecksum),
    fetchShotRows(matchChecksum),
    fetchDamageRows(matchChecksum),
    fetchFlashbangRows(matchChecksum),
    fetchBlindRows(matchChecksum),
  ]);

  return playerRows.map((player) => {
    const playerFlashbangs = flashbangRows.filter((f) => f.throwerSteamId === player.steamId);
    const playerBlindsAsFlasher = blindRows.filter((b) => b.flasherSteamId === player.steamId);

    const aim = buildAimData(shotRows, damageRows, player.steamId);
    const entry = buildEntryData(player);
    const trade = buildTradeData(player);
    const utility = buildUtilityData(playerFlashbangs, playerBlindsAsFlasher, player.utilityDamage);
    const survival = buildSurvivalData(player);

    return {
      steamId: player.steamId,
      playerName: player.name,
      rank: String(player.rank),
      matchCount: 1,
      kills: player.killCount,
      deaths: player.deathCount,
      assists: player.assistCount,
      kd: player.killDeathRatio,
      adr: player.averageDamagePerRound,
      headshotPercentage: player.headshotPercentage,
      hltvRating: player.hltvRating,
      hltvRating2: player.hltvRating2,
      rws: 0,
      twoKillCount: player.twoKillCount,
      threeKillCount: player.threeKillCount,
      fourKillCount: player.fourKillCount,
      fiveKillCount: player.fiveKillCount,
      firstKillCount: player.firstKillCount,
      firstDeathCount: player.firstDeathCount,
      kast: player.kast,
      tradeKillCount: player.tradeKillCount,
      tradeDeathCount: player.tradeDeathCount,
      mvpCount: player.mvpCount,
      averageMoneySpentPerRound: 0,
      utilityDamage: player.utilityDamage,
      enemiesFlashedCount: playerBlindsAsFlasher.filter((b) => b.flasherSide !== b.flashedSide).length,
      avgKillDistance: 0,
      aim,
      entry,
      trade,
      utility,
      survival,
    };
  });
}

async function fetchPlayerRows(matchChecksum: string): Promise<PlayerRow[]> {
  const rows = await db
    .selectFrom('players')
    .select([
      'steam_id as steamId',
      'name',
      'rank',
      'kill_count as killCount',
      'death_count as deathCount',
      'assist_count as assistCount',
      'kill_death_ratio as killDeathRatio',
      'average_damage_per_round as averageDamagePerRound',
      'headshot_percentage as headshotPercentage',
      'hltv_rating as hltvRating',
      'hltv_rating_2 as hltvRating2',
      'kast',
      'first_kill_count as firstKillCount',
      'first_death_count as firstDeathCount',
      'trade_kill_count as tradeKillCount',
      'trade_death_count as tradeDeathCount',
      'mvp_count as mvpCount',
      'two_kill_count as twoKillCount',
      'three_kill_count as threeKillCount',
      'four_kill_count as fourKillCount',
      'five_kill_count as fiveKillCount',
      'utility_damage as utilityDamage',
    ])
    .where('match_checksum', '=', matchChecksum)
    .execute();

  return rows as unknown as PlayerRow[];
}

async function fetchShotRows(matchChecksum: string): Promise<ShotRow[]> {
  const rows = await db
    .selectFrom('shots')
    .select([
      'weapon_name as weaponName',
      'player_velocity_x as playerVelocityX',
      'player_velocity_y as playerVelocityY',
      'player_velocity_z as playerVelocityZ',
      'recoil_index as recoilIndex',
      'tick',
    ])
    .where('match_checksum', '=', matchChecksum)
    .execute();

  return rows as unknown as ShotRow[];
}

async function fetchDamageRows(matchChecksum: string): Promise<DamageRow[]> {
  const rows = await db
    .selectFrom('damages')
    .select([
      'hitgroup',
      'weapon_name as weaponName',
      'health_damage as healthDamage',
      'tick',
      'victim_steam_id as victimSteamId',
      'attacker_steam_id as attackerSteamId',
    ])
    .where('match_checksum', '=', matchChecksum)
    .execute();

  return rows as unknown as DamageRow[];
}

async function fetchFlashbangRows(matchChecksum: string): Promise<FlashbangRow[]> {
  const rows = await db
    .selectFrom('flashbangs_explode')
    .select(['id as flashbangId', 'thrower_steam_id as throwerSteamId', 'tick'])
    .where('match_checksum', '=', matchChecksum)
    .execute();

  return rows as unknown as FlashbangRow[];
}

async function fetchBlindRows(matchChecksum: string): Promise<BlindRow[]> {
  const rows = await db
    .selectFrom('player_blinds')
    .select([
      'duration',
      'flasher_steam_id as flasherSteamId',
      'flashed_steam_id as flashedSteamId',
      'flashed_side as flashedSide',
      'flasher_side as flasherSide',
    ])
    .where('match_checksum', '=', matchChecksum)
    .execute();

  return rows as unknown as BlindRow[];
}

function buildAimData(shots: ShotRow[], damages: DamageRow[], steamId: string): AimAnalysisData {
  const totalShots = shots.length;
  const playerDamages = damages.filter((d) => d.attackerSteamId === steamId);
  const totalHits = playerDamages.length;

  const hitRate = totalShots > 0 ? (totalHits / totalShots) * 100 : 0;

  // 反急停判定：速度 < 50 的射击占比
  const counterStrafeShots = shots.filter((s) => {
    const velocity = Math.sqrt(s.playerVelocityX ** 2 + s.playerVelocityY ** 2 + s.playerVelocityZ ** 2);
    return velocity < 50;
  });
  const counterStrafeRate = totalShots > 0 ? (counterStrafeShots.length / totalShots) * 100 : 0;

  // 精确爆头率：hitgroup 1 = 头部
  const headshotHits = playerDamages.filter((d) => d.hitgroup === 1).length;
  const preciseHeadshotRate = totalHits > 0 ? (headshotHits / totalHits) * 100 : 0;

  // 精度 = 命中数 / 射击数（与 hitRate 相同，保留区分字段）
  const accuracy = hitRate;

  // 压枪精度：recoil_index > 1 的射击命中率
  const sprayShots = shots.filter((s) => s.recoilIndex > 1);
  const sprayHits = playerDamages.filter((d) => {
    // 匹配同一 tick 的射击
    return sprayShots.some((s) => s.tick === d.tick);
  });
  const sprayAccuracy = sprayShots.length > 0 ? (sprayHits.length / sprayShots.length) * 100 : 0;

  // 平均造成伤害的 tick 间隔
  const sortedDamages = playerDamages.toSorted((a, b) => a.tick - b.tick);
  let totalTickDiff = 0;
  let diffCount = 0;
  for (let i = 1; i < sortedDamages.length; i++) {
    totalTickDiff += sortedDamages[i].tick - sortedDamages[i - 1].tick;
    diffCount++;
  }
  const averageDamageTimeTicks = diffCount > 0 ? totalTickDiff / diffCount : 0;

  return {
    hitRate,
    accuracy,
    sprayAccuracy,
    counterStrafeRate,
    preciseHeadshotRate,
    averageDamageTimeTicks,
  };
}

function buildEntryData(player: PlayerRow): EntryAnalysisData {
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

function buildTradeData(player: PlayerRow): TradeAnalysisData {
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

function buildUtilityData(flashbangs: FlashbangRow[], blinds: BlindRow[], utilityDamage: number): UtilityAnalysisData {
  // 闪光致盲敌人的次数
  const enemyBlinds = blinds.filter((b) => b.flasherSide !== b.flashedSide);
  const teammateBlinds = blinds.filter((b) => b.flasherSide === b.flashedSide);

  const flashCount = flashbangs.length;
  const avgEnemiesFlashed = flashCount > 0 ? enemyBlinds.length / flashCount : 0;
  const avgTeammatesFlashed = flashCount > 0 ? teammateBlinds.length / flashCount : 0;

  const totalDuration = blinds.reduce((sum, b) => sum + b.duration, 0);
  const avgFlashDuration = blinds.length > 0 ? totalDuration / blinds.length : 0;

  return {
    flashAssists: 0,
    avgEnemiesFlashed,
    avgTeammatesFlashed,
    avgFlashDuration,
    utilityDamage,
    wastedUtilityValue: 0,
  };
}

function buildSurvivalData(player: PlayerRow): SurvivalAnalysisData {
  return {
    kast: player.kast,
    deathPositionEntropy: 0,
    clutchWinRate: 0,
    clutchParticipationRate: 0,
  };
}
