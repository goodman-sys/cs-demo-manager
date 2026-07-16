import { analyzePlayer } from 'csdm/node/analysis/analyze-player';
import type { MatchFilters } from 'csdm/node/database/match/apply-match-filters';

export type AnalyzePlayerPayload = {
  steamId: string;
  filters?: MatchFilters;
};

export async function analyzePlayerHandler(payload: AnalyzePlayerPayload) {
  return analyzePlayer(payload.steamId, payload.filters);
}
