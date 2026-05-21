import React, { useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Camera, Save, Lock, Eye, EyeOff, Check, X } from 'lucide-react';
import { updateUserProfile } from '../redux/slices/authSlice';
import Button from '../components/ui/Button';
import { Input, Textarea } from '../components/ui/FormFields';
import { addToast } from '../redux/slices/uiSlice';
import { authService } from '../services/auth.service';
import { getInitials } from '../utils/cn';

// ─── Password strength helpers (same as SignupPage) ──────────────────────────────
const passwordRules = [
  { id: 'length',  label: 'At least 8 characters',        test: (p) => p.length >= 8 },
  { id: 'upper',   label: 'One uppercase letter (A–Z)',    test: (p) => /[A-Z]/.test(p) },
  { id: 'number',  label: 'One number (0–9)',              test: (p) => /[0-9]/.test(p) },
  { id: 'special', label: 'One special character (!@#…)', test: (p) => /[^A-Za-z0-9]/.test(p) },
];
function getStrength(p) {
  const s = passwordRules.filter((r) => r.test(p)).length;
  if (s <= 1) return { score: s, label: 'Weak',   color: 'bg-red-500' };
  if (s === 2) return { score: s, label: 'Fair',   color: 'bg-orange-400' };
  if (s === 3) return { score: s, label: 'Good',   color: 'bg-yellow-400' };
  return            { score: s, label: 'Strong',  color: 'bg-green-500' };
}

const profileSchema = z.object({
  name: z.string().min(2, 'Min 2 characters').max(50),
  bio: z.string().max(200).optional(),
});

