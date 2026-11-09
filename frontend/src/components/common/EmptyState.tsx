import React from 'react';
import { Database, Plus } from 'lucide-react';
import { Button } from './Button';

interface EmptyStateProps {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  actionLabel,
  onAction,
  icon,
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center bg-white border border-dashed border-[#E8E4ED] rounded-2xl my-4">
      <div className="w-14 h-14 rounded-2xl bg-[#F0EDF9] text-[#7564D5] flex items-center justify-center mb-4 shadow-sm">
        {icon || <Database className="w-7 h-7" />}
      </div>
      <h3 className="text-lg font-bold text-[#28263A] font-display">{title}</h3>
      <p className="text-sm text-[#777487] max-w-md mt-1.5 mb-6">{description}</p>
      {actionLabel && onAction && (
        <Button variant="primary" leftIcon={<Plus className="w-4 h-4" />} onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
};
