import type { MatchAnalysisResult } from 'csdm/node/analysis/types';
import { fetchMatchAnalysisData } from 'csdm/node/analysis/fetch-match-analysis-data';
import { calculateRws } from 'csdm/node/analysis/rws';
import { evaluateRules } from 'csdm/node/analysis/rules/all-rules';
import { calculateScores } from 'csdm/node/analysis/score';
import { detectRole } from 'csdm/node/analysis/role-detection';
import { calculateHeadToHead } from 'csdm/node/analysis/head-to-head';

export async function analyzeMatch(checksum: string, steamId: string): Promise<MatchAnalysisResult> {
  const allPlayersData = await fetchMatchAnalysisData(checksum);
  const playerData = allPlayersData.find((p) => p.steamId === steamId);

  if (!playerData) {
    throw new Error(`玩家 ${steamId} 在比赛 ${checksum} 中不存在`);
  }

  playerData.rws = await calculateRws(checksum, steamId);

  const issues = evaluateRules(playerData);
  const scores = calculateScores(playerData);
  const { role, description: roleDescription } = detectRole(playerData);

  const allSteamIds = allPlayersData.map((p) => p.steamId);
  const h2hResult = await calculateHeadToHead(checksum, allSteamIds);
  const headToHead = h2hResult.matrix[steamId] ?? {};

  return {
    scores,
    issues,
    role,
    roleDescription,
    headToHead,
    playerData,
  };
}
