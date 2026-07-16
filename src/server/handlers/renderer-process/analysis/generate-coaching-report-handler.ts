import { analyzeMatch } from 'csdm/node/analysis/analyze-match';
import { analyzePlayer } from 'csdm/node/analysis/analyze-player';
import type { MatchFilters } from 'csdm/node/database/match/apply-match-filters';
import { generateCoachingReport } from 'csdm/node/llm/report-generator';
import { getSettings } from 'csdm/node/settings/get-settings';

export type GenerateCoachingReportPayload = {
  steamId: string;
  checksum?: string;
  filters?: MatchFilters;
};

export async function generateCoachingReportHandler(payload: GenerateCoachingReportPayload) {
  const settings = await getSettings();
  if (!settings.ai.apiKey) {
    throw new Error('AI API key not configured');
  }

  const result = payload.checksum
    ? await analyzeMatch(payload.checksum, payload.steamId)
    : await analyzePlayer(payload.steamId, payload.filters);

  return generateCoachingReport(settings.ai, result, payload.checksum ?? null);
}
