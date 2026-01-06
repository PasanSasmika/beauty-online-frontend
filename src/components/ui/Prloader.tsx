'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Preloader() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // 1. Disable scrolling while loading
    if (isLoading) {
      document.body.style.overflow = 'hidden';
    }

    // 2. Wait for 2 seconds (simulate loading)
    const timer = setTimeout(() => {
      setIsLoading(false);
      document.body.style.overflow = ''; // Re-enable scrolling
      window.scrollTo(0, 0); // Reset scroll to top
    }, 2200);

    return () => clearTimeout(timer);
  }, [isLoading]);

  return (
    <AnimatePresence mode="wait">
      {isLoading && (
        <motion.div
          // Slide Up Animation (Exit)
          exit={{ y: "-100%" }}
          transition={{ duration: 0.8, ease: [0.76, 0, 0.24, 1] }}
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#ee3f5c]"
        >
          {/* Animated Text */}
          <div className="overflow-hidden">
             <motion.h1
               initial={{ y: "100%" }}
               animate={{ y: 0 }}
               transition={{ duration: 0.5, delay: 0.2 }}
               className="text-[#000000] text-4xl md:text-6xl font-bold tracking-tight"
             >
               <span className="block">Skincares.lk</span>
             </motion.h1>
          </div>
          
          {/* Optional: Small Loading Bar */}
          <motion.div 
             initial={{ width: 0 }}
             animate={{ width: "200px" }}
             transition={{ duration: 1.5, ease: "easeInOut" }}
             className="absolute bottom-20 h-[1px] bg-[#FAF9F6]/30"
          >
             <div className="h-full bg-[#FAF9F6] w-full" />
          </motion.div>

        </motion.div>
      )}
    </AnimatePresence>
  );
}