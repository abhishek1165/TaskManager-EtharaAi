import React from 'react';
import { cn } from '../../utils/cn';

// ─── Input ─────────────────────────────────────────────────────────────────────
// forwardRef is required so react-hook-form's register() can attach its ref
// to the underlying <input> DOM node.
export const Input = React.forwardRef(function Input(
  { label, error, className, id, ...props },
  ref
) {
  return (
    <div className="space-y-1.5">
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-foreground">
          {label}
        </label>
      )}
      <input
        id={id}
        ref={ref}
        className={cn(
          'w-full px-3 py-2.5 text-sm rounded-lg border',
          'bg-background text-foreground placeholder:text-muted-foreground',
          'focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          'transition-all duration-200',
          error ? 'border-destructive focus:ring-destructive/50' : 'border-border',
          className
        )}
        {...props}
      />
      {error && <p className="text-xs text-destructive mt-1">{error}</p>}
    </div>
  );
});

// ─── Textarea ──────────────────────────────────────────────────────────────────
export const Textarea = React.forwardRef(function Textarea(
  { label, error, className, id, rows = 3, ...props },
  ref
) {
  return (
    <div className="space-y-1.5">
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-foreground">
          {label}
        </label>
      )}
      <textarea
        id={id}
        ref={ref}
        rows={rows}
        className={cn(
          'w-full px-3 py-2.5 text-sm rounded-lg border resize-none',
          'bg-background text-foreground placeholder:text-muted-foreground',
          'focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary',
          'disabled:opacity-50 disabled:cursor-not-allowed transition-all',
          error ? 'border-destructive' : 'border-border',
          className
        )}
        {...props}
      />
      {error && <p className="text-xs text-destructive mt-1">{error}</p>}
    </div>
  );
});

// ─── Select ────────────────────────────────────────────────────────────────────
export const Select = React.forwardRef(function Select(
  { label, error, className, id, children, ...props },
  ref
) {
  return (
    <div className="space-y-1.5">
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-foreground">
          {label}
        </label>
      )}
      <select
        id={id}
        ref={ref}
        className={cn(
          'w-full px-3 py-2.5 text-sm rounded-lg border',
          'bg-background text-foreground',
          'focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary',
          'disabled:opacity-50 disabled:cursor-not-allowed transition-all',
          error ? 'border-destructive' : 'border-border',
          className
        )}
        {...props}
      >
        {children}
      </select>
      {error && <p className="text-xs text-destructive mt-1">{error}</p>}
    </div>
  );
});
