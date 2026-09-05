import React from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle, ShoppingBag } from 'lucide-react';

export const CheckoutCancelPage: React.FC = () => {
  return (
    <div className="max-w-md mx-auto my-12 text-center p-8 bg-zinc-900/80 border border-zinc-800 rounded-3xl space-y-6 backdrop-blur-xl">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-rose-500/20 text-rose-400 mx-auto border border-rose-500/30">
        <AlertCircle className="h-8 w-8" />
      </div>

      <div className="space-y-2">
        <h1 className="text-2xl font-extrabold text-white">Payment Cancelled</h1>
        <p className="text-xs text-zinc-400">
          Your checkout session was cancelled. No charges were made to your card.
        </p>
      </div>

      <div className="pt-4 border-t border-zinc-800 space-y-3">
        <Link
          to="/cart"
          className="inline-flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-violet-600 font-bold text-xs text-white hover:bg-violet-500 transition shadow-lg shadow-violet-600/20"
        >
          <ShoppingBag className="h-4 w-4" />
          <span>Return to Cart</span>
        </Link>
      </div>
    </div>
  );
};
