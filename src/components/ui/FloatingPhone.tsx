'use client';

import { Phone, X } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';

export default function FloatingPhone() {
  const [isMobile, setIsMobile] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const popupRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const check = () => setIsMobile(window.matchMedia('(pointer: coarse)').matches);
    check();
    const mq = window.matchMedia('(pointer: coarse)');
    mq.addEventListener('change', check);
    return () => mq.removeEventListener('change', check);
  }, []);

  useEffect(() => {
    if (!showPopup) return;
    const handler = (e: MouseEvent) => {
      if (
        popupRef.current && !popupRef.current.contains(e.target as Node) &&
        buttonRef.current && !buttonRef.current.contains(e.target as Node)
      ) {
        setShowPopup(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showPopup]);

  const handleClick = () => {
    if (isMobile) {
      // Mobile only — opens native dialer
      window.location.href = 'tel:+94789086776';
    } else {
      // Desktop — just toggle the number popup, no tel: call
      setShowPopup(prev => !prev);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2">

      {/* Desktop popup — plain text number, no tel link */}
      {showPopup && !isMobile && (
        <div
          ref={popupRef}
          className="flex items-center gap-3 bg-white border border-stone-100 rounded-2xl px-4 py-3 shadow-[0_8px_30px_rgba(0,0,0,0.12)]"
        >
          <span className="relative flex h-2.5 w-2.5 shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500" />
          </span>

          <div className="flex flex-col leading-tight">
            <span className="text-[10px] text-stone-400 font-medium uppercase tracking-wider">
              Call us now
            </span>
            {/* Plain text — no href, no onclick, no tel: trigger */}
            <span className="text-sm font-bold text-stone-800 tracking-wide select-all">
              +94 78 908 6776
            </span>
          </div>

          <button
            onClick={() => setShowPopup(false)}
            className="ml-1 text-stone-300 hover:text-stone-500 transition-colors"
            aria-label="Close"
          >
            <X size={14} />
          </button>
        </div>
      )}

      <button
        ref={buttonRef}
        onClick={handleClick}
        aria-label="Call us"
        className="flex items-center justify-center w-14 h-14 rounded-full
                   bg-[#ee3f5c] hover:bg-[#e61c3d]
                   shadow-lg shadow-[#880a1f]
                   hover:shadow-2xl hover:shadow-[#f70b32]
                   transition-all duration-300"
      >
        <Phone className="w-6 h-6 text-white" />
      </button>

    </div>
  );
}