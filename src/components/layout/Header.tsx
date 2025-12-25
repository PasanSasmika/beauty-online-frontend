'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, ArrowRight } from 'lucide-react';
import Link from 'next/link';

const navLinks = [
  { title: "Home", href: "/" },
  { title: "Products", href: "#" },
  { title: "About Us", href: "#" },
];

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => setIsOpen(!isOpen);

  return (
    <>
      <header className={`fixed top-0 left-0 right-0 z-50 px-6 py-4 flex items-center justify-between transition-colors duration-300 ${isOpen ? 'bg-[#D6CFC4]' : 'bg-[#FAF9F6]'}`}>
        
        <Link href="/" className="flex items-center gap-2 z-50">
          <span className="text-stone-800 text-xl font-bold tracking-tight flex items-center gap-2">
             <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-stone-600"><path d="M12 7.5a4.5 4.5 0 1 1 4.5 4.5M12 7.5A4.5 4.5 0 1 0 7.5 12M12 7.5V9m-4.5 3a4.5 4.5 0 1 0 4.5 4.5M7.5 12H9m3 4.5V15m4.5-3a4.5 4.5 0 1 1-4.5-4.5M12 12v1.5"/></svg>
             Beauty Online
          </span>
        </Link>

        {/* Right Side Actions */}
        <div className="flex items-center gap-6 z-50">
          <button className="hidden md:block bg-[#2D241E] text-[#FAF9F6] px-6 py-2 rounded-full font-medium hover:bg-stone-800 transition-colors">
            Order Now
          </button>

          {/* Menu Trigger */}
          <button 
            onClick={toggleMenu} 
            className="flex items-center gap-2 text-[#2D241E] focus:outline-none group"
          >
            {/* Animated Icon Swap */}
            <div className="relative w-6 h-6">
              <motion.div
                initial={false}
                animate={{ opacity: isOpen ? 0 : 1, rotate: isOpen ? 90 : 0 }}
                className="absolute inset-0"
              >
                <Menu size={28} strokeWidth={1.5} />
              </motion.div>
              <motion.div
                initial={false}
                animate={{ opacity: isOpen ? 1 : 0, rotate: isOpen ? 0 : -90 }}
                className="absolute inset-0"
              >
                <X size={28} strokeWidth={1.5} />
              </motion.div>
            </div>
            
            <span className="text-2xl font-bold uppercase tracking-wide hidden sm:block">
              Menu
            </span>
          </button>
        </div>
      </header>

      {/* --- FULL SCREEN MENU OVERLAY --- */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ y: "-100%" }}
            animate={{ y: 0 }}
            exit={{ y: "-100%" }}
            transition={{ duration: 0.5, ease: [0.76, 0, 0.24, 1] }}
            className="fixed inset-0 z-40 bg-[#D6CFC4] pt-24 px-6 md:px-20 pb-10 flex flex-col justify-between"
          >
            {/* Menu Content Container */}
            <div className="h-full flex flex-col md:flex-row md:items-end justify-between pb-10">
              
              {/* Left Side: Navigation Links */}
              <nav className="flex flex-col gap-4 mt-10 md:mt-0">
                {navLinks.map((link, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + (index * 0.1) }}
                  >
                    <Link 
                      href={link.href} 
                      onClick={() => setIsOpen(false)}
                      className="text-5xl md:text-7xl font-medium text-[#2D241E] hover:text-white transition-colors block"
                    >
                      {link.title}
                    </Link>
                  </motion.div>
                ))}
              </nav>

              {/* Right Side: Contact Info (Desktop) */}
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="hidden md:block text-right space-y-2 text-[#2D241E]"
              >
                <p className="text-lg opacity-70">Sanctuary of Serenity</p>
                <p className="text-2xl font-medium">+1 (555) 000-0000</p>
                <p className="text-2xl font-medium">hello@lotusw.co</p>
              </motion.div>
            </div>

            {/* Bottom Divider & Mobile Footer */}
            <motion.div 
              initial={{ scaleX: 0 }} 
              animate={{ scaleX: 1 }} 
              transition={{ delay: 0.4, duration: 0.8 }}
              className="w-full h-[1px] bg-[#2D241E]/20 origin-left"
            />
            
            <div className="md:hidden mt-6 text-[#2D241E] space-y-1">
               <p className="font-medium">hello@lotusw.co</p>
               <p className="opacity-60">+1 (555) 000-0000</p>
            </div>

          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}