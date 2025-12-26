'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, ShoppingBag, PlusCircle, LogOut } from 'lucide-react';

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-[#2D241E] text-[#FAF9F6] flex flex-col border-r border-[#3E342F]">
      
      {/* Logo Area */}
      <div className="p-6 border-b border-[#3E342F]">
        <h2 className="text-2xl font-serif font-bold">Admin Panel</h2>
      </div>

      {/* Menu Links */}
      <nav className="flex-1 p-4 space-y-2">
        <Link 
          href="/admin/dashboard" 
          className={`flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-[#3E342F] ${pathname === '/admin/dashboard' ? 'bg-[#8B9B86]' : ''}`}
        >
          <LayoutDashboard size={20} /> <span>Overview</span>
        </Link>

        <div className="pt-4 px-4 text-xs font-bold text-[#8B9B86] uppercase">Products</div>
        
        <Link 
          href="/admin/products" 
          className={`flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-[#3E342F] ${pathname === '/admin/products' ? 'bg-[#8B9B86]' : ''}`}
        >
          <ShoppingBag size={20} /> <span>View All</span>
        </Link>

        <Link 
          href="/admin/products/add" 
          className={`flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-[#3E342F] ${pathname === '/admin/products/add' ? 'bg-[#8B9B86]' : ''}`}
        >
          <PlusCircle size={20} /> <span>Add New</span>
        </Link>
      </nav>

      {/* Logout Button */}
      <div className="p-4 border-t border-[#3E342F]">
        <button 
          onClick={() => {
            localStorage.clear();
            window.location.href = '/';
          }}
          className="flex items-center gap-3 px-4 py-3 w-full text-red-400 hover:bg-[#3E342F] rounded-lg"
        >
          <LogOut size={20} /> <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}