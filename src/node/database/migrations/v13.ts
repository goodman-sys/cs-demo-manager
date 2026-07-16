import type { Transaction } from 'kysely';
import type { Database } from '../schema';
import type { Migration } from './migration';

async function createAnalysisReportsTable(transaction: Transaction<Database>) {
  await transaction.schema
    .createTable('analysis_reports')
    .ifNotExists()
    .addColumn('id', 'bigserial', (col) => col.primaryKey())
    .addColumn('steam_id', 'varchar', (col) => col.notNull())
    .addColumn('match_checksum', 'varchar')
    .addColumn('created_at', 'timestamptz', (col) => col.notNull().defaultTo('now()'))
    .addColumn('llm_provider', 'varchar', (col) => col.notNull())
    .addColumn('llm_model', 'varchar', (col) => col.notNull())
    .addColumn('scores', 'jsonb', (col) => col.notNull())
    .addColumn('issues', 'jsonb', (col) => col.notNull())
    .addColumn('role', 'varchar', (col) => col.notNull())
    .addColumn('report_text', 'text', (col) => col.notNull())
    .addColumn('head_to_head', 'jsonb')
    .execute();

  await transaction.schema
    .createIndex('idx_analysis_reports_steam_id')
    .ifNotExists()
    .on('analysis_reports')
    .column('steam_id')
    .execute();

  await transaction.schema
    .createIndex('idx_analysis_reports_match_checksum')
    .ifNotExists()
    .on('analysis_reports')
    .column('match_checksum')
    .execute();
}

const v13: Migration = {
  schemaVersion: 13,
  run: async (transaction) => {
    await createAnalysisReportsTable(transaction);
  },
};

export default v13;