const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'Required'),
  newPassword: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Must contain at least one special character'),
  confirmPassword: z.string(),
}).refine((d) => d.newPassword === d.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

export default function ProfilePage() {
  const dispatch = useDispatch();
  const { user } = useSelector((s) => s.auth);
  const fileRef = useRef(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [avatarFile, setAvatarFile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [newPasswordValue, setNewPasswordValue] = useState('');

  const profileForm = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: { name: user?.name || '', bio: user?.bio || '' },
  });

  const passwordForm = useForm({
    resolver: zodResolver(passwordSchema),
  });

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const onProfileSubmit = async (data) => {
    setProfileLoading(true);
    const payload = { ...data };
    if (avatarFile) payload.avatar = avatarFile;
    const result = await dispatch(updateUserProfile(payload));
    setProfileLoading(false);
    if (updateUserProfile.fulfilled.match(result)) {
      dispatch(addToast({ type: 'success', title: 'Profile updated' }));
    } else {
      dispatch(addToast({ type: 'error', title: 'Update failed' }));
    }
  };

  const onPasswordSubmit = async (data) => {
    setPasswordLoading(true);
    try {
      await authService.changePassword({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });
      dispatch(addToast({ type: 'success', title: 'Password changed successfully' }));
      passwordForm.reset();
      setNewPasswordValue('');
    } catch (err) {
      dispatch(addToast({ type: 'error', title: err.response?.data?.message || 'Failed to change password' }));
    } finally {
      setPasswordLoading(false);
    }
  };

  const strength = getStrength(newPasswordValue);
  const avatarSrc = avatarPreview || user?.avatar;

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Profile</h1>
        <p className="text-muted-foreground text-sm mt-1">Manage your account settings</p>
      </div>

      {/* Profile Card */}
      <div className="rounded-xl border border-border bg-card p-6 space-y-6">
        <h2 className="text-base font-semibold text-foreground">Personal Information</h2>

        {/* Avatar */}
        <div className="flex items-center gap-5">
          <div className="relative group">
            <div className="w-20 h-20 rounded-full bg-brand-600 flex items-center justify-center text-white text-2xl font-bold overflow-hidden ring-4 ring-border">
              {avatarSrc ? (
                <img src={avatarSrc} alt={user?.name} className="w-full h-full object-cover" />
              ) : (
                <span>{getInitials(user?.name)}</span>
              )}
            </div>
            <button
              onClick={() => fileRef.current?.click()}
              className="absolute inset-0 rounded-full flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity text-white"
            >
              <Camera size={20} />
            </button>
          </div>
          <input ref={fileRef} type="file" className="hidden" accept="image/*" onChange={handleAvatarChange} />
          <div>
            <p className="text-sm font-medium text-foreground">{user?.name}</p>
            <p className="text-sm text-muted-foreground">{user?.email}</p>
            <button
              onClick={() => fileRef.current?.click()}
              className="text-xs text-primary hover:underline mt-1"
            >
              Change avatar
            </button>
          </div>
        </div>

        {/* Profile Form */}
        <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} id="profile-form" className="space-y-4">
          <Input
            id="profile-name"
            label="Full name"
            error={profileForm.formState.errors.name?.message}
            {...profileForm.register('name')}
          />
          <Textarea
            id="profile-bio"
            label="Bio"
            placeholder="Tell your team about yourself..."
            rows={3}
            error={profileForm.formState.errors.bio?.message}
            {...profileForm.register('bio')}
          />
          <div className="flex justify-end pt-2">
            <Button type="submit" leftIcon={<Save size={14} />} loading={profileLoading}>
              Save Changes
            </Button>
          </div>
        </form>
      </div>

      {/* Password Card */}
      <div className="rounded-xl border border-border bg-card p-6 space-y-4">
        <div className="flex items-center gap-2">
          <Lock size={18} className="text-muted-foreground" />
          <h2 className="text-base font-semibold text-foreground">Change Password</h2>
        </div>

        <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} id="password-form" className="space-y-4">
          {/* Current password */}
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-foreground">Current password</label>
            <div className="relative">
              <input
                id="current-password"
                type={showCurrent ? 'text' : 'password'}
                className={`w-full px-3 py-2.5 pr-10 text-sm rounded-lg border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all ${passwordForm.formState.errors.currentPassword ? 'border-destructive' : 'border-border'}`}
                {...passwordForm.register('currentPassword')}
              />
              <button type="button" onClick={() => setShowCurrent(!showCurrent)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                {showCurrent ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {passwordForm.formState.errors.currentPassword && (
              <p className="text-xs text-destructive mt-1">{passwordForm.formState.errors.currentPassword.message}</p>
            )}
          </div>

          {/* New password with strength meter */}
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-foreground">New password</label>
            <div className="relative">
              <input
                id="new-password"
                type={showNew ? 'text' : 'password'}
                placeholder="Min 8 characters"
                className={`w-full px-3 py-2.5 pr-10 text-sm rounded-lg border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all ${passwordForm.formState.errors.newPassword ? 'border-destructive' : 'border-border'}`}
                {...passwordForm.register('newPassword', { onChange: (e) => setNewPasswordValue(e.target.value) })}
              />
              <button type="button" onClick={() => setShowNew(!showNew)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {passwordForm.formState.errors.newPassword && (
              <p className="text-xs text-destructive mt-1">{passwordForm.formState.errors.newPassword.message}</p>
            )}
            {newPasswordValue.length > 0 && (
              <div className="mt-2 space-y-2">
                <div className="flex gap-1 items-center">
                  {[1,2,3,4].map((i) => (
                    <div key={i} className={`h-1 flex-1 rounded-full transition-all duration-300 ${i <= strength.score ? strength.color : 'bg-border'}`} />
                  ))}
                  <span className="text-xs text-muted-foreground ml-1 whitespace-nowrap">{strength.label}</span>
                </div>
                <div className="space-y-1">
                  {passwordRules.map((rule) => {
                    const ok = rule.test(newPasswordValue);
                    return (
                      <div key={rule.id} className={`flex items-center gap-1.5 text-xs transition-colors ${ok ? 'text-green-500' : 'text-muted-foreground'}`}>
                        {ok ? <Check size={11} /> : <X size={11} />}
                        {rule.label}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Confirm new password */}
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-foreground">Confirm new password</label>
            <div className="relative">
              <input
                id="confirm-new-password"
                type={showConfirm ? 'text' : 'password'}
                placeholder="••••••••"
                className={`w-full px-3 py-2.5 pr-10 text-sm rounded-lg border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all ${passwordForm.formState.errors.confirmPassword ? 'border-destructive' : 'border-border'}`}
                {...passwordForm.register('confirmPassword')}
              />
              <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {passwordForm.formState.errors.confirmPassword && (
              <p className="text-xs text-destructive mt-1">{passwordForm.formState.errors.confirmPassword.message}</p>
            )}
          </div>
          <div className="flex justify-end">
            <Button type="submit" variant="outline" loading={passwordLoading}>
              Update Password
            </Button>
          </div>
        </form>
      </div>

      {/* Account Info */}
      <div className="rounded-xl border border-border bg-card p-6">
        <h2 className="text-base font-semibold text-foreground mb-4">Account Information</h2>
        <dl className="space-y-3">
          {[
            { label: 'Email', value: user?.email },
            { label: 'Role', value: user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : '—' },
            { label: 'Member since', value: user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : '—' },
          ].map(({ label, value }) => (
            <div key={label} className="flex justify-between items-center py-2 border-b border-border last:border-0">
              <dt className="text-sm text-muted-foreground">{label}</dt>
              <dd className="text-sm font-medium text-foreground">{value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  );
}
