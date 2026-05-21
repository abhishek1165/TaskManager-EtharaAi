import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, Zap, ArrowRight, Check, X } from 'lucide-react';
import { registerUser, clearError } from '../redux/slices/authSlice';
import Button from '../components/ui/Button';
import { Input, Select } from '../components/ui/FormFields';

// ─── Password strength helpers ────────────────────────────────────────────────
const passwordRules = [
  { id: 'length',    label: 'At least 8 characters',         test: (p) => p.length >= 8 },
  { id: 'upper',     label: 'One uppercase letter (A–Z)',     test: (p) => /[A-Z]/.test(p) },
  { id: 'number',    label: 'One number (0–9)',               test: (p) => /[0-9]/.test(p) },
  { id: 'special',   label: 'One special character (!@#$…)',  test: (p) => /[^A-Za-z0-9]/.test(p) },
];

function getStrength(password) {
  const passed = passwordRules.filter((r) => r.test(password)).length;
  if (passed <= 1) return { score: passed, label: 'Weak',      color: 'bg-red-500' };
  if (passed === 2) return { score: passed, label: 'Fair',      color: 'bg-orange-400' };
  if (passed === 3) return { score: passed, label: 'Good',      color: 'bg-yellow-400' };
  return               { score: passed, label: 'Strong',     color: 'bg-green-500' };
}

const schema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(50),
  email: z.string().email('Enter a valid email'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Must contain at least one special character'),
  confirmPassword: z.string(),
  role: z.enum(['admin', 'member']),
}).refine((d) => d.password === d.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

export default function SignupPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((s) => s.auth);
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [passwordValue, setPasswordValue] = useState('');

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { role: 'member' },
  });

  const strength = getStrength(passwordValue);

  const onSubmit = async (data) => {
    dispatch(clearError());
    const { confirmPassword, ...rest } = data;
    const result = await dispatch(registerUser(rest));
    if (registerUser.fulfilled.match(result)) {
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-[hsl(var(--sidebar-bg))] to-brand-900 relative overflow-hidden items-center justify-center p-12">
        <div className="absolute inset-0 opacity-20" style={{
          backgroundImage: 'radial-gradient(circle at 25% 50%, #6366f1 0%, transparent 50%), radial-gradient(circle at 75% 50%, #8b5cf6 0%, transparent 50%)',
        }} />
        <div className="relative text-center">
          <div className="w-20 h-20 rounded-3xl bg-brand-600 flex items-center justify-center mx-auto mb-6 shadow-glow">
            <Zap size={40} className="text-white" />
          </div>
          <h2 className="text-4xl font-bold text-white mb-4">Join TaskFlow</h2>
          <p className="text-slate-300 text-lg max-w-sm mx-auto">
            Create your account and start managing your projects and team today.
          </p>
        </div>
      </div>

      {/* Form */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center">
              <Zap size={18} className="text-white" />
            </div>
            <span className="font-bold text-xl gradient-text">TaskFlow</span>
          </div>

          <h1 className="text-3xl font-bold text-foreground mb-2">Create account</h1>
          <p className="text-muted-foreground mb-8">
            Already have an account?{' '}
            <Link to="/login" className="text-primary hover:underline font-medium">Sign in</Link>
          </p>

          {error && (
            <div className="mb-5 p-4 rounded-lg bg-destructive/10 border border-destructive/30 text-destructive text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" id="signup-form">
            <Input
              id="name"
              label="Full name"
              placeholder="John Doe"
              error={errors.name?.message}
              {...register('name')}
            />

            <Input
              id="signup-email"
              label="Email address"
              type="email"
              placeholder="you@example.com"
              error={errors.email?.message}
              {...register('email')}
            />

            <Select
              id="role"
              label="Account type"
              error={errors.role?.message}
              {...register('role')}
            >
              <option value="member">Member</option>
              <option value="admin">Admin</option>
            </Select>

            {/* Password field with strength meter */}
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-foreground">Password</label>
              <div className="relative">
                <input
                  id="signup-password"
                  type={showPass ? 'text' : 'password'}
                  placeholder="Min 8 characters"
                  className={`w-full px-3 py-2.5 pr-10 text-sm rounded-lg border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all ${errors.password ? 'border-destructive' : 'border-border'}`}
                  {...register('password', { onChange: (e) => setPasswordValue(e.target.value) })}
                />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-destructive mt-1">{errors.password.message}</p>}

              {/* Strength bar — only shown when user starts typing */}
              {passwordValue.length > 0 && (
                <div className="mt-2 space-y-2">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                          i <= strength.score ? strength.color : 'bg-border'
                        }`}
                      />
                    ))}
                    <span className="text-xs text-muted-foreground ml-1 whitespace-nowrap">{strength.label}</span>
                  </div>
                  <div className="space-y-1">
                    {passwordRules.map((rule) => {
                      const ok = rule.test(passwordValue);
                      return (
                        <div key={rule.id} className={`flex items-center gap-1.5 text-xs transition-colors ${
                          ok ? 'text-green-500' : 'text-muted-foreground'
                        }`}>
                          {ok ? <Check size={11} /> : <X size={11} />}
                          {rule.label}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Confirm password */}
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-foreground">Confirm password</label>
              <div className="relative">
                <input
                  id="confirm-password"
                  type={showConfirm ? 'text' : 'password'}
                  placeholder="••••••••"
                  className={`w-full px-3 py-2.5 pr-10 text-sm rounded-lg border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all ${errors.confirmPassword ? 'border-destructive' : 'border-border'}`}
                  {...register('confirmPassword')}
                />
                <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.confirmPassword && <p className="text-xs text-destructive mt-1">{errors.confirmPassword.message}</p>}
            </div>

            <Button type="submit" className="w-full" size="lg" loading={loading} rightIcon={<ArrowRight size={18} />}>
              Create account
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
