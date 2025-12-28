'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Minus, Quote } from 'lucide-react';
import Image from 'next/image';

const reviews = [
  {
    id: 1,
    name: "Saheli Hettiarachchi ",
    location: "Colombo, Sri lanka",
    // avatar: "/images/user1.jpg", // Replace with your actual image paths
    text: "Absolutely love Beauty Online! Their skincare products are 100% genuine and really improved my skin’s texture and glow. Fast delivery and amazing prices—highly recommend!"
  },
  {
    id: 2,
    name: "Nilakshana Dissanayake",
    location: "Colombo, Sri lanka",
    // avatar: "/images/user2.jpg",
    text: "I’ve tried several products from Beauty Online, and each one exceeded my expectations. My skin feels smoother, healthier, and radiant. A must-try for anyone!"
  },
  {
    id: 3,
    name: "Nilmini Karunarathna ",
    location: "Colombo, Sri lanka",
    // avatar: "/images/user3.jpg",
    text: "Beauty Online is my go-to for original skincare. The products are top-quality, and the convenience of nationwide delivery makes shopping stress-free. Love it!"
  }
];

export default function Testimonials() {
 
  const [activeIndex, setActiveIndex] = useState<number | null>(0);

  const toggleAccordion = (index: number) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <section className="py-24 px-6 md:px-20 bg-[#FAF9F6]">
      
     
      <div className="mb-16">
        <h2 className="text-5xl font-medium md:text-6xl text-[#2D241E]">
          Clients Review
        </h2>
      </div>

      
      <div className="border-t border-[#2D241E]/10">
        {reviews.map((review, index) => (
          <div key={review.id} className="border-b border-[#2D241E]/10">
            
            
            <button
              onClick={() => toggleAccordion(index)}
              className="w-full py-8 flex flex-col md:flex-row md:items-center justify-between gap-4 text-left group"
            >
              <div className="flex items-center gap-6">
                
                <div className="text-[#2D241E] transition-transform duration-300">
                  {activeIndex === index ? <Minus size={24} /> : <Plus size={24} />}
                </div>

               
                <div className="flex items-center gap-4">
                  <div className="relative w-12 h-12 rounded-full overflow-hidden bg-stone-200">
                    {/* Placeholder image if actual image is missing */}
                    {/* <Image 
                      src={review.avatar} 
                      alt={review.name} 
                      fill 
                      className="object-cover"
                      // Fallback for demo (remove if you have real images)
                      onError={(e) => {
                         // @ts-ignore
                         e.target.style.display = 'none';
                      }}
                    /> */}
                     {/* Fallback color circle if image fails */}
                    <div className="absolute inset-0 bg-stone-300 -z-10" />
                  </div>
                  <span className="text-xl font-medium text-[#2D241E]">
                    {review.name}
                  </span>
                </div>
              </div>

              {/* Meta Data (Role & Location) - Hidden on small mobile when closed if you prefer, or kept visible */}
              <div className="pl-16 md:pl-0 flex items-center gap-4 text-sm md:text-base text-stone-500 font-sans">
                <span className="hidden md:inline text-stone-300">|</span>
                <span>{review.location}</span>
              </div>
            </button>

            {/* --- Accordion Body (The Review Content) --- */}
            <AnimatePresence>
              {activeIndex === index && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.4, ease: [0.04, 0.62, 0.23, 0.98] }}
                  className="overflow-hidden"
                >
                  <div className="pb-10 pl-0 md:pl-14">
                    <div className="bg-[#EBE5D9]/50 p-8 md:p-12 rounded-2xl flex flex-col items-center text-center relative">
                      
                      {/* Quote Icon */}
                      <Quote className="text-[#2D241E] mb-6 opacity-80" size={32} fill="currentColor" />
                      
                      {/* Review Text */}
                      <p className="text-lg md:text-xl text-[#2D241E]/80 leading-relaxed max-w-3xl  italic">
                        &quot;{review.text}&quot;
                      </p>

                      {/* Small decorative line */}
                      <div className="w-24 h-[1px] bg-[#2D241E]/20 mt-8 mb-4" />
                      
                      
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

          </div>
        ))}
      </div>

    </section>
  );
}