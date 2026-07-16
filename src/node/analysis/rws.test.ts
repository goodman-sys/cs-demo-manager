import { describe, expect, it } from 'vite-plus/test';
import { computeRws } from './rws';

describe('computeRws', () => {
  it('should return 0 when there are no winning rounds', () => {
    const rws = computeRws({
      winningRoundNumbers: [],
      plantedRounds: new Set(),
      defusedRounds: new Set(),
      playerDamageMap: new Map(),
      teamDamageMap: new Map(),
    });
    expect(rws).toBe(0);
  });

  it('should calculate RWS with pure damage (no bomb action)', () => {
    // 回合 1：玩家伤害 50，全队伤害 200 → 比例 0.25 → RWS = 25
    const rws = computeRws({
      winningRoundNumbers: [1],
      plantedRounds: new Set(),
      defusedRounds: new Set(),
      playerDamageMap: new Map([[1, 50]]),
      teamDamageMap: new Map([[1, 200]]),
    });
    expect(rws).toBe(25);
  });

  it('should calculate RWS with bomb plant bonus', () => {
    // 回合 1：玩家安包 + 伤害 70，全队伤害 200 → 比例 0.35 → RWS = 30 + 0.35 * 70 = 54.5
    const rws = computeRws({
      winningRoundNumbers: [1],
      plantedRounds: new Set([1]),
      defusedRounds: new Set(),
      playerDamageMap: new Map([[1, 70]]),
      teamDamageMap: new Map([[1, 200]]),
    });
    expect(rws).toBe(54.5);
  });

  it('should calculate RWS with bomb defuse bonus', () => {
    // 回合 1：玩家拆包 + 伤害 100，全队伤害 200 → 比例 0.5 → RWS = 30 + 0.5 * 70 = 65
    const rws = computeRws({
      winningRoundNumbers: [1],
      plantedRounds: new Set(),
      defusedRounds: new Set([1]),
      playerDamageMap: new Map([[1, 100]]),
      teamDamageMap: new Map([[1, 200]]),
    });
    expect(rws).toBe(65);
  });

  it('should average RWS across multiple winning rounds', () => {
    // 回合 1：纯伤害，玩家 100/200 = 0.5 → 50
    // 回合 2：安包，玩家 60/200 = 0.3 → 30 + 0.3 * 70 = 51
    // 平均 = (50 + 51) / 2 = 50.5
    const rws = computeRws({
      winningRoundNumbers: [1, 2],
      plantedRounds: new Set([2]),
      defusedRounds: new Set(),
      playerDamageMap: new Map([
        [1, 100],
        [2, 60],
      ]),
      teamDamageMap: new Map([
        [1, 200],
        [2, 200],
      ]),
    });
    expect(rws).toBe(50.5);
  });

  it('should handle zero team damage gracefully', () => {
    const rws = computeRws({
      winningRoundNumbers: [1],
      plantedRounds: new Set(),
      defusedRounds: new Set(),
      playerDamageMap: new Map([[1, 50]]),
      teamDamageMap: new Map([[1, 0]]),
    });
    expect(rws).toBe(0);
  });

  it('should handle player with no damage in a winning round', () => {
    // 回合 1：玩家无伤害，全队 200 → 比例 0 → RWS = 0
    const rws = computeRws({
      winningRoundNumbers: [1],
      plantedRounds: new Set(),
      defusedRounds: new Set(),
      playerDamageMap: new Map(),
      teamDamageMap: new Map([[1, 200]]),
    });
    expect(rws).toBe(0);
  });

  it('should handle 100% team damage contribution', () => {
    // 回合 1：玩家造成全部伤害 200/200 = 1.0 → RWS = 100
    const rws = computeRws({
      winningRoundNumbers: [1],
      plantedRounds: new Set(),
      defusedRounds: new Set(),
      playerDamageMap: new Map([[1, 200]]),
      teamDamageMap: new Map([[1, 200]]),
    });
    expect(rws).toBe(100);
  });
});
