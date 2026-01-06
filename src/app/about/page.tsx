'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import { ShieldCheck, Heart, Leaf, Users, Star } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#FAF9F6] text-[#2D241E]">
      
      {/* 1. CINEMATIC HERO SECTION */}
      <section className="relative h-[80vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image 
            src="/image.jpg" // [Image of diverse women with glowing skin]
            alt="About Hero" 
            fill 
            className="object-cover"
            priority
          />
          {/* Gradient Overlay for text readability */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-[#FAF9F6]" />
        </div>
        
        <div className="relative z-10 text-center px-6 mt-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <span className="inline-block py-1 px-4 border border-white/30 rounded-full text-white text-xs font-bold uppercase tracking-[0.2em] backdrop-blur-md mb-6">
              Since 2024
            </span>
            <h1 className="text-6xl md:text-8xl  font-medium text-white mb-6 drop-shadow-sm">
              Authentic beauty <br /> <span className="italic">for everyone.</span>
            </h1>
          </motion.div>
        </div>
      </section>

      {/* 2. THE PHILOSOPHY (Editorial Layout) */}
      <section className="py-32 px-6 md:px-20 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row gap-16 lg:gap-24 items-center">
          
          {/* Text Side */}
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="flex-1 space-y-8"
          >
            <h2 className="text-4xl md:text-5xl leading-tight">
              We bridge the gap between <span className="text-[#ee3f5c]">global luxury</span> and your daily ritual.
            </h2>
            <div className="w-20 h-1 bg-[#ee3f5c]" />
            <p className="text-lg text-stone-600 leading-relaxed">
              Founded in Sri Lanka, our platform was built to solve a simple yet critical problem: the difficulty of finding genuine, high-quality international skincare locally.
            </p>
            <p className="text-lg text-stone-600 leading-relaxed">
              We don't just sell products; we curate a lifestyle. Every item on our shelf is handpicked, strictly vetted, and sourced directly from authorized distributors.
            </p>
            
            {/* Signature Area */}
            <div className="pt-8">
              <p className="font-handwriting text-2xl text-[#ee3f5c]">The Founders</p>
            </div>
          </motion.div>
          
          {/* Image Side with 'Offset' effect */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="flex-1 relative"
          >
            <div className="relative aspect-[4/5] rounded-[3rem] overflow-hidden shadow-2xl z-10">
               <Image 
                 src="/image.jpg" // [Image of premium skincare bottles on a stone background]
                 alt="Our Philosophy" 
                 fill 
                 className="object-cover hover:scale-105 transition-transform duration-700"
               />
            </div>
            {/* Decorative Circle Behind */}
            <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-[#ee3f5c]/10 rounded-full blur-2xl -z-0" />
          </motion.div>
        </div>
      </section>

      {/* 3. CORE VALUES (Grid) */}
      <section className="bg-white py-24 px-6 md:px-20 rounded-t-[4rem]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <span className="text-[#ee3f5c] font-bold tracking-widest text-xs uppercase mb-3 block">Why Choose Us</span>
            <h2 className="text-4xl md:text-5xl">The Beauty Standard</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <ValueCard 
              icon={<ShieldCheck size={32} />} 
              title="100% Authentic" 
              desc="Zero tolerance for fakes. We guarantee the origin of every single bottle we ship." 
            />
            <ValueCard 
              icon={<Leaf size={32} />} 
              title="Consciously Curated" 
              desc="We prioritize products that are safe, effective, and loved by dermatologists worldwide." 
            />
            <ValueCard 
              icon={<Heart size={32} />} 
              title="Customer Obsessed" 
              desc="From luxury packaging to expert support, your experience is our absolute obsession." 
            />
          </div>
        </div>
      </section>

      {/* 4. STATS STRIP (Modern) */}
      <section className="py-24 bg-[#2D241E] text-[#FAF9F6] relative overflow-hidden">
        {/* Background Pattern */}        
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-12 relative z-10">
          <Stat number="5k+" label="Happy Customers" />
          <Stat number="50+" label="Global Brands" />
          <Stat number="100%" label="Authenticity" />
          <Stat number="4.9" label="Average Rating" />
        </div>
      </section>

    </div>
  );
}

// --- SUB-COMPONENTS ---

function ValueCard({ icon, title, desc }: { icon: any, title: string, desc: string }) {
  return (
    <div className="p-10 bg-[#FAF9F6] rounded-[2rem] hover:bg-white hover:shadow-xl hover:-translate-y-2 transition-all duration-300 border border-transparent hover:border-[#ee3f5c]/20 group">
      <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-[#2D241E] group-hover:text-[#ee3f5c] group-hover:bg-[#ee3f5c]/10 transition-colors mb-6 shadow-sm">
        {icon}
      </div>
      <h3 className="text-xl font-bold text-[#2D241E] mb-3 ">{title}</h3>
      <p className="text-stone-500 leading-relaxed">{desc}</p>
    </div>
  );
}

function Stat({ number, label }: { number: string, label: string }) {
  return (
    <div className="text-center space-y-2">
      <div className="text-5xl md:text-6xl  text-[#ee3f5c]">{number}</div>
      <div className="text-xs md:text-sm uppercase tracking-[0.2em] text-[#FAF9F6]/60">{label}</div>
    </div>
  );
}