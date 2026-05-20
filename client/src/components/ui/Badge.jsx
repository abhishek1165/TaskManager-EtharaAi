import React from 'react';
import { cn, getPriorityClass, getStatusClass, titleCase } from '../../utils/cn';

export function Badge({ children, className, variant = 'default', ...props }) {
  const variants = {
    default:     'bg-primary/10 text-primary',
    secondary:   'bg-secondary text-secondary-foreground',
    destructive: 'bg-destructive/10 text-destructive',
    outline:     'border border-border text-foreground',
    success:     'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    warning:     'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium',
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}

export function PriorityBadge({ priority }) {
  return (
    <span className={cn('inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium', getPriorityClass(priority))}>
      {titleCase(priority)}
    </span>
  );
}

export function StatusBadge({ status }) {
  return (
    <span className={cn('inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium', getStatusClass(status))}>
      {titleCase(status)}
    </span>
  );
}

export function RoleBadge({ role }) {
  return (
    <Badge variant={role === 'admin' ? 'default' : 'secondary'}>
      {titleCase(role)}
    </Badge>
  );
}
