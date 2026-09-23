import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore.js';
import { authApi } from '../../services/auth.api.js';
import { Button } from '../../components/ui/Button.js';
import { Input } from '../../components/ui/Input.js';
import { Card } from '../../components/ui/Card.js';
import { Dumbbell, Lock, Phone, User, Mail, Gift, AlertCircle, Sparkles } from 'lucide-react';

export const RegisterPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const refParam = searchParams.get('ref') || '';

  const [phone, setPhone] = useState('');
  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [referralCode, setReferralCode] = useState(refParam.toUpperCase());
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const { login } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (refParam) {
      setReferralCode(refParam.toUpperCase());
    }
  }, [refParam]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const res = await authApi.register({
        phone: phone.trim(),
        fullName: fullName.trim(),
        password,
        email: email.trim() || undefined,
        referralCode: referralCode.trim() || undefined,
      });

      if (res.success && res.data) {
        login(res.data.tokens, res.data.user);
        navigate('/member', { replace: true });
      } else {
        setErrorMessage(res.error?.message || 'Registration failed');
      }
    } catch (err: any) {
      setErrorMessage(
        err.response?.data?.error?.message || 'Registration failed. Please check your details.'
      );
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
          <h1 className="text-3xl font-black tracking-tight text-white">
            Join Fit<span className="text-lime-500">Core</span>
          </h1>
          <p className="text-xs text-slate-400 font-medium mt-1">
            Create your member account to buy plans and track attendance
          </p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <Card className="p-7 space-y-6 shadow-2xl border-charcoal-750">
          <div className="border-b border-charcoal-700/60 pb-3">
            <h2 className="text-lg font-bold text-white">Member Registration</h2>
            {refParam && (
              <div className="mt-2 p-2.5 rounded-xl bg-lime-500/15 border border-lime-500/30 text-lime-400 text-xs flex items-center gap-2">
                <Sparkles className="w-4 h-4 shrink-0" />
                <span>
                  Referral code <strong>{refParam}</strong> applied: ₹200 off your first plan!
                </span>
              </div>
            )}
          </div>

          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-4">
            <Input
              label="Full Name"
              placeholder="e.g. Arjun Sharma"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              leftIcon={<User className="w-4 h-4" />}
              required
            />

            <Input
              label="Phone Number (+91)"
              placeholder="9876543210"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              leftIcon={<Phone className="w-4 h-4" />}
              helperText="Phone number cannot be changed once registered"
              required
            />

            <Input
              label="Email Address (Optional)"
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              leftIcon={<Mail className="w-4 h-4" />}
            />

            <Input
              label="Password"
              type="password"
              placeholder="Min 6 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              leftIcon={<Lock className="w-4 h-4" />}
              required
            />

            <Input
              label="Referral Code (Optional)"
              placeholder="e.g. PRIY49B2"
              value={referralCode}
              onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
              leftIcon={<Gift className="w-4 h-4" />}
              helperText="Get ₹200 off your first subscription purchase"
            />

            <Button
              type="submit"
              variant="lime"
              className="w-full font-bold text-sm py-3 mt-2"
              isLoading={isLoading}
            >
              Create Member Account
            </Button>
          </form>

          <div className="text-center text-xs text-slate-400 pt-1">
            Already have an account?{' '}
            <Link to="/login" className="font-bold text-lime-400 hover:text-lime-300">
              Sign in
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
};
