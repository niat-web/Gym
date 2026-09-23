import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { usersApi } from '../../services/users.api.js';
import { User, MembershipStatus } from '../../types/index.js';
import { Card, CardHeader, CardTitle } from '../../components/ui/Card.js';
import { Input } from '../../components/ui/Input.js';
import { Badge } from '../../components/ui/Badge.js';
import { Button } from '../../components/ui/Button.js';
import { formatDate } from '../../lib/formatters.js';
import { Users, Search, Eye, Dumbbell, UserCheck } from 'lucide-react';

export const TrainerMembersPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [page, setPage] = useState(1);

  const { data: usersData, isLoading } = useQuery({
    queryKey: ['trainerMembersList', page, searchTerm, statusFilter],
    queryFn: async () => {
      const res = await usersApi.listUsers({
        page,
        pageSize: 15,
        search: searchTerm.trim() || undefined,
        status: statusFilter === 'all' ? undefined : (statusFilter as MembershipStatus),
        role: 'member',
      });
      return res.data;
    },
  });

  const members = usersData?.items || [];

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <Users className="w-6 h-6 text-lime-400" />
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Members Directory
          </h1>
        </div>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Search gym members, check active membership status, and inspect attendance histories.
        </p>
      </div>

      {/* Filters Bar */}
      <Card className="p-4 bg-charcoal-800 flex flex-col sm:flex-row items-center gap-3">
        <div className="w-full sm:flex-1">
          <Input
            placeholder="Search by name, phone or email..."
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
            <option value="all">All Statuses</option>
            <option value="active">Active Members</option>
            <option value="inactive">Inactive</option>
            <option value="expired">Expired</option>
            <option value="suspended">Suspended</option>
          </select>
        </div>
      </Card>

      {/* Members Directory Table / Cards */}
      <Card className="space-y-4">
        {isLoading ? (
          <div className="p-12 text-center text-xs text-slate-400">Loading members directory...</div>
        ) : members.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-400">No members found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-charcoal-750 text-slate-400 uppercase font-semibold text-[10px]">
                  <th className="pb-3 px-3">Member</th>
                  <th className="pb-3 px-3">Phone</th>
                  <th className="pb-3 px-3">Status</th>
                  <th className="pb-3 px-3">Current Plan</th>
                  <th className="pb-3 px-3">Joined</th>
                  <th className="pb-3 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-charcoal-800">
                {members.map((member) => {
                  const status = member.gymMeta?.membershipStatus || 'inactive';
                  const sub: any = member.activeSubscription;

                  return (
                    <tr key={member.id} className="hover:bg-charcoal-850/60 transition-colors">
                      <td className="py-3.5 px-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-lime-500/10 text-lime-400 flex items-center justify-center font-bold text-xs shrink-0">
                            {member.fullName.charAt(0)}
                          </div>
                          <span className="font-bold text-slate-200">{member.fullName}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-3 font-mono text-slate-300">{member.phone}</td>
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
                      <td className="py-3.5 px-3 text-slate-300">
                        {sub?.planSnapshot?.planName || sub?.plan?.planName || '—'}
                      </td>
                      <td className="py-3.5 px-3 text-slate-400">
                        {formatDate(member.gymMeta?.joinedOn || member.createdAt)}
                      </td>
                      <td className="py-3.5 px-3 text-right">
                        <Link to={`/trainer/members/${member.id}`}>
                          <Button variant="secondary" size="sm" className="text-xs gap-1">
                            <Eye className="w-3.5 h-3.5" />
                            View
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {usersData && usersData.totalPages > 1 && (
          <div className="flex items-center justify-between pt-4 border-t border-charcoal-750 text-xs">
            <span className="text-slate-400">
              Page {usersData.page} of {usersData.totalPages} ({usersData.total} members)
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
                disabled={page >= usersData.totalPages}
                onClick={() => setPage(page + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};
