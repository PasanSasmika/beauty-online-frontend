'use client';

import { Phone } from 'lucide-react';

export default function FloatingPhone() {
  return (
    <a
      href="tel:+94789086776"
      aria-label="Call us"
      className="fixed bottom-6 right-6 z-50 flex items-center justify-center w-14 h-14 
                 rounded-full bg-[#ee3f5c] hover:bg-[#e61c3d]
                 shadow-lg shadow-[#880a1f]
                 hover:shadow-2xl hover:shadow-[#f70b32]
                 transition-all duration-300"
    >
      <Phone className="w-6 h-6 text-white" />
    </a>
  );
}