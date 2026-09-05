import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi, CreateProductInput, UpdateProductInput } from '@/api/services';
import { formatCurrency } from '@/lib/utils';
import { Shield, Plus, Edit, Trash2, Package, Layers, X, Check } from 'lucide-react';

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

interface Order {
  id: string;
  user_id: string;
  items: any[];
  total: number;
  currency: string;
  payment_status: string;
  order_status: string;
  created_at: string;
}

export const AdminDashboardPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'products' | 'orders'>('products');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // New Product Form State
  const [newProduct, setNewProduct] = useState<CreateProductInput>({
    name: '',
    description: '',
    price: 49.99,
    image_url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500',
    stock: 20,
    category: 'Electronics',
    is_active: true
  });

  // Queries
  const { data: adminProducts = [], isLoading: productsLoading } = useQuery<Product[]>({
    queryKey: ['adminProducts'],
    queryFn: () => adminApi.getProducts()
  });

  const { data: adminOrders = [], isLoading: ordersLoading } = useQuery<Order[]>({
    queryKey: ['adminOrders'],
    queryFn: () => adminApi.getOrders()
  });

  // Mutations
  const createProductMutation = useMutation({
    mutationFn: (data: CreateProductInput) => adminApi.createProduct(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminProducts'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      setShowCreateModal(false);
    }
  });

  const updateProductMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateProductInput }) => adminApi.updateProduct(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminProducts'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      setEditingProduct(null);
    }
  });

  const deleteProductMutation = useMutation({
    mutationFn: (id: string) => adminApi.deleteProduct(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminProducts'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
    }
  });

  const updateOrderStatusMutation = useMutation({
    mutationFn: ({ orderId, status }: { orderId: string; status: string }) => adminApi.updateOrderStatus(orderId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminOrders'] });
    }
  });

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-16">
      
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-zinc-800 pb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-800/60 text-xs font-semibold text-emerald-400 mb-2">
            <Shield className="h-3.5 w-3.5" />
            <span>Admin Authorization Active</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white">Admin Dashboard</h1>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 rounded-xl p-1">
          <button
            onClick={() => setActiveTab('products')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition ${
              activeTab === 'products' ? 'bg-violet-600 text-white' : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Layers className="h-4 w-4" />
            <span>Product Management ({adminProducts.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition ${
              activeTab === 'orders' ? 'bg-violet-600 text-white' : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Package className="h-4 w-4" />
            <span>Order Management ({adminOrders.length})</span>
          </button>
        </div>
      </div>

      {/* Product Management */}
      {activeTab === 'products' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-bold text-white">Store Inventory</h2>
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 font-bold text-xs text-white transition shadow-lg shadow-violet-600/20"
            >
              <Plus className="h-4 w-4" />
              <span>Create New Product</span>
            </button>
          </div>

          {productsLoading ? (
            <div className="p-8 text-center text-zinc-400">Loading admin products...</div>
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-zinc-800 bg-zinc-900/60">
              <table className="w-full text-left text-xs text-zinc-300">
                <thead className="bg-zinc-950 text-zinc-400 font-semibold border-b border-zinc-800">
                  <tr>
                    <th className="p-4">Product</th>
                    <th className="p-4">Category</th>
                    <th className="p-4">Price</th>
                    <th className="p-4">Stock</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60">
                  {adminProducts.map((p) => (
                    <tr key={p.id} className="hover:bg-zinc-900/80 transition">
                      <td className="p-4 flex items-center gap-3">
                        <img src={p.image_url} alt={p.name} className="h-10 w-10 rounded-lg object-cover bg-zinc-950 border border-zinc-800" />
                        <div>
                          <p className="font-bold text-white text-sm line-clamp-1">{p.name}</p>
                          <p className="text-[11px] text-zinc-500 font-mono">ID: {p.id}</p>
                        </div>
                      </td>
                      <td className="p-4 font-semibold text-zinc-400">{p.category}</td>
                      <td className="p-4 font-bold text-violet-400">{formatCurrency(p.price)}</td>
                      <td className="p-4 font-bold">{p.stock}</td>
                      <td className="p-4">
                        <button
                          onClick={() => updateProductMutation.mutate({ id: p.id, data: { is_active: !p.is_active } })}
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold cursor-pointer transition ${p.is_active ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-rose-950 text-rose-400 border border-rose-800'}`}
                          title="Click to toggle active status"
                        >
                          {p.is_active ? 'Active' : 'Inactive'}
                        </button>
                      </td>
                      <td className="p-4 text-right space-x-2">
                        <button
                          onClick={() => setEditingProduct(p)}
                          className="p-1.5 text-zinc-400 hover:text-violet-400 transition"
                          title="Edit Product"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => deleteProductMutation.mutate(p.id)}
                          className="p-1.5 text-zinc-500 hover:text-red-400 transition"
                          title="Delete Product"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Order Management */}
      {activeTab === 'orders' && (
        <div className="space-y-6">
          <h2 className="text-lg font-bold text-white">All Platform Customer Orders</h2>
          {ordersLoading ? (
            <div className="p-8 text-center text-zinc-400">Loading admin orders...</div>
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-zinc-800 bg-zinc-900/60">
              <table className="w-full text-left text-xs text-zinc-300">
                <thead className="bg-zinc-950 text-zinc-400 font-semibold border-b border-zinc-800">
                  <tr>
                    <th className="p-4">Order ID & Date</th>
                    <th className="p-4">Customer ID</th>
                    <th className="p-4">Total</th>
                    <th className="p-4">Payment Status</th>
                    <th className="p-4">Order Status</th>
                    <th className="p-4 text-right">Update Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60">
                  {adminOrders.map((o) => (
                    <tr key={o.id} className="hover:bg-zinc-900/80 transition">
                      <td className="p-4">
                        <p className="font-bold text-white font-mono">{o.id}</p>
                        <p className="text-zinc-500 text-[10px]">{new Date(o.created_at).toLocaleString()}</p>
                      </td>
                      <td className="p-4 font-mono text-zinc-400">{o.user_id}</td>
                      <td className="p-4 font-bold text-white">{formatCurrency(o.total)}</td>
                      <td className="p-4">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${o.payment_status === 'paid' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-amber-950 text-amber-400'}`}>
                          {o.payment_status}
                        </span>
                      </td>
                      <td className="p-4 font-bold uppercase text-violet-300">{o.order_status}</td>
                      <td className="p-4 text-right">
                        <select
                          value={o.order_status}
                          onChange={(e) => updateOrderStatusMutation.mutate({ orderId: o.id, status: e.target.value })}
                          className="bg-zinc-950 border border-zinc-800 text-xs font-semibold text-zinc-200 rounded-lg px-2 py-1 focus:outline-none focus:border-violet-500 cursor-pointer"
                        >
                          <option value="pending">pending</option>
                          <option value="confirmed">confirmed</option>
                          <option value="processing">processing</option>
                          <option value="shipped">shipped</option>
                          <option value="delivered">delivered</option>
                          <option value="cancelled">cancelled</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Create Product Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-3xl border border-zinc-800 bg-zinc-900 p-6 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b border-zinc-800 pb-3">
              <h3 className="text-lg font-bold text-white">Create New Product</h3>
              <button onClick={() => setShowCreateModal(false)} className="text-zinc-400 hover:text-white">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-zinc-400 mb-1">Product Name</label>
                <input
                  type="text"
                  value={newProduct.name}
                  onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-white"
                  placeholder="e.g. Wireless Noise-Canceling Headphones"
                />
              </div>
              <div>
                <label className="block text-zinc-400 mb-1">Description</label>
                <textarea
                  value={newProduct.description}
                  onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-white h-20"
                  placeholder="Product description..."
                />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-zinc-400 mb-1">Price ($)</label>
                  <input
                    type="number"
                    value={newProduct.price}
                    onChange={(e) => setNewProduct({ ...newProduct, price: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-zinc-400 mb-1">Stock</label>
                  <input
                    type="number"
                    value={newProduct.stock}
                    onChange={(e) => setNewProduct({ ...newProduct, stock: parseInt(e.target.value) || 0 })}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-zinc-400 mb-1">Category</label>
                  <select
                    value={newProduct.category}
                    onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-white"
                  >
                    <option value="Electronics">Electronics</option>
                    <option value="Clothing">Clothing</option>
                    <option value="Accessories">Accessories</option>
                    <option value="Home">Home</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-zinc-400 mb-1">Image URL</label>
                <input
                  type="text"
                  value={newProduct.image_url}
                  onChange={(e) => setNewProduct({ ...newProduct, image_url: e.target.value })}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-white"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-zinc-800">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 rounded-xl bg-zinc-800 text-zinc-300 font-bold text-xs"
              >
                Cancel
              </button>
              <button
                onClick={() => createProductMutation.mutate(newProduct)}
                disabled={!newProduct.name || createProductMutation.isPending}
                className="px-4 py-2 rounded-xl bg-violet-600 text-white font-bold text-xs hover:bg-violet-500 transition"
              >
                Save Product
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Product Modal */}
      {editingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-3xl border border-zinc-800 bg-zinc-900 p-6 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b border-zinc-800 pb-3">
              <h3 className="text-lg font-bold text-white">Edit Product</h3>
              <button onClick={() => setEditingProduct(null)} className="text-zinc-400 hover:text-white">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-zinc-400 mb-1">Product Name</label>
                <input
                  type="text"
                  value={editingProduct.name}
                  onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-400 mb-1">Price ($)</label>
                  <input
                    type="number"
                    value={editingProduct.price}
                    onChange={(e) => setEditingProduct({ ...editingProduct, price: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-zinc-400 mb-1">Stock</label>
                  <input
                    type="number"
                    value={editingProduct.stock}
                    onChange={(e) => setEditingProduct({ ...editingProduct, stock: parseInt(e.target.value) || 0 })}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-white"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-zinc-800">
              <button
                onClick={() => setEditingProduct(null)}
                className="px-4 py-2 rounded-xl bg-zinc-800 text-zinc-300 font-bold text-xs"
              >
                Cancel
              </button>
              <button
                onClick={() =>
                  updateProductMutation.mutate({
                    id: editingProduct.id,
                    data: {
                      name: editingProduct.name,
                      price: editingProduct.price,
                      stock: editingProduct.stock
                    }
                  })
                }
                disabled={updateProductMutation.isPending}
                className="px-4 py-2 rounded-xl bg-violet-600 text-white font-bold text-xs hover:bg-violet-500 transition"
              >
                Update Product
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
