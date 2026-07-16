import React from 'react';
import type { AnalysisScores } from 'csdm/node/analysis/types';

type Props = {
  scores: AnalysisScores;
};

const SIZE = 200;
const CENTER = SIZE / 2;
const RADIUS = 80;
const LEVELS = [0.2, 0.4, 0.6, 0.8, 1];

const DIMENSIONS: { key: keyof AnalysisScores; label: string }[] = [
  { key: 'aim', label: '枪法' },
  { key: 'entry', label: '突破' },
  { key: 'trade', label: '补枪' },
  { key: 'utility', label: '道具' },
  { key: 'survival', label: '生存' },
];

const ANGLE_OFFSET = -Math.PI / 2;

function getVertex(index: number, radius: number) {
  const angle = (2 * Math.PI * index) / DIMENSIONS.length + ANGLE_OFFSET;
  return {
    x: CENTER + radius * Math.cos(angle),
    y: CENTER + radius * Math.sin(angle),
  };
}

function pointsToPath(points: { x: number; y: number }[]) {
  return points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ') + ' Z';
}

export function RadarChart({ scores }: Props) {
  const dataPoints = DIMENSIONS.map((dim, i) => {
    const value = Math.max(0, Math.min(100, scores[dim.key]));
    return getVertex(i, (value / 100) * RADIUS);
  });

  return (
    <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`}>
      {LEVELS.map((level) => (
        <circle
          key={level}
          cx={CENTER}
          cy={CENTER}
          r={RADIUS * level}
          className="fill-none stroke-gray-400"
          strokeWidth={0.5}
        />
      ))}
      {DIMENSIONS.map((_, i) => {
        const end = getVertex(i, RADIUS);
        return (
          <line key={i} x1={CENTER} y1={CENTER} x2={end.x} y2={end.y} className="stroke-gray-400" strokeWidth={0.5} />
        );
      })}
      <polygon points={pointsToPath(dataPoints)} className="fill-blue-500/30 stroke-blue-500" strokeWidth={1.5} />
      {DIMENSIONS.map((dim, i) => {
        const pos = getVertex(i, RADIUS + 18);
        return (
          <text
            key={dim.key}
            x={pos.x}
            y={pos.y}
            textAnchor="middle"
            dominantBaseline="middle"
            className="fill-gray-700 text-[9px] font-medium dark:fill-gray-300"
          >
            {dim.label} {Math.round(scores[dim.key])}
          </text>
        );
      })}
    </svg>
  );
}
