import { analyzeMatch } from 'csdm/node/analysis/analyze-match';
import { analyzePlayer } from 'csdm/node/analysis/analyze-player';
import type { MatchFilters } from 'csdm/node/database/match/apply-match-filters';
import { generateCoachingReport } from 'csdm/node/llm/report-generator';
import { getSettings } from 'csdm/node/settings/get-settings';
import { RendererServerMessageName } from 'csdm/server/renderer-server-message-name';
import { server } from 'csdm/server/server';

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

  const stream = await generateCoachingReport(settings.ai, result, payload.checksum ?? null);

  const reader = stream.getReader();
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      server.sendMessageToRendererProcess({
        name: RendererServerMessageName.CoachingReportChunk,
        payload: value,
      });
    }
    server.sendMessageToRendererProcess({
      name: RendererServerMessageName.CoachingReportFinished,
    });
  } catch (error) {
    logger.error('生成教练报告失败');
    logger.error(error);
    server.sendMessageToRendererProcess({
      name: RendererServerMessageName.CoachingReportError,
      payload: error instanceof Error ? error.message : String(error),
    });
  }
}
