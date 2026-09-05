import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { apiClient } from '@/api/client';
import { formatCurrency } from '@/lib/utils';
import { Package, Clock, CheckCircle2, XCircle, ArrowRight } from 'lucide-react';

interface OrderItem {
  product_id: string;
  product_name: string;
  price: number;
  quantity: number;
}

interface Order {
  id: string;
  user_id: string;
  items: OrderItem[];
  subtotal: number;
  total: number;
  currency: string;
  payment_status: string;
  order_status: string;
  created_at: string;
}

export const OrdersPage: React.FC = () => {
  const { data: orders = [], isLoading, isError } = useQuery<Order[]>({
    queryKey: ['orders'],
    queryFn: async () => {
      const res = await apiClient.get('/orders');
      return res.data;
    }
  });

  if (isLoading) {
    return <div className="p-12 text-center text-zinc-400">Loading your order history...</div>;
  }

  if (isError) {
    return <div className="p-12 text-center text-red-400">Failed to load orders.</div>;
  }

  if (orders.length === 0) {
    return (
      <div className="max-w-md mx-auto my-12 text-center p-8 bg-zinc-900/60 border border-zinc-800 rounded-3xl space-y-4">
        <Package className="h-12 w-12 text-zinc-600 mx-auto" />
        <h2 className="text-xl font-bold text-white">No Orders Found</h2>
        <p className="text-xs text-zinc-400">You haven't placed any orders yet.</p>
        <Link
          to="/"
          className="inline-flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-violet-600 font-bold text-xs text-white hover:bg-violet-500 transition shadow-lg shadow-violet-600/20"
        >
          Browse Products
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16">
      <h1 className="text-3xl font-extrabold text-white flex items-center gap-3">
        <span>My Orders</span>
        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-violet-950 text-violet-300 border border-violet-800">
          {orders.length} Total
        </span>
      </h1>

      <div className="space-y-4">
        {orders.map((order) => (
          <div
            key={order.id}
            className="p-6 rounded-3xl bg-zinc-900/80 border border-zinc-800 space-y-4 hover:border-zinc-700 transition"
          >
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-zinc-800 pb-4 text-xs">
              <div className="space-y-1">
                <span className="text-zinc-500 font-mono">ORDER #{order.id}</span>
                <p className="text-zinc-300">
                  Placed on {new Date(order.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                </p>
              </div>

              <div className="flex items-center gap-3">
                {/* Payment Badge */}
                <span
                  className={`px-2.5 py-1 rounded-full font-bold uppercase text-[10px] ${
                    order.payment_status === 'paid'
                      ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                      : 'bg-amber-950 text-amber-400 border border-amber-800'
                  }`}
                >
                  Payment: {order.payment_status}
                </span>

                {/* Status Badge */}
                <span
                  className={`px-2.5 py-1 rounded-full font-bold uppercase text-[10px] ${
                    order.order_status === 'confirmed' || order.order_status === 'delivered'
                      ? 'bg-violet-950 text-violet-300 border border-violet-800'
                      : 'bg-zinc-800 text-zinc-300 border border-zinc-700'
                  }`}
                >
                  Status: {order.order_status}
                </span>
              </div>
            </div>

            {/* Items Summary */}
            <div className="space-y-2">
              {order.items.map((item, idx) => (
                <div key={idx} className="flex justify-between items-center text-xs text-zinc-300">
                  <span>
                    {item.product_name} <strong className="text-zinc-500">x{item.quantity}</strong>
                  </span>
                  <span className="font-semibold text-white">{formatCurrency(item.price * item.quantity)}</span>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="pt-3 border-t border-zinc-800/60 flex items-center justify-between">
              <div className="text-xs">
                <span className="text-zinc-500">Total Amount: </span>
                <span className="font-extrabold text-white text-sm">{formatCurrency(order.total, order.currency)}</span>
              </div>

              <Link
                to={`/orders/${order.id}`}
                className="inline-flex items-center gap-1 text-xs font-semibold text-violet-400 hover:text-violet-300 transition"
              >
                <span>View Details</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
