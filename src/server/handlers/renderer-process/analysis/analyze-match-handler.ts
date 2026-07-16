import { analyzeMatch } from 'csdm/node/analysis/analyze-match';

export type AnalyzeMatchPayload = {
  checksum: string;
  steamId: string;
};

export async function analyzeMatchHandler(payload: AnalyzeMatchPayload) {
  return analyzeMatch(payload.checksum, payload.steamId);
}
