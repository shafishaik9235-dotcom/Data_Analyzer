import React from 'react';
import { clsx } from 'clsx';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'violet' | 'mint' | 'coral' | 'gray' | 'danger' | 'outline';
  size?: 'sm' | 'md';
  icon?: React.ReactNode;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'violet',
  size = 'sm',
  icon,
  className,
}) => {
  const baseStyles = 'inline-flex items-center font-medium rounded-full select-none';

  const sizeStyles = {
    sm: 'text-xs px-2.5 py-0.5 gap-1',
    md: 'text-sm px-3 py-1 gap-1.5',
  };

  const variantStyles = {
    violet: 'bg-[#F0EDF9] text-[#7564D5] border border-[#E3DEF5]',
    mint: 'bg-[#DDF2E7] text-[#286A50] border border-[#C5E5D4]',
    coral: 'bg-[#FBE7DC] text-[#A95837] border border-[#F2D0BF]',
    gray: 'bg-[#ECEAF1] text-[#777487] border border-[#DFDCE6]',
    danger: 'bg-[#FDE8E9] text-[#C54D58] border border-[#F9CFD2]',
    outline: 'bg-transparent text-[#777487] border border-[#E8E4ED]',
  };

  return (
    <span className={clsx(baseStyles, sizeStyles[size], variantStyles[variant], className)}>
      {icon && <span className="inline-flex shrink-0">{icon}</span>}
      <span>{children}</span>
    </span>
  );
};
