import { describe, expect, it } from 'vite-plus/test';
import { detectRole } from './role-detection';
import type { PlayerAnalysisData } from './types';

function buildData(overrides: Partial<PlayerAnalysisData> = {}): PlayerAnalysisData {
  return {
    steamId: '76561198000000000',
    playerName: 'Test',
    rank: '',
    matchCount: 10,
    kills: 200,
    deaths: 180,
    assists: 30,
    kd: 1.11,
    adr: 80,
    headshotPercentage: 45,
    hltvRating: 1.0,
    hltvRating2: 1.0,
    rws: 0,
    twoKillCount: 10,
    threeKillCount: 3,
    fourKillCount: 1,
    fiveKillCount: 0,
    firstKillCount: 5,
    firstDeathCount: 5,
    kast: 70,
    tradeKillCount: 10,
    tradeDeathCount: 10,
    mvpCount: 5,
    averageMoneySpentPerRound: 0,
    utilityDamage: 50,
    enemiesFlashedCount: 20,
    avgKillDistance: 800,
    aim: {
      hitRate: 25,
      accuracy: 25,
      sprayAccuracy: 0,
      counterStrafeRate: 0,
      preciseHeadshotRate: 40,
      averageDamageTimeTicks: 0,
    },
    entry: {
      firstKillCount: 5,
      firstDeathCount: 5,
      firstKillRate: 50,
      firstKillTradeRate: 0,
      topFirstKillWeapon: '',
    },
    trade: {
      tradeKillCount: 10,
      tradeDeathCount: 10,
      tradeOpportunities: 20,
      tradeSuccessRate: 50,
      createOpportunities: 0,
      teammateTradeSuccessRate: 0,
    },
    utility: {
      flashAssists: 5,
      avgEnemiesFlashed: 1,
      avgTeammatesFlashed: 0.2,
      avgFlashDuration: 2,
      utilityDamage: 50,
      wastedUtilityValue: 0,
    },
    survival: {
      kast: 70,
      deathPositionEntropy: 0,
      clutchWinRate: 0,
      clutchParticipationRate: 0,
    },
    ...overrides,
  };
}

describe('detectRole', () => {
  it('应检测为狙击手：avgKillDistance > 1500 且 headshotPercentage < 35', () => {
    const result = detectRole(buildData({ avgKillDistance: 1600, headshotPercentage: 30 }));
    expect(result).toEqual({ role: 'awper', description: '狙击手' });
  });

  it('不应检测为狙击手：headshotPercentage 过高', () => {
    const result = detectRole(buildData({ avgKillDistance: 1600, headshotPercentage: 40 }));
    expect(result.role).not.toBe('awper');
  });

  it('不应检测为狙击手：avgKillDistance 过低', () => {
    const result = detectRole(buildData({ avgKillDistance: 1000, headshotPercentage: 30 }));
    expect(result.role).not.toBe('awper');
  });

  it('应检测为灵活突破手：firstKillCount > 5 且 firstKillRate > 50 且 tradeSuccessRate > 40', () => {
    const result = detectRole(
      buildData({
        firstKillCount: 8,
        entry: {
          firstKillCount: 8,
          firstDeathCount: 2,
          firstKillRate: 80,
          firstKillTradeRate: 0,
          topFirstKillWeapon: '',
        },
        trade: {
          tradeKillCount: 10,
          tradeDeathCount: 5,
          tradeOpportunities: 15,
          tradeSuccessRate: 66.7,
          createOpportunities: 0,
          teammateTradeSuccessRate: 0,
        },
      }),
    );
    expect(result).toEqual({ role: 'entry-fragger', description: '灵活突破手' });
  });

  it('应检测为突破手：firstKillCount > 5 且 firstKillRate > 50 但 tradeSuccessRate <= 40', () => {
    const result = detectRole(
      buildData({
        firstKillCount: 8,
        entry: {
          firstKillCount: 8,
          firstDeathCount: 2,
          firstKillRate: 80,
          firstKillTradeRate: 0,
          topFirstKillWeapon: '',
        },
        trade: {
          tradeKillCount: 5,
          tradeDeathCount: 15,
          tradeOpportunities: 20,
          tradeSuccessRate: 25,
          createOpportunities: 0,
          teammateTradeSuccessRate: 0,
        },
      }),
    );
    expect(result).toEqual({ role: 'entry-fragger', description: '突破手' });
  });

  it('应检测为潜伏者：kd > 1.1 且 firstKillCount < 3 且 kast > 65', () => {
    const result = detectRole(buildData({ kd: 1.3, firstKillCount: 2, kast: 70 }));
    expect(result).toEqual({ role: 'lurker', description: '潜伏者' });
  });

  it('不应检测为潜伏者：firstKillCount 过高', () => {
    const result = detectRole(buildData({ kd: 1.3, firstKillCount: 5, kast: 70 }));
    expect(result.role).not.toBe('lurker');
  });

  it('应检测为辅助型选手：assists > kills * 0.3 且 flashAssists > 3', () => {
    const result = detectRole(
      buildData({
        kills: 100,
        assists: 40,
        firstKillCount: 0,
        kd: 0.8,
        kast: 50,
        utility: {
          flashAssists: 5,
          avgEnemiesFlashed: 1,
          avgTeammatesFlashed: 0.2,
          avgFlashDuration: 2,
          utilityDamage: 50,
          wastedUtilityValue: 0,
        },
      }),
    );
    expect(result).toEqual({ role: 'support', description: '辅助型选手' });
  });

  it('应检测为辅助型选手（闪光需改进）：avgTeammatesFlashed > 0.3', () => {
    const result = detectRole(
      buildData({
        kills: 100,
        assists: 40,
        firstKillCount: 0,
        kd: 0.8,
        kast: 50,
        utility: {
          flashAssists: 5,
          avgEnemiesFlashed: 1,
          avgTeammatesFlashed: 0.5,
          avgFlashDuration: 2,
          utilityDamage: 50,
          wastedUtilityValue: 0,
        },
      }),
    );
    expect(result).toEqual({ role: 'support', description: '辅助型选手（闪光使用需改进）' });
  });

  it('应默认检测为全能型选手', () => {
    const result = detectRole(
      buildData({
        avgKillDistance: 800,
        headshotPercentage: 45,
        firstKillCount: 3,
        kd: 1.0,
        kast: 60,
        kills: 100,
        assists: 10,
        entry: {
          firstKillCount: 3,
          firstDeathCount: 7,
          firstKillRate: 30,
          firstKillTradeRate: 0,
          topFirstKillWeapon: '',
        },
        utility: {
          flashAssists: 1,
          avgEnemiesFlashed: 0.5,
          avgTeammatesFlashed: 0.1,
          avgFlashDuration: 1.5,
          utilityDamage: 30,
          wastedUtilityValue: 0,
        },
      }),
    );
    expect(result).toEqual({ role: 'flex', description: '全能型选手' });
  });
});
