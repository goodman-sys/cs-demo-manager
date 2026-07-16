import type { AiSettings } from 'csdm/node/settings/settings';
import type { MatchAnalysisResult } from 'csdm/node/analysis/types';
import { createLlmClient, streamChatCompletion } from './llm-client';
import { buildSystemPrompt, buildUserPrompt } from './prompt-builder';
import { insertAnalysisReport } from 'csdm/node/database/analysis-reports/insert-analysis-report';

export async function generateCoachingReport(
  settings: AiSettings,
  result: MatchAnalysisResult,
  matchChecksum: string | null,
): Promise<ReadableStream<string>> {
  const client = createLlmClient(settings);
  const systemPrompt = buildSystemPrompt(settings.language);
  const userPrompt = buildUserPrompt(result);
  const stream = await streamChatCompletion(client, settings.model, systemPrompt, userPrompt);

  const [returnStream, saveStream] = stream.tee();

  // 后台消费：拼接完整报告并写入数据库
  const reader = saveStream.getReader();
  void (async () => {
    let reportText = '';
    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        reportText += value;
      }
      await insertAnalysisReport({
        steam_id: result.playerData.steamId,
        match_checksum: matchChecksum,
        llm_provider: settings.provider,
        llm_model: settings.model,
        scores: result.scores,
        issues: result.issues,
        role: result.role,
        head_to_head: result.headToHead,
        report_text: reportText,
      });
    } catch (error) {
      logger.error('保存分析报告失败');
      logger.error(error);
    }
  })();

  return returnStream;
}
