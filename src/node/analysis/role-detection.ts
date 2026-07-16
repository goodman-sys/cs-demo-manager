import type { PlayerAnalysisData, PlayerRole } from 'csdm/node/analysis/types';

type RoleResult = {
  role: PlayerRole;
  description: string;
};

export function detectRole(data: PlayerAnalysisData): RoleResult {
  if (data.avgKillDistance > 1500 && data.headshotPercentage < 35) {
    return { role: 'awper', description: '狙击手' };
  }

  if (data.firstKillCount > 5 && data.entry.firstKillRate > 50) {
    if (data.trade.tradeSuccessRate > 40) {
      return { role: 'entry-fragger', description: '灵活突破手' };
    }
    return { role: 'entry-fragger', description: '突破手' };
  }

  if (data.kd > 1.1 && data.firstKillCount < 3 && data.kast > 65) {
    return { role: 'lurker', description: '潜伏者' };
  }

  if (data.assists > data.kills * 0.3 && data.utility.flashAssists > 3) {
    if (data.utility.avgTeammatesFlashed > 0.3) {
      return { role: 'support', description: '辅助型选手（闪光使用需改进）' };
    }
    return { role: 'support', description: '辅助型选手' };
  }

  return { role: 'flex', description: '全能型选手' };
}
