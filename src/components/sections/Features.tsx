'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, ShoppingBag, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

interface Product {
  id: number;
  name: string;
  brand: string;
  price: number;
  original_price?: number;
  images: string; 
  category: string;
}

export default function Features() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/products');
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

  // 2. Get First 8 Products
  const displayedProducts = products.slice(0, 8);

  return (
    <section className="py-24 px-6 md:px-20 bg-[#FAF9F6]">
      
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
        <div>
          <span className="text-[#8B9B86] font-bold tracking-widest text-sm uppercase mb-2 block">
            Curated For You
          </span>
          <h2 className=" text-4xl md:text-5xl text-[#2D241E]">
            Featured Collection
          </h2>
        </div>
        
        <Link 
          href="/products" 
          className="hidden md:flex items-center gap-2 text-[#2D241E] font-medium hover:text-[#8B9B86] transition-colors group"
        >
          View All Products
          <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="animate-spin text-[#2D241E]" size={40} />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {displayedProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}

      <div className="mt-12 md:hidden flex justify-center">
        <Link 
          href="/products" 
          className="flex items-center gap-2 bg-[#2D241E] text-white px-8 py-3 rounded-full font-medium"
        >
          View All Products
        </Link>
      </div>
    </section>
  );
}

function ProductCard({ product }: { product: Product }) {
  let imageUrl = '/logo.png'; 
  try {
    let imageData = product.images;

    if (typeof imageData === 'string') {
        try {
            if (imageData.startsWith('[')) {
                imageData = JSON.parse(imageData);
            }
        } catch (e) {}
    }

    if (Array.isArray(imageData) && imageData.length > 0) {
        imageUrl = `http://localhost:5000${imageData[0]}`;
    } else if (typeof imageData === 'string' && imageData.startsWith('/')) {
        imageUrl = `http://localhost:5000${imageData}`;
    }

  } catch (e) {
    console.error("Image logic error", e);
  }

  const discount = product.original_price 
    ? Math.round(((product.original_price - product.price) / product.original_price) * 100)
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
        <p className="text-xs text-stone-500 uppercase tracking-wide mb-1">
          {product.brand}
        </p>
        <h3 className=" text-lg text-[#2D241E] truncate group-hover:text-[#8B9B86] transition-colors">
          {product.name}
        </h3>
        
        <div className="mt-3 flex items-center gap-3">
          <span className="font-bold text-[#2D241E]">
            LKR {product.price.toLocaleString()}
          </span>
          {product.original_price && (
            <span className="text-sm text-stone-400 line-through">
              LKR {product.original_price.toLocaleString()}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
}