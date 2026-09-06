import React, { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { Bot, X } from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { AIChatWidget } from '@/components/AIChatWidget';
import { ProtectedRoute, AdminRoute } from '@/components/ProtectedRoute';
import { HomePage } from '@/pages/HomePage';
import { ProductDetailPage } from '@/pages/ProductDetailPage';
import { CartPage } from '@/pages/CartPage';
import { CheckoutSuccessPage } from '@/pages/CheckoutSuccessPage';
import { CheckoutCancelPage } from '@/pages/CheckoutCancelPage';
import { OrdersPage } from '@/pages/OrdersPage';
import { OrderDetailPage } from '@/pages/OrderDetailPage';
import { AdminDashboardPage } from '@/pages/AdminDashboardPage';
import { apiClient } from '@/api/client';
import { useAuthStore } from '@/store/authStore';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || 'your_google_client_id_here';

function AppContent() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isAIChatOpen, setIsAIChatOpen] = useState(false);
  const { isAuthenticated } = useAuthStore();

  const { data: cartData, refetch: refetchCart } = useQuery({
    queryKey: ['cart'],
    queryFn: async () => {
      if (!isAuthenticated) return { items: [] };
      const res = await apiClient.get('/cart');
      return res.data;
    },
    enabled: isAuthenticated,
  });

  const cartCount =
    cartData?.items?.reduce((acc: number, item: any) => acc + item.quantity, 0) || 0;

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col justify-between selection:bg-violet-500 selection:text-white">
      <div>
        <Navbar
          cartCount={cartCount}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
        />

        <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-8">
          <Routes>
            <Route
              path="/"
              element={<HomePage searchQuery={searchQuery} onCartUpdated={refetchCart} />}
            />
            <Route
              path="/products/:id"
              element={<ProductDetailPage onCartUpdated={refetchCart} />}
            />
            <Route path="/cart" element={<CartPage onCartUpdated={refetchCart} />} />
            <Route path="/payment/success" element={<CheckoutSuccessPage />} />
            <Route path="/payment/cancel" element={<CheckoutCancelPage />} />

            <Route
              path="/orders"
              element={
                <ProtectedRoute>
                  <OrdersPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/orders/:id"
              element={
                <ProtectedRoute>
                  <OrderDetailPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/admin"
              element={
                <AdminRoute>
                  <AdminDashboardPage />
                </AdminRoute>
              }
            />
          </Routes>
        </main>
      </div>

      <Footer />

      {/* ── Floating AI Chat FAB ── bottom-right corner */}
      <button
        onClick={() => setIsAIChatOpen((open) => !open)}
        aria-label="Open AI Support Assistant"
        title="AI Support Assistant"
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-tr from-violet-600 to-indigo-500 shadow-xl shadow-violet-700/40 hover:scale-110 hover:shadow-violet-600/60 active:scale-95 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-violet-400 focus:ring-offset-2 focus:ring-offset-zinc-950"
      >
        <span className={`absolute inline-flex h-full w-full rounded-full bg-violet-500 opacity-20 ${isAIChatOpen ? '' : 'animate-ping'}`} />
        {isAIChatOpen ? <X className="relative h-6 w-6 text-white" /> : <Bot className="relative h-6 w-6 text-white" />}
      </button>

      {/* AI Chat Panel */}
      <AIChatWidget isOpen={isAIChatOpen} onClose={() => setIsAIChatOpen(false)} />
    </div>
  );
}

export function App() {
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <AppContent />
        </BrowserRouter>
      </QueryClientProvider>
    </GoogleOAuthProvider>
  );
}

export default App;
