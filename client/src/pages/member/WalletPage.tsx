import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { paymentsApi } from '../../services/payments.api.js';
import { Payment } from '../../types/index.js';
import { Card, CardHeader, CardTitle } from '../../components/ui/Card.js';
import { Badge } from '../../components/ui/Badge.js';
import { Button } from '../../components/ui/Button.js';
import { ReceiptModal } from '../../components/common/ReceiptModal.js';
import { formatRupees, formatDate } from '../../lib/formatters.js';
import { CreditCard, Receipt, Eye, Dumbbell, ShieldCheck } from 'lucide-react';

export const WalletPage: React.FC = () => {
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);

  const { data: payments = [], isLoading } = useQuery({
    queryKey: ['myPayments'],
    queryFn: async () => {
      const res = await paymentsApi.getMyPayments();
      return res.data || [];
    },
  });

  const handleOpenReceipt = (payment: Payment) => {
    setSelectedPayment(payment);
    setIsReceiptOpen(true);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <CreditCard className="w-6 h-6 text-lime-400" />
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Payments & Receipts
          </h1>
        </div>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Review all your membership transactions and digital tax receipts.
        </p>
      </div>

      {/* Transactions List Card */}
      <Card className="space-y-4">
        <CardHeader className="mb-0">
          <div className="flex items-center gap-2">
            <Receipt className="w-5 h-5 text-lime-500" />
            <CardTitle>Transaction History</CardTitle>
          </div>
          <span className="text-xs text-slate-400">
            {payments.length} {payments.length === 1 ? 'record' : 'records'}
          </span>
        </CardHeader>

        {isLoading ? (
          <div className="p-8 text-center text-xs text-slate-400">Loading payment records...</div>
        ) : payments.length === 0 ? (
          <div className="text-center py-12 text-slate-400 space-y-2">
            <CreditCard className="w-10 h-10 mx-auto text-slate-600" />
            <p className="text-xs">No transactions recorded yet.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {payments.map((p) => {
              const planName = typeof p.plan === 'object' ? p.plan.planName : 'Fitness Plan';

              return (
                <div
                  key={p.id}
                  onClick={() => handleOpenReceipt(p)}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-2xl bg-charcoal-850 border border-charcoal-750/80 hover:border-charcoal-700 hover:bg-charcoal-800/80 transition-all cursor-pointer gap-3"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-lime-500/10 border border-lime-500/20 flex items-center justify-center text-lime-400 shrink-0">
                      <Receipt className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-slate-100">{planName}</h4>
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
                      </div>
                      <p className="text-xs font-mono text-slate-400 mt-0.5">
                        Receipt: {p.receiptNumber} • {formatDate(p.createdAt)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-4 self-end sm:self-auto w-full sm:w-auto">
                    <div className="text-right">
                      <p className="text-base font-black text-lime-400">
                        {formatRupees(p.finalAmountPaise)}
                      </p>
                      <p className="text-[10px] uppercase font-bold text-slate-400">
                        via {p.paymentMethod}
                      </p>
                    </div>

                    <Button variant="ghost" size="sm" className="text-xs text-slate-400 gap-1">
                      <Eye className="w-3.5 h-3.5" />
                      View
                    </Button>
                  </div>
                </div>
              );
            })}
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
