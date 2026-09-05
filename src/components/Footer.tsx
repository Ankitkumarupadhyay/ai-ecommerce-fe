import React from 'react';
import { ShoppingBag, ShieldCheck, Zap } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full border-t border-zinc-800 bg-zinc-950 text-zinc-400 text-xs py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
        
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-violet-600/20 text-violet-400 border border-violet-500/30">
            <ShoppingBag className="h-4 w-4" />
          </div>
          <div>
            <span className="font-semibold text-zinc-200">Mini AI E-Commerce</span>
            <p className="text-zinc-500">FastAPI • MongoDB • React • Stripe • LangChain AI</p>
          </div>
        </div>

        <div className="flex items-center gap-6 text-zinc-500">
          <span className="flex items-center gap-1">
            <ShieldCheck className="h-4 w-4 text-emerald-400" /> RBAC Protected
          </span>
          <span className="flex items-center gap-1">
            <Zap className="h-4 w-4 text-violet-400" /> Real DB Tools
          </span>
          <span>© {new Date().getFullYear()} AuraStore Demo</span>
        </div>
      </div>
    </footer>
  );
};
