import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/api/client';
import { formatCurrency } from '@/lib/utils';
import { ArrowLeft, Package, CheckCircle2, CreditCard, ShieldCheck } from 'lucide-react';

export const OrderDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  const { data: order, isLoading, isError } = useQuery({
    queryKey: ['order', id],
    queryFn: async () => {
      const res = await apiClient.get(`/orders/${id}`);
      return res.data;
    },
    enabled: !!id
  });

  if (isLoading) {
    return <div className="p-12 text-center text-zinc-400">Loading order details...</div>;
  }

  if (isError || !order) {
    return (
      <div className="p-12 text-center text-red-400 space-y-4">
        <p>Order not found or access restricted.</p>
        <Link to="/orders" className="text-xs text-violet-400 hover:underline">Back to Orders</Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-16">
      <Link
        to="/orders"
        className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white transition"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Back to Order History</span>
      </Link>

      <div className="p-8 rounded-3xl bg-zinc-900/80 border border-zinc-800 space-y-6 backdrop-blur-xl">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-zinc-800 pb-6">
          <div>
            <span className="text-xs text-zinc-500 font-mono">ORDER #{order.id}</span>
            <h1 className="text-2xl font-extrabold text-white">Order Details</h1>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full font-bold uppercase text-xs bg-emerald-950 text-emerald-400 border border-emerald-800">
              {order.payment_status}
            </span>
            <span className="px-3 py-1 rounded-full font-bold uppercase text-xs bg-violet-950 text-violet-300 border border-violet-800">
              {order.order_status}
            </span>
          </div>
        </div>

        {/* Purchased Items List */}
        <div className="space-y-4">
          <h2 className="text-sm font-bold text-zinc-300">Purchased Items</h2>
          <div className="divide-y divide-zinc-800/80">
            {order.items.map((item: any, idx: number) => (
              <div key={idx} className="py-3 flex justify-between items-center text-xs">
                <div>
                  <p className="font-bold text-white text-sm">{item.product_name}</p>
                  <p className="text-zinc-500">Unit Price: {formatCurrency(item.price)}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-violet-400 text-sm">{formatCurrency(item.price * item.quantity)}</p>
                  <p className="text-zinc-500">Qty: {item.quantity}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Pricing Summary */}
        <div className="pt-4 border-t border-zinc-800 space-y-2 text-xs text-zinc-400">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span className="font-semibold text-zinc-200">{formatCurrency(order.subtotal, order.currency)}</span>
          </div>
          <div className="flex justify-between text-sm font-bold text-white pt-2 border-t border-zinc-800">
            <span>Grand Total</span>
            <span className="text-violet-400">{formatCurrency(order.total, order.currency)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
