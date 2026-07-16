import React from 'react';
import { useLingui } from '@lingui/react/macro';
import { msg } from '@lingui/core/macro';
import type { AnalysisIssue, IssueSeverity } from 'csdm/node/analysis/types';

type Props = {
  issues: AnalysisIssue[];
};

const severityLabels: Record<IssueSeverity, ReturnType<typeof msg>> = {
  critical: msg`严重`,
  warning: msg`警告`,
  info: msg`信息`,
};

export function IssuesList({ issues }: Props) {
  const { t } = useLingui();

  if (issues.length === 0) {
    return <p className="text-body text-gray-500 dark:text-gray-400">未发现明显问题</p>;
  }

  /* oxlint-disable lingui/no-unlocalized-strings */
  const getBadgeClass = (severity: IssueSeverity): string => {
    switch (severity) {
      case 'critical':
        return 'bg-red-500/20 text-red-700 dark:text-red-400';
      case 'warning':
        return 'bg-orange-500/20 text-orange-700 dark:text-orange-400';
      case 'info':
        return 'bg-blue-500/20 text-blue-700 dark:text-blue-400';
    }
  };
  /* oxlint-enable lingui/no-unlocalized-strings */

  return (
    <div className="flex flex-col gap-8">
      {issues.map((issue) => {
        return (
          <div key={issue.id} className="rounded-8 border border-gray-200 p-12 dark:border-gray-700">
            <div className="flex items-center gap-8">
              <span className={`rounded-4 px-8 py-4 text-caption font-medium ${getBadgeClass(issue.severity)}`}>
                {t(severityLabels[issue.severity])}
              </span>
              <span className="text-body-strong text-gray-900 dark:text-gray-100">{issue.title}</span>
            </div>
            <p className="mt-8 text-body text-gray-600 dark:text-gray-400">{issue.description}</p>
            <p className="mt-4 text-body text-gray-500 dark:text-gray-500">{issue.suggestion}</p>
          </div>
        );
      })}
    </div>
  );
}
