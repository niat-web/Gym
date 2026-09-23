import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Modal } from '../ui/Modal.js';
import { Badge } from '../ui/Badge.js';
import { Button } from '../ui/Button.js';
import { User, Subscription } from '../../types/index.js';
import { Dumbbell, ShieldCheck, Sparkles } from 'lucide-react';

interface DigitalPassModalProps {
  user: User | null;
  subscription?: Subscription | null;
  isOpen: boolean;
  onClose: () => void;
}

export const DigitalPassModal: React.FC<DigitalPassModalProps> = ({
  user,
  subscription,
  isOpen,
  onClose,
}) => {
  if (!user) return null;

  const qrData = JSON.stringify({
    fitcorePass: true,
    memberId: user.id,
    phone: user.phone,
    name: user.fullName,
    refCode: user.myReferralCode,
  });

  const isActive = user.gymMeta?.membershipStatus === 'active';
  const planName = subscription?.planSnapshot?.planName || 'No Active Plan';

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="sm">
      <div className="p-2 text-center space-y-6">
        {/* Pass Card Container */}
        <div className="bg-gradient-to-b from-charcoal-800 to-charcoal-900 border-2 border-lime-500/40 rounded-3xl p-6 shadow-lime-glow-sm relative overflow-hidden">
          {/* Top Logo */}
          <div className="flex items-center justify-between pb-4 border-b border-charcoal-700/60 mb-5">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-lime-500 flex items-center justify-center text-charcoal-950 font-black">
                <Dumbbell className="w-4 h-4" />
              </div>
              <span className="text-sm font-black tracking-tight text-white">FITCORE PASS</span>
            </div>
            <Badge variant={isActive ? 'lime' : 'neutral'} size="sm">
              {isActive ? 'Active Member' : 'Inactive'}
            </Badge>
          </div>

          {/* QR Code */}
          <div className="bg-white p-4 rounded-2xl inline-block shadow-lg mx-auto mb-4">
            <QRCodeSVG
              value={qrData}
              size={180}
              level="H"
              includeMargin={false}
              fgColor="#0F1117"
            />
          </div>

          {/* Member Details */}
          <div className="space-y-1">
            <h3 className="text-lg font-black text-slate-100">{user.fullName}</h3>
            <p className="text-xs font-mono font-bold text-lime-400">{user.phone}</p>
          </div>

          {/* Plan badge & visits remaining */}
          <div className="mt-4 pt-3 border-t border-charcoal-700/60 flex justify-between items-center text-xs">
            <div className="text-left">
              <p className="text-[10px] text-slate-400 uppercase font-semibold">Current Plan</p>
              <p className="font-bold text-slate-200">{planName}</p>
            </div>
            {subscription && (
              <div className="text-right">
                <p className="text-[10px] text-slate-400 uppercase font-semibold">Visits Left</p>
                <p className="font-bold text-lime-400">
                  {subscription.daysRemaining} / {subscription.allocatedDays}
                </p>
              </div>
            )}
          </div>
        </div>

        <p className="text-xs text-slate-400">
          Show this QR code at the front desk scanner for seamless touchless check-in.
        </p>

        <Button variant="secondary" className="w-full" onClick={onClose}>
          Done
        </Button>
      </div>
    </Modal>
  );
};
