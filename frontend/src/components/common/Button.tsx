import React from 'react';
import { clsx } from 'clsx';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'mint' | 'coral' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  className,
  disabled,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed select-none';

  const sizeStyles = {
    sm: 'text-xs px-3 py-1.5 rounded-lg gap-1.5',
    md: 'text-sm px-4 py-2 rounded-xl gap-2',
    lg: 'text-base px-5 py-2.5 rounded-xl gap-2.5',
  };

  const variantStyles = {
    primary: 'bg-[#8B7BE8] text-white hover:bg-[#7564D5] focus:ring-[#8B7BE8] shadow-sm hover:shadow hover:-translate-y-0.5 active:translate-y-0',
    secondary: 'bg-[#F0EDF9] text-[#7564D5] hover:bg-[#E5E0F5] focus:ring-[#8B7BE8] border border-[#E8E4ED]',
    outline: 'bg-white text-[#28263A] border border-[#E8E4ED] hover:bg-[#F7F5F0] hover:border-[#D8D3E0] focus:ring-[#8B7BE8]',
    ghost: 'text-[#777487] hover:text-[#28263A] hover:bg-[#F0EDF9] focus:ring-[#8B7BE8]',
    mint: 'bg-[#DDF2E7] text-[#286A50] hover:bg-[#CEEAD9] focus:ring-[#286A50] border border-[#C5E5D4]',
    coral: 'bg-[#FBE7DC] text-[#A95837] hover:bg-[#F8DACB] focus:ring-[#A95837] border border-[#F2D0BF]',
    danger: 'bg-[#C54D58] text-white hover:bg-[#B33E49] focus:ring-[#C54D58]',
  };

  return (
    <button
      className={clsx(
        baseStyles,
        sizeStyles[size],
        variantStyles[variant],
        className
      )}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        leftIcon && <span className="inline-flex shrink-0">{leftIcon}</span>
      )}
      <span>{children}</span>
      {!isLoading && rightIcon && <span className="inline-flex shrink-0">{rightIcon}</span>}
    </button>
  );
};
