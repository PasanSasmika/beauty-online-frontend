'use client';

import { ArrowRight, Search, Sparkles, Star, ShieldCheck, X, Tag, Gift } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';

interface Banner {
  _id: string;
  image: string;
  description: string;
  isVisible: boolean;
}

type Phase = 'hidden' | 'visible' | 'leaving';

export default function Hero() {
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();

  const [banners, setBanners] = useState<Banner[]>([]);
  const [currentBanner, setCurrentBanner] = useState<Banner | null>(null);
  const [phase, setPhase] = useState<Phase>('hidden');
  const [dotIndex, setDotIndex] = useState(0);

  const bannersRef    = useRef<Banner[]>([]);
  const idxRef        = useRef(0);
  const busyRef       = useRef(false);
  const timers        = useRef<NodeJS.Timeout[]>([]);
  // ── NEW: track banners the user explicitly closed ──
  const dismissedIds  = useRef<Set<string>>(new Set());

  const after = (ms: number, fn: () => void) => {
    const t = setTimeout(fn, ms);
    timers.current.push(t);
  };

  const clearAll = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  };

  const preloadImages = (list: Banner[]) => {
    list.forEach(b => {
      const img = new window.Image();
      img.src = `${process.env.NEXT_PUBLIC_API_URL}/uploads/${b.image}`;
    });
  };

  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/settings`);
        if (!res.ok) return;
        const data = await res.json();
        const visible = (data.banners || []).filter((b: Banner) => b.isVisible);
        bannersRef.current = visible;
        preloadImages(visible);
        setBanners(visible);
      } catch (err) {
        console.error('Failed to load banners', err);
      }
    };
    fetchBanners();
    return () => clearAll();
  }, []);

  // ── Auto-dismiss (timer expired) — banner can show again next cycle ──
  const dismiss = useCallback(() => {
    clearAll();
    setPhase('leaving');
    after(460, () => {
      setPhase('hidden');
      busyRef.current = false;
      const list = bannersRef.current;
      if (list.length > 1) {
        const nextIdx = (idxRef.current + 1) % list.length;
        idxRef.current = nextIdx;
        after(1200, runCycle);
      }
    });
  }, []);

  // ── Manual dismiss (X button) — marks banner so it never shows again ──
  const dismissForever = useCallback(() => {
    const banner = bannersRef.current[idxRef.current];
    if (banner) dismissedIds.current.add(banner._id);

    clearAll();
    setPhase('leaving');
    after(460, () => {
      setPhase('hidden');
      busyRef.current = false;

      // Find the next banner that hasn't been permanently dismissed
      const list = bannersRef.current;
      const remaining = list.filter(b => !dismissedIds.current.has(b._id));
      if (remaining.length === 0) return; // all dismissed — stop cycling

      const nextIdx = (idxRef.current + 1) % list.length;
      idxRef.current = nextIdx;
      after(1200, runCycle);
    });
  }, []);

  const runCycle = useCallback(() => {
    const list = bannersRef.current;
    if (list.length === 0 || busyRef.current) return;

    // Walk forward until we find a banner not permanently dismissed
    let checked = 0;
    while (
      dismissedIds.current.has(list[idxRef.current]._id) &&
      checked < list.length
    ) {
      idxRef.current = (idxRef.current + 1) % list.length;
      checked++;
    }

    // All banners dismissed — nothing left to show
    if (checked === list.length) return;

    busyRef.current = true;
    const idx = idxRef.current;
    setCurrentBanner(list[idx]);
    setDotIndex(idx);

    after(100, () => {
      setPhase('visible');
      after(6000, () => {
        dismiss();
      });
    });
  }, [dismiss]);

  useEffect(() => {
    if (banners.length === 0) return;
    after(1500, runCycle);
    return () => clearAll();
  }, [banners.length, runCycle]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      router.push('/products');
    }
  };

  const popupStyle = (): React.CSSProperties => {
    if (phase === 'hidden') {
      return {
        transform: 'translate(-50%, -40%) scale(0.95)',
        opacity: 0,
        transition: 'none',
        pointerEvents: 'none',
      };
    }
    if (phase === 'visible') {
      return {
        transform: 'translate(-50%, -50%) scale(1)',
        opacity: 1,
        transition: 'transform 600ms cubic-bezier(0.34, 1.3, 0.64, 1), opacity 400ms ease-out',
        pointerEvents: 'auto',
      };
    }
    return {
      transform: 'translate(-50%, -40%) scale(0.95)',
      opacity: 0,
      transition: 'transform 450ms cubic-bezier(0.55, 0, 1, 0.45), opacity 300ms ease-in',
      pointerEvents: 'none',
    };
  };

  return (
    <section className="relative min-h-[90vh] flex items-center bg-[#FAF9F6] overflow-hidden">

      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#ee3f5c]/6 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[#EBE5D9]/80 rounded-full blur-[100px] pointer-events-none" />

      <div className="container mx-auto px-4 sm:px-6 md:px-20 pt-24 pb-12 grid lg:grid-cols-12 gap-12 items-center z-10 w-full">

        {/* ── Left: untouched ── */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          <div className="inline-flex items-center gap-2 bg-white border border-stone-200 rounded-full px-4 py-2 w-max shadow-sm">
            <ShieldCheck size={14} className="text-[#ee3f5c]" />
            <span className="text-xs font-semibold text-stone-600 tracking-wide uppercase">100% Authentic Products</span>
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-[#000000] leading-[1.15]">
            Where Beauty <br />
            <span className="text-[#ee3f5c]">Meets True Elegance</span>
          </h1>
          <p className="text-base md:text-xl text-stone-600 max-w-lg leading-relaxed font-medium opacity-90">
            Step into a world of luxury skincare and timeless glow. Discover products crafted to nourish, enhance, and reveal your natural radiance.
          </p>

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

          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 pt-2">
            <div className="flex items-center gap-1.5">
              <div className="flex text-yellow-400">
                {[1, 2, 3, 4, 5].map(i => <Star key={i} size={14} fill="currentColor" />)}
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

        {/* ── Right: pure static image, zero animation ── */}
        <div className="lg:col-span-5 relative mt-12 lg:mt-0">
          <div className="relative w-full max-w-md mx-auto h-[450px] md:h-[550px] rounded-[30px]">
            <div className="absolute inset-0 bg-[#EBE5D9] rounded-[30px] rotate-6 scale-[1.03] origin-bottom-right z-0 shadow-lg" />
            <div className="relative w-full h-full rounded-[30px] overflow-hidden shadow-2xl z-10">
              <Image src="/image.jpg" alt="Radiant skin" fill className="object-cover" priority />
            </div>
          </div>
        </div>

      </div>

      {phase !== 'hidden' && (
        <div
          className="absolute inset-0 bg-white/20 backdrop-blur-[2px] z-40 transition-opacity duration-500"
          style={{ opacity: phase === 'visible' ? 1 : 0 }}
        />
      )}

      {currentBanner && (
        <div
          className="absolute top-1/2 left-1/2 z-50 w-[96vw] max-w-5xl will-change-transform shadow-[0_30px_60px_-15px_rgba(238,63,92,0.3)] rounded-2xl md:rounded-[32px] bg-white overflow-hidden border border-stone-100"
          style={popupStyle()}
        >
          <div className="flex flex-col md:flex-row h-full w-full relative">

            <div className="absolute inset-3 md:inset-4 border-2 border-dashed border-[#ee3f5c]/30 rounded-xl md:rounded-[20px] pointer-events-none z-20" />

            <div className="relative w-full md:w-5/12 h-56 md:h-72 lg:h-80 flex-shrink-0 bg-stone-100 z-10">
              <Image
                src={`${process.env.NEXT_PUBLIC_API_URL}/uploads/${currentBanner.image}`}
                alt={currentBanner.description || 'Promotional Offer'}
                fill
                className="object-cover"
                unoptimized
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-transparent via-transparent to-white/90 md:to-white pointer-events-none" />
              <div className="absolute top-6 left-6 bg-[#ee3f5c] text-white text-[10px] md:text-xs font-black uppercase tracking-widest px-4 py-2 rounded-md shadow-xl transform -rotate-3 flex items-center gap-1.5 z-30">
                <Tag size={14} /> Flash Offer
              </div>
            </div>

            <div className="relative w-full md:w-7/12 p-8 md:p-10 lg:p-12 flex flex-col justify-center bg-white z-10">
              <div className="flex items-center gap-2 mb-3 text-[#ee3f5c]">
                <Gift size={18} className="animate-pulse" />
                <span className="text-sm font-black uppercase tracking-widest">Special Promotion</span>
              </div>

              {currentBanner.description && (
                <h3 className="text-2xl sm:text-3xl md:text-4xl font-black text-stone-900 leading-[1.1] mb-6 md:mb-8 line-clamp-3 tracking-tight">
                  {currentBanner.description}
                </h3>
              )}

              <div className="mt-auto flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <Link href="/products" onClick={dismiss} className="w-full sm:w-auto">
                  <button className="group w-full sm:w-auto flex items-center justify-center gap-2 bg-[#ee3f5c] hover:bg-[#c1023e] text-white px-8 py-4 rounded-xl font-bold transition-all duration-300 shadow-[0_8px_20px_-6px_rgba(238,63,92,0.5)] hover:shadow-[0_12px_25px_-6px_rgba(238,63,92,0.6)] hover:-translate-y-0.5 text-base sm:text-lg">
                    Shop The Offer <ArrowRight size={20} className="transition-transform group-hover:translate-x-1" />
                  </button>
                </Link>

                {banners.length > 1 && (
                  <div className="flex justify-center gap-2 pr-2">
                    {banners.map((_, i) => (
                      <span
                        key={i}
                        className={`block rounded-full transition-all duration-500 ${
                          i === dotIndex ? 'w-8 h-2 bg-[#ee3f5c]' : 'w-2 h-2 bg-stone-200'
                        }`}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* X button now calls dismissForever instead of dismiss */}
          <button
            onClick={dismissForever}
            className="absolute top-6 right-6 bg-white/80 backdrop-blur-sm hover:bg-stone-100 text-stone-500 hover:text-stone-900 rounded-full p-2 transition-colors shadow-sm z-30 border border-stone-200"
            aria-label="Close offer"
          >
            <X size={18} />
          </button>
        </div>
      )}

      <div className="absolute bottom-10 left-0 w-full h-[1px] bg-stone-200 hidden md:block" />
    </section>
  );
}