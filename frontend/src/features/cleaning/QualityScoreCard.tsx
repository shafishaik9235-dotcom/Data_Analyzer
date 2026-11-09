import React from 'react';
import { ShieldCheck, AlertTriangle, Layers, Copy, Hash } from 'lucide-react';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';

interface QualityScoreCardProps {
  score: number;
  completeness: number;
  uniqueness: number;
  validity: number;
  consistency: number;
  missingCells: number;
  duplicateRows: number;
  totalOutliers: number;
}

export const QualityScoreCard: React.FC<QualityScoreCardProps> = ({
  score,
  completeness,
  uniqueness,
  validity,
  consistency,
  missingCells,
  duplicateRows,
  totalOutliers,
}) => {
  const getScoreColor = (val: number) => {
    if (val >= 85) return 'text-[#286A50] bg-[#DDF2E7] border-[#C5E5D4]';
    if (val >= 70) return 'text-[#7564D5] bg-[#F0EDF9] border-[#E3DEF5]';
    return 'text-[#A95837] bg-[#FBE7DC] border-[#F2D0BF]';
  };

  const scoreBadgeVariant = score >= 85 ? 'mint' : score >= 70 ? 'violet' : 'coral';

  const metrics = [
    { label: 'Completeness', val: completeness, desc: 'Absence of null values' },
    { label: 'Uniqueness', val: uniqueness, desc: 'Deduplicated records' },
    { label: 'Validity & Normality', val: validity, desc: 'Conforming to distribution fences' },
    { label: 'Consistency', val: consistency, desc: 'Non-constant dimensions' },
  ];

  return (
    <Card className="p-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-[#E8E4ED]">
        {/* Left: Overall Gauge */}
        <div className="flex items-center gap-5">
          <div className={`w-20 h-20 rounded-2xl flex flex-col items-center justify-center border font-display ${getScoreColor(score)}`}>
            <span className="text-2xl font-black">{score}%</span>
            <span className="text-[10px] font-bold tracking-wider uppercase">Score</span>
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-lg font-bold text-[#28263A] font-display">
                Data Quality & Health Audit
              </h3>
              <Badge variant={scoreBadgeVariant} size="sm">
                {score >= 85 ? 'High Quality' : score >= 70 ? 'Moderate Health' : 'Needs Cleaning'}
              </Badge>
            </div>
            <p className="text-sm text-[#777487] max-w-xl">
              Composite score computed across 4 dimensions of data cleanliness. High quality data guarantees uncorrupted downstream machine learning and aggregation models.
            </p>
          </div>
        </div>

        {/* Right: Quick Issue Counts */}
        <div className="flex items-center gap-4 text-xs">
          <div className="p-3 bg-[#F7F5F0] rounded-xl border border-[#E8E4ED] text-center min-w-[90px]">
            <span className="text-[#777487] block mb-0.5">Missing</span>
            <span className="text-base font-bold text-[#28263A] font-display">
              {missingCells.toLocaleString()}
            </span>
          </div>
          <div className="p-3 bg-[#F7F5F0] rounded-xl border border-[#E8E4ED] text-center min-w-[90px]">
            <span className="text-[#777487] block mb-0.5">Duplicates</span>
            <span className="text-base font-bold text-[#28263A] font-display">
              {duplicateRows.toLocaleString()}
            </span>
          </div>
          <div className="p-3 bg-[#F7F5F0] rounded-xl border border-[#E8E4ED] text-center min-w-[90px]">
            <span className="text-[#777487] block mb-0.5">Outliers</span>
            <span className="text-base font-bold text-[#28263A] font-display">
              {totalOutliers.toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* Progress Bars for Pillars */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
        {metrics.map((m, idx) => (
          <div key={idx} className="p-3.5 bg-[#F7F5F0]/60 rounded-xl border border-[#E8E4ED]">
            <div className="flex justify-between items-center mb-1.5">
              <span className="text-xs font-semibold text-[#28263A]">{m.label}</span>
              <span className="text-xs font-bold text-[#7564D5]">{m.val}%</span>
            </div>
            <div className="w-full bg-[#E8E4ED] rounded-full h-2 overflow-hidden">
              <div
                className="bg-[#8B7BE8] h-full rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, Math.max(0, m.val))}%` }}
              />
            </div>
            <span className="text-[11px] text-[#777487] mt-1.5 block">{m.desc}</span>
          </div>
        ))}
      </div>
    </Card>
  );
};
