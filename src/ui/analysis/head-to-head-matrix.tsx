import React from 'react';
import { useLingui } from '@lingui/react/macro';
import { msg } from '@lingui/core/macro';
import type { HeadToHeadEntry } from 'csdm/node/analysis/types';

type Props = {
  headToHead: Record<string, HeadToHeadEntry>;
  playerName: string;
};

export function HeadToHeadMatrix({ headToHead }: Props) {
  const { t } = useLingui();

  const opponents = Object.entries(headToHead);
  if (opponents.length === 0) {
    return null;
  }

  const getKdRatio = (kills: number, deaths: number): string => {
    if (deaths === 0) {
      return kills > 0 ? '∞' : '0.00';
    }
    return (kills / deaths).toFixed(2);
  };

  /* oxlint-disable lingui/no-unlocalized-strings */
  const getRowClass = (hasAdvantage: boolean): string => {
    return hasAdvantage ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400';
  };
  /* oxlint-enable lingui/no-unlocalized-strings */

  return (
    <table className="w-full">
      <thead>
        <tr className="border-b border-gray-200 dark:border-gray-700">
          <th className="p-8  text-left text-caption font-medium text-gray-500 dark:text-gray-400">{t(msg`对手`)}</th>
          <th className="p-8  text-right text-caption font-medium text-gray-500 dark:text-gray-400">{t(msg`击杀`)}</th>
          <th className="p-8  text-right text-caption font-medium text-gray-500 dark:text-gray-400">{t(msg`死亡`)}</th>
          <th className="p-8  text-right text-caption font-medium text-gray-500 dark:text-gray-400">{t(msg`K/D`)}</th>
        </tr>
      </thead>
      <tbody>
        {opponents.map(([opponentName, { kills, deaths }]) => {
          const rowClass = getRowClass(kills > deaths);

          return (
            <tr key={opponentName} className="border-b border-gray-100 dark:border-gray-800">
              <td className={`p-8  text-body ${rowClass}`}>{opponentName}</td>
              <td className={`p-8  text-right text-body ${rowClass}`}>{kills}</td>
              <td className={`p-8  text-right text-body ${rowClass}`}>{deaths}</td>
              <td className={`p-8  text-right text-body-strong ${rowClass}`}>{getKdRatio(kills, deaths)}</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
