'use client';

import Image from 'next/image';

// --- CONFIGURATION ---
const BRANDS = [
  // Keep using your temporary logo or replace with real ones in public/brands/
  { name: 'Brand 1', logo: '/logo1.png' }, 
  { name: 'Brand 2', logo: '/logo2.png' },
  { name: 'Brand 3', logo: '/logo3.png' },
  { name: 'Brand 4', logo: '/logo4.png' },
  { name: 'Brand 5', logo: '/logo5.png' },
  { name: 'Brand 6', logo: '/logo6.png' },
  { name: 'Brand 7', logo: '/logo7.png' },
];

export default function BrandMarquee() {
  return (
    <section className="py-20 bg-white border-y border-stone-100 overflow-hidden">
      
      {/* --- UPDATED HEADER SECTION WITH TEXT --- */}
      <div className="max-w-4xl mx-auto px-6 md:px-20 text-center mb-16 relative z-10">
        <span className="text-[ee3f5c] font-bold tracking-[0.2em] text-xs uppercase mb-4 block">
          Curated Excellence
        </span>
        <h2 className=" font-medium text-3xl md:text-4xl text-[#000000] mb-6">
          World-Class Beauty Partners
        </h2>
        <div className="w-16 h-px bg-[#000000]/20 mx-auto mb-6"></div>
        <p className="text-stone-500 text-sm md:text-base leading-relaxed max-w-2xl mx-auto">
          We have meticulously selected the most renowned global beauty houses. Every product in our collection is sourced directly from manufacturers, guaranteeing 
          <strong className="text-[#000000] font-medium"> 100% authenticity</strong> and premium quality for your daily ritual.
        </p>
      </div>

      {/* --- MARQUEE CONTAINER (Same as before) --- */}
      <div className="relative w-full overflow-hidden group py-4">
        
        {/* Left Fade Gradient */}
        <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-white via-white/80 to-transparent z-10 pointer-events-none" />
        
        {/* Right Fade Gradient */}
        <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-white via-white/80 to-transparent z-10 pointer-events-none" />

        {/* SCROLLING TRACK */}
        <div className="flex w-max">
          
          {/* List 1 */}
          <div className="flex animate-infinite-scroll gap-20 px-10 items-center">
            {BRANDS.map((brand, index) => (
              <BrandItem key={`a-${index}`} brand={brand} />
            ))}
          </div>

          {/* List 2 (Duplicate for seamless loop) */}
          <div className="flex animate-infinite-scroll gap-20 px-10 items-center" aria-hidden="true">
            {BRANDS.map((brand, index) => (
              <BrandItem key={`b-${index}`} brand={brand} />
            ))}
          </div>

        </div>
      </div>
    </section>
  );
}

// Helper Component
function BrandItem({ brand }: { brand: { name: string; logo: string } }) {
  return (
    <div className="relative w-36 h-20 grayscale opacity-40 hover:grayscale-0 hover:opacity-100 transition-all duration-500 cursor-pointer hover:scale-110">
      <Image
        src={brand.logo}
        alt={brand.name}
        fill
        className="object-contain"
        sizes="166px"
      />
    </div>
  );
}