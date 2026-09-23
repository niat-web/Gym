import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { usersApi } from '../../services/users.api.js';
import { User } from '../../types/index.js';
import { Card, CardHeader, CardTitle } from '../../components/ui/Card.js';
import { Button } from '../../components/ui/Button.js';
import { Input } from '../../components/ui/Input.js';
import { Badge } from '../../components/ui/Badge.js';
import { Modal } from '../../components/ui/Modal.js';
import { formatDate } from '../../lib/formatters.js';
import { UserCheck, UserPlus, Phone, Mail, AlertCircle, Dumbbell } from 'lucide-react';

export const OwnerTrainersPage: React.FC = () => {
  const [isAddTrainerOpen, setIsAddTrainerOpen] = useState(false);
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('Trainer@123');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const { data: trainers = [], isLoading, refetch } = useQuery({
    queryKey: ['trainersStaffList'],
    queryFn: async () => {
      const res = await usersApi.listTrainers();
      return res.data || [];
    },
  });

  const handleCreateTrainer = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const res = await usersApi.createUser({
        fullName: fullName.trim(),
        phone: phone.trim(),
        password,
        email: email.trim() || undefined,
        role: 'trainer',
      });

      if (res.success) {
        setIsAddTrainerOpen(false);
        setFullName('');
        setPhone('');
        setEmail('');
        refetch();
      } else {
        setErrorMsg(res.error?.message || 'Failed to create trainer');
      }
    } catch (err: any) {
      setErrorMsg(err.response?.data?.error?.message || 'Failed to create trainer');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <UserCheck className="w-6 h-6 text-lime-400" />
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Trainers & Front Desk Staff
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Manage fitness trainers authorized to verify member attendance and conduct sessions.
          </p>
        </div>

        <Button
          variant="lime"
          className="gap-2 font-bold shadow-lime-glow-sm shrink-0"
          onClick={() => setIsAddTrainerOpen(true)}
        >
          <UserPlus className="w-4 h-4" />
          Add Trainer
        </Button>
      </div>

      {/* Trainers Grid */}
      {isLoading ? (
        <div className="p-12 text-center text-xs text-slate-400">Loading trainer roster...</div>
      ) : trainers.length === 0 ? (
        <div className="p-12 text-center text-xs text-slate-400 bg-charcoal-850 rounded-2xl border border-charcoal-700">
          No trainers registered yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {trainers.map((trainer) => (
            <Card key={trainer.id} className="p-5 space-y-4 hover:border-charcoal-600 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center font-black text-sky-400 text-base">
                    {trainer.fullName.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-slate-100">{trainer.fullName}</h3>
                    <Badge variant="info" size="sm">
                      Trainer
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="space-y-2 text-xs text-slate-300 bg-charcoal-850 p-3 rounded-xl border border-charcoal-750">
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-lime-400 shrink-0" />
                  <span className="font-mono">{trainer.phone}</span>
                </div>
                {trainer.email && (
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                    <span className="truncate">{trainer.email}</span>
                  </div>
                )}
              </div>

              <div className="text-[11px] text-slate-400 flex justify-between items-center pt-1">
                <span>Staff Member</span>
                <span>Joined {formatDate(trainer.createdAt)}</span>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Add Trainer Modal */}
      <Modal
        isOpen={isAddTrainerOpen}
        onClose={() => setIsAddTrainerOpen(false)}
        title="Add New Trainer"
        description="Create credentials for a fitness coach or front desk staff member"
        maxWidth="md"
      >
        <form onSubmit={handleCreateTrainer} className="space-y-4">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <Input
            label="Full Name"
            placeholder="e.g. Vikram Singh"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
          />

          <Input
            label="Phone Number (+91)"
            placeholder="9876543211"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
          />

          <Input
            label="Email Address (Optional)"
            type="email"
            placeholder="vikram@fitcore.in"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <Input
            label="Initial Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <div className="flex gap-3 pt-3">
            <Button type="button" variant="secondary" className="flex-1" onClick={() => setIsAddTrainerOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="lime" className="flex-1 font-bold" isLoading={isSubmitting}>
              Create Trainer
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
