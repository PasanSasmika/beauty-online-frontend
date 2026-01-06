'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import { ShieldCheck, Heart, Leaf, Users } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#FAF9F6]">
      
      {/* 1. HERO SECTION */}
      <section className="relative h-[60vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image 
            src="/placeholder.jpg" // Replace with a high-quality team or product shot
            alt="About Hero" 
            fill 
            className="object-cover opacity-90"
            priority
          />
          <div className="absolute inset-0 bg-[#2D241E]/30" /> {/* Dark overlay for text readability */}
        </div>
        
        <div className="relative z-10 text-center text-white px-6 max-w-4xl">
          <motion.span 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-[#EBE5D9] font-bold tracking-[0.2em] text-xs uppercase block mb-4"
          >
            Our Story
          </motion.span>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl md:text-7xl  font-bold mb-6"
          >
            Redefining Authentic Beauty
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg md:text-xl text-[#EBE5D9] font-light max-w-2xl mx-auto leading-relaxed"
          >
            We believe that premium skincare shouldn't be a mystery. We bridge the gap between global luxury brands and your daily ritual.
          </motion.p>
        </div>
      </section>

      {/* 2. OUR MISSION (Text & Image Split) */}
      <section className="py-24 px-6 md:px-20 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <span className="text-[#ee3f5c] font-bold tracking-widest text-sm uppercase mb-2 block">
              The Mission
            </span>
            <h2 className="text-4xl  text-[#2D241E] mb-6">
              Curated for the Conscious
            </h2>
            <p className="text-stone-600 mb-6 leading-loose">
              It started with a simple question: <em>"Why is it so hard to find genuine, high-quality international skincare products locally?"</em>
            </p>
            <p className="text-stone-600 leading-loose">
              Founded in Sri Lanka, our platform was built to solve the authenticity crisis. We don't just sell products; we curate a lifestyle. Every item on our shelf is handpicked, rigorously checked, and sourced directly from authorized distributors to ensure that what you put on your skin is nothing short of perfection.
            </p>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative aspect-square md:aspect-[4/5] bg-stone-200 rounded-2xl overflow-hidden"
          >
             <Image 
               src="/image.jpg" // Replace with an image of products or founder
               alt="Our Mission" 
               fill 
               className="object-cover"
             />
          </motion.div>
        </div>
      </section>

      {/* 3. CORE VALUES */}
      <section className="bg-white py-24 px-6 md:px-20 border-y border-stone-100">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl  text-[#2D241E]">Why Choose Us?</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <ValueCard 
              icon={<ShieldCheck size={32} />} 
              title="100% Authentic" 
              desc="Zero tolerance for fakes. We guarantee the origin of every bottle." 
            />
            <ValueCard 
              icon={<Leaf size={32} />} 
              title="Clean Beauty" 
              desc="We prioritize products that are safe, non-toxic, and effective." 
            />
            <ValueCard 
              icon={<Heart size={32} />} 
              title="Customer First" 
              desc="From packaging to support, your experience is our obsession." 
            />
            <ValueCard 
              icon={<Users size={32} />} 
              title="Community" 
              desc="Join thousands of beauty enthusiasts redefining self-care." 
            />
          </div>
        </div>
      </section>

      {/* 4. STATS STRIP */}
      <section className="py-20 bg-[#ee3f5c]">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <Stat number="5k+" label="Happy Customers" />
          <Stat number="50+" label="Premium Brands" />
          <Stat number="100%" label="Authenticity" />
          <Stat number="24/7" label="Support" />
        </div>
      </section>

    </div>
  );
}

// Helper Components
function ValueCard({ icon, title, desc }: { icon: any, title: string, desc: string }) {
  return (
    <div className="p-8 bg-[#FAF9F6] rounded-2xl hover:-translate-y-2 transition-transform duration-300 border border-transparent hover:border-[#8B9B86]/20 text-center">
      <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-[#2D241E] mx-auto mb-6 shadow-sm">
        {icon}
      </div>
      <h3 className="text-lg font-bold text-[#2D241E] mb-3">{title}</h3>
      <p className="text-sm text-stone-500 leading-relaxed">{desc}</p>
    </div>
  );
}

function Stat({ number, label }: { number: string, label: string }) {
  return (
    <div className="space-y-2">
      <div className="text-4xl md:text-5xl  font-bold text-[#EBE5D9]">{number}</div>
      <div className="text-xs md:text-sm uppercase tracking-widest text-[#8B9B86]">{label}</div>
    </div>
  );
}