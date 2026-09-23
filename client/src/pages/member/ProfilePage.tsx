import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../../store/authStore.js';
import { useThemeStore } from '../../store/themeStore.js';
import { usersApi } from '../../services/users.api.js';
import { authApi } from '../../services/auth.api.js';
import { Card, CardHeader, CardTitle } from '../../components/ui/Card.js';
import { Input } from '../../components/ui/Input.js';
import { Button } from '../../components/ui/Button.js';
import { Badge } from '../../components/ui/Badge.js';
import { DigitalPassModal } from '../../components/common/DigitalPassModal.js';
import {
  User,
  Phone,
  Mail,
  Lock,
  QrCode,
  Moon,
  Sun,
  LogOut,
  AlertCircle,
  CheckCircle2,
  ShieldCheck,
  MapPin,
  Calendar,
  Heart,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const ProfilePage: React.FC = () => {
  const { user, updateUser, logout } = useAuthStore();
  const { theme, toggleTheme } = useThemeStore();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState(user?.fullName || '');
  const [email, setEmail] = useState(user?.email || '');
  const [dob, setDob] = useState(user?.profile?.dob?.slice(0, 10) || '');
  const [bloodGroup, setBloodGroup] = useState(user?.profile?.bloodGroup || '');
  const [gender, setGender] = useState(user?.profile?.gender || '');
  const [street, setStreet] = useState(user?.profile?.address?.street || '');
  const [city, setCity] = useState(user?.profile?.address?.city || '');
  const [state, setState] = useState(user?.profile?.address?.state || '');
  const [pincode, setPincode] = useState(user?.profile?.address?.pincode || '');

  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [profileSuccessMsg, setProfileSuccessMsg] = useState<string | null>(null);
  const [profileErrorMsg, setProfileErrorMsg] = useState<string | null>(null);

  // Change Password state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isChangingPass, setIsChangingPass] = useState(false);
  const [passSuccessMsg, setPassSuccessMsg] = useState<string | null>(null);
  const [passErrorMsg, setPassErrorMsg] = useState<string | null>(null);

  const [isOpenPass, setIsOpenPass] = useState(false);

  useEffect(() => {
    if (user) {
      setFullName(user.fullName || '');
      setEmail(user.email || '');
      setDob(user.profile?.dob?.slice(0, 10) || '');
      setBloodGroup(user.profile?.bloodGroup || '');
      setGender(user.profile?.gender || '');
      setStreet(user.profile?.address?.street || '');
      setCity(user.profile?.address?.city || '');
      setState(user.profile?.address?.state || '');
      setPincode(user.profile?.address?.pincode || '');
    }
  }, [user]);

  const hasExistingEmail = !!user?.email;

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdatingProfile(true);
    setProfileSuccessMsg(null);
    setProfileErrorMsg(null);

    try {
      const payload: any = {
        fullName: fullName.trim(),
        dob: dob ? new Date(dob) : undefined,
        bloodGroup: bloodGroup.trim(),
        gender,
        address: {
          street: street.trim(),
          city: city.trim(),
          state: state.trim(),
          pincode: pincode.trim(),
        },
      };

      // Only send email if user had none
      if (!hasExistingEmail && email.trim()) {
        payload.email = email.trim();
      }

      const res = await usersApi.updateMe(payload);
      if (res.success && res.data) {
        updateUser(res.data);
        setProfileSuccessMsg('Profile updated successfully!');
      } else {
        setProfileErrorMsg(res.error?.message || 'Failed to update profile');
      }
    } catch (err: any) {
      setProfileErrorMsg(err.response?.data?.error?.message || 'Failed to update profile');
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setPassErrorMsg('New passwords do not match');
      return;
    }

    setIsChangingPass(true);
    setPassSuccessMsg(null);
    setPassErrorMsg(null);

    try {
      const res = await authApi.changePassword({ currentPassword, newPassword });
      if (res.success) {
        setPassSuccessMsg('Password changed successfully!');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setPassErrorMsg(res.error?.message || 'Failed to change password');
      }
    } catch (err: any) {
      setPassErrorMsg(err.response?.data?.error?.message || 'Failed to change password');
    } finally {
      setIsChangingPass(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      {/* Header with Digital Pass Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Account & Profile
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Manage your personal profile, security credentials, and access your digital pass.
          </p>
        </div>

        <Button
          variant="lime"
          className="gap-2 font-bold shadow-lime-glow-sm shrink-0"
          onClick={() => setIsOpenPass(true)}
        >
          <QrCode className="w-4 h-4" />
          View Digital Pass
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Info Form (2 Cols) */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-6 space-y-5">
            <CardHeader className="mb-0">
              <div className="flex items-center gap-2">
                <User className="w-5 h-5 text-lime-400" />
                <CardTitle>Personal Details</CardTitle>
              </div>
            </CardHeader>

            {profileSuccessMsg && (
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{profileSuccessMsg}</span>
              </div>
            )}

            {profileErrorMsg && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{profileErrorMsg}</span>
              </div>
            )}

            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <Input
                label="Full Name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />

              {/* Locked Phone */}
              <div className="space-y-1.5">
                <Input
                  label="Phone Number"
                  value={user?.phone || ''}
                  disabled
                  leftIcon={<Phone className="w-4 h-4" />}
                  rightIcon={
                    <span title="Phone is locked">
                      <Lock className="w-4 h-4 text-slate-500" />
                    </span>
                  }
                  helperText="Primary login phone number cannot be modified"
                />
              </div>

              {/* Locked / Editable Email */}
              <div className="space-y-1.5">
                <Input
                  label="Email Address"
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={hasExistingEmail}
                  leftIcon={<Mail className="w-4 h-4" />}
                  rightIcon={
                    hasExistingEmail ? (
                      <span title="Email is locked once set">
                        <Lock className="w-4 h-4 text-slate-500" />
                      </span>
                    ) : undefined
                  }
                  helperText={
                    hasExistingEmail
                      ? 'Email address is locked and cannot be changed'
                      : 'You can set your email address once'
                  }
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <Input
                  label="Date of Birth"
                  type="date"
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                />

                <Input
                  label="Blood Group"
                  placeholder="e.g. O+"
                  value={bloodGroup}
                  onChange={(e) => setBloodGroup(e.target.value)}
                />

                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Gender
                  </label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="w-full bg-charcoal-850 border border-charcoal-700 text-slate-100 rounded-xl px-3.5 py-2.5 text-sm outline-none focus:border-lime-500"
                  >
                    <option value="">Select</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                    <option value="prefer_not_to_say">Prefer not to say</option>
                  </select>
                </div>
              </div>

              {/* Address Fields */}
              <div className="space-y-3 pt-2 border-t border-charcoal-750">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Residential Address
                </p>

                <Input
                  placeholder="Street / Apartment / Area"
                  value={street}
                  onChange={(e) => setStreet(e.target.value)}
                />

                <div className="grid grid-cols-3 gap-2">
                  <Input
                    placeholder="City"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                  />
                  <Input
                    placeholder="State"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                  />
                  <Input
                    placeholder="Pincode"
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value)}
                  />
                </div>
              </div>

              <Button type="submit" variant="lime" className="w-full font-bold" isLoading={isUpdatingProfile}>
                Save Profile Changes
              </Button>
            </form>
          </Card>
        </div>

        {/* Security & App Preferences Sidebar (1 Col) */}
        <div className="space-y-6">
          {/* Change Password Card */}
          <Card className="p-5 space-y-4">
            <CardHeader className="mb-0">
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-lime-400" />
                <CardTitle className="text-base">Change Password</CardTitle>
              </div>
            </CardHeader>

            {passSuccessMsg && (
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{passSuccessMsg}</span>
              </div>
            )}

            {passErrorMsg && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{passErrorMsg}</span>
              </div>
            )}

            <form onSubmit={handleChangePassword} className="space-y-3">
              <Input
                label="Current Password"
                type="password"
                placeholder="••••••••"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
              />

              <Input
                label="New Password"
                type="password"
                placeholder="Min 6 characters"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />

              <Input
                label="Confirm New Password"
                type="password"
                placeholder="Re-enter password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />

              <Button type="submit" variant="secondary" className="w-full text-xs font-bold" isLoading={isChangingPass}>
                Update Password
              </Button>
            </form>
          </Card>

          {/* Preferences & Logout */}
          <Card className="p-5 space-y-4">
            <h3 className="font-bold text-sm text-slate-200">App Preferences</h3>

            <div className="flex items-center justify-between py-1">
              <span className="text-xs text-slate-300">Theme</span>
              <Button variant="secondary" size="sm" onClick={toggleTheme} className="gap-2 text-xs">
                {theme === 'dark' ? (
                  <>
                    <Sun className="w-3.5 h-3.5 text-amber-400" /> Light Mode
                  </>
                ) : (
                  <>
                    <Moon className="w-3.5 h-3.5 text-slate-400" /> Dark Mode
                  </>
                )}
              </Button>
            </div>

            <div className="pt-3 border-t border-charcoal-750">
              <Button
                variant="danger"
                className="w-full text-xs font-bold gap-2"
                onClick={handleLogout}
              >
                <LogOut className="w-4 h-4" />
                Log Out
              </Button>
            </div>
          </Card>
        </div>
      </div>

      {/* Digital Pass Modal */}
      <DigitalPassModal
        user={user}
        subscription={typeof user?.activeSubscription === 'object' ? (user.activeSubscription as any) : null}
        isOpen={isOpenPass}
        onClose={() => setIsOpenPass(false)}
      />
    </div>
  );
};
