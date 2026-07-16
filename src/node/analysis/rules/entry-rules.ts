import type { AnalysisRule, AnalysisIssue } from 'csdm/node/analysis/types';

const highFirstDeathRule: AnalysisRule = {
  id: 'high-first-death',
  category: 'entry',
  evaluate(data): AnalysisIssue | null {
    const { firstDeathCount, firstKillCount } = data.entry;
    if (firstDeathCount > firstKillCount && firstDeathCount > 5) {
      return {
        id: 'high-first-death',
        severity: 'warning',
        title: '首死次数过高',
        description: `你的首死次数为 ${firstDeathCount}，高于首杀次数 ${firstKillCount}，说明你在开局对枪中频繁先倒下。`,
        suggestion: '调整站位和选位策略，避免在开局暴露于敌方预瞄点，或让队友先行拉枪后再跟进。',
        data: { firstDeathCount, firstKillCount },
      };
    }

    return null;
  },
};

const concentratedFirstKillWeaponRule: AnalysisRule = {
  id: 'concentrated-first-kill-weapon',
  category: 'entry',
  evaluate(data): AnalysisIssue | null {
    const { topFirstKillWeapon, firstKillCount } = data.entry;
    if (topFirstKillWeapon !== 'unknown' && firstKillCount > 5) {
      return {
        id: 'concentrated-first-kill-weapon',
        severity: 'info',
        title: '首杀武器集中',
        description: `你的首杀主要依赖 ${topFirstKillWeapon}（共 ${firstKillCount} 次首杀），武器选择较为单一。`,
        suggestion: '尝试使用不同武器进行首杀，增加战术多样性，避免被对手针对。',
        data: { topFirstKillWeapon, firstKillCount },
      };
    }

    return null;
  },
};

export const entryRules: AnalysisRule[] = [highFirstDeathRule, concentratedFirstKillWeaponRule];
