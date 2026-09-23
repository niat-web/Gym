import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore.js';
import {
  Home,
  ShoppingBag,
  CreditCard,
  CalendarCheck,
  Gift,
  User,
  Users,
  QrCode,
  LayoutDashboard,
  Tag,
  Receipt,
} from 'lucide-react';
import { cn } from '../../lib/utils.js';

export const BottomNav: React.FC = () => {
  const { role } = useAuthStore();

  if (!role) return null;

  const memberTabs = [
    { to: '/member', label: 'Home', icon: Home, end: true },
    { to: '/member/plans', label: 'Plans', icon: ShoppingBag },
    { to: '/member/wallet', label: 'Wallet', icon: CreditCard },
    { to: '/member/history', label: 'History', icon: CalendarCheck },
    { to: '/member/refer', label: 'Refer', icon: Gift },
    { to: '/member/profile', label: 'Profile', icon: User },
  ];

  const trainerTabs = [
    { to: '/trainer', label: 'Dashboard', icon: LayoutDashboard, end: true },
    { to: '/trainer/checkin', label: 'Check-In', icon: QrCode },
    { to: '/trainer/members', label: 'Members', icon: Users },
    { to: '/trainer/profile', label: 'Profile', icon: User },
  ];

  const adminTabs = [
    { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
    { to: '/admin/members', label: 'Members', icon: Users },
    { to: '/admin/plans', label: 'Plans', icon: ShoppingBag },
    { to: '/admin/coupons', label: 'Coupons', icon: Tag },
    { to: '/admin/payments', label: 'Ledger', icon: Receipt },
  ];

  const tabs = role === 'member' ? memberTabs : role === 'trainer' ? trainerTabs : adminTabs;

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-charcoal-900/95 border-t border-charcoal-800 backdrop-blur-lg px-2 py-1.5 pb-safe">
      <div className="flex items-center justify-around">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <NavLink
              key={tab.to}
              to={tab.to}
              end={tab.end}
              className={({ isActive }) =>
                cn(
                  'flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all duration-200 min-w-[52px]',
                  isActive
                    ? 'text-lime-500 font-bold scale-105'
                    : 'text-slate-400 hover:text-slate-200 font-medium'
                )
              }
            >
              <Icon className="w-5 h-5 mb-0.5" />
              <span className="text-[10px] tracking-tight">{tab.label}</span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};
