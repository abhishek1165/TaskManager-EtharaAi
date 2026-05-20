import React from 'react';
import { cn } from '../../utils/cn';

export default function StatsCard({ title, value, icon: Icon, change, description, color = 'indigo', loading }) {
  const colors = {
    indigo:  { bg: 'bg-brand-500/10', text: 'text-brand-500',  icon: 'text-brand-500' },
    green:   { bg: 'bg-green-500/10', text: 'text-green-500',  icon: 'text-green-500' },
    yellow:  { bg: 'bg-yellow-500/10',text: 'text-yellow-500', icon: 'text-yellow-500' },
    red:     { bg: 'bg-red-500/10',   text: 'text-red-500',    icon: 'text-red-500' },
    purple:  { bg: 'bg-purple-500/10',text: 'text-purple-500', icon: 'text-purple-500' },
    blue:    { bg: 'bg-blue-500/10',  text: 'text-blue-500',   icon: 'text-blue-500' },
  };

  const c = colors[color] || colors.indigo;

  if (loading) {
    return (
      <div className="rounded-xl border border-border bg-card p-5 space-y-3 animate-pulse">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-muted" />
          <div className="space-y-2">
            <div className="h-3 w-20 bg-muted rounded" />
            <div className="h-6 w-12 bg-muted rounded" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="group rounded-xl border border-border bg-card p-5 hover:border-primary/50 hover:shadow-card-hover transition-all duration-300">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-muted-foreground font-medium">{title}</p>
          <p className={cn('text-3xl font-bold mt-1.5', c.text)}>{value ?? 0}</p>
          {description && <p className="text-xs text-muted-foreground mt-1">{description}</p>}
        </div>
        <div className={cn('w-11 h-11 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110', c.bg)}>
          {Icon && <Icon size={22} className={c.icon} />}
        </div>
      </div>
      {change !== undefined && (
        <div className="mt-3 flex items-center gap-1 text-xs">
          <span className={change >= 0 ? 'text-green-500' : 'text-red-500'}>
            {change >= 0 ? '↑' : '↓'} {Math.abs(change)}%
          </span>
          <span className="text-muted-foreground">from last week</span>
        </div>
      )}
    </div>
  );
}
