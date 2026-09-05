import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GoogleLogin, CredentialResponse } from '@react-oauth/google';
import { useAuthStore } from '@/store/authStore';
import { apiClient } from '@/api/client';
import { ShoppingBag, LogOut, Shield, Search, AlertCircle, X } from 'lucide-react';

interface NavbarProps {
  cartCount?: number;
  searchQuery?: string;
  setSearchQuery?: (q: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  cartCount = 0,
  searchQuery = '',
  setSearchQuery,
}) => {
  const { user, isAuthenticated, logout, setAuth } = useAuthStore();
  const navigate = useNavigate();
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || 'your_google_client_id_here';
  const isGoogleConfigured = googleClientId && !googleClientId.startsWith('your_google_client_id');

  const handleGoogleSuccess = async (credentialResponse: CredentialResponse) => {
    if (!credentialResponse.credential) return;

    try {
      setAuthError(null);
      const res = await apiClient.post('/auth/google', {
        credential: credentialResponse.credential
      });

      const { access_token, user: authUser } = res.data;
      setAuth(authUser, access_token);
    } catch (err: any) {
      console.error('Google Auth Failed:', err);
      setAuthError(err.response?.data?.detail || 'Google Authentication failed on backend server.');
    }
  };



  return (
    <header className="sticky top-0 z-40 w-full border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-2 text-xl font-bold tracking-tight text-white hover:opacity-90">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-violet-600 to-indigo-500 shadow-lg shadow-violet-500/20">
            <ShoppingBag className="h-5 w-5 text-white" />
          </div>
          <span className="bg-gradient-to-r from-white via-zinc-200 to-zinc-400 bg-clip-text text-transparent">
            AuraStore
          </span>
        </Link>

        {/* Search Bar */}
        {setSearchQuery && (
          <div className="hidden md:flex flex-1 max-w-md mx-8 relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
            <input
              type="text"
              placeholder="Search products, categories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-zinc-900/90 border border-zinc-800 rounded-full text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition"
            />
          </div>
        )}

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          
          {/* Cart Icon */}
          <Link
            to="/cart"
            className="relative flex h-10 w-10 items-center justify-center rounded-full bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white hover:border-zinc-700 transition"
            aria-label="View Cart"
          >
            <ShoppingBag className="h-5 w-5" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-violet-600 text-[11px] font-bold text-white shadow-md">
                {cartCount}
              </span>
            )}
          </Link>

          {/* User Auth Section */}
          {isAuthenticated && user ? (
            <div className="flex items-center gap-2">
              <Link
                to="/orders"
                className="hidden sm:inline-flex text-xs font-medium text-zinc-400 hover:text-white px-2 py-1 transition"
              >
                My Orders
              </Link>
              
              {user.role === 'admin' && (
                <Link
                  to="/admin"
                  className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-lg bg-emerald-950/80 border border-emerald-800/60 text-emerald-400 hover:bg-emerald-900/80 transition"
                >
                  <Shield className="h-3.5 w-3.5" />
                  <span>Admin</span>
                </Link>
              )}

              <div className="flex items-center gap-2 pl-2 border-l border-zinc-800">
                <img
                  src={user.picture || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'}
                  alt={user.name}
                  className="h-8 w-8 rounded-full border border-zinc-700 object-cover"
                />
                <button
                  onClick={() => {
                    logout();
                    navigate('/');
                  }}
                  className="p-2 text-zinc-400 hover:text-red-400 transition"
                  title="Sign Out"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              {isGoogleConfigured ? (
                <div className="scale-90 origin-right">
                  <GoogleLogin
                    onSuccess={handleGoogleSuccess}
                    onError={() => setAuthError('Google Sign-In popup failed or was closed.')}
                    theme="filled_black"
                    shape="pill"
                    size="medium"
                  />
                </div>
              ) : (
                <button
                  onClick={() => setShowConfigModal(true)}
                  className="px-3.5 py-1.5 rounded-lg bg-violet-600 text-white text-xs font-semibold hover:bg-violet-500 shadow-md shadow-violet-600/20 transition"
                >
                  Sign In with Google
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Auth Error Toast */}
      {authError && (
        <div className="bg-rose-950/90 border-b border-rose-800 px-4 py-2 text-xs text-rose-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-rose-400" />
            <span>{authError}</span>
          </div>
          <button onClick={() => setAuthError(null)} className="text-rose-400 hover:text-white">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Google Client ID Configuration Help Modal */}
      {showConfigModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-3xl border border-zinc-800 bg-zinc-900 p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-amber-400" />
                Google Client ID Setup Required
              </h3>
              <button onClick={() => setShowConfigModal(false)} className="text-zinc-400 hover:text-white">
                <X className="h-4 w-4" />
              </button>
            </div>

            <p className="text-xs text-zinc-300 leading-relaxed">
              To trigger the live Google OAuth login popup, place your Google OAuth Client ID inside your environment file:
            </p>

            <div className="bg-zinc-950 p-3 rounded-xl border border-zinc-800 text-[11px] font-mono text-violet-300 space-y-1">
              <p className="text-zinc-500"># In frontend/.env</p>
              <p>VITE_GOOGLE_CLIENT_ID=your_real_client_id.apps.googleusercontent.com</p>
            </div>

            <p className="text-[11px] text-zinc-400">
              In the meantime, you can instantly test authenticated customer features using <strong>Instant Demo Sign-In</strong>:
            </p>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowConfigModal(false)}
                className="px-4 py-2 rounded-xl bg-violet-600 text-white text-xs font-bold hover:bg-violet-500 transition shadow-lg shadow-violet-600/20"
              >
                Got It
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
