'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation'; // Added useRouter
import Image from 'next/image';
import Link from 'next/link';
import { Loader2, Minus, Plus, ShoppingBag, Star, Truck, ShieldCheck, ArrowLeft, Zap } from 'lucide-react';
import { useCart } from '@/context/CartContext'; // Import Cart Hook

// --- INTERFACES ---
interface Variant {
  size: string;
  price: number;
  original_price: number;
  quantity: number;
}

interface Product {
  id: number;
  name: string;
  brand: string;
  description: string;
  category: string;
  country: string; 
  images: string; 
  variants: any; 
  is_koko_enabled: boolean;
}

// --- HELPER: Country Name to Code Mapping ---
const getCountryCode = (countryName: string) => {
    if (!countryName) return null;
    const map: Record<string, string> = {
        "sri lanka": "lk",
        "korea": "kr", "south korea": "kr",
        "usa": "us", "united states": "us",
        "uk": "gb", "united kingdom": "gb",
        "japan": "jp",
        "china": "cn",
        "australia": "au",
        "canada": "ca",
        "france": "fr",
        "italy": "it",
        "germany": "de"
    };
    return map[countryName.toLowerCase()] || null;
};

export default function ProductOverviewPage() {
  const params = useParams();
  const router = useRouter(); // Initialize Router
  const id = params.id;

  // Global Cart Actions
  const { addToCart } = useCart();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Selection States
  const [selectedVariant, setSelectedVariant] = useState<Variant | null>(null);
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
  const [parsedImages, setParsedImages] = useState<string[]>([]);
  const [parsedVariants, setParsedVariants] = useState<Variant[]>([]);

  // 1. Fetch Product Data
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/products/${id}`);
        if (!res.ok) throw new Error('Product not found');
        const data = await res.json();
        setProduct(data);

        // A. Parse Images
        let imgs: string[] = [];
        try {
            const rawImgs = typeof data.images === 'string' ? JSON.parse(data.images) : data.images;
            if (Array.isArray(rawImgs) && rawImgs.length > 0) {
                imgs = rawImgs.map((path: string) => `http://localhost:5000${path}`);
            } else {
                imgs = ['/logo.png']; 
            }
        } catch (e) { imgs = ['/logo.png']; }
        setParsedImages(imgs);
        setSelectedImage(imgs[0]);

        // B. Parse Variants
        let vars: Variant[] = [];
        try {
            const rawVars = typeof data.variants === 'string' ? JSON.parse(data.variants) : data.variants;
            if (Array.isArray(rawVars)) {
                vars = rawVars.map((v: any) => ({
                    size: v.size,
                    price: parseFloat(v.price),
                    original_price: parseFloat(v.original_price || 0),
                    quantity: parseInt(v.quantity)
                }));
            }
        } catch (e) {}
        setParsedVariants(vars);
        if (vars.length > 0) setSelectedVariant(vars[0]);

      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchProduct();
  }, [id]);

  // Handle Quantity
  const handleQuantity = (type: 'inc' | 'dec') => {
    if (type === 'dec' && quantity > 1) setQuantity(q => q - 1);
    if (type === 'inc' && selectedVariant && quantity < selectedVariant.quantity) setQuantity(q => q + 1);
  };

  // --- CART FUNCTIONS ---

  const handleAddToCart = () => {
    if (!product || !selectedVariant) return;

    addToCart({
      id: product.id,
      name: product.name,
      price: selectedVariant.price,
      size: selectedVariant.size,
      image: selectedImage,
      quantity: quantity
    });
  };

  const handleBuyNow = () => {
    if (!product || !selectedVariant) return;
    
    // 1. Add item to cart
    handleAddToCart();
    
    // 2. Redirect immediately to checkout
    router.push('/checkout');
  };

  // --- RENDER ---

  if (loading) return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin text-[#2D241E]" size={40} /></div>;
  if (!product || !selectedVariant) return <div className="text-center py-20">Product not found</div>;

  // Calculate Discount
  const discount = selectedVariant.original_price > 0
    ? Math.round(((selectedVariant.original_price - selectedVariant.price) / selectedVariant.original_price) * 100)
    : 0;

  const countryCode = product.country ? getCountryCode(product.country) : null;

  return (
    <div className="min-h-screen bg-[#FAF9F6] pb-20 mt-12">
      
      {/* Breadcrumb / Back */}
      <div className="max-w-7xl mx-auto px-6 md:px-20 pt-8 pb-4">
        <Link href="/products" className="inline-flex items-center gap-2 text-stone-500 hover:text-[#2D241E] transition-colors text-sm font-medium">
            <ArrowLeft size={16} /> Back to Shop
        </Link>
      </div>

      <div className="max-w-7xl mx-auto px-6 md:px-20 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
        
        {/* LEFT: IMAGE GALLERY */}
        <div className="space-y-6">
            {/* Main Image */}
            <div className="relative aspect-[4/5] bg-white rounded-3xl overflow-hidden shadow-sm border border-stone-100 group cursor-zoom-in">
                <Image 
                    src={selectedImage} 
                    alt={product.name} 
                    fill 
                    className="object-cover transition-transform duration-700 group-hover:scale-125"
                    unoptimized={true}
                />
                {discount > 0 && (
                    <span className="absolute top-4 left-4 bg-[#E11D48] text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm">
                        -{discount}% OFF
                    </span>
                )}
            </div>

            {/* Thumbnails */}
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                {parsedImages.map((img, idx) => (
                    <button 
                        key={idx} 
                        onClick={() => setSelectedImage(img)}
                        className={`relative w-20 h-20 rounded-xl overflow-hidden border-2 transition-all shrink-0 ${
                            selectedImage === img ? 'border-[#2D241E]' : 'border-transparent hover:border-stone-300'
                        }`}
                    >
                        <Image src={img} alt="thumbnail" fill className="object-cover" unoptimized={true} />
                    </button>
                ))}
            </div>
        </div>

        {/* RIGHT: DETAILS */}
        <div className="flex flex-col h-full pt-2">
            
            {/* Brand & Country */}
            <div className="flex items-center justify-between mb-3">
                <span className="text-[#ee3f5c] font-bold tracking-widest text-xs uppercase">{product.brand}</span>
                
                {/* Country Flag Display */}
                {product.country && (
                    <div className="flex items-center gap-2 bg-white px-2 py-1 rounded-full border border-stone-200 shadow-sm" title={product.country}>
                        {countryCode ? (
                            <img 
                                src={`https://flagcdn.com/w40/${countryCode}.png`}
                                srcSet={`https://flagcdn.com/w80/${countryCode}.png 2x`}
                                width="40"
                                alt={product.country}
                                className="rounded-sm object-cover"
                            />
                        ) : (
                            <span className="text-xs">🌍</span> // Fallback icon
                        )}
                        <span className="text-[10px] font-bold text-stone-500 uppercase">{product.country}</span>
                    </div>
                )}
            </div>
            
            <h1 className="text-4xl font-bold text-[#2D241E] mb-4 leading-tight">{product.name}</h1>
            
            {/* Reviews */}
            <div className="flex items-center gap-2 mb-6">
                <div className="flex text-yellow-500">
                    {[1,2,3,4,5].map(i => <Star key={i} size={16} fill="currentColor" />)}
                </div>
                <span className="text-xs text-stone-400 font-medium">(128 Reviews)</span>
            </div>

            {/* Price */}
            <div className="flex items-end gap-4 mb-8 border-b border-stone-200 pb-8">
                <span className="text-4xl font-bold text-[#2D241E]">
                    LKR {selectedVariant.price.toLocaleString()}
                </span>
                {selectedVariant.original_price > 0 && (
                    <div className="flex flex-col mb-1">
                        <span className="text-lg text-stone-400 line-through">
                            LKR {selectedVariant.original_price.toLocaleString()}
                        </span>
                    </div>
                )}
            </div>

            {/* Description */}
            <p className="text-stone-600 leading-relaxed mb-8">
                {product.description || "Experience premium quality with our meticulously crafted formula. Designed to enhance your natural beauty."}
            </p>

            {/* Variant Selector */}
            <div className="mb-8">
                <div className="flex justify-between items-center mb-3">
                    <label className="text-xs font-bold text-[#2D241E] uppercase">Select Size</label>
                    <span className="text-xs text-stone-400">{selectedVariant.quantity} items in stock</span>
                </div>
                <div className="flex flex-wrap gap-3">
                    {parsedVariants.map((v, i) => (
                        <button
                            key={i}
                            onClick={() => { setSelectedVariant(v); setQuantity(1); }}
                            className={`px-6 py-3 rounded-lg border text-sm font-medium transition-all ${
                                selectedVariant === v 
                                    ? 'bg-[#ee3f5c] text-white border-[#ee3f5c] shadow-md' 
                                    : 'bg-white text-stone-600 border-stone-200 hover:border-[#ee3f5c]'
                            }`}
                        >
                            {v.size}
                        </button>
                    ))}
                </div>
            </div>

            {/* ACTIONS: Quantity, Add to Cart, Buy Now */}
            <div className="space-y-4 mb-8">
                <div className="flex flex-col sm:flex-row gap-4">
                    {/* Qty */}
                    <div className="flex items-center bg-white border border-stone-200 rounded-xl w-max shadow-sm">
                        <button onClick={() => handleQuantity('dec')} className="p-4 text-stone-500 hover:text-[#2D241E]"><Minus size={18}/></button>
                        <span className="w-8 text-center font-bold text-[#2D241E]">{quantity}</span>
                        <button onClick={() => handleQuantity('inc')} className="p-4 text-stone-500 hover:text-[#2D241E]"><Plus size={18}/></button>
                    </div>

                    {/* Add To Cart */}
                    <button 
                        onClick={handleAddToCart}
                        disabled={selectedVariant.quantity === 0}
                        className="flex-1 bg-white border-2 border-[#ee3f5c] text-[#2D241E] py-4 rounded-xl font-bold hover:bg-stone-50 transition-all flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
                    >
                        <ShoppingBag size={20} />
                        {selectedVariant.quantity > 0 ? 'Add to Cart' : 'Out of Stock'}
                    </button>
                </div>

                {/* BUY IT NOW (Full Width) */}
                <button 
                    onClick={handleBuyNow}
                    disabled={selectedVariant.quantity === 0}
                    className="w-full bg-[#ee3f5c] text-white py-4 rounded-xl font-bold hover:bg-[#e01f3f] transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-xl disabled:opacity-70"
                >
                    <Zap size={20} fill="currentColor" />
                    Buy It Now
                </button>
            </div>

            {/* TRUST BADGES & INFO */}
            <div className="grid grid-cols-2 gap-4 text-xs text-stone-500 bg-white p-6 rounded-2xl border border-stone-100 shadow-sm">
                
                {/* Standard Info */}
                <div className="flex items-center gap-3">
                    <Truck size={20} className="text-[#ee3f5c]" />
                    <span>Island-wide Delivery</span>
                </div>
                <div className="flex items-center gap-3">
                    <ShieldCheck size={20} className="text-[#ee3f5c]" />
                    <span>100% Authentic</span>
                </div>

                {/* PAYMENT METHODS */}
                <div className="col-span-2 pt-4 mt-2 border-t border-stone-100">
                    <p className="text-[10px] font-bold uppercase text-stone-400 mb-2">Secure Payment Via</p>
                    <div className="flex items-center gap-3">
                        {/* 1. VISA */}
                        <div className="w-14 h-12 relative transition-all">
                            <Image src="/icons/visa.png" alt="Visa" fill className="object-contain" />
                        </div>
                        {/* 2. MASTERCARD */}
                        <div className="w-14 h-12 relative transition-all">
                            <Image src="/icons/mastercard.png" alt="Mastercard" fill className="object-contain" />
                        </div>
                        {/* 3. MINTPAY */}
                        <div className="w-14 h-12 relative transition-all">
                            <Image src="/icons/mintpay.png" alt="MintPay" fill className="object-contain" sizes="144px" />
                        </div>
                    </div>
                </div>

                {/* KOKO INSTALLMENTS */}
                {product.is_koko_enabled && (
                    <div className="col-span-2 pt-4 mt-2 border-t border-stone-100">
                        <div className="flex items-center justify-between">
                            <div className="flex flex-col">
                                <span className="font-bold text-[#2D241E] text-sm">Pay in 3</span>
                                <span>Installments of LKR {((selectedVariant.price)/3).toFixed(2)}</span>
                            </div>
                            <div className="w-16 h-8 relative">
                                <Image src="/icons/koko.png" alt="Koko" fill className="object-contain" />
                            </div>
                        </div>
                    </div>
                )}
            </div>

        </div>
      </div>
    </div>
  );
}