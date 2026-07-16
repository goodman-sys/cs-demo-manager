import { db } from 'csdm/node/database/database';
import type { Insertable } from 'kysely';
import type { AnalysisReportTable } from './analysis-report-table';

export type InsertAnalysisReportParams = Insertable<AnalysisReportTable>;

export async function insertAnalysisReport(params: InsertAnalysisReportParams): Promise<void> {
  await db.insertInto('analysis_reports').values(params).execute();
}
