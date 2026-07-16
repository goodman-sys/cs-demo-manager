export type IssueSeverity = 'critical' | 'warning' | 'info';

export type AnalysisIssue = {
  id: string;
  severity: IssueSeverity;
  title: string;
  description: string;
  suggestion: string;
  data: Record<string, number | string>;
};

export type AnalysisRule = {
  id: string;
  category: 'aim' | 'entry' | 'trade' | 'utility' | 'survival' | 'combined';
  evaluate: (data: PlayerAnalysisData) => AnalysisIssue | null;
};

export type AimAnalysisData = {
  hitRate: number;
  accuracy: number;
  sprayAccuracy: number;
  counterStrafeRate: number;
  preciseHeadshotRate: number;
  averageDamageTimeTicks: number;
};

export type EntryAnalysisData = {
  firstKillCount: number;
  firstDeathCount: number;
  firstKillRate: number;
  firstKillTradeRate: number;
  topFirstKillWeapon: string;
};

export type TradeAnalysisData = {
  tradeKillCount: number;
  tradeDeathCount: number;
  tradeOpportunities: number;
  tradeSuccessRate: number;
  createOpportunities: number;
  teammateTradeSuccessRate: number;
};

export type UtilityAnalysisData = {
  flashAssists: number;
  avgEnemiesFlashed: number;
  avgTeammatesFlashed: number;
  avgFlashDuration: number;
  utilityDamage: number;
  wastedUtilityValue: number;
};

export type SurvivalAnalysisData = {
  kast: number;
  deathPositionEntropy: number;
  clutchWinRate: number;
  clutchParticipationRate: number;
};

export type PlayerAnalysisData = {
  steamId: string;
  playerName: string;
  rank: string;
  matchCount: number;
  kills: number;
  deaths: number;
  assists: number;
  kd: number;
  adr: number;
  headshotPercentage: number;
  hltvRating: number;
  hltvRating2: number;
  rws: number;
  twoKillCount: number;
  threeKillCount: number;
  fourKillCount: number;
  fiveKillCount: number;
  firstKillCount: number;
  firstDeathCount: number;
  kast: number;
  tradeKillCount: number;
  tradeDeathCount: number;
  mvpCount: number;
  averageMoneySpentPerRound: number;
  utilityDamage: number;
  enemiesFlashedCount: number;
  avgKillDistance: number;
  aim: AimAnalysisData;
  entry: EntryAnalysisData;
  trade: TradeAnalysisData;
  utility: UtilityAnalysisData;
  survival: SurvivalAnalysisData;
};

export type AnalysisScores = {
  aim: number;
  entry: number;
  trade: number;
  utility: number;
  survival: number;
};

export type HeadToHeadEntry = {
  kills: number;
  deaths: number;
};

export type PlayerRole = 'entry-fragger' | 'awper' | 'lurker' | 'support' | 'flex';

export type MatchAnalysisResult = {
  scores: AnalysisScores;
  issues: AnalysisIssue[];
  role: PlayerRole;
  roleDescription: string;
  headToHead: Record<string, HeadToHeadEntry>;
  playerData: PlayerAnalysisData;
};
