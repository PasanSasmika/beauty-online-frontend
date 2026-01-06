'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { Loader2, Package, LogOut, Calendar } from 'lucide-react';

export default function ProfilePage() {
  const { user, token, logout } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) {
        router.push('/'); // Redirect if not logged in
        return;
    }

    const fetchMyOrders = async () => {
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/orders/my-orders`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            setOrders(data);
        } catch (e) { console.error(e); } 
        finally { setLoading(false); }
    };

    fetchMyOrders();
  }, [token, router]);

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[#FAF9F6] pt-32 pb-20 px-6 md:px-20">
      <div className="max-w-4xl mx-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-12">
            <div>
                <h1 className="text-3xl font-serif font-bold text-[#2D241E]">Hello, {user.full_name}</h1>
                <p className="text-stone-500">{user.email}</p>
            </div>
            <button onClick={logout} className="flex items-center gap-2 text-[#ee3f5c] border border-[#ee3f5c] px-4 py-2 rounded-lg hover:bg-[#ee3f5c] hover:text-white transition-all">
                <LogOut size={18} /> Sign Out
            </button>
        </div>

        {/* Order History */}
        <h2 className="text-xl font-bold text-[#2D241E] mb-6 flex items-center gap-2">
            <Package size={20} /> Order History
        </h2>

        {loading ? (
            <div className="py-20 flex justify-center"><Loader2 className="animate-spin text-[#2D241E]" /></div>
        ) : orders.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-2xl border border-stone-100">
                <p className="text-stone-400">You haven't placed any orders yet.</p>
            </div>
        ) : (
            <div className="space-y-4">
                {orders.map((order) => (
                    <div key={order.id} className="bg-white p-6 rounded-2xl border border-stone-100 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex flex-col md:flex-row justify-between md:items-center mb-4 pb-4 border-b border-stone-50">
                            <div>
                                <span className="text-xs font-bold text-stone-400 uppercase tracking-wider">Order #{order.id.slice(-6)}</span>
                                <div className="flex items-center gap-2 text-stone-500 text-sm mt-1">
                                    <Calendar size={14} /> {new Date(order.createdAt).toLocaleDateString()}
                                </div>
                            </div>
                            <div className="mt-2 md:mt-0 flex items-center gap-3">
                                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                                    order.order_status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                                    order.order_status === 'delivered' ? 'bg-green-100 text-green-700' :
                                    'bg-blue-100 text-blue-700'
                                }`}>
                                    {order.order_status}
                                </span>
                                <span className="font-bold text-[#2D241E] text-lg">LKR {order.total_amount.toLocaleString()}</span>
                            </div>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {order.items.map((item: any, idx: number) => (
                                <div key={idx} className="text-xs bg-stone-50 px-3 py-1 rounded-lg text-stone-600">
                                    {item.quantity}x {item.name}
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        )}
      </div>
    </div>
  );
}