import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import { apiClient } from '@/api/client';
import { formatCurrency } from '@/lib/utils';
import { useAuthStore } from '@/store/authStore';
import { ShoppingBag, Trash2, ArrowRight, ArrowLeft, Lock } from 'lucide-react';

interface CartItem {
  product_id: string;
  name: string;
  price: number;
  image_url: string;
  quantity: number;
  stock: number;
  line_total: number;
}

interface CartData {
  id: string;
  user_id: string;
  items: CartItem[];
  total_amount: number;
}

export const CartPage: React.FC<{ onCartUpdated?: () => void }> = ({ onCartUpdated }) => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();

  const { data: cart, isLoading, isError } = useQuery<CartData>({
    queryKey: ['cart'],
    queryFn: async () => {
      if (!isAuthenticated) return { id: '', user_id: '', items: [], total_amount: 0 };
      const res = await apiClient.get('/cart');
      return res.data;
    },
    enabled: isAuthenticated
  });

  const updateQuantityMutation = useMutation({
    mutationFn: async ({ productId, quantity }: { productId: string; quantity: number }) => {
      return apiClient.put(`/cart/items/${productId}`, { quantity });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      if (onCartUpdated) onCartUpdated();
    }
  });

  const removeItemMutation = useMutation({
    mutationFn: async (productId: string) => {
      return apiClient.delete(`/cart/items/${productId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      if (onCartUpdated) onCartUpdated();
    }
  });

  const checkoutMutation = useMutation({
    mutationFn: async () => {
      // Step 1: Create order from cart
      const orderRes = await apiClient.post('/orders/create-from-cart');
      const orderId = orderRes.data.id;
      // Step 2: Create Stripe session
      const sessionRes = await apiClient.post('/payments/create-checkout-session', { order_id: orderId });
      return sessionRes.data;
    },
    onSuccess: (data) => {
      if (data.checkout_url) {
        window.location.href = data.checkout_url;
      }
    }
  });

  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto my-12 text-center p-8 bg-zinc-900/60 border border-zinc-800 rounded-3xl space-y-4">
        <ShoppingBag className="h-12 w-12 text-zinc-500 mx-auto" />
        <h2 className="text-xl font-bold text-white">Your Cart is Empty</h2>
        <p className="text-xs text-zinc-400">Please sign in to manage your shopping cart.</p>
        <button
          onClick={() => {
            const mockUser = {
              id: '65f01234567890abcdef2222',
              email: 'customer@example.com',
              name: 'Demo Customer',
              picture: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
              role: 'customer' as const
            };
            useAuthStore.getState().setAuth(mockUser, 'mock_google_token_customer');
            queryClient.invalidateQueries({ queryKey: ['cart'] });
          }}
          className="w-full py-2.5 rounded-xl bg-violet-600 font-bold text-xs text-white hover:bg-violet-500 transition shadow-lg shadow-violet-600/20"
        >
          Sign In to Access Cart
        </button>
      </div>
    );
  }

  if (isLoading) {
    return <div className="p-12 text-center text-zinc-400">Loading your cart...</div>;
  }

  const items = cart?.items || [];
  const totalAmount = cart?.total_amount || 0;

  if (items.length === 0) {
    return (
      <div className="max-w-md mx-auto my-12 text-center p-8 bg-zinc-900/60 border border-zinc-800 rounded-3xl space-y-4">
        <ShoppingBag className="h-12 w-12 text-zinc-600 mx-auto" />
        <h2 className="text-xl font-bold text-white">Your Cart is Empty</h2>
        <p className="text-xs text-zinc-400">Add products from our catalog to get started!</p>
        <Link
          to="/"
          className="inline-flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-violet-600 font-bold text-xs text-white hover:bg-violet-500 transition shadow-lg shadow-violet-600/20"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Browse Products</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-16">
      <h1 className="text-3xl font-extrabold text-white flex items-center gap-3">
        <span>Shopping Cart</span>
        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-violet-950 text-violet-300 border border-violet-800">
          {items.length} {items.length === 1 ? 'item' : 'items'}
        </span>
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Cart Item List */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <div
              key={item.product_id}
              className="flex items-center justify-between gap-4 p-4 rounded-2xl bg-zinc-900/80 border border-zinc-800"
            >
              <div className="flex items-center gap-4">
                <img
                  src={item.image_url}
                  alt={item.name}
                  className="h-16 w-16 rounded-xl object-cover bg-zinc-950 border border-zinc-800"
                />
                <div>
                  <h3 className="font-bold text-white text-sm line-clamp-1">{item.name}</h3>
                  <p className="text-xs text-violet-400 font-semibold mt-0.5">
                    {formatCurrency(item.price)} each
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-6">
                {/* Quantity Controls */}
                <div className="flex items-center gap-2 bg-zinc-950 border border-zinc-800 rounded-xl p-1">
                  <button
                    onClick={() =>
                      updateQuantityMutation.mutate({
                        productId: item.product_id,
                        quantity: Math.max(1, item.quantity - 1)
                      })
                    }
                    disabled={item.quantity <= 1 || updateQuantityMutation.isPending}
                    className="w-7 h-7 rounded-lg bg-zinc-900 text-zinc-300 hover:bg-zinc-800 disabled:opacity-30 text-xs font-bold"
                  >
                    -
                  </button>
                  <span className="w-6 text-center text-xs font-bold text-white">{item.quantity}</span>
                  <button
                    onClick={() =>
                      updateQuantityMutation.mutate({
                        productId: item.product_id,
                        quantity: Math.min(item.stock, item.quantity + 1)
                      })
                    }
                    disabled={item.quantity >= item.stock || updateQuantityMutation.isPending}
                    className="w-7 h-7 rounded-lg bg-zinc-900 text-zinc-300 hover:bg-zinc-800 disabled:opacity-30 text-xs font-bold"
                  >
                    +
                  </button>
                </div>

                <div className="text-right min-w-[70px]">
                  <p className="font-bold text-white text-sm">{formatCurrency(item.line_total)}</p>
                </div>

                <button
                  onClick={() => removeItemMutation.mutate(item.product_id)}
                  disabled={removeItemMutation.isPending}
                  className="text-zinc-500 hover:text-red-400 p-1.5 transition"
                  title="Remove Item"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary */}
        <div className="h-fit rounded-3xl bg-zinc-900/90 border border-zinc-800 p-6 space-y-6">
          <h2 className="text-lg font-bold text-white border-b border-zinc-800 pb-4">Order Summary</h2>

          <div className="space-y-3 text-xs text-zinc-400">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span className="font-semibold text-zinc-200">{formatCurrency(totalAmount)}</span>
            </div>
            <div className="flex justify-between">
              <span>Estimated Shipping</span>
              <span className="font-semibold text-emerald-400">FREE</span>
            </div>
            <div className="flex justify-between">
              <span>Taxes</span>
              <span className="font-semibold text-zinc-200">$0.00</span>
            </div>

            <div className="border-t border-zinc-800 pt-3 flex justify-between text-sm font-bold text-white">
              <span>Total</span>
              <span className="text-violet-400">{formatCurrency(totalAmount)}</span>
            </div>
          </div>

          <button
            onClick={() => checkoutMutation.mutate()}
            disabled={checkoutMutation.isPending}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold text-sm shadow-lg shadow-violet-600/25 flex items-center justify-center gap-2 transition disabled:opacity-50"
          >
            <Lock className="h-4 w-4" />
            <span>{checkoutMutation.isPending ? 'Preparing Stripe...' : 'Proceed to Checkout'}</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
