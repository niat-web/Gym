import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { Modal } from '../ui/Modal.js';
import { Button } from '../ui/Button.js';
import { checkinApi, CheckInResult } from '../../services/checkin.api.js';
import { Camera, AlertCircle, Loader2 } from 'lucide-react';

interface QRScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (result: CheckInResult) => void;
}

export const QRScannerModal: React.FC<QRScannerModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const scannerRef = useRef<Html5Qrcode | null>(null);

  useEffect(() => {
    if (!isOpen) {
      if (scannerRef.current) {
        scannerRef.current
          .stop()
          .catch(() => {})
          .finally(() => {
            scannerRef.current = null;
          });
      }
      return;
    }

    const startScanner = async () => {
      setErrorMsg(null);
      try {
        const scanner = new Html5Qrcode('qr-reader-container');
        scannerRef.current = scanner;

        await scanner.start(
          { facingMode: 'environment' },
          {
            fps: 10,
            qrbox: { width: 220, height: 220 },
          },
          async (decodedText) => {
            if (isProcessing) return;
            setIsProcessing(true);

            try {
              let memberId = decodedText;
              try {
                const parsed = JSON.parse(decodedText);
                if (parsed.memberId) {
                  memberId = parsed.memberId;
                }
              } catch (e) {}

              // Stop scanner on valid read
              await scanner.stop();
              scannerRef.current = null;

              const res = await checkinApi.checkIn({ memberId });
              if (res.success && res.data) {
                onSuccess(res.data);
                onClose();
              } else {
                setErrorMsg(res.error?.message || 'Check-in refused');
              }
            } catch (err: any) {
              setErrorMsg(
                err.response?.data?.error?.message || 'Attendance refused: Subscription expired or no active plan'
              );
            } finally {
              setIsProcessing(false);
            }
          },
          (errorMessage) => {
            // QR scanning in progress
          }
        );
      } catch (err: any) {
        setErrorMsg('Camera access denied or device has no supported camera.');
      }
    };

    const timer = setTimeout(startScanner, 200);
    return () => {
      clearTimeout(timer);
      if (scannerRef.current) {
        scannerRef.current
          .stop()
          .catch(() => {})
          .finally(() => {
            scannerRef.current = null;
          });
      }
    };
  }, [isOpen]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="sm">
      <div className="space-y-4 text-center">
        <div className="flex items-center justify-center gap-2 pb-2">
          <Camera className="w-5 h-5 text-lime-400" />
          <h3 className="text-lg font-bold text-white">Scan Member QR Pass</h3>
        </div>

        {/* Video stream container */}
        <div className="relative rounded-2xl overflow-hidden bg-charcoal-950 border-2 border-dashed border-lime-500/40 aspect-square flex items-center justify-center">
          <div id="qr-reader-container" className="w-full h-full" />

          {isProcessing && (
            <div className="absolute inset-0 bg-charcoal-900/90 flex flex-col items-center justify-center gap-2">
              <Loader2 className="w-8 h-8 text-lime-400 animate-spin" />
              <p className="text-xs font-bold text-slate-200">Verifying Member...</p>
            </div>
          )}
        </div>

        {errorMsg && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-start gap-2 text-left">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        <p className="text-xs text-slate-400">
          Point device camera at the member's digital QR pass to auto-record attendance.
        </p>

        <Button variant="secondary" className="w-full" onClick={onClose}>
          Cancel
        </Button>
      </div>
    </Modal>
  );
};
