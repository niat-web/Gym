import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { couponsApi } from '../../services/coupons.api.js';
import { Coupon } from '../../types/index.js';
import { Card, CardHeader, CardTitle } from '../../components/ui/Card.js';
import { Button } from '../../components/ui/Button.js';
import { Badge } from '../../components/ui/Badge.js';
import { Progress } from '../../components/ui/Progress.js';
import { CouponEditorModal } from '../../components/owner/CouponEditorModal.js';
import { formatRupees, formatDate } from '../../lib/formatters.js';
import { Tag, Plus, Edit2, Power, AlertCircle, Sparkles } from 'lucide-react';

export const OwnerCouponsPage: React.FC = () => {
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);

  const { data: coupons = [], isLoading, refetch } = useQuery({
    queryKey: ['allCouponsAdmin'],
    queryFn: async () => {
      const res = await couponsApi.listCoupons();
      return res.data || [];
    },
  });

  const handleCreate = () => {
    setEditingCoupon(null);
    setIsEditorOpen(true);
  };

  const handleEdit = (coupon: Coupon) => {
    setEditingCoupon(coupon);
    setIsEditorOpen(true);
  };

  const handleDeactivate = async (coupon: Coupon) => {
    try {
      await couponsApi.deactivateCoupon(coupon.id);
      refetch();
    } catch (err) {}
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Tag className="w-6 h-6 text-lime-400" />
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Discounts & Coupons
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Create promotional coupon codes, percentage caps, per-user limits, and campaign windows.
          </p>
        </div>

        <Button variant="lime" className="gap-2 font-bold shadow-lime-glow-sm" onClick={handleCreate}>
          <Plus className="w-4 h-4" />
          Create Coupon
        </Button>
      </div>

      {/* Coupons Grid */}
      {isLoading ? (
        <div className="p-12 text-center text-xs text-slate-400">Loading coupons...</div>
      ) : coupons.length === 0 ? (
        <div className="p-12 text-center text-xs text-slate-400 bg-charcoal-850 rounded-2xl border border-charcoal-700">
          No coupons created yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {coupons.map((coupon) => {
            const isExpired = new Date() > new Date(coupon.validUntil);
            const isExhausted = coupon.currentUses >= coupon.maxUses;
            const isInactive = !coupon.isActive || isExpired || isExhausted;

            return (
              <Card
                key={coupon.id}
                className={`p-5 flex flex-col justify-between space-y-4 ${
                  isInactive ? 'opacity-65 border-dashed border-charcoal-700' : ''
                }`}
              >
                <div className="space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="font-mono font-black text-lg text-lime-400 tracking-wider">
                        {coupon.code}
                      </span>
                      <h4 className="text-xs font-bold text-slate-200 mt-0.5">{coupon.name}</h4>
                    </div>

                    <Badge
                      variant={
                        !coupon.isActive
                          ? 'danger'
                          : isExpired
                          ? 'warning'
                          : isExhausted
                          ? 'neutral'
                          : 'lime'
                      }
                      size="sm"
                    >
                      {!coupon.isActive
                        ? 'Inactive'
                        : isExpired
                        ? 'Expired'
                        : isExhausted
                        ? 'Exhausted'
                        : 'Active'}
                    </Badge>
                  </div>

                  <p className="text-xs text-slate-400 line-clamp-2">{coupon.description}</p>

                  {/* Value badge */}
                  <div className="p-3 bg-charcoal-850 rounded-xl border border-charcoal-750 text-xs flex justify-between items-center">
                    <span className="text-slate-400">Discount Value</span>
                    <span className="font-black text-white text-sm">
                      {coupon.discountType === 'percentage'
                        ? `${coupon.discountValue}% Off`
                        : `${formatRupees(coupon.discountValue)} Flat Off`}
                    </span>
                  </div>

                  {/* Usage Progress Gauge */}
                  <div className="space-y-1.5 pt-1">
                    <div className="flex justify-between text-[11px] text-slate-400">
                      <span>Redemptions</span>
                      <span className="font-bold text-slate-200">
                        {coupon.currentUses} / {coupon.maxUses} uses
                      </span>
                    </div>
                    <Progress value={coupon.currentUses} max={coupon.maxUses} />
                  </div>

                  {/* Validity Window */}
                  <div className="text-[11px] text-slate-400 border-t border-charcoal-750 pt-2 flex justify-between">
                    <span>Valid until:</span>
                    <span className="font-medium text-slate-300">
                      {formatDate(coupon.validUntil)}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="pt-3 border-t border-charcoal-750 flex gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    className="flex-1 text-xs gap-1"
                    onClick={() => handleEdit(coupon)}
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    Edit
                  </Button>

                  {coupon.isActive && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs text-rose-400 hover:border-rose-500/40"
                      onClick={() => handleDeactivate(coupon)}
                    >
                      Deactivate
                    </Button>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Coupon Editor Modal */}
      <CouponEditorModal
        coupon={editingCoupon}
        isOpen={isEditorOpen}
        onClose={() => setIsEditorOpen(false)}
        onSaved={() => refetch()}
      />
    </div>
  );
};
