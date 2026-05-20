import React from 'react';
import { cn } from '../../utils/cn';

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  className,
  loading = false,
  leftIcon,
  rightIcon,
  ...props
}) {
  const variants = {
    primary:   'bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm',
    secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
    outline:   'border border-border hover:bg-accent text-foreground',
    ghost:     'hover:bg-accent text-foreground',
    danger:    'bg-destructive text-destructive-foreground hover:bg-destructive/90',
    success:   'bg-green-600 text-white hover:bg-green-700',
  };

  const sizes = {
    xs:  'px-2.5 py-1.5 text-xs gap-1.5',
    sm:  'px-3 py-2 text-sm gap-2',
    md:  'px-4 py-2.5 text-sm gap-2',
    lg:  'px-5 py-3 text-base gap-2.5',
    xl:  'px-6 py-3.5 text-lg gap-3',
    icon:'w-9 h-9',
  };

  return (
    <button
      className={cn(
        'inline-flex items-center justify-center rounded-lg font-medium',
        'transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 focus:ring-offset-background',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        variants[variant],
        sizes[size],
        className
      )}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading ? (
        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      ) : leftIcon}
      {children}
      {!loading && rightIcon}
    </button>
  );
}
