'use client';

import { useEffect, useState } from 'react';
import { Loader2, Package, Eye, X, MapPin, Mail, Phone, CreditCard, Calendar, User } from 'lucide-react';
import Image from 'next/image';

// --- INTERFACES ---
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

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Fetch Orders
  const fetchOrders = async () => {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/orders`
    );

    if (!res.ok) {
      throw new Error('Failed to fetch orders');
    }

    const data = await res.json();
    setOrders(data);
  } catch (error) {
    console.error('Fetch orders error:', error);
  } finally {
    setLoading(false);
  }
};


  useEffect(() => { fetchOrders(); }, []);

  // Update Status
 const handleStatusChange = async (id: string, newStatus: string) => {
  try {
    const token = localStorage.getItem('token');

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/orders/${id}/status`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      }
    );

    if (!res.ok) {
      throw new Error('Failed to update order status');
    }

    // Optimistic UI update
    setOrders(prev =>
      prev.map(o =>
        o.id === id ? { ...o, order_status: newStatus } : o
      )
    );

    if (selectedOrder?.id === id) {
      setSelectedOrder(prev =>
        prev ? { ...prev, order_status: newStatus } : null
      );
    }
  } catch (error) {
    console.error('Order status update error:', error);
  }
};

  // Status Badge Color Helper
  const getStatusColor = (status: string) => {
    switch(status) {
      case 'pending': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'processing': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'shipped': return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'delivered': return 'bg-green-100 text-green-700 border-green-200';
      case 'cancelled': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="max-w-7xl mx-auto pb-20 relative">
      
      {/* HEADER */}
      <h1 className="text-3xl font-serif font-bold text-[#2D241E] mb-8 flex items-center gap-3">
        <Package size={32} /> Order Management
      </h1>

      {/* TABLE */}
      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="animate-spin text-[#2D241E]" size={40} /></div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead className="bg-stone-50 text-stone-500 text-xs uppercase tracking-wider border-b border-stone-200">
              <tr>
                <th className="p-6 font-bold">Order ID</th>
                <th className="p-6 font-bold">Customer</th>
                <th className="p-6 font-bold">Total</th>
                <th className="p-6 font-bold">Status</th>
                <th className="p-6 font-bold text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {orders.map((order) => (
                <tr key={order.id} className="hover:bg-stone-50/50 transition-colors">
                  <td className="p-6">
                    <span className="font-mono text-xs font-bold text-stone-600 bg-stone-100 px-2 py-1 rounded">#{order.id.slice(-6)}</span>
                    <div className="text-xs text-stone-400 mt-2 flex items-center gap-1">
                      <Calendar size={12} /> {new Date(order.createdAt).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="p-6">
                    <div className="font-bold text-[#2D241E]">{order.customer.firstName} {order.customer.lastName}</div>
                    <div className="text-xs text-stone-500 mt-1">{order.customer.city}</div>
                  </td>
                  <td className="p-6">
                    <div className="font-bold text-[#2D241E]">LKR {order.total_amount.toLocaleString()}</div>
                    <div className="text-[10px] uppercase font-bold text-stone-400 mt-1">{order.payment_method}</div>
                  </td>
                  <td className="p-6">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${getStatusColor(order.order_status)}`}>
                      {order.order_status}
                    </span>
                  </td>
                  <td className="p-6 text-center">
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
          {orders.length === 0 && <div className="p-12 text-center text-stone-400">No orders found.</div>}
        </div>
      )}

      {/* --- ORDER DETAILS MODAL --- */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-[#FAF9F6] w-full max-w-4xl max-h-[90vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden">
            
            {/* Modal Header */}
            <div className="p-6 border-b border-stone-200 bg-white flex justify-between items-center sticky top-0 z-10">
              <div>
                <h2 className="text-2xl font-serif font-bold text-[#2D241E]">Order #{selectedOrder.id.slice(-6)}</h2>
                <p className="text-xs text-stone-500 mt-1">Placed on {new Date(selectedOrder.createdAt).toLocaleString()}</p>
              </div>
              <button onClick={() => setSelectedOrder(null)} className="p-2 hover:bg-stone-100 rounded-full transition-colors">
                <X size={24} className="text-stone-500" />
              </button>
            </div>

            {/* Modal Content (Scrollable) */}
            <div className="flex-1 overflow-y-auto p-6 space-y-8">
              
              {/* 1. Status & Management */}
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
                    onChange={(e) => handleStatusChange(selectedOrder.id, e.target.value)}
                    className="w-full md:w-64 bg-stone-50 border border-stone-200 text-stone-700 text-sm rounded-xl p-3 focus:ring-2 focus:ring-[#2D241E] outline-none cursor-pointer font-medium"
                  >
                    <option value="pending">Pending</option>
                    <option value="processing">Processing</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* 2. Customer Details */}
                <div className="space-y-4">
                  <h3 className="font-bold text-[#2D241E] flex items-center gap-2 text-lg border-b border-stone-200 pb-2">
                    <User size={18} /> Customer Details
                  </h3>
                  <div className="bg-white p-6 rounded-2xl border border-stone-100 space-y-4 text-sm">
                    <div className="flex items-start gap-3">
                      <User size={16} className="text-stone-400 mt-0.5" />
                      <div>
                        <p className="font-bold text-[#2D241E]">{selectedOrder.customer.firstName} {selectedOrder.customer.lastName}</p>
                      </div>
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

                {/* 3. Shipping Address */}
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

              {/* 4. Order Items */}
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
                            <div className="relative w-12 h-12 rounded-lg overflow-hidden border border-stone-200 bg-stone-50">
                              <Image 
                                src={item.image} 
                                alt={item.name} 
                                fill 
                                className="object-cover" 
                                unoptimized={true} // Fix image loading
                              />
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

              {/* 5. Payment Summary */}
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