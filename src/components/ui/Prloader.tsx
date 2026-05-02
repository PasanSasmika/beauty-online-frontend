'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';

export default function Preloader() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isLoading) {
      document.body.style.overflow = 'hidden';
    }

    const timer = setTimeout(() => {
      setIsLoading(false);
      document.body.style.overflow = '';
      window.scrollTo(0, 0);
    }, 2800);

    return () => clearTimeout(timer);
  }, [isLoading]);

  return (
    <AnimatePresence mode="wait">
      {isLoading && (
        <motion.div
          exit={{ y: '-100%' }}
          transition={{ duration: 0.85, ease: [0.76, 0, 0.24, 1] }}
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#faf7f4] overflow-hidden"
        >
          {/* Radial ambient glow */}
          <motion.div
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.2, ease: 'easeOut' }}
            className="absolute w-[420px] h-[420px] rounded-full"
            style={{
              background:
                'radial-gradient(circle, rgba(0,0,0,0.2) 0%, transparent 70%)',
            }}
          />

          {/* Corner brackets */}
          {[
            'top-7 left-7 border-t-[1.5px] border-l-[1.5px]',
            'top-7 right-7 border-t-[1.5px] border-r-[1.5px]',
            'bottom-7 left-7 border-b-[1.5px] border-l-[1.5px]',
            'bottom-7 right-7 border-b-[1.5px] border-r-[1.5px]',
          ].map((cls, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 + i * 0.05 }}
              className={`absolute w-9 h-9 border-black/20 ${cls}`}
            />
          ))}

          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, scale: 0.82, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{
              duration: 0.65,
              delay: 0.3,
              ease: [0.34, 1.56, 0.64, 1], // spring overshoot
            }}
            className="relative"
          >
            <Image
              src="/skinlogo.png"          // ← adjust path to your public folder
              alt="Skincares.lk"
              width={300}
              height={100}
              priority
              className="rounded-xl"
              style={{ filter: 'drop-shadow(0 8px 32px rgba(0,0,0,0.4))' }}
            />

            {/* Shimmer sweep */}
            <motion.div
              initial={{ x: '-100%', opacity: 0.6 }}
              animate={{ x: '200%', opacity: 0.6 }}
              transition={{
                duration: 0.9,
                delay: 0.95,
                ease: 'easeInOut',
                repeat: 1,
                repeatDelay: 0.4,
              }}
              className="absolute inset-0 rounded-xl pointer-events-none"
              style={{
                background:
                  'linear-gradient(105deg, transparent 35%, rgba(255,255,255,0.22) 50%, transparent 65%)',
              }}
            />
          </motion.div>

          {/* Tagline */}
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9, duration: 0.5 }}
            className="mt-6 text-black/60 text-[11px] tracking-[0.25em] uppercase font-semibold"
          >
            Glow from within
          </motion.p>

          {/* Loading bar */}
          <div className="absolute bottom-12 w-[200px] h-[1.5px] bg-black/15 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: '100%' }}
              transition={{ duration: 2, ease: 'easeInOut', delay: 0.5 }}
              className="h-full bg-black/45 rounded-full"
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}