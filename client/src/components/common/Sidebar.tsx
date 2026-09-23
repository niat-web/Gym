import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore.js';
import {
  LayoutDashboard,
  Users,
  UserCheck,
  ShoppingBag,
  Tag,
  Receipt,
  Gift,
  QrCode,
  CalendarCheck,
  User,
  CreditCard,
  Home,
} from 'lucide-react';
import { cn } from '../../lib/utils.js';

export const Sidebar: React.FC = () => {
  const { role } = useAuthStore();

  if (!role) return null;

  const adminLinks = [
    { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
    { to: '/admin/members', label: 'Members Directory', icon: Users },
    { to: '/admin/trainers', label: 'Trainers Staff', icon: UserCheck },
    { to: '/admin/plans', label: 'Fitness Plans', icon: ShoppingBag },
    { to: '/admin/coupons', label: 'Discounts & Coupons', icon: Tag },
    { to: '/admin/payments', label: 'Payments Ledger', icon: Receipt },
    { to: '/admin/referrals', label: 'Referrals Leaderboard', icon: Gift },
    { to: '/trainer/checkin', label: 'Front Desk Check-In', icon: QrCode },
    { to: '/member/profile', label: 'My Profile', icon: User },
  ];

  const trainerLinks = [
    { to: '/trainer', label: 'Trainer Dashboard', icon: LayoutDashboard, end: true },
    { to: '/trainer/checkin', label: 'Mark Check-In', icon: QrCode },
    { to: '/trainer/members', label: 'Members Directory', icon: Users },
    { to: '/member/profile', label: 'My Profile', icon: User },
  ];

  const memberLinks = [
    { to: '/member', label: 'My Membership', icon: Home, end: true },
    { to: '/member/plans', label: 'Buy / Renew Plans', icon: ShoppingBag },
    { to: '/member/wallet', label: 'Payment Receipts', icon: CreditCard },
    { to: '/member/history', label: 'Attendance History', icon: CalendarCheck },
    { to: '/member/refer', label: 'Refer & Earn', icon: Gift },
    { to: '/member/profile', label: 'Digital Pass & Profile', icon: User },
  ];

  const links = role === 'owner' ? adminLinks : role === 'trainer' ? trainerLinks : memberLinks;

  return (
    <aside className="hidden md:flex flex-col w-64 bg-charcoal-900 border-r border-charcoal-800 p-4 shrink-0 min-h-[calc(100vh-4rem)]">
      <div className="space-y-1">
        <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
          {role === 'owner' ? 'Admin Suite' : role === 'trainer' ? 'Trainer Desk' : 'Member Portal'}
        </p>
        {links.map((link) => {
          const Icon = link.icon;
          return (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200',
                  isActive
                    ? 'bg-lime-500 text-charcoal-950 shadow-lime-glow-sm font-bold'
                    : 'text-slate-300 hover:bg-charcoal-800 hover:text-white'
                )
              }
            >
              <Icon className="w-4 h-4" />
              <span>{link.label}</span>
            </NavLink>
          );
        })}
      </div>
    </aside>
  );
};
