import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, Zap, ArrowRight } from 'lucide-react';
import { loginUser, clearError } from '../redux/slices/authSlice';
import Button from '../components/ui/Button';
import { Input } from '../components/ui/FormFields';

const schema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(1, 'Password is required'),
});

export default function LoginPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((s) => s.auth);
  const [showPass, setShowPass] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data) => {
    dispatch(clearError());
    const result = await dispatch(loginUser(data));
    if (loginUser.fulfilled.match(result)) {
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left panel — decorative */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-[hsl(var(--sidebar-bg))] to-brand-900 relative overflow-hidden items-center justify-center p-12">
        <div className="absolute inset-0 opacity-20" style={{
          backgroundImage: 'radial-gradient(circle at 25% 50%, #6366f1 0%, transparent 50%), radial-gradient(circle at 75% 50%, #8b5cf6 0%, transparent 50%)',
        }} />
        <div className="relative text-center">
          <div className="w-20 h-20 rounded-3xl bg-brand-600 flex items-center justify-center mx-auto mb-6 shadow-glow">
            <Zap size={40} className="text-white" />
          </div>
          <h2 className="text-4xl font-bold text-white mb-4">Welcome back</h2>
          <p className="text-slate-300 text-lg max-w-sm mx-auto">
            Sign in to manage your team, track tasks, and ship projects faster.
          </p>

          {/* Feature pills */}
          <div className="flex flex-wrap gap-2 justify-center mt-8">
            {['Kanban Boards', 'Analytics', 'Notifications', 'Team Roles'].map((f) => (
              <span key={f} className="px-3 py-1.5 rounded-full bg-white/10 text-white/80 text-sm border border-white/20">
                {f}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center">
              <Zap size={18} className="text-white" />
            </div>
            <span className="font-bold text-xl gradient-text">TaskFlow</span>
          </div>

          <h1 className="text-3xl font-bold text-foreground mb-2">Sign in</h1>
          <p className="text-muted-foreground mb-8">
            Don't have an account?{' '}
            <Link to="/signup" className="text-primary hover:underline font-medium">
              Sign up
            </Link>
          </p>

          {error && (
            <div className="mb-5 p-4 rounded-lg bg-destructive/10 border border-destructive/30 text-destructive text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" id="login-form">
            <Input
              id="email"
              label="Email address"
              type="email"
              placeholder="you@example.com"
              error={errors.email?.message}
              {...register('email')}
            />

            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-foreground">Password</label>
              <div className="relative">
                <input
                  id="password"
                  type={showPass ? 'text' : 'password'}
                  placeholder="••••••••"
                  className={`w-full px-3 py-2.5 pr-10 text-sm rounded-lg border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all ${errors.password ? 'border-destructive' : 'border-border'}`}
                  {...register('password')}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
            </div>

            <Button
              type="submit"
              className="w-full"
              size="lg"
              loading={loading}
              rightIcon={<ArrowRight size={18} />}
            >
              Sign in
            </Button>
          </form>

          {/* Demo credentials hint */}
          <div className="mt-6 p-4 rounded-lg bg-secondary border border-border">
            <p className="text-xs text-muted-foreground font-medium mb-1">Demo credentials</p>
            <p className="text-xs text-muted-foreground">Admin: admin@taskflow.com / admin123</p>
          </div>
        </div>
      </div>
    </div>
  );
}
