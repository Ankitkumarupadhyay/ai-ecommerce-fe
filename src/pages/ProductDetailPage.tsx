import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiClient } from '@/api/client';
import { formatCurrency } from '@/lib/utils';
import { useAppSelector } from '@/store/hooks';
import { ShoppingBag, ArrowLeft, CheckCircle2, ShieldCheck, Truck, RefreshCw } from 'lucide-react';

export const ProductDetailPage: React.FC<{ onCartUpdated?: () => void }> = ({ onCartUpdated }) => {
  const { id } = useParams<{ id: string }>();
  const [quantity, setQuantity] = useState<number>(1);
  const [added, setAdded] = useState(false);
  const navigate = useNavigate();
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);

  const { data: product, isLoading, isError } = useQuery({
    queryKey: ['product', id],
    queryFn: async () => {
      const res = await apiClient.get(`/products/${id}`);
      return res.data;
    },
    enabled: !!id
  });

  const addToCartMutation = useMutation({
    mutationFn: async () => {
      if (!isAuthenticated) return null;
      return apiClient.post('/cart/items', { product_id: id, quantity });
    },
    onSuccess: (data) => {
      if (!data) return;
      setAdded(true);
      setTimeout(() => setAdded(false), 2000);
      if (onCartUpdated) onCartUpdated();
    }
  });

  if (isLoading) {
    return <div className="p-12 text-center text-zinc-400">Loading product details...</div>;
  }

  if (isError || !product) {
    return (
      <div className="p-12 text-center text-red-400 space-y-4">
        <p>Product not found.</p>
        <Link to="/" className="text-xs text-violet-400 hover:underline">Return to Store</Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-16">
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white transition"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Back to products</span>
      </button>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 bg-zinc-900/60 border border-zinc-800 rounded-3xl p-6 sm:p-8 backdrop-blur-xl">
        
        {/* Product Image */}
        <div className="aspect-square w-full rounded-2xl bg-zinc-950 border border-zinc-800 overflow-hidden">
          <img
            src={product.image_url}
            alt={product.name}
            className="h-full w-full object-cover object-center"
          />
        </div>

        {/* Details Column */}
        <div className="flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <span className="inline-block px-3 py-1 rounded-full bg-violet-950/80 border border-violet-800/60 text-xs font-semibold text-violet-300">
              {product.category}
            </span>
            <h1 className="text-3xl font-extrabold text-white">{product.name}</h1>
            <p className="text-2xl font-black text-violet-400">
              {formatCurrency(product.price, product.currency)}
            </p>
            <p className="text-sm text-zinc-300 leading-relaxed">
              {product.description}
            </p>
          </div>

          <div className="space-y-6 border-t border-zinc-800/80 pt-6">
            
            {/* Quantity Selector */}
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-zinc-400">Select Quantity:</span>
              <div className="flex items-center gap-2 bg-zinc-950 border border-zinc-800 rounded-xl p-1">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  disabled={quantity <= 1}
                  className="w-8 h-8 rounded-lg bg-zinc-900 text-zinc-300 hover:bg-zinc-800 disabled:opacity-30 transition font-bold"
                >
                  -
                </button>
                <span className="w-8 text-center text-sm font-bold text-white">{quantity}</span>
                <button
                  onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                  disabled={quantity >= product.stock}
                  className="w-8 h-8 rounded-lg bg-zinc-900 text-zinc-300 hover:bg-zinc-800 disabled:opacity-30 transition font-bold"
                >
                  +
                </button>
              </div>
            </div>

            {/* Add to Cart CTA */}
            <button
              onClick={() => addToCartMutation.mutate()}
              disabled={product.stock <= 0 || addToCartMutation.isPending || !isAuthenticated}
              title={!isAuthenticated ? 'Sign in to add to cart' : undefined}
              className={`w-full py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-lg transition ${
                added
                  ? 'bg-emerald-600 text-white'
                  : 'bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white shadow-violet-600/25 disabled:opacity-50 disabled:cursor-not-allowed'
              }`}
            >
              {added ? (
                <>
                  <CheckCircle2 className="h-5 w-5" />
                  <span>Added {quantity} to Cart</span>
                </>
              ) : (
                <>
                  <ShoppingBag className="h-5 w-5" />
                  <span>Add to Cart ({formatCurrency(product.price * quantity, product.currency)})</span>
                </>
              )}
            </button>

            {/* Trust Badges */}
            <div className="grid grid-cols-3 gap-2 pt-2 text-[11px] text-zinc-400 text-center">
              <div className="flex flex-col items-center gap-1 p-2 rounded-xl bg-zinc-950/60 border border-zinc-800/50">
                <Truck className="h-4 w-4 text-violet-400" />
                <span>Fast Shipping</span>
              </div>
              <div className="flex flex-col items-center gap-1 p-2 rounded-xl bg-zinc-950/60 border border-zinc-800/50">
                <ShieldCheck className="h-4 w-4 text-emerald-400" />
                <span>Stripe Verified</span>
              </div>
              <div className="flex flex-col items-center gap-1 p-2 rounded-xl bg-zinc-950/60 border border-zinc-800/50">
                <RefreshCw className="h-4 w-4 text-amber-400" />
                <span>30-Day Returns</span>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};
