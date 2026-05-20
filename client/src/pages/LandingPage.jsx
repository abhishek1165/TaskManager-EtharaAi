import React from 'react';
import { Link } from 'react-router-dom';
import { Zap, CheckSquare, Users, BarChart3, Shield, ArrowRight, Star } from 'lucide-react';
import Button from '../components/ui/Button';

const features = [
  { icon: CheckSquare, title: 'Task Management',  desc: 'Create, assign, and track tasks with Kanban boards and priority levels.' },
  { icon: Users,       title: 'Team Collaboration',desc: 'Invite members, assign roles, and collaborate in real time.' },
  { icon: BarChart3,   title: 'Analytics Dashboard',desc: 'Monitor project health, completion rates, and team performance.' },
  { icon: Shield,      title: 'Role-Based Access', desc: 'Control who can create, edit, or view with Admin and Member roles.' },
];

const stats = [
  { label: 'Tasks Managed',   value: '50K+' },
  { label: 'Teams Worldwide', value: '2K+' },
  { label: 'Uptime',          value: '99.9%' },
  { label: 'Happy Users',     value: '10K+' },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <header className="border-b border-border sticky top-0 bg-background/80 backdrop-blur-md z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center shadow-glow-sm">
              <Zap size={18} className="text-white" />
            </div>
            <span className="font-bold text-xl gradient-text">TaskFlow</span>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/login">
              <Button variant="ghost" size="sm">Sign In</Button>
            </Link>
            <Link to="/signup">
              <Button size="sm">Get Started Free</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden py-24 md:py-36">
        {/* Background glow */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-brand-600/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-0 w-[600px] h-[300px] bg-purple-600/5 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-brand-500/30 bg-brand-500/10 text-brand-400 text-sm font-medium mb-6 animate-fade-in">
            <Star size={14} className="fill-current" />
            <span>Built for modern product teams</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-extrabold text-foreground mb-6 tracking-tight text-balance animate-fade-in">
            Manage teams &{' '}
            <span className="gradient-text">ship projects</span> faster
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto text-balance animate-fade-in">
            TaskFlow is a collaborative project management platform with Kanban boards,
            role-based access, real-time notifications, and powerful analytics — all in one place.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in">
            <Link to="/signup">
              <Button size="lg" rightIcon={<ArrowRight size={18} />}>
                Start for free
              </Button>
            </Link>
            <Link to="/login">
              <Button size="lg" variant="outline">
                Sign in to dashboard
              </Button>
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-20 pt-10 border-t border-border">
            {stats.map(({ label, value }) => (
              <div key={label} className="text-center">
                <p className="text-3xl font-bold gradient-text">{value}</p>
                <p className="text-sm text-muted-foreground mt-1">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 bg-secondary/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Everything your team needs
            </h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">
              From task creation to project delivery, TaskFlow has every tool you need.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map(({ icon: Icon, title, desc }) => (
              <div
                key={title}
                className="group p-6 rounded-2xl border border-border bg-card hover:border-brand-500/50 hover:shadow-glow-sm transition-all duration-300"
              >
                <div className="w-12 h-12 rounded-xl bg-brand-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Icon size={24} className="text-brand-500" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">{title}</h3>
                <p className="text-sm text-muted-foreground">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-4xl font-bold text-foreground mb-4">
            Ready to get started?
          </h2>
          <p className="text-muted-foreground text-lg mb-8">
            Join thousands of teams already using TaskFlow.
          </p>
          <Link to="/signup">
            <Button size="xl" rightIcon={<ArrowRight size={20} />}>
              Create your free account
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Zap size={16} className="text-brand-500" />
            <span className="font-semibold text-foreground">TaskFlow</span>
          </div>
          <p className="text-sm text-muted-foreground">© 2025 TaskFlow. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
