import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore.js';
import { authApi } from '../../services/auth.api.js';
import { Button } from '../../components/ui/Button.js';
import { Input } from '../../components/ui/Input.js';
import { Card } from '../../components/ui/Card.js';
import { Dumbbell, Lock, Phone, AlertCircle, Sparkles, ShieldCheck, UserCheck, User } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const { login } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogin = async (e?: React.FormEvent, customPhone?: string, customPass?: string) => {
    if (e) e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    const loginPhone = customPhone || phone;
    const loginPassword = customPass || password;

    try {
      const res = await authApi.login({ phone: loginPhone, password: loginPassword });
      if (res.success && res.data) {
        login(res.data.tokens, res.data.user);

        // Redirect based on role
        const userRole = res.data.user.role;
        if (userRole === 'owner') {
          navigate('/admin', { replace: true });
        } else if (userRole === 'trainer') {
          navigate('/trainer', { replace: true });
        } else {
          navigate('/member', { replace: true });
        }
      } else {
        setErrorMessage(res.error?.message || 'Login failed. Please check your credentials.');
      }
    } catch (err: any) {
      setErrorMessage(
        err.response?.data?.error?.message || 'Invalid phone number or password'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickDemoLogin = (demoPhone: string, demoPass: string) => {
    setPhone(demoPhone);
    setPassword(demoPass);
    handleLogin(undefined, demoPhone, demoPass);
  };

  return (
    <div className="min-h-screen bg-charcoal-950 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center space-y-3">
        {/* Brand */}
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-lime-500 text-charcoal-950 shadow-lime-glow mx-auto">
          <Dumbbell className="w-8 h-8 font-black" />
        </div>
        <div>
          <h1 className="text-3xl font-black tracking-tight text-white">
            Fit<span className="text-lime-500">Core</span>
          </h1>
          <p className="text-xs text-slate-400 font-medium mt-1">
            Gym Membership, Attendance & Loyalty Platform
          </p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <Card className="p-7 space-y-6 shadow-2xl border-charcoal-750">
          <div className="border-b border-charcoal-700/60 pb-3">
            <h2 className="text-lg font-bold text-white">Sign In to Your Account</h2>
            <p className="text-xs text-slate-400">Enter your registered Indian phone number</p>
          </div>

          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <Input
              label="Phone Number (+91)"
              placeholder="9876543210 or +919876543210"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              leftIcon={<Phone className="w-4 h-4" />}
              required
            />

            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              leftIcon={<Lock className="w-4 h-4" />}
              required
            />

            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Forgot password?</span>
              <Link
                to="/forgot-password"
                className="text-lime-400 font-semibold hover:text-lime-300"
              >
                Reset via OTP
              </Link>
            </div>

            <Button
              type="submit"
              variant="lime"
              className="w-full font-bold text-sm py-3"
              isLoading={isLoading}
            >
              Sign In
            </Button>
          </form>

          {/* Quick Demo Logins Helper */}
          <div className="pt-2 border-t border-charcoal-750 space-y-2">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 text-center">
              Quick 1-Click Demo Accounts
            </p>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleQuickDemoLogin('+919876543210', 'Admin@123')}
                className="flex flex-col items-center p-2 rounded-xl bg-charcoal-750 hover:bg-charcoal-700 border border-charcoal-700 text-[11px] font-bold text-purple-300 transition-colors"
              >
                <ShieldCheck className="w-4 h-4 text-purple-400 mb-1" />
                Admin (Owner)
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemoLogin('+919876543211', 'Trainer@123')}
                className="flex flex-col items-center p-2 rounded-xl bg-charcoal-750 hover:bg-charcoal-700 border border-charcoal-700 text-[11px] font-bold text-sky-300 transition-colors"
              >
                <UserCheck className="w-4 h-4 text-sky-400 mb-1" />
                Head Trainer
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemoLogin('+919876543212', 'Member@123')}
                className="flex flex-col items-center p-2 rounded-xl bg-charcoal-750 hover:bg-charcoal-700 border border-charcoal-700 text-[11px] font-bold text-lime-300 transition-colors"
              >
                <User className="w-4 h-4 text-lime-400 mb-1" />
                Member (Priya)
              </button>
            </div>
          </div>

          <div className="text-center text-xs text-slate-400 pt-1">
            New to FitCore?{' '}
            <Link to="/register" className="font-bold text-lime-400 hover:text-lime-300">
              Create an account
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
};
