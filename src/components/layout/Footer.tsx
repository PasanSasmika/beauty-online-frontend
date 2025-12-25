'use client';

import { motion } from 'framer-motion';
import { Facebook, ArrowUpRight, MapPin, Phone, Mail } from 'lucide-react';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="w-full px-4 md:px-6 py-6 pb-8 bg-[#FAF9F6]">
      
      {/* Main Rounded Container */}
      <div className="w-full bg-white rounded-[40px] md:rounded-[60px] overflow-hidden shadow-sm border border-[#2D241E]/5 px-6 md:px-20 py-16 md:py-24 relative flex flex-col items-center justify-between">
        
        {/* --- 1. Center Content: Large Animated Text --- */}
        <div className="flex flex-col items-center text-center w-full z-10 mb-12">
          
          {/* Animated Text Wrapper */}
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-[12vw] md:text-[10vw]  font-bold leading-none tracking-tighter select-none"
          >
            {/* Gradient Text */}
            <span className="bg-gradient-to-r from-[#2D241E] via-[#8B9B86] to-[#2D241E] bg-[length:200%_auto] bg-clip-text text-transparent animate-gradient-slow">
              BEAUTY ONLINE
            </span>
          </motion.h1>

          <p className="mt-6 text-stone-500 max-w-md text-lg">
            Awaken Your Natural Glow
          </p>

          {/* Buttons Row */}
          <div className="flex flex-wrap justify-center gap-4 mt-10">
            <Link 
               href="/products" 
               className="group flex items-center gap-2 bg-[#2D241E] text-white px-8 py-4 rounded-full font-medium transition-transform hover:scale-105"
            >
              View Products
              <ArrowUpRight className="w-4 h-4 transition-transform group-hover:rotate-45" />
            </Link>
            
            <Link 
               href="/contact" 
               className="group flex items-center gap-2 bg-stone-100 text-[#2D241E] px-8 py-4 rounded-full font-medium hover:bg-stone-200 transition-transform hover:scale-105"
            >
              Contact Us
            </Link>
          </div>
        </div>

        {/* --- 2. Contact Details Grid --- */}
        <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-8 py-10 border-t border-stone-100 text-[#2D241E]">
            
            {/* Address */}
            <div className="flex flex-col items-center md:items-start text-center md:text-left gap-2">
                <div className="flex items-center gap-2 text-[#8B9B86] font-semibold text-sm uppercase tracking-wider">
                    <MapPin size={16} /> Address
                </div>
                <p className="text-stone-600">
                    Colombo, Sri Lanka
                </p>
            </div>

            {/* Contact Numbers */}
            <div className="flex flex-col items-center text-center gap-2">
                <div className="flex items-center gap-2 text-[#8B9B86] font-semibold text-sm uppercase tracking-wider">
                    <Phone size={16} /> Contact
                </div>
                <div className="text-stone-600 space-y-1">
                    <p className="flex items-center justify-center gap-2 text-[#2D241E] font-medium">
                        +94 71 806 0000
                    </p>
                </div>
            </div>

            {/* Email */}
            <div className="flex flex-col items-center md:items-end text-center md:text-right gap-2">
                <div className="flex items-center gap-2 text-[#8B9B86] font-semibold text-sm uppercase tracking-wider">
                    <Mail size={16} /> Email
                </div>
                <a href="mailto:beautyonline.lk@gmail.com" className="text-stone-600 hover:text-[#2D241E] transition-colors">
                    beautyonline.lk@gmail.com
                </a>
            </div>
        </div>


        {/* --- 3. Bottom Bar: Facebook & Credits --- */}
        <div className="w-full flex flex-col md:flex-row items-center justify-between gap-6 mt-6 pt-6 border-t border-stone-100">
          
          {/* Social Icons (Only Facebook) */}
          <div className="flex gap-4">
            <a href="https://www.facebook.com/p/Beauty-Online-61578582267460/" target="_blank" className="p-3 bg-[#1877F2] text-white rounded-full hover:opacity-90 transition-opacity">
              <Facebook size={20} fill="currentColor" strokeWidth={0} />
            </a>
          </div>

          {/* Credits */}
          <div className="text-center md:text-right">
  <p className="text-sm text-stone-500">
    Design & Develop by{" "}
    <a 
      href="https://voguesoftwares.com/" 
      target="_blank" 
      rel="noopener noreferrer" 
      className="text-[#2D241E] font-bold hover:underline"
    >
      Vogue Software Solutions
    </a>
  </p>
  <p className="text-xs text-stone-400 mt-1">© 2025. All rights reserved.</p>
</div>

        </div>
      </div>
    </footer>
  );
}