import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authApi } from '../../services/auth.api.js';
import { Button } from '../../components/ui/Button.js';
import { Input } from '../../components/ui/Input.js';
import { Card } from '../../components/ui/Card.js';
import { Dumbbell, Phone, KeyRound, Lock, AlertCircle, CheckCircle2, ArrowLeft } from 'lucide-react';

export const ForgotPasswordPage: React.FC = () => {
  const [step, setStep] = useState<'phone' | 'otp' | 'password'>('phone');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [devOtp, setDevOtp] = useState<string | null>(null);
  const [resetToken, setResetToken] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const navigate = useNavigate();

  // Step 1: Send OTP
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const res = await authApi.sendOtp(phone);
      if (res.success) {
        if (res.data?.devOtp) {
          setDevOtp(res.data.devOtp);
          setOtp(res.data.devOtp); // Auto-fill in dev
        }
        setStep('otp');
        setSuccessMessage('OTP sent! Please check your phone.');
      } else {
        setErrorMessage(res.error?.message || 'Failed to send OTP');
      }
    } catch (err: any) {
      setErrorMessage(err.response?.data?.error?.message || 'Failed to send OTP');
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const res = await authApi.verifyOtp({ phone, otp });
      if (res.success && res.data?.resetToken) {
        setResetToken(res.data.resetToken);
        setStep('password');
        setSuccessMessage('OTP verified. Set your new password.');
      } else {
        setErrorMessage(res.error?.message || 'Invalid or expired OTP');
      }
    } catch (err: any) {
      setErrorMessage(err.response?.data?.error?.message || 'Invalid OTP entered');
    } finally {
      setIsLoading(false);
    }
  };

  // Step 3: Reset Password
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setErrorMessage('Passwords do not match');
      return;
    }

    if (!resetToken) return;

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const res = await authApi.resetPassword({ resetToken, newPassword });
      if (res.success) {
        setSuccessMessage('Password reset successfully! Redirecting to login...');
        setTimeout(() => {
          navigate('/login');
        }, 1500);
      } else {
        setErrorMessage(res.error?.message || 'Failed to reset password');
      }
    } catch (err: any) {
      setErrorMessage(err.response?.data?.error?.message || 'Failed to reset password');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-charcoal-950 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center space-y-3">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-lime-500 text-charcoal-950 shadow-lime-glow mx-auto">
          <Dumbbell className="w-8 h-8 font-black" />
        </div>
        <div>
          <h1 className="text-3xl font-black tracking-tight text-white">Reset Password</h1>
          <p className="text-xs text-slate-400 font-medium mt-1">
            Recover access to your FitCore account
          </p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <Card className="p-7 space-y-6 shadow-2xl border-charcoal-750">
          <div className="flex items-center justify-between border-b border-charcoal-700/60 pb-3">
            <h2 className="text-base font-bold text-white">
              {step === 'phone'
                ? 'Step 1: Enter Phone Number'
                : step === 'otp'
                ? 'Step 2: Enter 6-Digit OTP'
                : 'Step 3: Set New Password'}
            </h2>
            <Link to="/login" className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1">
              <ArrowLeft className="w-3.5 h-3.5" /> Back
            </Link>
          </div>

          {devOtp && step === 'otp' && (
            <div className="p-3 rounded-xl bg-lime-500/15 border border-lime-500/30 text-lime-400 text-xs">
              <p className="font-bold">Development Mock SMS OTP:</p>
              <p className="font-mono text-sm tracking-widest mt-0.5">{devOtp}</p>
            </div>
          )}

          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{successMessage}</span>
            </div>
          )}

          {step === 'phone' && (
            <form onSubmit={handleSendOtp} className="space-y-4">
              <Input
                label="Registered Phone Number"
                placeholder="9876543210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                leftIcon={<Phone className="w-4 h-4" />}
                required
              />
              <Button type="submit" variant="lime" className="w-full font-bold text-sm py-3" isLoading={isLoading}>
                Send Verification OTP
              </Button>
            </form>
          )}

          {step === 'otp' && (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <Input
                label="6-Digit OTP Code"
                placeholder="123456"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                leftIcon={<KeyRound className="w-4 h-4" />}
                required
              />
              <Button type="submit" variant="lime" className="w-full font-bold text-sm py-3" isLoading={isLoading}>
                Verify OTP & Proceed
              </Button>
            </form>
          )}

          {step === 'password' && (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <Input
                label="New Password"
                type="password"
                placeholder="Min 6 characters"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                leftIcon={<Lock className="w-4 h-4" />}
                required
              />
              <Input
                label="Confirm New Password"
                type="password"
                placeholder="Re-enter new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                leftIcon={<Lock className="w-4 h-4" />}
                required
              />
              <Button type="submit" variant="lime" className="w-full font-bold text-sm py-3" isLoading={isLoading}>
                Update Password
              </Button>
            </form>
          )}
        </Card>
      </div>
    </div>
  );
};
