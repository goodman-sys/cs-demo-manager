import type { AnalysisRule, AnalysisIssue, PlayerAnalysisData } from 'csdm/node/analysis/types';
import { aimRules } from './aim-rules';
import { entryRules } from './entry-rules';
import { tradeRules } from './trade-rules';
import { utilityRules } from './utility-rules';
import { survivalRules } from './survival-rules';
import { combinedRules } from './combined-rules';

export const allRules: AnalysisRule[] = [
  ...aimRules,
  ...entryRules,
  ...tradeRules,
  ...utilityRules,
  ...survivalRules,
  ...combinedRules,
];

const severityOrder: Record<string, number> = {
  critical: 0,
  warning: 1,
  info: 2,
};

export function evaluateRules(data: PlayerAnalysisData): AnalysisIssue[] {
  const issues: AnalysisIssue[] = [];
  for (const rule of allRules) {
    const issue = rule.evaluate(data);
    if (issue) {
      issues.push(issue);
    }
  }
  return issues.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);
}
