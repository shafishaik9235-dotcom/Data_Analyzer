import React from 'react';
import { clsx } from 'clsx';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'surface' | 'subtle' | 'bordered';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  hoverEffect?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'surface',
  padding = 'md',
  hoverEffect = false,
  className,
  ...props
}) => {
  const baseStyles = 'rounded-2xl transition-all duration-200 border';

  const variantStyles = {
    surface: 'bg-white border-[#E8E4ED] shadow-[0_2px_8px_rgba(40,38,58,0.04)]',
    subtle: 'bg-[#F0EDF9] border-[#E8E4ED]',
    bordered: 'bg-transparent border-[#E8E4ED]',
  };

  const paddingStyles = {
    none: 'p-0',
    sm: 'p-3.5 sm:p-4',
    md: 'p-5 sm:p-6',
    lg: 'p-7 sm:p-8',
  };

  const hoverStyles = hoverEffect ? 'hover:shadow-[0_8px_24px_rgba(40,38,58,0.07)] hover:border-[#D8D3E0] hover:-translate-y-0.5' : '';

  return (
    <div
      className={clsx(
        baseStyles,
        variantStyles[variant],
        paddingStyles[padding],
        hoverStyles,
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};
