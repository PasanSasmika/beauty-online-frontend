'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, ShoppingBag, PlusCircle, LogOut, Tags } from 'lucide-react';

export default function AdminSidebar() {
  const pathname = usePathname();

  // Helper to check if a link is active for styling
  const isActive = (path: string) => pathname === path;

  return (
    <aside className="w-64 bg-[#000000] text-[#FAF9F6] flex flex-col h-screen fixed left-0 top-0 overflow-y-auto border-r border-[#3E342F]">
      
      {/* 1. Admin Brand Logo */}
      <div className="p-6 border-b border-[#3E342F]">
        <h2 className="text-2xl font-serif font-bold tracking-tight">
          Admin Panel
        </h2>
        <p className="text-xs text-[#ee3f5c] mt-1">Skincare.lk Management</p>
      </div>

      {/* 2. Navigation Links */}
      <nav className="flex-1 p-4 space-y-2">
        
        {/* Dashboard Link */}
        <Link 
          href="/admin/dashboard" 
          className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
            isActive('/admin/dashboard') ? 'bg-[#ee3f5c] text-white' : 'hover:bg-[#3E342F] text-stone-300'
          }`}
        >
          <LayoutDashboard size={20} />
          <span className="font-medium">Overview</span>
        </Link>

        {/* --- PRODUCT SECTION --- */}
        <div className="pt-6 pb-2 px-4 text-xs font-semibold text-[#ee3f5c] uppercase tracking-wider">
          Products
        </div>

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

        {/* --- MANAGEMENT SECTION --- */}
        <div className="pt-6 pb-2 px-4 text-xs font-semibold text-[#ee3f5c] uppercase tracking-wider">
          Management
        </div>

        <Link 
          href="/admin/categories" 
          className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
            isActive('/admin/categories') ? 'bg-[#ee3f5c] text-white' : 'hover:bg-[#3E342F] text-stone-300'
          }`}
        >
          <Tags size={20} />
          <span className="font-medium">Categories</span>
        </Link>
        
      </nav>

      {/* 3. Bottom Actions */}
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