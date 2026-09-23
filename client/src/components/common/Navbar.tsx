import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore.js';
import { useThemeStore } from '../../store/themeStore.js';
import { Button } from '../ui/Button.js';
import { Badge } from '../ui/Badge.js';
import {
  Dumbbell,
  Sun,
  Moon,
  LogOut,
  Sparkles,
  User as UserIcon,
  ShieldAlert,
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, role, logout } = useAuthStore();
  const { theme, toggleTheme } = useThemeStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getRoleLabel = () => {
    if (role === 'owner') return 'Admin';
    if (role === 'trainer') return 'Trainer';
    return 'Member';
  };

  const getRoleBadgeVariant = () => {
    if (role === 'owner') return 'purple';
    if (role === 'trainer') return 'info';
    return 'lime';
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-charcoal-900/90 border-b border-charcoal-800 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-10 h-10 rounded-xl bg-lime-500 flex items-center justify-center text-charcoal-950 shadow-lime-glow-sm group-hover:scale-105 transition-transform">
            <Dumbbell className="w-5 h-5 font-black stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xl font-extrabold tracking-tight text-white">Fit</span>
              <span className="text-xl font-extrabold tracking-tight text-lime-500">Core</span>
            </div>
            <p className="text-[10px] text-slate-400 font-semibold tracking-wider uppercase -mt-1">
              Studio & Gym
            </p>
          </div>
        </Link>

        {/* User Stats & Controls */}
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Member Loyalty Points */}
          {user && role === 'member' && (
            <div className="hidden sm:flex items-center gap-1.5 bg-charcoal-800/80 border border-charcoal-700 px-3 py-1.5 rounded-full text-xs font-semibold text-lime-400">
              <Sparkles className="w-3.5 h-3.5 text-lime-500" />
              <span>{user.loyaltyPoints || 0} pts</span>
            </div>
          )}

          {/* User Role Badge */}
          {user && (
            <div className="hidden md:flex items-center gap-2">
              <div className="text-right">
                <p className="text-xs font-bold text-slate-200">{user.fullName}</p>
                <p className="text-[10px] text-slate-400 font-medium">{user.phone}</p>
              </div>
              <Badge variant={getRoleBadgeVariant() as any} size="sm">
                {getRoleLabel()}
              </Badge>
            </div>
          )}

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2.5 rounded-xl bg-charcoal-800 hover:bg-charcoal-750 text-slate-300 hover:text-white border border-charcoal-700 transition-colors"
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} theme`}
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-slate-400" />
            )}
          </button>

          {/* Logout button */}
          {user && (
            <button
              onClick={handleLogout}
              className="p-2.5 rounded-xl bg-charcoal-800 hover:bg-rose-900/30 text-slate-400 hover:text-rose-400 border border-charcoal-700 hover:border-rose-500/30 transition-colors"
              title="Log out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
