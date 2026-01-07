'use client';

import { useEffect, useState } from 'react';
import { 
  Users, 
  ShoppingBag, 
  DollarSign, 
  Package, 
  Loader2, 
  ArrowUpRight 
} from 'lucide-react';

interface DashboardData {
  stats: {
    users: number;
    products: number;
    orders: number;
    revenue: number;
  };
  recentOrders: any[];
  statusCounts: any[];
}

export default function AdminDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem('token'); // Assuming you use JWT
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/dashboard/stats`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        if (!res.ok) throw new Error('Failed to fetch stats');
        const jsonData = await res.json();
        setData(jsonData);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
        <div className="flex h-96 items-center justify-center">
            <Loader2 className="animate-spin text-[#2D241E]" size={40} />
        </div>
    );
  }

  if (!data) return <div>Error loading dashboard.</div>;

  return (
    <div className="max-w-7xl mx-auto pb-10">
      {/* 1. STATS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-28 relative top-20">
        
        {/* Revenue Card */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-100">
          <div className="flex justify-between items-start">
            <div>
                <h3 className="text-stone-500 text-xs font-bold uppercase tracking-wider">Total Revenue</h3>
                <p className="text-3xl font-bold text-[#2D241E] mt-2">
                    LKR {data.stats.revenue.toLocaleString()}
                </p>
            </div>
            <div className="p-3 bg-green-50 text-green-600 rounded-lg">
                <DollarSign size={24} />
            </div>
          </div>
        </div>

        {/* Orders Card */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-100">
          <div className="flex justify-between items-start">
            <div>
                <h3 className="text-stone-500 text-xs font-bold uppercase tracking-wider">Total Orders</h3>
                <p className="text-3xl font-bold text-[#2D241E] mt-2">
                    {data.stats.orders}
                </p>
            </div>
            <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
                <ShoppingBag size={24} />
            </div>
          </div>
        </div>

        {/* Products Card */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-100">
          <div className="flex justify-between items-start">
            <div>
                <h3 className="text-stone-500 text-xs font-bold uppercase tracking-wider">Products</h3>
                <p className="text-3xl font-bold text-[#2D241E] mt-2">
                    {data.stats.products}
                </p>
            </div>
            <div className="p-3 bg-orange-50 text-orange-600 rounded-lg">
                <Package size={24} />
            </div>
          </div>
        </div>

        {/* Users Card */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-100">
          <div className="flex justify-between items-start">
            <div>
                <h3 className="text-stone-500 text-xs font-bold uppercase tracking-wider">Customers</h3>
                <p className="text-3xl font-bold text-[#2D241E] mt-2">
                    {data.stats.users}
                </p>
            </div>
            <div className="p-3 bg-purple-50 text-purple-600 rounded-lg">
                <Users size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* 2. RECENT ORDERS TABLE */}
      <div className="bg-white rounded-3xl shadow-sm border border-stone-200 overflow-hidden">
        <div className="p-6 border-b border-stone-100 flex justify-between items-center">
            <h3 className="font-bold text-lg text-[#2D241E]">Recent Orders</h3>
            <a href="/admin/orders" className="text-sm font-medium text-[#ee3f5c] flex items-center gap-1 hover:underline">
                View All <ArrowUpRight size={16} />
            </a>
        </div>
        <table className="w-full text-left">
            <thead className="bg-stone-50 text-xs text-stone-500 uppercase">
                <tr>
                    <th className="px-6 py-4 font-bold">Order ID</th>
                    <th className="px-6 py-4 font-bold">Customer</th>
                    <th className="px-6 py-4 font-bold">Date</th>
                    <th className="px-6 py-4 font-bold">Amount</th>
                    <th className="px-6 py-4 font-bold">Status</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 text-sm">
                {data.recentOrders.map((order) => (
                    <tr key={order._id || order.id} className="hover:bg-stone-50 transition-colors">
                        <td className="px-6 py-4 font-mono text-stone-500">#{order._id?.slice(-6) || order.id?.slice(-6)}</td>
                        <td className="px-6 py-4 font-medium text-[#2D241E]">
                            {order.customer?.firstName} {order.customer?.lastName}
                        </td>
                        <td className="px-6 py-4 text-stone-500">
                            {new Date(order.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 font-bold text-[#2D241E]">
                            LKR {order.total_amount.toLocaleString()}
                        </td>
                        <td className="px-6 py-4">
                            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                                order.order_status === 'delivered' ? 'bg-green-100 text-green-700' :
                                order.order_status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                                order.order_status === 'cancelled' ? 'bg-red-100 text-red-700' :
                                'bg-blue-100 text-blue-700'
                            }`}>
                                {order.order_status}
                            </span>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
      </div>

    </div>
  );
}