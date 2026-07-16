import type { MatchAnalysisResult } from 'csdm/node/analysis/types';
import type { MatchFilters } from 'csdm/node/database/match/apply-match-filters';
import { fetchPlayerAnalysisData } from 'csdm/node/analysis/fetch-player-analysis-data';
import { evaluateRules } from 'csdm/node/analysis/rules/all-rules';
import { calculateScores } from 'csdm/node/analysis/score';
import { detectRole } from 'csdm/node/analysis/role-detection';

export async function analyzePlayer(steamId: string, filters?: MatchFilters): Promise<MatchAnalysisResult> {
  const playerData = await fetchPlayerAnalysisData(steamId, filters);

  const issues = evaluateRules(playerData);
  const scores = calculateScores(playerData);
  const { role, description: roleDescription } = detectRole(playerData);

  return {
    scores,
    issues,
    role,
    roleDescription,
    headToHead: {},
    playerData,
  };
}
