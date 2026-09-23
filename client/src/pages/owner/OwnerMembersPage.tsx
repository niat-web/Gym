import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { usersApi } from '../../services/users.api.js';
import { subscriptionsApi } from '../../services/subscriptions.api.js';
import { User, MembershipStatus } from '../../types/index.js';
import { Card, CardHeader, CardTitle } from '../../components/ui/Card.js';
import { Input } from '../../components/ui/Input.js';
import { Button } from '../../components/ui/Button.js';
import { Badge } from '../../components/ui/Badge.js';
import { Modal } from '../../components/ui/Modal.js';
import { ManualPaymentModal } from '../../components/owner/ManualPaymentModal.js';
import { formatDate } from '../../lib/formatters.js';
import {
  Users,
  Search,
  UserPlus,
  CreditCard,
  UserCheck,
  Pause,
  Play,
  XCircle,
  AlertCircle,
  Eye,
  ShieldAlert,
} from 'lucide-react';

export const OwnerMembersPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [page, setPage] = useState(1);

  // Modals state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isManualPayOpen, setIsManualPayOpen] = useState(false);
  const [selectedMemberForPayment, setSelectedMemberForPayment] = useState<User | null>(null);

  // Assign trainer modal state
  const [isAssignTrainerOpen, setIsAssignTrainerOpen] = useState(false);
  const [targetMember, setTargetMember] = useState<User | null>(null);
  const [selectedTrainerId, setSelectedTrainerId] = useState('');

  // Create member form state
  const [createName, setCreateName] = useState('');
  const [createPhone, setCreatePhone] = useState('');
  const [createEmail, setCreateEmail] = useState('');
  const [createPassword, setCreatePassword] = useState('Member@123');
  const [createAssignedTrainer, setCreateAssignedTrainer] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  const queryClient = useQueryClient();

  // Load trainers for dropdowns
  const { data: trainers = [] } = useQuery({
    queryKey: ['trainersList'],
    queryFn: async () => {
      const res = await usersApi.listTrainers();
      return res.data || [];
    },
  });

  // Load members paginated
  const { data: membersData, isLoading, refetch } = useQuery({
    queryKey: ['ownerMembersList', page, searchTerm, statusFilter],
    queryFn: async () => {
      const res = await usersApi.listUsers({
        page,
        pageSize: 10,
        search: searchTerm.trim() || undefined,
        status: statusFilter === 'all' ? undefined : (statusFilter as MembershipStatus),
        role: 'member',
      });
      return res.data;
    },
  });

  const members = membersData?.items || [];

  const handleCreateMember = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);
    setCreateError(null);

    try {
      const res = await usersApi.createUser({
        fullName: createName.trim(),
        phone: createPhone.trim(),
        password: createPassword,
        email: createEmail.trim() || undefined,
        role: 'member',
        assignedTrainer: createAssignedTrainer || undefined,
      });

      if (res.success) {
        setIsCreateModalOpen(false);
        setCreateName('');
        setCreatePhone('');
        setCreateEmail('');
        refetch();
      } else {
        setCreateError(res.error?.message || 'Failed to create member');
      }
    } catch (err: any) {
      setCreateError(err.response?.data?.error?.message || 'Failed to create member');
    } finally {
      setIsCreating(false);
    }
  };

  const handleToggleStatus = async (member: User) => {
    const newStatus = member.gymMeta?.membershipStatus === 'suspended' ? 'active' : 'suspended';
    try {
      await usersApi.updateStatus(member.id, newStatus);
      refetch();
    } catch (err) {}
  };

  const handleOpenAssignTrainer = (member: User) => {
    setTargetMember(member);
    setSelectedTrainerId(
      typeof member.gymMeta?.assignedTrainer === 'object'
        ? member.gymMeta.assignedTrainer.id
        : (member.gymMeta?.assignedTrainer as string) || ''
    );
    setIsAssignTrainerOpen(true);
  };

  const handleSaveAssignTrainer = async () => {
    if (!targetMember || !selectedTrainerId) return;
    try {
      await usersApi.assignTrainer(targetMember.id, selectedTrainerId);
      setIsAssignTrainerOpen(false);
      refetch();
    } catch (err) {}
  };

  // Subscription Actions: Pause / Resume / Cancel
  const handlePauseSub = async (subId: string) => {
    try {
      await subscriptionsApi.pauseSubscription(subId);
      refetch();
    } catch (err) {}
  };

  const handleResumeSub = async (subId: string) => {
    try {
      await subscriptionsApi.resumeSubscription(subId);
      refetch();
    } catch (err) {}
  };

  const handleCancelSub = async (subId: string) => {
    if (window.confirm('Are you sure you want to cancel this active membership subscription?')) {
      try {
        await subscriptionsApi.cancelSubscription(subId);
        refetch();
      } catch (err) {}
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Users className="w-6 h-6 text-lime-400" />
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Members Directory
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Manage gym accounts, assign trainers, record cash payments, and manage subscription states.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="secondary"
            className="gap-2 font-bold"
            onClick={() => {
              setSelectedMemberForPayment(null);
              setIsManualPayOpen(true);
            }}
          >
            <CreditCard className="w-4 h-4 text-lime-400" />
            Record Payment
          </Button>

          <Button
            variant="lime"
            className="gap-2 font-bold shadow-lime-glow-sm"
            onClick={() => setIsCreateModalOpen(true)}
          >
            <UserPlus className="w-4 h-4" />
            Add Member
          </Button>
        </div>
      </div>

      {/* Search & Status Filter */}
      <Card className="p-4 bg-charcoal-800 flex flex-col sm:flex-row items-center gap-3">
        <div className="w-full sm:flex-1">
          <Input
            placeholder="Search member by name, phone, or email..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPage(1);
            }}
            leftIcon={<Search className="w-4 h-4" />}
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="w-full sm:w-auto bg-charcoal-850 border border-charcoal-700 text-slate-100 rounded-xl px-3 py-2.5 text-xs outline-none focus:border-lime-500"
          >
            <option value="all">All Memberships</option>
            <option value="active">Active Members</option>
            <option value="inactive">Inactive</option>
            <option value="expired">Expired</option>
            <option value="suspended">Suspended</option>
          </select>
        </div>
      </Card>

      {/* Members Directory Table */}
      <Card className="space-y-4">
        {isLoading ? (
          <div className="p-12 text-center text-xs text-slate-400">Loading members...</div>
        ) : members.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-400">No members found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-charcoal-750 text-slate-400 uppercase font-semibold text-[10px]">
                  <th className="pb-3 px-3">Member Details</th>
                  <th className="pb-3 px-3">Status</th>
                  <th className="pb-3 px-3">Active Subscription</th>
                  <th className="pb-3 px-3">Trainer</th>
                  <th className="pb-3 px-3 text-right">Subscription & Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-charcoal-800">
                {members.map((member) => {
                  const status = member.gymMeta?.membershipStatus || 'inactive';
                  const sub: any = member.activeSubscription;
                  const isSuspended = status === 'suspended';

                  return (
                    <tr key={member.id} className="hover:bg-charcoal-850/60 transition-colors">
                      <td className="py-3.5 px-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-lime-500/10 text-lime-400 flex items-center justify-center font-bold text-xs shrink-0">
                            {member.fullName.charAt(0)}
                          </div>
                          <div>
                            <p className="font-bold text-slate-200">{member.fullName}</p>
                            <p className="font-mono text-[11px] text-slate-400">{member.phone}</p>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-3">
                        <Badge
                          variant={
                            status === 'active'
                              ? 'lime'
                              : status === 'expired'
                              ? 'warning'
                              : status === 'suspended'
                              ? 'danger'
                              : 'neutral'
                          }
                          size="sm"
                        >
                          {status}
                        </Badge>
                      </td>

                      <td className="py-3.5 px-3">
                        {sub ? (
                          <div>
                            <p className="font-semibold text-slate-200">
                              {sub.planSnapshot?.planName || sub.plan?.planName}
                            </p>
                            <p className="text-[10px] text-lime-400 font-medium">
                              {sub.daysRemaining} visits left • Exp {formatDate(sub.expiresOn)}
                            </p>
                          </div>
                        ) : (
                          <span className="text-slate-500 italic">None</span>
                        )}
                      </td>

                      <td className="py-3.5 px-3">
                        <div className="flex items-center gap-2">
                          <span className="text-slate-300">
                            {(member.gymMeta?.assignedTrainer as any)?.fullName || 'None'}
                          </span>
                          <button
                            onClick={() => handleOpenAssignTrainer(member)}
                            className="text-[10px] font-bold text-lime-400 hover:underline"
                          >
                            Assign
                          </button>
                        </div>
                      </td>

                      <td className="py-3.5 px-3 text-right space-x-1.5">
                        {/* Record Cash Payment */}
                        <Button
                          variant="secondary"
                          size="sm"
                          className="text-[11px] py-1 px-2 h-7"
                          onClick={() => {
                            setSelectedMemberForPayment(member);
                            setIsManualPayOpen(true);
                          }}
                        >
                          + Pay
                        </Button>

                        {/* Subscription Controls */}
                        {sub && sub.status === 'active' && (
                          <Button
                            variant="secondary"
                            size="sm"
                            className="text-[11px] py-1 px-2 h-7 text-amber-400"
                            title="Pause Subscription"
                            onClick={() => handlePauseSub(sub._id || sub.id)}
                          >
                            <Pause className="w-3 h-3" />
                          </Button>
                        )}

                        {sub && sub.status === 'paused' && (
                          <Button
                            variant="secondary"
                            size="sm"
                            className="text-[11px] py-1 px-2 h-7 text-lime-400"
                            title="Resume Subscription"
                            onClick={() => handleResumeSub(sub._id || sub.id)}
                          >
                            <Play className="w-3 h-3" />
                          </Button>
                        )}

                        {sub && (
                          <Button
                            variant="secondary"
                            size="sm"
                            className="text-[11px] py-1 px-2 h-7 text-rose-400"
                            title="Cancel Subscription"
                            onClick={() => handleCancelSub(sub._id || sub.id)}
                          >
                            <XCircle className="w-3 h-3" />
                          </Button>
                        )}

                        {/* Suspend / Activate Account */}
                        <Button
                          variant={isSuspended ? 'lime' : 'ghost'}
                          size="sm"
                          className="text-[11px] py-1 px-2 h-7"
                          onClick={() => handleToggleStatus(member)}
                        >
                          {isSuspended ? 'Activate' : 'Suspend'}
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {membersData && membersData.totalPages > 1 && (
          <div className="flex items-center justify-between pt-4 border-t border-charcoal-750 text-xs">
            <span className="text-slate-400">
              Page {membersData.page} of {membersData.totalPages} ({membersData.total} members)
            </span>
            <div className="flex gap-2">
              <Button
                variant="secondary"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
              >
                Previous
              </Button>
              <Button
                variant="secondary"
                size="sm"
                disabled={page >= membersData.totalPages}
                onClick={() => setPage(page + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Create Member Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Add New Member"
        description="Register a member account and assign dedicated trainer"
        maxWidth="md"
      >
        <form onSubmit={handleCreateMember} className="space-y-4">
          {createError && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{createError}</span>
            </div>
          )}

          <Input
            label="Full Name"
            placeholder="e.g. Rahul Sharma"
            value={createName}
            onChange={(e) => setCreateName(e.target.value)}
            required
          />

          <Input
            label="Phone Number (+91)"
            placeholder="9876543210"
            value={createPhone}
            onChange={(e) => setCreatePhone(e.target.value)}
            required
          />

          <Input
            label="Email Address (Optional)"
            type="email"
            placeholder="rahul@example.com"
            value={createEmail}
            onChange={(e) => setCreateEmail(e.target.value)}
          />

          <Input
            label="Initial Password"
            value={createPassword}
            onChange={(e) => setCreatePassword(e.target.value)}
            required
          />

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
              Assign Trainer (Optional)
            </label>
            <select
              value={createAssignedTrainer}
              onChange={(e) => setCreateAssignedTrainer(e.target.value)}
              className="w-full bg-charcoal-850 border border-charcoal-700 text-slate-100 rounded-xl px-3.5 py-2.5 text-sm outline-none focus:border-lime-500"
            >
              <option value="">None Assigned</option>
              {trainers.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.fullName} ({t.phone})
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-3 pt-3">
            <Button type="button" variant="secondary" className="flex-1" onClick={() => setIsCreateModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="lime" className="flex-1 font-bold" isLoading={isCreating}>
              Create Member
            </Button>
          </div>
        </form>
      </Modal>

      {/* Assign Trainer Modal */}
      <Modal
        isOpen={isAssignTrainerOpen}
        onClose={() => setIsAssignTrainerOpen(false)}
        title="Assign Trainer"
        description={`Assign a staff trainer to ${targetMember?.fullName}`}
        maxWidth="sm"
      >
        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
              Select Trainer
            </label>
            <select
              value={selectedTrainerId}
              onChange={(e) => setSelectedTrainerId(e.target.value)}
              className="w-full bg-charcoal-850 border border-charcoal-700 text-slate-100 rounded-xl px-3.5 py-2.5 text-sm outline-none focus:border-lime-500"
            >
              <option value="">Select Trainer...</option>
              {trainers.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.fullName} ({t.phone})
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-3 pt-2">
            <Button variant="secondary" className="flex-1" onClick={() => setIsAssignTrainerOpen(false)}>
              Cancel
            </Button>
            <Button variant="lime" className="flex-1 font-bold" onClick={handleSaveAssignTrainer}>
              Save Assignment
            </Button>
          </div>
        </div>
      </Modal>

      {/* Manual Payment Modal */}
      <ManualPaymentModal
        initialMember={selectedMemberForPayment}
        isOpen={isManualPayOpen}
        onClose={() => setIsManualPayOpen(false)}
        onSuccess={() => refetch()}
      />
    </div>
  );
};
