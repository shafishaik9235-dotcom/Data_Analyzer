import React from 'react';
import { History, Check, GitCommit } from 'lucide-react';
import { CleaningStep } from '../../types';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';

interface TransformationHistoryProps {
  steps: CleaningStep[];
}

export const TransformationHistory: React.FC<TransformationHistoryProps> = ({ steps }) => {
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-bold text-[#28263A] font-display flex items-center gap-2">
          <History className="w-4 h-4 text-[#8B7BE8]" />
          Transformation Pipeline & Audit Trail
        </h3>
        <Badge variant="violet" size="sm">
          {steps.length} {steps.length === 1 ? 'Step' : 'Steps'} Committed
        </Badge>
      </div>

      {steps.length === 0 ? (
        <div className="text-center py-6 text-xs text-[#777487] italic">
          Raw dataset snapshot. No transformations have been applied yet.
        </div>
      ) : (
        <div className="relative pl-6 space-y-4 before:content-[''] before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#E8E4ED]">
          {steps.map((step) => (
            <div key={step.id} className="relative flex items-start justify-between gap-3 text-xs">
              <span className="absolute -left-6 top-0.5 w-5 h-5 rounded-full bg-[#8B7BE8] text-white flex items-center justify-center text-[10px] font-bold">
                {step.step_number}
              </span>
              <div className="flex-1 pl-2">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="font-semibold text-[#28263A] uppercase tracking-wider text-[11px]">
                    {step.operation_type.replace('_', ' ')}
                  </span>
                  <span className="text-[#777487] text-[10px]">
                    {new Date(step.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <p className="text-[#777487] text-xs">{step.description}</p>
              </div>
              <div className="text-right text-[11px] text-[#777487] shrink-0">
                <span>{step.rows_before.toLocaleString()} &rarr; {step.rows_after.toLocaleString()} rows</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
};
