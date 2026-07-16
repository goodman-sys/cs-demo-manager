import type { AnalysisScores, PlayerAnalysisData } from 'csdm/node/analysis/types';

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function normalize(value: number, min: number, max: number): number {
  return Math.round(((clamp(value, min, max) - min) / (max - min)) * 100);
}

export function calculateScores(data: PlayerAnalysisData): AnalysisScores {
  const aim =
    normalize(data.aim.hitRate, 10, 40) * 0.3 +
    normalize(data.headshotPercentage, 20, 60) * 0.2 +
    normalize(data.adr, 40, 100) * 0.3 +
    normalize(data.aim.counterStrafeRate, 30, 80) * 0.2;

  const entry = normalize(data.entry.firstKillCount, 0, 15) * 0.5 + normalize(data.entry.firstKillRate, 0, 0.5) * 0.5;

  const trade =
    normalize(data.trade.tradeSuccessRate, 0, 60) * 0.5 + normalize(data.trade.teammateTradeSuccessRate, 0, 60) * 0.5;

  const utility =
    normalize(data.utility.flashAssists, 0, 10) * 0.4 +
    normalize(data.utility.avgEnemiesFlashed, 0, 2) * 0.3 +
    normalize(data.utility.utilityDamage, 0, 100) * 0.3;

  const survival = normalize(data.survival.kast, 50, 80) * 0.6 + normalize(data.survival.clutchWinRate, 0, 50) * 0.4;

  return { aim, entry, trade, utility, survival };
}
