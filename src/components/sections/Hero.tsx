'use client';

import { ArrowRight, Search, Sparkles, Star, ShieldCheck } from 'lucide-react';
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

export default function Hero() {
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();

  const [banners, setBanners] = useState<Banner[]>([]);

  // Two-slot system — A and B swap roles each cycle
  const [slotA, setSlotA] = useState<{ banner: Banner | null; phase: 'idle' | 'in' | 'out' }>({ banner: null, phase: 'idle' });
  const [slotB, setSlotB] = useState<{ banner: Banner | null; phase: 'idle' | 'in' | 'out' }>({ banner: null, phase: 'idle' });
  const [topSlot, setTopSlot] = useState<'A' | 'B'>('A');
  const [dotIndex, setDotIndex] = useState(0);

  const bannersRef = useRef<Banner[]>([]);
  const idxRef = useRef(0);
  const activeRef = useRef<'A' | 'B'>('A');
  const busyRef = useRef(false);
  const timers = useRef<NodeJS.Timeout[]>([]);

  const after = (ms: number, fn: () => void) => {
    const t = setTimeout(fn, ms);
    timers.current.push(t);
  };

  const clearAll = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  };

  // Preload all images so they're in browser cache before sliding in
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

  const setSlot = useCallback((name: 'A' | 'B', patch: Partial<typeof slotA>) => {
    if (name === 'A') setSlotA(s => ({ ...s, ...patch }));
    else setSlotB(s => ({ ...s, ...patch }));
  }, []);

  const runCycle = useCallback(() => {
    const list = bannersRef.current;
    if (list.length === 0 || busyRef.current) return;
    busyRef.current = true;

    const current = activeRef.current;           // slot currently active
    const incoming = current === 'A' ? 'B' : 'A'; // slot that will slide in next
    const nextIdx = (idxRef.current + 1) % list.length;

    // Paint the next banner into the incoming slot BEFORE animating
    setSlot(incoming, { banner: list[nextIdx], phase: 'idle' });

    // One rAF so the browser renders the reset position first
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {

        // Slide current banner IN (it was pre-set to idle/below)
        setSlot(current, { banner: list[idxRef.current], phase: 'in' });
        setTopSlot(current);
        setDotIndex(idxRef.current);

        // After 3.5s visible → slide out
        after(3500, () => {
          setSlot(current, { phase: 'out' });
          setTopSlot(incoming); // bring incoming behind so it's ready

          // After slide-out finishes → reset, switch active, wait 1s
          after(520, () => {
            setSlot(current, { phase: 'idle' });
            activeRef.current = incoming;
            idxRef.current = nextIdx;
            busyRef.current = false;

            after(1000, runCycle);
          });
        });
      });
    });
  }, [setSlot]);

  useEffect(() => {
    if (banners.length === 0) return;
    // Pre-load slot A with first banner
    setSlotA({ banner: banners[0], phase: 'idle' });
    // Pre-load slot B with second (if exists) so it's cached in DOM
    if (banners.length > 1) setSlotB({ banner: banners[1], phase: 'idle' });
    after(800, runCycle);
    return () => clearAll();
  }, [banners.length]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      router.push('/products');
    }
  };

  // Translate phase → Tailwind transform + transition
  const phaseClass = (phase: 'idle' | 'in' | 'out') => {
    if (phase === 'in')  return 'translate-y-0    transition-transform duration-[620ms] ease-[cubic-bezier(0.34,1.15,0.64,1)]';
    if (phase === 'out') return '-translate-y-full transition-transform duration-[500ms] ease-[cubic-bezier(0.76,0,0.24,1)]';
    return 'translate-y-full'; // idle = parked below, no transition so it snaps silently
  };

  const renderSlot = (slot: typeof slotA, name: 'A' | 'B') => {
    if (!slot.banner) return null;
    return (
      <div
        key={name}
        className={`absolute inset-0 z-20 rounded-[30px] overflow-hidden shadow-2xl will-change-transform ${phaseClass(slot.phase)}`}
        style={{ zIndex: topSlot === name ? 22 : 21 }}
      >
        <Image
          src={`${process.env.NEXT_PUBLIC_API_URL}/uploads/${slot.banner.image}`}
          alt={slot.banner.description || 'Banner'}
          fill
          className="object-cover"
          unoptimized
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />

        {slot.banner.description && (
  <div className="absolute bottom-5 left-5 right-5 z-10">
    <div className="inline-flex items-center gap-2 bg-black/60 backdrop-blur-md border border-white/10 rounded-2xl px-4 py-2.5 max-w-full">
      <p className="text-white text-sm font-semibold leading-snug">
        {slot.banner.description}
      </p>
    </div>
  </div>
)}

        {banners.length > 1 && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
            {banners.map((_, i) => (
              <span
                key={i}
                className={`block rounded-full transition-all duration-300 ${
                  i === dotIndex ? 'w-5 h-[5px] bg-white' : 'w-[5px] h-[5px] bg-white/50'
                }`}
              />
            ))}
          </div>
        )}
      </div>
    );
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

        {/* ── Right: hero always visible, banners slide over it ── */}
        <div className="lg:col-span-5 relative mt-12 lg:mt-0">
<div className="relative w-full max-w-md mx-auto h-[450px] md:h-[550px] overflow-hidden rounded-[30px]">

            <div className="absolute inset-0 bg-[#EBE5D9] rounded-[30px] rotate-6 scale-[1.03] origin-bottom-right z-0 shadow-lg" />

            {/* Hero image — always the base */}
            <div className="relative w-full h-full rounded-[30px] overflow-hidden shadow-2xl z-10">
              <Image src="/image.jpg" alt="Radiant skin" fill className="object-cover" priority />
            </div>

            {/* Two banner slots — swap each cycle */}
            {renderSlot(slotA, 'A')}
            {renderSlot(slotB, 'B')}

          </div>
        </div>

      </div>

      <div className="absolute bottom-10 left-0 w-full h-[1px] bg-stone-200 hidden md:block" />
    </section>
  );
}