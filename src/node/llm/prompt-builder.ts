import type { MatchAnalysisResult, AnalysisScores, AnalysisIssue, PlayerAnalysisData } from 'csdm/node/analysis/types';

const SYSTEM_PROMPTS: Record<'zh' | 'en', string> = {
  zh: `你是一位专业的 CS2（Counter-Strike 2）教练，擅长通过数据分析帮助玩家提升竞技水平。

## 你的职责
- 根据玩家的比赛数据，给出具体、可执行的改进建议
- 所有建议必须引用具体数据作为依据
- 按优先级从高到低排列改进方向
- 使用 Markdown 格式输出，包含标题、列表、加粗等

## 分析框架
1. 先总结玩家整体表现和定位
2. 识别最突出的 2-3 个问题
3. 针对每个问题给出具体训练方法和练习建议
4. 最后给出鼓励性总结

## 输出要求
- 语言：中文
- 语气：专业但友好，像一位经验丰富的教练
- 每条建议必须可操作，避免空泛的"多练习"类建议
- 引用具体数值（如"你的爆头率 28% 低于同段位平均水平 35%"）`,

  en: `You are a professional CS2 (Counter-Strike 2) coach who helps players improve through data analysis.

## Your Role
- Provide specific, actionable improvement suggestions based on match data
- All suggestions must cite specific data as evidence
- Rank improvement areas by priority (highest to lowest)
- Output in Markdown format with headings, lists, bold text, etc.

## Analysis Framework
1. Summarize overall performance and role positioning
2. Identify the top 2-3 issues
3. For each issue, provide specific training methods and practice suggestions
4. End with an encouraging summary

## Output Requirements
- Language: English
- Tone: Professional but friendly, like an experienced coach
- Every suggestion must be actionable — avoid vague advice like "practice more"
- Cite specific values (e.g., "Your 28% headshot rate is below the 35% average for your rank")`,
};

export function buildSystemPrompt(language: 'zh' | 'en'): string {
  return SYSTEM_PROMPTS[language];
}

function formatScore(name: string, score: number): string {
  return `${name}: ${score.toFixed(1)}/100`;
}

function formatScores(scores: AnalysisScores): string {
  return [
    formatScore('瞄准 (Aim)', scores.aim),
    formatScore('突破 (Entry)', scores.entry),
    formatScore('补枪 (Trade)', scores.trade),
    formatScore('道具 (Utility)', scores.utility),
    formatScore('生存 (Survival)', scores.survival),
  ].join('\n');
}

function formatBasicStats(data: PlayerAnalysisData): string {
  return [
    `K/D: ${data.kd.toFixed(2)}`,
    `ADR: ${data.adr.toFixed(1)}`,
    `爆头率 (HS%): ${data.headshotPercentage.toFixed(1)}%`,
    `HLTV Rating: ${data.hltvRating.toFixed(2)}`,
    `HLTV Rating 2.0: ${data.hltvRating2.toFixed(2)}`,
    `KAST: ${data.kast.toFixed(1)}%`,
    `RWS: ${data.rws.toFixed(2)}`,
    `击杀: ${data.kills} | 死亡: ${data.deaths} | 助攻: ${data.assists}`,
    `多杀: 2K=${data.twoKillCount} 3K=${data.threeKillCount} 4K=${data.fourKillCount} 5K=${data.fiveKillCount}`,
    `MVP: ${data.mvpCount}`,
  ].join('\n');
}

function formatAimAnalysis(data: PlayerAnalysisData['aim']): string {
  return [
    `命中率: ${data.hitRate.toFixed(1)}%`,
    `精度: ${data.accuracy.toFixed(1)}%`,
    `压枪精度: ${data.sprayAccuracy.toFixed(1)}%`,
    `急停率: ${data.counterStrafeRate.toFixed(1)}%`,
    `精确爆头率: ${data.preciseHeadshotRate.toFixed(1)}%`,
    `平均伤害间隔: ${data.averageDamageTimeTicks.toFixed(0)} ticks`,
  ].join('\n');
}

