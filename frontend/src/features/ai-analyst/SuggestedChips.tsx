import React from 'react';
import {
  Trophy,
  TrendingUp,
  AlertTriangle,
  ShieldAlert,
  BarChart3,
  HelpCircle,
} from 'lucide-react';
import { SuggestedQuestion } from '../../types';

interface SuggestedChipsProps {
  suggestions: SuggestedQuestion[];
  onSelect: (question: string) => void;
}

export const SuggestedChips: React.FC<SuggestedChipsProps> = ({ suggestions, onSelect }) => {
  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'trophy':
        return <Trophy className="w-3.5 h-3.5 text-[#8B7BE8]" />;
      case 'trending-up':
        return <TrendingUp className="w-3.5 h-3.5 text-[#286A50]" />;
      case 'alert-triangle':
        return <AlertTriangle className="w-3.5 h-3.5 text-[#A95837]" />;
      case 'shield-alert':
        return <ShieldAlert className="w-3.5 h-3.5 text-[#C54D58]" />;
      case 'bar-chart-3':
        return <BarChart3 className="w-3.5 h-3.5 text-[#7564D5]" />;
      default:
        return <HelpCircle className="w-3.5 h-3.5 text-[#777487]" />;
    }
  };

  if (suggestions.length === 0) return null;

  return (
    <div className="space-y-2">
      <span className="text-xs font-semibold text-[#777487] uppercase tracking-wider block">
        Suggested Analytical Inquiries
      </span>
      <div className="flex flex-wrap gap-2">
        {suggestions.map((s, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => onSelect(s.question)}
            className="inline-flex items-center gap-2 px-3 py-1.5 bg-white border border-[#E8E4ED] hover:border-[#8B7BE8] hover:bg-[#F0EDF9]/50 rounded-xl text-xs text-[#28263A] transition-all shadow-2xs group"
          >
            {getIcon(s.icon)}
            <span className="group-hover:text-[#7564D5]">{s.question}</span>
          </button>
        ))}
      </div>
    </div>
  );
};
