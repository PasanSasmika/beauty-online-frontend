'use client';

import { ArrowRight, Search, Sparkles, Star, ShieldCheck } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

// const QUICK_CATEGORIES = [
//   { label: 'Skincare', emoji: '✨' },
//   { label: 'Makeup', emoji: '💄' },
//   { label: 'Perfume', emoji: '🌸' },
//   { label: 'Haircare', emoji: '💆' },
//   { label: 'Body Care', emoji: '🧴' },
// ];

export default function Hero() {
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      router.push('/products');
    }
  };

  const handleCategoryClick = (category: string) => {
    router.push(`/products?category=${encodeURIComponent(category.toLowerCase())}`);
  };

  return (
    <section className="relative min-h-[90vh] flex items-center bg-[#FAF9F6] overflow-hidden">

      {/* Soft background blobs */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#ee3f5c]/6 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[#EBE5D9]/80 rounded-full blur-[100px] pointer-events-none" />

      <div className="container mx-auto px-4 sm:px-6 md:px-20 pt-24 pb-12 grid lg:grid-cols-12 gap-12 items-center z-10 w-full">

        {/* Text + Search Content */}
        <div className="lg:col-span-7 flex flex-col gap-6">

          {/* Trust pill */}
          <div className="inline-flex items-center gap-2 bg-white border border-stone-200 rounded-full px-4 py-2 w-max shadow-sm">
            <ShieldCheck size={14} className="text-[#ee3f5c]" />
            <span className="text-xs font-semibold text-stone-600 tracking-wide uppercase">100% Authentic Products</span>
          </div>

          {/* 1. Reduced base font size and removed <br /> so it wraps naturally on mobile */}
       
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-[#000000] leading-[1.15]">
            Where Elegance <br />
            <span className="text-[#ee3f5c]">Truly Meets Radiance</span>
          </h1>
          <p className="text-base md:text-xl text-stone-600 max-w-lg leading-relaxed font-medium opacity-90">
            Step into a world of beauty and sophistication. Relax, rejuvenate, and let our curated treatments elevate your mind, body, and spirit.
          </p>

          {/* 2. Search bar — icon-only button on xs screens */}
          <form onSubmit={handleSearch} className="w-full max-w-xl">
            <div className="flex items-center bg-white rounded-2xl shadow-lg border border-stone-200 overflow-hidden focus-within:border-[#ee3f5c] focus-within:shadow-[0_0_0_3px_rgba(238,63,92,0.12)] transition-all duration-200">
              <Search size={20} className="ml-4 text-stone-400 shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search Products name..."
                className="flex-1 px-3 py-4 text-[#000000] placeholder-stone-400 bg-transparent outline-none text-sm sm:text-base font-medium min-w-0"
              />
              <button
                type="submit"
                className="m-1.5 bg-[#ee3f5c] hover:bg-[#c1023e] text-white px-3 sm:px-6 py-3 rounded-xl font-semibold transition-colors shrink-0 flex items-center gap-2"
              >
                <span className="hidden sm:inline">Search</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </form>

          {/* 3. CTA Buttons — stack vertically on xs, row on sm+ */}
          <div className="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4 pt-2">
            <Link href="/products">
              <button className="flex items-center justify-center gap-2 bg-[#ee3f5c] text-white px-8 py-4 rounded-full font-semibold hover:bg-[#c1023e] transition-colors shadow-lg w-full sm:w-auto">
                View Collections <ArrowRight className="w-5 h-5" />
              </button>
            </Link>
            <Link href="/contact">
              <button className="bg-transparent border-2 border-[#000000] px-8 py-4 rounded-full font-semibold text-[#000000] hover:bg-[#000000] hover:text-white transition-colors w-full sm:w-auto">
                Contact Us
              </button>
            </Link>
          </div>

          {/* 4. Social proof — wrap on small screens */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 pt-2">
            <div className="flex items-center gap-1.5">
              <div className="flex text-yellow-400">
                {[1,2,3,4,5].map(i => <Star key={i} size={14} fill="currentColor" />)}
              </div>
              <span className="text-sm text-stone-500 font-medium">4.9 · 2,400+ reviews</span>
            </div>
            <div className="hidden sm:block w-px h-4 bg-stone-300" />
            <div className="flex items-center gap-1.5 text-sm text-stone-500 font-medium">
              <Sparkles size={14} className="text-[#ee3f5c]" />
              Island-wide delivery
            </div>
          </div>
        </div>

        {/* Hero Image */}
        <div className="lg:col-span-5 relative mt-12 lg:mt-0">
          <div className="relative w-full max-w-md mx-auto h-[450px] md:h-[550px]">
            <div className="absolute inset-0 bg-[#EBE5D9] rounded-[30px] rotate-6 scale-[1.03] origin-bottom-right z-0 shadow-lg"></div>
            <div className="relative w-full h-full rounded-[30px] overflow-hidden shadow-2xl z-10">
              <Image
                src="/image.jpg"
                alt="Radiant skin"
                fill
                className="object-cover"
                priority
              />
            </div>
          </div>
        </div>

      </div>

      <div className="absolute bottom-10 left-0 w-full h-[1px] bg-stone-200 hidden md:block" />
    </section>
  );
}