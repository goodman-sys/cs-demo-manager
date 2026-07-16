import type { AnalysisRule, AnalysisIssue } from 'csdm/node/analysis/types';

const aggressivePlayerRule: AnalysisRule = {
  id: 'aggressive-player',
  category: 'combined',
  evaluate(data): AnalysisIssue | null {
    if (data.rws > 12 && data.hltvRating < 0.9) {
      return {
        id: 'aggressive-player',
        severity: 'info',
        title: '激进型选手',
        description: `你的 RWS 为 ${data.rws.toFixed(1)}（较高），但 HLTV 评分仅为 ${data.hltvRating.toFixed(2)}（偏低），说明你虽然每回合伤害贡献大，但击杀效率不足，打法偏激进。`,
        suggestion: '在保证输出的同时注意生存，避免过于冒进导致白给，尝试在交火后及时撤退寻找下一次机会。',
        data: { rws: data.rws, hltvRating: data.hltvRating },
      };
    }

    return null;
  },
};

const passivePlayerRule: AnalysisRule = {
  id: 'passive-player',
  category: 'combined',
  evaluate(data): AnalysisIssue | null {
    if (data.rws < 9 && data.hltvRating > 1.0) {
      return {
        id: 'passive-player',
        severity: 'info',
        title: '保守型选手',
        description: `你的 RWS 为 ${data.rws.toFixed(1)}（偏低），但 HLTV 评分为 ${data.hltvRating.toFixed(2)}（较高），说明你击杀效率不错但整体伤害贡献偏低，打法偏保守。`,
        suggestion: '尝试更积极地参与战斗，在关键时刻主动出击，将个人技术优势转化为更大的团队贡献。',
        data: { rws: data.rws, hltvRating: data.hltvRating },
      };
    }

    return null;
  },
};

const adrHighKdLowRule: AnalysisRule = {
  id: 'adr-high-kd-low',
  category: 'combined',
  evaluate(data): AnalysisIssue | null {
    if (data.adr > 80 && data.kd < 0.8) {
      return {
        id: 'adr-high-kd-low',
        severity: 'warning',
        title: '伤害高但击杀少',
        description: `你的 ADR 为 ${data.adr.toFixed(1)}（较高），但 KD 比仅为 ${data.kd.toFixed(2)}（偏低），说明你能造成大量伤害但难以完成击杀，收尾能力需要提升。`,
        suggestion: '注意补枪时机，与队友配合完成击杀；练习追踪射击和压枪，提高将伤害转化为击杀的能力。',
        data: { adr: data.adr, kd: data.kd },
      };
    }

    return null;
  },
};

const utilityNoFollowupRule: AnalysisRule = {
  id: 'utility-no-followup',
  category: 'combined',
  evaluate(data): AnalysisIssue | null {
    if (data.utility.flashAssists > 3 && data.adr < 60) {
      return {
        id: 'utility-no-followup',
        severity: 'warning',
        title: '丢完道具不补枪',
        description: `你的闪光助攻为 ${data.utility.flashAssists} 次（较多），但 ADR 仅为 ${data.adr.toFixed(1)}（偏低），说明你虽然道具使用积极，但闪光后未能跟进输出伤害。`,
        suggestion: '闪光弹投出后立即跟进进攻，抓住敌人致盲的时间窗口完成击杀，将道具优势转化为实际伤害。',
        data: { flashAssists: data.utility.flashAssists, adr: data.adr },
      };
    }

    return null;
  },
};

export const combinedRules: AnalysisRule[] = [
  aggressivePlayerRule,
  passivePlayerRule,
  adrHighKdLowRule,
  utilityNoFollowupRule,
];
