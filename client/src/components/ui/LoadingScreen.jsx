import React from 'react';
import { Zap } from 'lucide-react';

export default function LoadingScreen() {
  return (
    <div className="fixed inset-0 bg-background flex flex-col items-center justify-center gap-4 z-50">
      <div className="w-16 h-16 rounded-2xl bg-brand-600 flex items-center justify-center shadow-glow animate-pulse">
        <Zap size={32} className="text-white" />
      </div>
      <div className="flex gap-1.5">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="w-2 h-2 rounded-full bg-brand-500 animate-bounce"
            style={{ animationDelay: `${i * 0.15}s` }}
          />
        ))}
      </div>
      <p className="text-muted-foreground text-sm">Loading TaskFlow...</p>
    </div>
  );
}
