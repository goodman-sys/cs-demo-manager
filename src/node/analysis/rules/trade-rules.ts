import type { AnalysisRule, AnalysisIssue } from 'csdm/node/analysis/types';

const lowTradeSuccessRule: AnalysisRule = {
  id: 'low-trade-success',
  category: 'trade',
  evaluate(data): AnalysisIssue | null {
    const { tradeSuccessRate, tradeOpportunities } = data.trade;
    if (tradeSuccessRate < 30 && tradeOpportunities > 5) {
      return {
        id: 'low-trade-success',
        severity: 'warning',
        title: '补枪成功率过低',
        description: `你的补枪成功率为 ${tradeSuccessRate.toFixed(1)}%（共 ${tradeOpportunities} 次补枪机会），远低于 30% 的基准线，错失了大量翻盘机会。`,
        suggestion: '在队友倒下后迅速确认敌人位置，缩短反应时间，利用闪光弹等道具辅助补枪。',
        data: { tradeSuccessRate, tradeOpportunities },
      };
    }

    return null;
  },
};

const alwaysFirstDeathRule: AnalysisRule = {
  id: 'always-first-death',
  category: 'trade',
  evaluate(data): AnalysisIssue | null {
    const { createOpportunities, teammateTradeSuccessRate } = data.trade;
    if (createOpportunities > 10 && teammateTradeSuccessRate < 30) {
      return {
        id: 'always-first-death',
        severity: 'critical',
        title: '总是第一个阵亡',
        description: `你创造了 ${createOpportunities} 次补枪机会，但队友的补枪成功率仅为 ${teammateTradeSuccessRate.toFixed(1)}%，说明你频繁在队友无法支援的位置阵亡。`,
        suggestion: '调整进攻节奏，与队友保持协同比距，确保阵亡后队友能及时补枪，避免孤立作战。',
        data: { createOpportunities, teammateTradeSuccessRate },
      };
    }

    return null;
  },
};

export const tradeRules: AnalysisRule[] = [lowTradeSuccessRule, alwaysFirstDeathRule];
