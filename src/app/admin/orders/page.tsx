'use client';

import { useEffect, useState, useMemo } from 'react';
import { Loader2, Package, Eye, X, MapPin, Mail, Phone, CreditCard, Calendar, User, Search, ChevronLeft, ChevronRight, Filter } from 'lucide-react';
import Image from 'next/image';

interface OrderItem {
  name: string;
  size: string;
  price: number;
  quantity: number;
  image: string;
}

interface Order {
  id: string;
  customer: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    postalCode: string;
  };
  items: OrderItem[];
  total_amount: number;
  shipping_cost: number;
  order_status: string;
  payment_method: string;
  payment_status: string;
  createdAt: string;
}

const STATUS_OPTIONS = ['all', 'pending', 'processing', 'shipped', 'delivered', 'cancelled', 'returned'];
const PAGE_SIZE = 10;

export default function AdminOrdersPage() {
  const [orders, setOrders]               = useState<Order[]>([]);
  const [loading, setLoading]             = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // ── Controls ──────────────────────────────────────────────
  const [searchInput, setSearchInput] = useState('');   // what user types
  const [search, setSearch]           = useState('');   // applied only on button click / Enter
  const [statusFilter, setStatus]     = useState('all');
  const [page, setPage]               = useState(1);

  const fetchOrders = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/orders`);
      if (!res.ok) throw new Error('Failed to fetch orders');
      setOrders(await res.json());
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchOrders(); }, []);

  // Apply search on button click or Enter key
  const applySearch = () => {
    setSearch(searchInput);
    setPage(1);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') applySearch();
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/orders/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error('Failed');
      setOrders(prev => prev.map(o => o.id === id ? { ...o, order_status: newStatus } : o));
      setSelectedOrder(prev => prev ? { ...prev, order_status: newStatus } : null);
    } catch (e) { console.error(e); }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':    return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'processing': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'shipped':    return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'delivered':  return 'bg-green-100 text-green-700 border-green-200';
      case 'cancelled':  return 'bg-red-100 text-red-700 border-red-200';
      case 'returned':  return 'bg-orange-100 text-orange-700 border-orange-200';
      default:           return 'bg-gray-100 text-gray-700';
    }
  };

  // ── Filter + Search + Paginate ────────────────────────────
  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return orders.filter(o => {
      const matchStatus = statusFilter === 'all' || o.order_status === statusFilter;
      const matchSearch =
        !q ||
        o.id.toLowerCase().includes(q) ||
        o.id.slice(-8).toLowerCase().includes(q) ||
        `${o.customer.firstName} ${o.customer.lastName}`.toLowerCase().includes(q) ||
        o.customer.email.toLowerCase().includes(q) ||
        o.customer.city.toLowerCase().includes(q);
      return matchStatus && matchSearch;
    });
  }, [orders, search, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated  = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // Reset to page 1 on filter change
  useEffect(() => { setPage(1); }, [statusFilter]);

  return (
    <div className="max-w-7xl mx-auto pb-20 relative">

      {/* HEADER */}
      <h1 className="text-3xl font-serif font-bold text-[#2D241E] mb-8 flex items-center gap-3">
        <Package size={32} /> Order Management
      </h1>

      {/* ── Search + Filter bar ── */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">

        {/* Search input + button */}
        <div className="flex flex-1 gap-2">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              type="text"
              placeholder="Search by order ID, name, email, city…"
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-stone-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#2D241E] text-stone-700"
            />
          </div>
          <button
            onClick={applySearch}
            className="px-5 py-2.5 bg-[#2D241E] hover:bg-stone-800 text-white text-sm font-semibold rounded-xl transition-colors flex items-center gap-2 shrink-0"
          >
            <Search size={15} />
            Search
          </button>
        </div>

        {/* Status filter */}
        <div className="relative">
          <Filter size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none" />
          <select
            value={statusFilter}
            onChange={e => setStatus(e.target.value)}
            className="pl-9 pr-4 py-2.5 bg-white border border-stone-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#2D241E] text-stone-700 cursor-pointer appearance-none"
          >
            {STATUS_OPTIONS.map(s => (
              <option key={s} value={s}>{s === 'all' ? 'All Statuses' : s.charAt(0).toUpperCase() + s.slice(1)}</option>
            ))}
          </select>
        </div>

        {/* Result count */}
        <div className="flex items-center text-sm text-stone-400 whitespace-nowrap px-1">
          {filtered.length} order{filtered.length !== 1 ? 's' : ''}
        </div>
      </div>

      {/* TABLE */}
      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="animate-spin text-[#2D241E]" size={40} />
        </div>
      ) : (
        <>
          <div className="bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead className="bg-stone-50 text-stone-500 text-xs uppercase tracking-wider border-b border-stone-200">
                <tr>
                  <th className="p-5 font-bold">Order ID</th>
                  <th className="p-5 font-bold">Customer</th>
                  <th className="p-5 font-bold">Total</th>
                  <th className="p-5 font-bold">Status</th>
                  <th className="p-5 font-bold text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {paginated.map(order => (
                  <tr key={order.id} className="hover:bg-stone-50/50 transition-colors">
                    <td className="p-5">
                      <span className="font-mono text-xs font-bold text-stone-600 bg-stone-100 px-2 py-1 rounded">
                        {order.id.slice(-8).toUpperCase()}
                      </span>
                      <div className="text-xs text-stone-400 mt-2 flex items-center gap-1">
                        <Calendar size={11} /> {new Date(order.createdAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="p-5">
                      <div className="font-bold text-[#2D241E]">{order.customer.firstName} {order.customer.lastName}</div>
                      <div className="text-xs text-stone-500 mt-1">{order.customer.city}</div>
                    </td>
                    <td className="p-5">
                      <div className="font-bold text-[#2D241E]">LKR {order.total_amount.toLocaleString()}</div>
                      <div className="text-[10px] uppercase font-bold text-stone-400 mt-1">{order.payment_method}</div>
                    </td>
                    <td className="p-5">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${getStatusColor(order.order_status)}`}>
                        {order.order_status}
                      </span>
                    </td>
                    <td className="p-5 text-center">
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="text-[#2D241E] hover:bg-stone-100 p-2 rounded-lg transition-colors border border-stone-200"
                        title="View Details"
                      >
                        <Eye size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {paginated.length === 0 && (
              <div className="p-12 text-center text-stone-400">
                {filtered.length === 0 ? 'No orders match your search.' : 'No orders found.'}
              </div>
            )}
          </div>

          {/* ── Pagination ── */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-5 px-1">
              <p className="text-sm text-stone-500">
                Page {page} of {totalPages}
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="p-2 rounded-xl border border-stone-200 bg-white hover:bg-stone-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft size={16} />
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter(n => n === 1 || n === totalPages || Math.abs(n - page) <= 1)
                  .reduce<(number | '...')[]>((acc, n, i, arr) => {
                    if (i > 0 && n - (arr[i - 1] as number) > 1) acc.push('...');
                    acc.push(n);
                    return acc;
                  }, [])
                  .map((n, i) =>
                    n === '...' ? (
                      <span key={`ellipsis-${i}`} className="px-2 text-stone-400 text-sm">…</span>
                    ) : (
                      <button
                        key={n}
                        onClick={() => setPage(n as number)}
                        className={`w-9 h-9 rounded-xl text-sm font-semibold transition-colors border ${
                          page === n
                            ? 'bg-[#2D241E] text-white border-[#2D241E]'
                            : 'bg-white border-stone-200 text-stone-600 hover:bg-stone-50'
                        }`}
                      >
                        {n}
                      </button>
                    )
                  )}

                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="p-2 rounded-xl border border-stone-200 bg-white hover:bg-stone-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* ── ORDER DETAILS MODAL ── */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-[#FAF9F6] w-full max-w-4xl max-h-[90vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden">

            <div className="p-6 border-b border-stone-200 bg-white flex justify-between items-center sticky top-0 z-10">
              <div>
                <h2 className="text-2xl font-serif font-bold text-[#2D241E]">Order {selectedOrder.id.slice(-8).toUpperCase()}</h2>
                <p className="text-xs text-stone-500 mt-1">Placed on {new Date(selectedOrder.createdAt).toLocaleString()}</p>
              </div>
              <button onClick={() => setSelectedOrder(null)} className="p-2 hover:bg-stone-100 rounded-full transition-colors">
                <X size={24} className="text-stone-500" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-8">

              <div className="bg-white p-6 rounded-2xl border border-stone-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <p className="text-xs font-bold text-stone-400 uppercase mb-1">Current Status</p>
                  <span className={`px-4 py-2 rounded-lg text-sm font-bold uppercase tracking-wider border ${getStatusColor(selectedOrder.order_status)}`}>
                    {selectedOrder.order_status}
                  </span>
                </div>
                <div className="w-full md:w-auto">
                  <p className="text-xs font-bold text-stone-400 uppercase mb-1">Update Status</p>
                  <select
                    value={selectedOrder.order_status}
                    onChange={e => handleStatusChange(selectedOrder.id, e.target.value)}
                    className="w-full md:w-64 bg-stone-50 border border-stone-200 text-stone-700 text-sm rounded-xl p-3 focus:ring-2 focus:ring-[#2D241E] outline-none cursor-pointer font-medium"
                  >
                    <option value="pending">Pending</option>
                    <option value="processing">Processing</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                    <option value="returned">Returned</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <h3 className="font-bold text-[#2D241E] flex items-center gap-2 text-lg border-b border-stone-200 pb-2">
                    <User size={18} /> Customer Details
                  </h3>
                  <div className="bg-white p-6 rounded-2xl border border-stone-100 space-y-4 text-sm">
                    <div className="flex items-start gap-3">
                      <User size={16} className="text-stone-400 mt-0.5" />
                      <p className="font-bold text-[#2D241E]">{selectedOrder.customer.firstName} {selectedOrder.customer.lastName}</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <Mail size={16} className="text-stone-400 mt-0.5" />
                      <p className="text-stone-600">{selectedOrder.customer.email}</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <Phone size={16} className="text-stone-400 mt-0.5" />
                      <p className="text-stone-600">{selectedOrder.customer.phone}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-bold text-[#2D241E] flex items-center gap-2 text-lg border-b border-stone-200 pb-2">
                    <MapPin size={18} /> Shipping Address
                  </h3>
                  <div className="bg-white p-6 rounded-2xl border border-stone-100 text-sm text-stone-600 leading-relaxed">
                    <p>{selectedOrder.customer.address}</p>
                    <p>{selectedOrder.customer.city}</p>
                    <p>{selectedOrder.customer.postalCode}</p>
                    <p className="mt-2 font-bold text-[#2D241E]">Sri Lanka</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-bold text-[#2D241E] flex items-center gap-2 text-lg border-b border-stone-200 pb-2">
                  <Package size={18} /> Order Items
                </h3>
                <div className="bg-white rounded-2xl border border-stone-100 overflow-hidden">
                  <table className="w-full text-left">
                    <thead className="bg-stone-50 text-xs font-bold text-stone-500 uppercase">
                      <tr>
                        <th className="p-4">Product</th>
                        <th className="p-4">Size</th>
                        <th className="p-4 text-center">Qty</th>
                        <th className="p-4 text-right">Price</th>
                        <th className="p-4 text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100 text-sm">
                      {selectedOrder.items.map((item, idx) => (
                        <tr key={idx}>
                          <td className="p-4 flex items-center gap-4">
                            <div className="relative w-12 h-12 rounded-lg overflow-hidden border border-stone-200 bg-stone-50 flex-shrink-0">
                              <Image src={item.image} alt={item.name} fill className="object-cover" unoptimized />
                            </div>
                            <span className="font-medium text-[#2D241E]">{item.name}</span>
                          </td>
                          <td className="p-4 text-stone-500">{item.size}</td>
                          <td className="p-4 text-center font-bold">{item.quantity}</td>
                          <td className="p-4 text-right text-stone-600">{item.price.toLocaleString()}</td>
                          <td className="p-4 text-right font-bold text-[#2D241E]">{(item.price * item.quantity).toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="flex justify-end">
                <div className="w-full md:w-1/2 bg-white p-6 rounded-2xl border border-stone-100 space-y-3">
                  <h3 className="font-bold text-[#2D241E] mb-4 flex items-center gap-2">
                    <CreditCard size={18} /> Payment Summary
                  </h3>
                  <div className="flex justify-between text-stone-600 text-sm">
                    <span>Payment Method</span>
                    <span className="font-bold uppercase">{selectedOrder.payment_method}</span>
                  </div>
                  <div className="flex justify-between text-stone-600 text-sm">
                    <span>Shipping Cost</span>
                    <span>LKR {selectedOrder.shipping_cost.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-[#2D241E] text-lg font-bold pt-4 border-t border-stone-100">
                    <span>Total Amount</span>
                    <span>LKR {selectedOrder.total_amount.toLocaleString()}</span>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  );
}