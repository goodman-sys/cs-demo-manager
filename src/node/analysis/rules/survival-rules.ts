import type { AnalysisRule, AnalysisIssue } from 'csdm/node/analysis/types';

const lowKastRule: AnalysisRule = {
  id: 'low-kast',
  category: 'survival',
  evaluate(data): AnalysisIssue | null {
    if (data.kast < 60) {
      return {
        id: 'low-kast',
        severity: 'warning',
        title: 'KAST 过低',
        description: `你的 KAST 为 ${data.kast.toFixed(1)}%，低于 60% 的基准线，说明你参与击杀、存活或被补枪的回合比例不足。`,
        suggestion: '提升生存意识，避免不必要的阵亡，与队友保持协同比距，确保每回合都能为团队做出贡献。',
        data: { kast: data.kast },
      };
    }

    return null;
  },
};

const concentratedDeathPositionRule: AnalysisRule = {
  id: 'concentrated-death-position',
  category: 'survival',
  evaluate(data): AnalysisIssue | null {
    const { deathPositionEntropy } = data.survival;
    if (deathPositionEntropy < 2.0 && data.deaths > 5) {
      return {
        id: 'concentrated-death-position',
        severity: 'warning',
        title: '阵亡位置过于集中',
        description: `你的阵亡位置熵值为 ${deathPositionEntropy.toFixed(2)}，总死亡 ${data.deaths} 次，说明你反复在相近的位置被击杀，容易被对手针对。`,
        suggestion: '变换站位和进攻路线，避免在同一位置频繁暴露，增加对手的预判难度。',
        data: { deathPositionEntropy, deaths: data.deaths },
      };
    }

    return null;
  },
};

export const survivalRules: AnalysisRule[] = [lowKastRule, concentratedDeathPositionRule];
