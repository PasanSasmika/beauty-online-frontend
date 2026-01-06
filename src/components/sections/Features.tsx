'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, ShoppingBag, Loader2, Plus } from 'lucide-react';
import { motion } from 'framer-motion';

// --- INTERFACES ---
interface Product {
  id: number;
  name: string;
  brand: string;
  price: number;
  original_price?: number;
  images: string; 
  category: string;
  variants: any;
}

export default function Features() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/products`);
        const data = await res.json();
        setProducts(data);
      } catch (error) {
        console.error('Failed to load products', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const displayedProducts = products.slice(0, 8);

  return (
    <section className="py-24 px-6 md:px-20 bg-[#FAF9F6]">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
        <div>
          <span className="text-[ee3f5c] font-bold tracking-widest text-sm uppercase mb-2 block">
            Curated For You
          </span>
          <h2 className=" text-4xl md:text-5xl text-[#000000]">
            Featured Collection
          </h2>
        </div>
        
        <Link 
          href="/products" 
          className="hidden md:flex items-center gap-2 text-[#000000] font-medium hover:text-[ee3f5c] transition-colors group"
        >
          View All Products
          <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="animate-spin text-[#000000]" size={40} />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {displayedProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}

      {/* Mobile Button */}
      <div className="mt-12 md:hidden flex justify-center">
        <Link 
          href="/products" 
          className="flex items-center gap-2 bg-[#000000] text-white px-8 py-3 rounded-full font-medium"
        >
          View All Products
        </Link>
      </div>
    </section>
  );
}

// --- UPDATED PRODUCT CARD ---
function ProductCard({ product }: { product: Product }) {
  
  // 1. Image Parsing Logic (Get First & Second Image)
  let images: string[] = ['/logo.png']; // Default fallback
  
  try {
    let rawImages = product.images;
    if (typeof rawImages === 'string') {
        try {
            if (rawImages.startsWith('[')) {
                rawImages = JSON.parse(rawImages);
            }
        } catch (e) {}
    }

    if (Array.isArray(rawImages) && rawImages.length > 0) {
  // Map to full URLs using env variable
  images = rawImages.map(img => `${process.env.NEXT_PUBLIC_API_URL}${img}`);
} else if (typeof rawImages === 'string' && rawImages.startsWith('/')) {
  images = [`${process.env.NEXT_PUBLIC_API_URL}${rawImages}`];
}
  } catch (e) {
    console.error("Image logic error", e);
  }

  const primaryImage = images[0];
  const hoverImage = images.length > 1 ? images[1] : images[0]; // Use 2nd image on hover, or keep 1st

  // 2. Price / Variant Logic
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

  // 3. Add to Cart Handler
  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault(); // Stop link navigation
    e.stopPropagation(); 
    alert(`Added ${product.name} to cart!`); // Replace with your Cart Context logic later
  };

  return (
    <Link href={`/products/${product.id}`} className="block h-full">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="group relative bg-white rounded-2xl overflow-hidden shadow-sm border border-[#000000]/5 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 h-full flex flex-col"
      >
        
        {/* --- IMAGE CONTAINER --- */}
        <div className="relative aspect-[3/4] bg-stone-100 overflow-hidden">
          
          {/* Primary Image (Visible by default) */}
          <Image
            src={primaryImage}
            alt={product.name}
            fill
            className="object-cover transition-opacity duration-700 ease-in-out group-hover:opacity-0"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
            unoptimized={true} 
          />

          {/* Secondary Image (Visible on Hover) */}
          <Image
            src={hoverImage}
            alt={`${product.name} alternate`}
            fill
            className="absolute top-0 left-0 object-cover opacity-0 transition-opacity duration-700 ease-in-out group-hover:opacity-100 scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
            unoptimized={true} 
          />
          
          {/* Discount Badge */}
          {discount > 0 && (
            <span className="absolute top-3 left-3 bg-[#E11D48] text-white text-xs font-bold px-3 py-1 rounded-full z-10 shadow-sm">
              -{discount}%
            </span>
          )}

          {/* --- ADD TO CART BUTTON (Slide Up) --- */}
          <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-in-out z-20">
            <button 
              onClick={handleAddToCart}
              className="w-full bg-white/90 backdrop-blur-sm text-[#000000] py-3 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg hover:bg-[#000000] hover:text-white transition-colors"
            >
              <ShoppingBag size={18} />
              Add to Cart
            </button>
          </div>
        </div>

        {/* --- DETAILS --- */}
        <div className="p-5 flex flex-col flex-1">
           <p className="text-xs text-stone-500 uppercase font-bold tracking-wider mb-1">{product.brand}</p>
           <h3 className="text-lg text-[#000000] font-medium leading-tight mb-2 line-clamp-1">{product.name}</h3>
           
           {/* Size Badge */}
           {firstVariant && (
              <span className="inline-block w-max text-[10px] uppercase bg-stone-100 px-2 py-1 rounded text-stone-600 font-medium mb-3">
                 {firstVariant.size}
              </span>
           )}

           <div className="mt-auto flex items-center gap-3">
             <span className="font-bold text-[#000000] text-lg">
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
    </Link>
  );
}