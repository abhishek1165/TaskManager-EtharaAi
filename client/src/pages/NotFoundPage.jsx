import React from 'react';
import { Link } from 'react-router-dom';
import { Zap, ArrowLeft } from 'lucide-react';
import Button from '../components/ui/Button';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6 text-center">
      <div className="w-20 h-20 rounded-3xl bg-brand-600/20 border border-brand-500/30 flex items-center justify-center mb-8">
        <Zap size={36} className="text-brand-500" />
      </div>

      <h1 className="text-8xl md:text-9xl font-black gradient-text mb-4">404</h1>
      <h2 className="text-2xl font-bold text-foreground mb-3">Page not found</h2>
      <p className="text-muted-foreground text-lg max-w-md mb-8">
        The page you're looking for doesn't exist or has been moved.
      </p>

      <div className="flex gap-3">
        <Link to="/">
          <Button variant="outline" leftIcon={<ArrowLeft size={16} />}>
            Go home
          </Button>
        </Link>
        <Link to="/dashboard">
          <Button>Dashboard</Button>
        </Link>
      </div>
    </div>
  );
}
