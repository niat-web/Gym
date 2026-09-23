import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore.js';
import { ProtectedRoute, RoleGuard } from '../components/common/ProtectedRoute.js';
import { AppLayout } from '../components/common/AppLayout.js';

// Auth Pages
import { LoginPage } from '../pages/auth/LoginPage.js';
import { RegisterPage } from '../pages/auth/RegisterPage.js';
import { ForgotPasswordPage } from '../pages/auth/ForgotPasswordPage.js';

// Member Pages
import { MemberHomePage } from '../pages/member/MemberHomePage.js';
import { StorePage } from '../pages/member/StorePage.js';
import { WalletPage } from '../pages/member/WalletPage.js';
import { HistoryPage } from '../pages/member/HistoryPage.js';
import { ReferPage } from '../pages/member/ReferPage.js';
import { ProfilePage } from '../pages/member/ProfilePage.js';

// Trainer Pages
import { TrainerDashboardPage } from '../pages/trainer/TrainerDashboardPage.js';
import { TrainerCheckInPage } from '../pages/trainer/TrainerCheckInPage.js';
import { TrainerMembersPage } from '../pages/trainer/TrainerMembersPage.js';
import { TrainerMemberDetailPage } from '../pages/trainer/TrainerMemberDetailPage.js';

// Owner (Admin) Pages
import { OwnerDashboardPage } from '../pages/owner/OwnerDashboardPage.js';
import { OwnerMembersPage } from '../pages/owner/OwnerMembersPage.js';
import { OwnerTrainersPage } from '../pages/owner/OwnerTrainersPage.js';
import { OwnerPlansPage } from '../pages/owner/OwnerPlansPage.js';
import { OwnerCouponsPage } from '../pages/owner/OwnerCouponsPage.js';
import { OwnerPaymentsPage } from '../pages/owner/OwnerPaymentsPage.js';
import { OwnerReferralsPage } from '../pages/owner/OwnerReferralsPage.js';

// Shared
import { NotFoundPage } from '../pages/shared/NotFoundPage.js';

export const AppRouter: React.FC = () => {
  const { role, isAuthenticated } = useAuthStore();

  const getHomeRedirect = () => {
    if (!isAuthenticated) return <Navigate to="/login" replace />;
    if (role === 'owner') return <Navigate to="/admin" replace />;
    if (role === 'trainer') return <Navigate to="/trainer" replace />;
    return <Navigate to="/member" replace />;
  };

  return (
    <Routes>
      {/* Public Auth Routes */}
      <Route
        path="/login"
        element={isAuthenticated ? getHomeRedirect() : <LoginPage />}
      />
      <Route
        path="/register"
        element={isAuthenticated ? getHomeRedirect() : <RegisterPage />}
      />
      <Route
        path="/forgot-password"
        element={isAuthenticated ? getHomeRedirect() : <ForgotPasswordPage />}
      />

      {/* Authenticated Root Redirection */}
      <Route path="/" element={getHomeRedirect()} />

      {/* Protected Routes */}
      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          {/* Member Routes */}
          <Route element={<RoleGuard allowedRoles={['member', 'owner', 'trainer']} />}>
            <Route path="/member" element={<MemberHomePage />} />
            <Route path="/member/plans" element={<StorePage />} />
            <Route path="/member/wallet" element={<WalletPage />} />
            <Route path="/member/history" element={<HistoryPage />} />
            <Route path="/member/refer" element={<ReferPage />} />
            <Route path="/member/profile" element={<ProfilePage />} />
          </Route>

          {/* Trainer Routes */}
          <Route element={<RoleGuard allowedRoles={['trainer', 'owner']} />}>
            <Route path="/trainer" element={<TrainerDashboardPage />} />
            <Route path="/trainer/checkin" element={<TrainerCheckInPage />} />
            <Route path="/trainer/members" element={<TrainerMembersPage />} />
            <Route path="/trainer/members/:id" element={<TrainerMemberDetailPage />} />
            <Route path="/trainer/profile" element={<ProfilePage />} />
          </Route>

          {/* Owner (Admin) Routes */}
          <Route element={<RoleGuard allowedRoles={['owner']} />}>
            <Route path="/admin" element={<OwnerDashboardPage />} />
            <Route path="/admin/members" element={<OwnerMembersPage />} />
            <Route path="/admin/trainers" element={<OwnerTrainersPage />} />
            <Route path="/admin/plans" element={<OwnerPlansPage />} />
            <Route path="/admin/coupons" element={<OwnerCouponsPage />} />
            <Route path="/admin/payments" element={<OwnerPaymentsPage />} />
            <Route path="/admin/referrals" element={<OwnerReferralsPage />} />
          </Route>
        </Route>
      </Route>

      {/* Catch-all 404 */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};
