import React, { useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Camera, Save, Lock } from 'lucide-react';
import { updateUserProfile } from '../redux/slices/authSlice';
import Button from '../components/ui/Button';
import { Input, Textarea } from '../components/ui/FormFields';
import { addToast } from '../redux/slices/uiSlice';
import { authService } from '../services/auth.service';
import { getInitials } from '../utils/cn';

const profileSchema = z.object({
  name: z.string().min(2, 'Min 2 characters').max(50),
  bio: z.string().max(200).optional(),
});

const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'Required'),
  newPassword: z.string().min(6, 'Min 6 characters'),
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
    } catch (err) {
      dispatch(addToast({ type: 'error', title: err.response?.data?.message || 'Failed to change password' }));
    } finally {
      setPasswordLoading(false);
    }
  };

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
          <Input
            id="current-password"
            label="Current password"
            type="password"
            error={passwordForm.formState.errors.currentPassword?.message}
            {...passwordForm.register('currentPassword')}
          />
          <Input
            id="new-password"
            label="New password"
            type="password"
            placeholder="Min 6 characters"
            error={passwordForm.formState.errors.newPassword?.message}
            {...passwordForm.register('newPassword')}
          />
          <Input
            id="confirm-new-password"
            label="Confirm new password"
            type="password"
            error={passwordForm.formState.errors.confirmPassword?.message}
            {...passwordForm.register('confirmPassword')}
          />
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
