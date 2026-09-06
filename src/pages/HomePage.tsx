import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { productsApi, cartApi } from '@/api/services';
import { formatCurrency } from '@/lib/utils';
import { useAppSelector } from '@/store/hooks';
import { ShoppingBag, CheckCircle2, Sparkles, Filter } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  image_url: string;
  stock: number;
  category: string;
  is_active: boolean;
}

interface HomePageProps {
  searchQuery: string;
  onCartUpdated?: () => void;
}

export const HomePage: React.FC<HomePageProps> = ({ searchQuery, onCartUpdated }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [addedProductId, setAddedProductId] = useState<string | null>(null);
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);

  const categories = ['All', 'Electronics', 'Clothing', 'Accessories', 'Home'];

  const { data: products = [], isLoading, isError } = useQuery<Product[]>({
    queryKey: ['products', searchQuery, selectedCategory],
    queryFn: () => productsApi.getProducts({
      search: searchQuery || undefined,
      category: selectedCategory !== 'All' ? selectedCategory : undefined
    })
  });

  const addToCartMutation = useMutation({
    mutationFn: async (productId: string) => {
      if (!isAuthenticated) return null;
      return cartApi.addItem(productId, 1);
    },
    onSuccess: (_, productId) => {
      setAddedProductId(productId);
      setTimeout(() => setAddedProductId(null), 2000);
      if (onCartUpdated) onCartUpdated();
    }
  });

  return (
    <div className="space-y-10 pb-16">
      
      {/* Hero Banner */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-violet-950/80 via-zinc-900 to-indigo-950/80 p-8 sm:p-12 border border-zinc-800 shadow-2xl">
        <div className="relative z-10 max-w-2xl space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full bg-violet-500/10 border border-violet-500/30 px-3 py-1 text-xs font-semibold text-violet-300">
            <Sparkles className="h-3.5 w-3.5 text-amber-400" />
            <span>AI-Driven Modern E-Commerce Platform</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
            Curated Products for <span className="bg-gradient-to-r from-violet-400 to-indigo-300 bg-clip-text text-transparent">Digital Creators</span>
          </h1>
          <p className="text-sm sm:text-base text-zinc-300">
            Explore premium electronics, apparel, and lifestyle gear backed by real-time AI customer support and automated Stripe checkout.
          </p>
        </div>
      </section>

      {/* Category Filter Bar */}
      <div className="flex flex-wrap sm:flex-nowrap items-center justify-between gap-3 pb-2 border-b border-zinc-800/60">
        <div className="flex items-center gap-2 shrink-0">
          <Filter className="h-4 w-4 text-zinc-400" />
          <span className="text-xs font-medium text-zinc-400">Categories:</span>
        </div>
        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap overflow-x-auto pb-0.5">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 sm:px-4 py-1.5 rounded-full text-xs font-medium transition whitespace-nowrap ${
                selectedCategory === cat
                  ? 'bg-violet-600 text-white shadow-md shadow-violet-600/20'
                  : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-zinc-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Product Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div key={n} className="h-80 rounded-2xl bg-zinc-900/60 border border-zinc-800 animate-pulse" />
          ))}
        </div>
      ) : isError ? (
        <div className="p-8 text-center bg-zinc-900/50 rounded-2xl border border-zinc-800 text-red-400 text-sm">
          Failed to load products from API server.
        </div>
      ) : products.length === 0 ? (
        <div className="p-12 text-center bg-zinc-900/40 rounded-2xl border border-zinc-800 text-zinc-400 space-y-2">
          <ShoppingBag className="h-10 w-10 mx-auto text-zinc-600" />
          <p className="font-semibold text-zinc-200">No products found</p>
          <p className="text-xs text-zinc-500">Try clearing search terms or selecting a different category.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product) => (
            <div
              key={product.id}
              className="group flex flex-col justify-between rounded-2xl bg-zinc-900/80 border border-zinc-800 p-4 transition-all duration-300 hover:border-violet-500/50 hover:shadow-xl hover:shadow-violet-950/20"
            >
              <div className="space-y-3">
                {/* Clickable image + details → product detail page */}
                <Link to={`/products/${product.id}`} className="block space-y-3">
                  {/* Image */}
                  <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-zinc-950 border border-zinc-800/80">
                    <img
                      src={product.image_url}
                      alt={product.name}
                      className="h-full w-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                    />
                    <span className="absolute top-2.5 right-2.5 rounded-full bg-zinc-950/80 backdrop-blur-md px-2.5 py-1 text-[11px] font-semibold text-zinc-300 border border-zinc-800">
                      {product.category}
                    </span>
                  </div>

                  {/* Name & description */}
                  <div>
                    <h3 className="font-bold text-zinc-100 text-sm line-clamp-1 group-hover:text-violet-400 transition">
                      {product.name}
                    </h3>
                    <p className="text-xs text-zinc-400 line-clamp-2 mt-1">
                      {product.description}
                    </p>
                  </div>
                </Link>

              </div>

              {/* Price & Actions */}
              <div className="mt-4 pt-3 border-t border-zinc-800/60 flex items-center justify-between">
                <div>
                  <span className="text-lg font-extrabold text-white">
                    {formatCurrency(product.price, product.currency)}
                  </span>
                  <span className={`block text-[10px] ${product.stock > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {product.stock > 0 ? `In Stock (${product.stock})` : 'Out of Stock'}
                  </span>
                </div>

                <button
                  onClick={() => addToCartMutation.mutate(product.id)}
                  disabled={product.stock <= 0 || addToCartMutation.isPending || !isAuthenticated}
                  title={!isAuthenticated ? 'Sign in to add to cart' : undefined}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition ${
                    addedProductId === product.id
                      ? 'bg-emerald-600 text-white'
                      : 'bg-violet-600 hover:bg-violet-500 text-white disabled:opacity-50 disabled:cursor-not-allowed'
                  }`}
                >
                  {addedProductId === product.id ? (
                    <>
                      <CheckCircle2 className="h-4 w-4" />
                      <span>Added</span>
                    </>
                  ) : (
                    <>
                      <ShoppingBag className="h-4 w-4" />
                      <span>Add to Cart</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
