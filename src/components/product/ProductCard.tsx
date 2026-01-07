'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ShoppingBag } from 'lucide-react';

interface Product {
  id: string; // or number depending on your DB
  name: string;
  brand: string;
  images: string | string[]; // Can be JSON string or array
  variants?: any[];
}

export default function ProductCard({ product }: { product: Product }) {
  // 1. Calculate Price: Get the lowest price from variants
  const displayPrice = product.variants && product.variants.length > 0 
    ? Math.min(...product.variants.map((v: any) => v.price))
    : 0;

  // 2. Handle Image Parsing (Robust)
  let displayImage = '/placeholder.png'; // Default fallback
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

  if (product.images) {
     try {
        // If it's a string (JSON), parse it. If it's already an array, use it.
        const parsed = typeof product.images === 'string' ? JSON.parse(product.images) : product.images;
        
        if (Array.isArray(parsed) && parsed.length > 0) {
            // Construct full URL
            let path = parsed[0];
            displayImage = path.startsWith('http') ? path : `${apiUrl}${path}`;
        }
     } catch (e) {
        console.error("Image parse error", e);
     }
  }

  return (
    <Link href={`/products/${product.id}`} className="group block h-full">
      <div className="bg-white h-full rounded-2xl overflow-hidden border border-stone-100 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col">
        {/* Image Area */}
        <div className="relative aspect-[4/5] bg-stone-50 overflow-hidden">
          <Image 
            src={displayImage} 
            alt={product.name} 
            fill 
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            unoptimized={true} // Fixes external image loading issues
          />
          {/* Quick Icon */}
          <div className="absolute bottom-4 right-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
            <div className="bg-white p-3 rounded-full shadow-lg text-[#2D241E] hover:text-[#ee3f5c]">
              <ShoppingBag size={18} />
            </div>
          </div>
        </div>

        {/* Details */}
        <div className="p-5 flex flex-col flex-1">
          <p className="text-xs font-bold text-[#ee3f5c] uppercase tracking-wider mb-1">{product.brand}</p>
          <h3 className="font-medium text-[#2D241E] text-lg mb-2 line-clamp-2 group-hover:text-[#ee3f5c] transition-colors">{product.name}</h3>
          <div className="mt-auto">
             <p className="font-bold text-stone-900">
                {displayPrice > 0 ? `LKR ${displayPrice.toLocaleString()}` : 'Out of Stock'}
             </p>
          </div>
        </div>
      </div>
    </Link>
  );
}