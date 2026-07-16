import React from 'react';
import { useLingui } from '@lingui/react/macro';
import { msg } from '@lingui/core/macro';
import { useSelector } from 'csdm/ui/store/use-selector';
import { selectAnalysisResult, selectAnalysisLoading, selectAnalysisError } from 'csdm/ui/analysis/analysis-reducer';
import { RadarChart } from 'csdm/ui/analysis/radar-chart';
import { IssuesList } from 'csdm/ui/analysis/issues-list';
import { HeadToHeadMatrix } from 'csdm/ui/analysis/head-to-head-matrix';
import { CoachingReport } from 'csdm/ui/analysis/coaching-report';
import { Spinner } from 'csdm/ui/components/spinner';
import type { PlayerRole } from 'csdm/node/analysis/types';

type Props = {
  steamId: string;
  checksum?: string;
};

const roleLabels: Record<PlayerRole, ReturnType<typeof msg>> = {
  'entry-fragger': msg`突破手`,
  awper: msg`狙击手`,
  lurker: msg`潜伏者`,
  support: msg`辅助`,
  flex: msg`自由人`,
};

export function AnalysisPage({ steamId, checksum }: Props) {
  const { t } = useLingui();
  const result = useSelector(selectAnalysisResult);
  const isLoading = useSelector(selectAnalysisLoading);
  const error = useSelector(selectAnalysisError);

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Spinner size={32} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-body text-red-500">{error}</p>
      </div>
    );
  }

  if (!result) {
    return null;
  }

  const { scores, issues, role, roleDescription, headToHead, playerData } = result;
  const hasHeadToHead = Object.keys(headToHead).length > 0;

  return (
    <div className="flex flex-col gap-24 overflow-y-auto p-24">
      <div className="flex flex-col gap-24 lg:flex-row">
        <div className="shrink-0">
          <RadarChart scores={scores} />
        </div>
        <div className="flex flex-1 flex-col gap-16">
          <div>
            <h2 className="text-subtitle text-gray-900 dark:text-gray-100">{t(roleLabels[role])}</h2>
            <p className="mt-4 text-body text-gray-600 dark:text-gray-400">{roleDescription}</p>
          </div>
          <div className="grid grid-cols-2 gap-12 sm:grid-cols-4">
            <StatItem label={t(msg`K/D`)} value={playerData.kd.toFixed(2)} />
            <StatItem label={t(msg`ADR`)} value={playerData.adr.toFixed(1)} />
            <StatItem label={t(msg`爆头率`)} value={`${playerData.headshotPercentage.toFixed(1)}%`} />
            <StatItem label={t(msg`Rating`)} value={playerData.hltvRating2.toFixed(2)} />
          </div>
        </div>
      </div>

      <Section title={t(msg`问题列表`)}>
        <IssuesList issues={issues} />
      </Section>

      {hasHeadToHead && (
        <Section title={t(msg`对阵统计`)}>
          <HeadToHeadMatrix headToHead={headToHead} playerName={playerData.playerName} />
        </Section>
      )}

      <Section title={t(msg`AI 教练报告`)}>
        <CoachingReport steamId={steamId} checksum={checksum} />
      </Section>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-12">
      <h3 className="text-subtitle text-gray-900 dark:text-gray-100">{title}</h3>
      {children}
    </div>
  );
}

function StatItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-8 bg-gray-50 p-12 dark:bg-gray-800">
      <p className="text-caption text-gray-500 dark:text-gray-400">{label}</p>
      <p className="text-body-strong text-gray-900 dark:text-gray-100">{value}</p>
    </div>
  );
}
