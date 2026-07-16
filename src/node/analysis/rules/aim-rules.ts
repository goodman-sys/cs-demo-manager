import type { AnalysisRule, AnalysisIssue } from 'csdm/node/analysis/types';

const lowAdrRule: AnalysisRule = {
  id: 'low-adr',
  category: 'aim',
  evaluate(data): AnalysisIssue | null {
    if (data.adr < 60) {
      return {
        id: 'low-adr',
        severity: 'critical',
        title: 'ADR 过低',
        description: `你的 ADR 为 ${data.adr.toFixed(1)}，远低于 60 的基准线，说明每回合造成的伤害严重不足。`,
        suggestion: '练习枪法准度和预瞄点位，优先选择能造成伤害的交火位置，避免无意义的消耗。',
        data: { adr: data.adr },
      };
    }

    if (data.adr < 70) {
      return {
        id: 'low-adr',
        severity: 'warning',
        title: 'ADR 偏低',
        description: `你的 ADR 为 ${data.adr.toFixed(1)}，低于 70 的理想水平，团队贡献有提升空间。`,
        suggestion: '关注交火时的命中率，尝试更积极地参与战斗，提升每回合伤害输出。',
        data: { adr: data.adr },
      };
    }

    return null;
  },
};

const lowHeadshotRule: AnalysisRule = {
  id: 'low-headshot',
  category: 'aim',
  evaluate(data): AnalysisIssue | null {
    if (data.headshotPercentage < 30) {
      return {
        id: 'low-headshot',
        severity: 'warning',
        title: '爆头率偏低',
        description: `你的爆头率为 ${data.headshotPercentage.toFixed(1)}%，低于 30% 的基准线，瞄准精度需要提升。`,
        suggestion: '在练习地图中专注爆头线预瞄，调整鼠标灵敏度，养成瞄准头部的习惯。',
        data: { headshotPercentage: data.headshotPercentage },
      };
    }

    return null;
  },
};

const lowHitRateRule: AnalysisRule = {
  id: 'low-hit-rate',
  category: 'aim',
  evaluate(data): AnalysisIssue | null {
    if (data.aim.hitRate < 20) {
      return {
        id: 'low-hit-rate',
        severity: 'warning',
        title: '命中率过低',
        description: `你的命中率为 ${data.aim.hitRate.toFixed(1)}%，低于 20% 的基准线，射击命中需要改善。`,
        suggestion: '练习压枪控制和急停射击，减少移动中开枪的情况，提升首发命中率。',
        data: { hitRate: data.aim.hitRate },
      };
    }

    return null;
  },
};

const lowCounterStrafeRule: AnalysisRule = {
  id: 'low-counter-strafe',
  category: 'aim',
  evaluate(data): AnalysisIssue | null {
    if (data.aim.counterStrafeRate < 50) {
      return {
        id: 'low-counter-strafe',
        severity: 'warning',
        title: '急停率偏低',
        description: `你的急停率为 ${data.aim.counterStrafeRate.toFixed(1)}%，低于 50% 的基准线，移动射击转换效率不足。`,
        suggestion: '练习反向急停操作，确保每次射击前完全停下，提高射击精准度。',
        data: { counterStrafeRate: data.aim.counterStrafeRate },
      };
    }

    return null;
  },
};

export const aimRules: AnalysisRule[] = [lowAdrRule, lowHeadshotRule, lowHitRateRule, lowCounterStrafeRule];
