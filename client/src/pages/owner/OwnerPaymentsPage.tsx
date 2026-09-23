import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { paymentsApi } from '../../services/payments.api.js';
import { Payment, PaymentStatus, PaymentMethod } from '../../types/index.js';
import { Card, CardHeader, CardTitle } from '../../components/ui/Card.js';
import { Button } from '../../components/ui/Button.js';
import { Badge } from '../../components/ui/Badge.js';
import { ReceiptModal } from '../../components/common/ReceiptModal.js';
import { formatRupees, formatDate } from '../../lib/formatters.js';
import { Receipt, Eye, Filter } from 'lucide-react';

export const OwnerPaymentsPage: React.FC = () => {
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [methodFilter, setMethodFilter] = useState<string>('all');
  const [page, setPage] = useState(1);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);

  const { data: paymentsData, isLoading } = useQuery({
    queryKey: ['ownerPaymentsLedger', page, statusFilter, methodFilter],
    queryFn: async () => {
      const res = await paymentsApi.listPayments({
        page,
        pageSize: 15,
        status: statusFilter === 'all' ? undefined : (statusFilter as PaymentStatus),
        paymentMethod: methodFilter === 'all' ? undefined : (methodFilter as PaymentMethod),
      });
      return res.data;
    },
  });

  const payments = paymentsData?.items || [];

  const handleOpenReceipt = (payment: Payment) => {
    setSelectedPayment(payment);
    setIsReceiptOpen(true);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <Receipt className="w-6 h-6 text-lime-400" />
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Payments Ledger
          </h1>
        </div>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Complete audit trail of online Razorpay transactions, front desk cash, and UPI payments.
        </p>
      </div>

      {/* Filter Bar */}
      <Card className="p-4 bg-charcoal-800 flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <label className="text-xs font-semibold text-slate-400">Status:</label>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="bg-charcoal-850 border border-charcoal-700 text-slate-100 rounded-xl px-3 py-1.5 text-xs outline-none focus:border-lime-500"
          >
            <option value="all">All Statuses</option>
            <option value="success">Success</option>
            <option value="pending">Pending</option>
            <option value="failed">Failed</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-xs font-semibold text-slate-400">Method:</label>
          <select
            value={methodFilter}
            onChange={(e) => {
              setMethodFilter(e.target.value);
              setPage(1);
            }}
            className="bg-charcoal-850 border border-charcoal-700 text-slate-100 rounded-xl px-3 py-1.5 text-xs outline-none focus:border-lime-500"
          >
            <option value="all">All Methods</option>
            <option value="razorpay">Razorpay Online</option>
            <option value="cash">Counter Cash</option>
            <option value="upi">UPI / QR</option>
          </select>
        </div>
      </Card>

      {/* Payments Table */}
      <Card className="space-y-4">
        {isLoading ? (
          <div className="p-12 text-center text-xs text-slate-400">Loading payments ledger...</div>
        ) : payments.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-400">No payment records found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-charcoal-750 text-slate-400 uppercase font-semibold text-[10px]">
                  <th className="pb-3 px-3">Receipt No</th>
                  <th className="pb-3 px-3">Member</th>
                  <th className="pb-3 px-3">Plan</th>
                  <th className="pb-3 px-3">Amount</th>
                  <th className="pb-3 px-3">Method</th>
                  <th className="pb-3 px-3">Status</th>
                  <th className="pb-3 px-3">Date</th>
                  <th className="pb-3 px-3 text-right">Receipt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-charcoal-800">
                {payments.map((p) => {
                  const member: any = p.user;
                  const plan: any = p.plan;

                  return (
                    <tr key={p.id} className="hover:bg-charcoal-850/60 transition-colors">
                      <td className="py-3 px-3 font-mono font-bold text-slate-200">
                        {p.receiptNumber}
                      </td>
                      <td className="py-3 px-3 font-semibold text-slate-200">
                        {member?.fullName || '—'}
                      </td>
                      <td className="py-3 px-3 text-slate-300">{plan?.planName || '—'}</td>
                      <td className="py-3 px-3 font-extrabold text-lime-400">
                        {formatRupees(p.finalAmountPaise)}
                      </td>
                      <td className="py-3 px-3 uppercase font-bold text-slate-400 text-[11px]">
                        {p.paymentMethod}
                      </td>
                      <td className="py-3 px-3">
                        <Badge
                          variant={
                            p.status === 'success'
                              ? 'success'
                              : p.status === 'pending'
                              ? 'warning'
                              : 'danger'
                          }
                          size="sm"
                        >
                          {p.status}
                        </Badge>
                      </td>
                      <td className="py-3 px-3 text-slate-400">{formatDate(p.createdAt)}</td>
                      <td className="py-3 px-3 text-right">
                        <Button
                          variant="secondary"
                          size="sm"
                          className="text-[11px] py-1 px-2 h-7 gap-1"
                          onClick={() => handleOpenReceipt(p)}
                        >
                          <Eye className="w-3 h-3" />
                          View
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
        {paymentsData && paymentsData.totalPages > 1 && (
          <div className="flex items-center justify-between pt-4 border-t border-charcoal-750 text-xs">
            <span className="text-slate-400">
              Page {paymentsData.page} of {paymentsData.totalPages} ({paymentsData.total} transactions)
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
                disabled={page >= paymentsData.totalPages}
                onClick={() => setPage(page + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Receipt Modal */}
      <ReceiptModal
        payment={selectedPayment}
        isOpen={isReceiptOpen}
        onClose={() => setIsReceiptOpen(false)}
      />
    </div>
  );
};
