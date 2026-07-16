import type { Generated } from 'kysely';
import type { ColumnID } from 'csdm/common/types/column-id';

export type AnalysisReportTable = {
  id: Generated<ColumnID>;
  steam_id: string;
  match_checksum: string | null;
  created_at: Generated<Date>;
  llm_provider: string;
  llm_model: string;
  scores: unknown;
  issues: unknown;
  role: string;
  report_text: string;
  head_to_head: unknown;
};
