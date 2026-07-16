import type { AnalysisRule, AnalysisIssue } from 'csdm/node/analysis/types';

const flashTeammatesRule: AnalysisRule = {
  id: 'flash-teammates',
  category: 'utility',
  evaluate(data): AnalysisIssue | null {
    if (data.utility.avgTeammatesFlashed > 0.5) {
      return {
        id: 'flash-teammates',
        severity: 'warning',
        title: '闪光弹误伤队友过多',
        description: `你每局平均闪到 ${data.utility.avgTeammatesFlashed.toFixed(1)} 名队友，闪光弹使用需要更注意队友位置。`,
        suggestion: '投掷闪光弹前确认队友位置，使用背闪或高抛闪光减少误伤。',
        data: { avgTeammatesFlashed: data.utility.avgTeammatesFlashed },
      };
    }

    return null;
  },
};

const lowFlashEfficiencyRule: AnalysisRule = {
  id: 'low-flash-efficiency',
  category: 'utility',
  evaluate(data): AnalysisIssue | null {
    if (data.utility.avgEnemiesFlashed < 0.5 && data.utility.flashAssists < 2) {
      return {
        id: 'low-flash-efficiency',
        severity: 'warning',
        title: '闪光弹效率过低',
        description: `你每局平均仅闪到 ${data.utility.avgEnemiesFlashed.toFixed(1)} 名敌人，闪光助攻仅 ${data.utility.flashAssists} 次，闪光弹未能有效协助团队。`,
        suggestion: '练习闪光弹投掷角度和时机，配合队友进攻时主动提供闪光支援。',
        data: { avgEnemiesFlashed: data.utility.avgEnemiesFlashed, flashAssists: data.utility.flashAssists },
      };
    }

    return null;
  },
};

const lowUtilityDamageRule: AnalysisRule = {
  id: 'low-utility-damage',
  category: 'utility',
  evaluate(data): AnalysisIssue | null {
    if (data.utility.utilityDamage < 10 && data.matchCount > 0) {
      return {
        id: 'low-utility-damage',
        severity: 'info',
        title: '道具伤害不足',
        description: `你的道具总伤害仅为 ${data.utility.utilityDamage}，道具未能有效造成伤害。`,
        suggestion: '学习常用的手雷投掷点位，在进攻和防守时合理使用手雷造成伤害。',
        data: { utilityDamage: data.utility.utilityDamage },
      };
    }

    return null;
  },
};

export const utilityRules: AnalysisRule[] = [flashTeammatesRule, lowFlashEfficiencyRule, lowUtilityDamageRule];