function formatEntryAnalysis(data: PlayerAnalysisData['entry']): string {
  return [
    `首杀: ${data.firstKillCount} | 首死: ${data.firstDeathCount}`,
    `首杀率: ${data.firstKillRate.toFixed(1)}%`,
    `首杀补枪率: ${data.firstKillTradeRate.toFixed(1)}%`,
    `首选武器: ${data.topFirstKillWeapon || 'N/A'}`,
  ].join('\n');
}

function formatTradeAnalysis(data: PlayerAnalysisData['trade']): string {
  return [
    `补枪击杀: ${data.tradeKillCount} | 被补枪: ${data.tradeDeathCount}`,
    `补枪机会: ${data.tradeOpportunities}`,
    `补枪成功率: ${data.tradeSuccessRate.toFixed(1)}%`,
    `创造机会: ${data.createOpportunities}`,
    `队友补枪成功率: ${data.teammateTradeSuccessRate.toFixed(1)}%`,
  ].join('\n');
}

function formatUtilityAnalysis(data: PlayerAnalysisData['utility']): string {
  return [
    `闪光助攻: ${data.flashAssists}`,
    `平均致盲敌人: ${data.avgEnemiesFlashed.toFixed(2)}`,
    `平均致盲队友: ${data.avgTeammatesFlashed.toFixed(2)}`,
    `平均闪光持续时间: ${data.avgFlashDuration.toFixed(2)}s`,
    `道具伤害: ${data.utilityDamage}`,
    `浪费道具价值: $${data.wastedUtilityValue}`,
  ].join('\n');
}

function formatIssues(issues: AnalysisIssue[]): string {
  if (issues.length === 0) {
    return '无明显问题';
  }

  const severityLabel: Record<string, string> = {
    critical: '严重',
    warning: '警告',
    info: '提示',
  };

  return issues
    .map((issue) => {
      const label = severityLabel[issue.severity] ?? issue.severity;
      return `- [${label}] ${issue.title}\n  描述: ${issue.description}\n  建议: ${issue.suggestion}`;
    })
    .join('\n');
}

function formatHeadToHead(headToHead: Record<string, { kills: number; deaths: number }>): string {
  const entries = Object.entries(headToHead);
  if (entries.length === 0) {
    return '无对抗数据';
  }

  return entries
    .filter(([, value]) => value.kills > 0 || value.deaths > 0)
    .map(([steamId, data]) => `${steamId}: 击杀 ${data.kills} / 死亡 ${data.deaths}`)
    .join('\n');
}

const ROLE_LABELS: Record<string, string> = {
  'entry-fragger': '突破手',
  awper: '狙击手',
  lurker: '潜伏者',
  support: '辅助',
  flex: '全能型',
};

export function buildUserPrompt(result: MatchAnalysisResult): string {
  const { scores, issues, role, roleDescription, headToHead, playerData } = result;

  const roleLabel = ROLE_LABELS[role] ?? role;

  return `请根据以下比赛数据为该玩家提供专业的改进建议。

---

## 玩家信息
- 名称: ${playerData.playerName}
- 段位: ${playerData.rank}
- 角色定位: ${roleLabel} — ${roleDescription}
- 比赛场次: ${playerData.matchCount}

## 五维评分
${formatScores(scores)}

## 基础数据
${formatBasicStats(playerData)}

## 详细分析

### 瞄准分析
${formatAimAnalysis(playerData.aim)}

### 突破分析
${formatEntryAnalysis(playerData.entry)}

### 补枪分析
${formatTradeAnalysis(playerData.trade)}

### 道具分析
${formatUtilityAnalysis(playerData.utility)}

## 规则引擎检测的问题
${formatIssues(issues)}

## 对抗数据 (Head-to-Head)
${formatHeadToHead(headToHead)}

---

请基于以上数据，按优先级给出改进建议。`;
}
