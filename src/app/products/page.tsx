'use client';

import { useEffect, useState, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Loader2, ArrowLeft, Search, X } from 'lucide-react';
import { motion } from 'framer-motion';

interface Product {
  id: number;
  name: string;
  brand: string;
  images: string; 
  category: string;
  variants: any;
}

export default function AllProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // NEW: Dynamic Categories State
  const [categories, setCategories] = useState<{id: string, label: string}[]>([]);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // 1. Fetch Categories
  useEffect(() => {
    fetch('http://localhost:5000/api/categories')
      .then(res => res.json())
      .then(data => {
        // Transform data for UI
        const formatted = data.map((c: any) => ({ 
            id: c.name.toLowerCase(), 
            label: c.name 
        }));
        // Prepend 'All' option
        setCategories([{ id: 'all', label: 'All Products' }, ...formatted]);
      })
      .catch(e => console.error("Error fetching categories", e));
  }, []);

  // 2. Fetch Products
  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (selectedCategory && selectedCategory !== 'all') params.append('category', selectedCategory);

      const res = await fetch(`http://localhost:5000/api/products?${params.toString()}`);
      const data = await res.json();
      setProducts(data);
    } catch (error) {
      console.error('Failed to load products', error);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, selectedCategory]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchProducts();
    }, 500); 

    return () => clearTimeout(delayDebounceFn);
  }, [fetchProducts]);

  return (
    <div className="min-h-screen bg-[#FAF9F6]">
      
      {/* Header */}
      <div className="bg-[#2D241E] text-[#FAF9F6] pt-12 pb-24 px-6 md:px-20 relative overflow-hidden">
        <div className="max-w-7xl mx-auto relative z-10">
          <Link href="/" className="inline-flex items-center gap-2 text-[#8B9B86] hover:text-white mb-6 transition-colors">
             <ArrowLeft size={16} /> Back to Home
          </Link>
          <h1 className=" text-4xl md:text-5xl font-bold mb-8">Shop Collection</h1>
          
          <div className="max-w-2xl">
            <div className="relative">
              <input 
                type="text" 
                placeholder="Search by product name or brand..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-4 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:bg-white/20 focus:border-white/40 transition-all"
              />
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50" size={20} />
              
              {searchTerm && (
                <button 
                  onClick={() => setSearchTerm('')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/50 hover:text-white"
                >
                  <X size={18} />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Dynamic Filter Tabs */}
      <div className="px-6 md:px-20 -mt-8 relative z-20">
        <div className="max-w-7xl mx-auto overflow-x-auto pb-4 scrollbar-hide">
          <div className="flex gap-2">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`whitespace-nowrap px-6 py-3 rounded-full text-sm font-medium transition-all shadow-sm border ${
                  selectedCategory === cat.id 
                    ? 'bg-[#2D241E] text-white border-[#2D241E]' 
                    : 'bg-white text-stone-600 border-stone-200 hover:border-[#2D241E] hover:text-[#2D241E]'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Product Grid */}
      <section className="py-12 px-6 md:px-20 max-w-7xl mx-auto min-h-[500px]">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 className="animate-spin text-[#2D241E]" size={40} />
            <p className="text-stone-500">Updating collection...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-stone-100 shadow-sm">
            <p className="text-xl text-[#2D241E] mb-2">No products found</p>
            <p className="text-stone-500">Try adjusting your search or filters</p>
            <button 
              onClick={() => { setSearchTerm(''); setSelectedCategory('all'); }}
              className="mt-6 text-[#8B9B86] hover:text-[#2D241E] font-medium underline"
            >
              Clear all filters
            </button>
          </div>
        ) : (
          <>
            <p className="mb-6 text-sm text-stone-500 font-medium">{products.length} Products Found</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </>
        )}
      </section>

    </div>
  );
}

// Helper Card Component
function ProductCard({ product }: { product: Product }) {
  let imageUrl = '/logo.png'; 
  try {
    let imageData = product.images;
    if (typeof imageData === 'string') {
        try {
            if (imageData.startsWith('[')) imageData = JSON.parse(imageData);
        } catch (e) {}
    }
    if (Array.isArray(imageData) && imageData.length > 0) {
        imageUrl = `http://localhost:5000${imageData[0]}`;
    } else if (typeof imageData === 'string' && imageData.startsWith('/')) {
        imageUrl = `http://localhost:5000${imageData}`;
    }
  } catch (e) { console.error(e); }

  let firstVariant = null;
  let displayPrice = 0;
  let displayOriginalPrice = 0;
  try {
     const v = product.variants; 
     const variantsArray = typeof v === 'string' ? JSON.parse(v) : v;
     if (Array.isArray(variantsArray) && variantsArray.length > 0) {
        firstVariant = variantsArray[0];
        displayPrice = parseFloat(firstVariant.price);
        displayOriginalPrice = firstVariant.original_price ? parseFloat(firstVariant.original_price) : 0;
     }
  } catch (e) { console.error(e); }

  const discount = displayOriginalPrice > 0
    ? Math.round(((displayOriginalPrice - displayPrice) / displayOriginalPrice) * 100)
    : 0;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="group relative bg-white rounded-2xl overflow-hidden shadow-sm border border-[#2D241E]/5 hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
    >
      <div className="relative aspect-[3/4] bg-stone-100 overflow-hidden">
        <Image
          src={imageUrl}
          alt={product.name}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-700"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
          unoptimized={true} 
        />
        {discount > 0 && (
          <span className="absolute top-3 left-3 bg-[#E11D48] text-white text-xs font-bold px-3 py-1 rounded-full z-10">
            -{discount}%
          </span>
        )}
      </div>
      <div className="p-5">
         <p className="text-xs text-stone-500 uppercase font-bold tracking-wider mb-1">{product.brand}</p>
         <h3 className="text-lg text-[#2D241E] truncate mb-2">{product.name}</h3>
         {firstVariant && (
            <span className="inline-block text-[10px] uppercase bg-stone-100 px-2 py-1 rounded text-stone-600 font-medium mb-3">
               {firstVariant.size}
            </span>
         )}
         <div className="flex items-center gap-3">
           <span className="font-bold text-[#2D241E] text-lg">
             LKR {(displayPrice || 0).toLocaleString()}
           </span>
           {displayOriginalPrice > 0 && (
             <span className="text-sm text-stone-400 line-through">
               LKR {displayOriginalPrice.toLocaleString()}
             </span>
           )}
         </div>
       </div>
    </motion.div>
  );
}