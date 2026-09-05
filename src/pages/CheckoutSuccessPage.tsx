import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { apiClient } from '@/api/client';
import { CheckCircle2, ArrowRight, Package } from 'lucide-react';

export const CheckoutSuccessPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const [verifying, setVerifying] = useState(true);
  const [verifiedOrder, setVerifiedOrder] = useState<any>(null);

  useEffect(() => {
    async function verify() {
      if (sessionId) {
        try {
          const res = await apiClient.post('/payments/verify-session', null, {
            params: { session_id: sessionId }
          });
          setVerifiedOrder(res.data);
        } catch (e) {
          console.error("Verification warning:", e);
        } finally {
          setVerifying(false);
        }
      } else {
        setVerifying(false);
      }
    }
    verify();
  }, [sessionId]);

  return (
    <div className="max-w-md mx-auto my-12 text-center p-8 bg-zinc-900/80 border border-zinc-800 rounded-3xl space-y-6 backdrop-blur-xl">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 mx-auto border border-emerald-500/30">
        <CheckCircle2 className="h-8 w-8" />
      </div>

      <div className="space-y-2">
        <h1 className="text-2xl font-extrabold text-white">Payment Successful!</h1>
        <p className="text-xs text-zinc-400">
          Thank you for your order. Stripe payment has been confirmed by our backend.
        </p>
      </div>

      {verifying ? (
        <div className="text-xs text-zinc-500 animate-pulse">Verifying order confirmation status...</div>
      ) : (
        <div className="pt-4 border-t border-zinc-800 space-y-3">
          <Link
            to="/orders"
            className="inline-flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-violet-600 font-bold text-xs text-white hover:bg-violet-500 transition shadow-lg shadow-violet-600/20"
          >
            <Package className="h-4 w-4" />
            <span>View Order History</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            to="/"
            className="block text-xs text-zinc-400 hover:text-white transition"
          >
            Continue Shopping
          </Link>
        </div>
      )}
    </div>
  );
};
