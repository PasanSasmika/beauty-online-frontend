'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { LayoutDashboard, ShoppingBag, PlusCircle, LogOut, Tags, Package, Mail, Settings } from 'lucide-react';

export default function AdminSidebar() {
  const pathname = usePathname();
  const isActive = (path: string) => pathname === path;

  const [newOrderCount, setNewOrderCount] = useState(0);

  const fetchAndCompare = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/orders`);
      if (!res.ok) return;
      const data = await res.json();
      const totalNow: number = data.length;

      // How many orders did admin see last time they visited /admin/orders
      const lastSeen = parseInt(localStorage.getItem('admin_orders_last_seen') || '0', 10);
      const diff = totalNow - lastSeen;
      setNewOrderCount(diff > 0 ? diff : 0);
    } catch {}
  };

  // Poll every 30s
  useEffect(() => {
    fetchAndCompare();
    const interval = setInterval(fetchAndCompare, 30000);
    return () => clearInterval(interval);
  }, []);

  // When admin lands on orders page → save current total as "seen", clear badge
  useEffect(() => {
    if (pathname !== '/admin/orders') return;

    const markAsSeen = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/orders`);
        if (!res.ok) return;
        const data = await res.json();
        localStorage.setItem('admin_orders_last_seen', String(data.length));
        setNewOrderCount(0);
      } catch {}
    };

    markAsSeen();
  }, [pathname]);

  return (
    <aside className="w-64 bg-[#000000] text-[#FAF9F6] flex flex-col h-screen fixed left-0 top-0 overflow-y-auto border-r border-[#3E342F]">

      <div className="p-6 border-b border-[#3E342F]">
        <h2 className="text-2xl font-serif font-bold tracking-tight">Admin Panel</h2>
        <p className="text-xs text-[#ee3f5c] mt-1">Skincares.lk Management</p>
      </div>

      <nav className="flex-1 p-4 space-y-2">

        <Link
          href="/admin/dashboard"
          className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
            isActive('/admin/dashboard') ? 'bg-[#ee3f5c] text-white' : 'hover:bg-[#3E342F] text-stone-300'
          }`}
        >
          <LayoutDashboard size={20} />
          <span className="font-medium">Overview</span>
        </Link>

        <div className="pt-6 pb-2 px-4 text-xs font-semibold text-[#ee3f5c] uppercase tracking-wider">Products</div>

        <Link
          href="/admin/products"
          className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
            isActive('/admin/products') ? 'bg-[#ee3f5c] text-white' : 'hover:bg-[#3E342F] text-stone-300'
          }`}
        >
          <ShoppingBag size={20} />
          <span className="font-medium">View All Products</span>
        </Link>

        <Link
          href="/admin/products/add"
          className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
            isActive('/admin/products/add') ? 'bg-[#ee3f5c] text-white' : 'hover:bg-[#3E342F] text-stone-300'
          }`}
        >
          <PlusCircle size={20} />
          <span className="font-medium">Add New Product</span>
        </Link>

        <div className="pt-6 pb-2 px-4 text-xs font-semibold text-[#ee3f5c] uppercase tracking-wider">Management</div>

        <Link
          href="/admin/categories"
          className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
            isActive('/admin/categories') ? 'bg-[#ee3f5c] text-white' : 'hover:bg-[#3E342F] text-stone-300'
          }`}
        >
          <Tags size={20} />
          <span className="font-medium">Categories</span>
        </Link>

        {/* Orders with real new-order badge */}
        <Link
          href="/admin/orders"
          className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
            isActive('/admin/orders') ? 'bg-[#ee3f5c] text-white' : 'hover:bg-[#3E342F] text-stone-300'
          }`}
        >
          <Package size={20} />
          <span className="font-medium flex-1">Orders</span>
          {newOrderCount > 0 && (
            <span className="bg-[#ee3f5c] text-white text-[10px] font-bold px-2 py-0.5 rounded-full min-w-[20px] text-center animate-pulse">
              +{newOrderCount}
            </span>
          )}
        </Link>

        <Link
          href="/admin/messages"
          className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
            isActive('/admin/messages') ? 'bg-[#ee3f5c] text-white' : 'hover:bg-[#3E342F] text-stone-300'
          }`}
        >
          <Mail size={20} />
          <span className="font-medium">Messages</span>
        </Link>

        <Link
          href="/admin/config"
          className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
            isActive('/admin/config') ? 'bg-[#ee3f5c] text-white' : 'hover:bg-[#3E342F] text-stone-300'
          }`}
        >
          <Settings size={20} />
          <span className="font-medium">Settings</span>
        </Link>

      </nav>

      <div className="p-4 border-t border-[#3E342F]">
        <button
          onClick={() => {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/';
          }}
          className="flex items-center gap-3 px-4 py-3 w-full text-left text-red-400 hover:bg-[#3E342F] rounded-lg transition-colors"
        >
          <LogOut size={20} />
          <span className="font-medium">Sign Out</span>
        </button>
      </div>
    </aside>
  );
}