'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, UserCircle, ShoppingBag } from 'lucide-react'; // Added ShoppingBag
import Link from 'next/link';
import Image from 'next/image';
import { useCart } from '@/context/CartContext'; // Import Cart Hook

// Import the new separate files
import LoginForm from '@/components/auth/LoginForm';
import SignupForm from '@/components/auth/SignupForm';

const navLinks = [
  { title: "Home", href: "/" },
  { title: "Products", href: "/products" },
  { title: "About Us", href: "/about" },
];

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  
  // Cart Context
  const { toggleCart, cart } = useCart();

  // Auth State
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
    if (isLoginOpen) setIsLoginOpen(false);
  };

  const toggleLogin = () => {
    setIsLoginOpen(!isLoginOpen);
    if (isMenuOpen) setIsMenuOpen(false);
    if (!isLoginOpen) setAuthMode('login'); 
  };

  const headerBgClass = isMenuOpen || isLoginOpen ? 'bg-[#ee3f5c]' : 'bg-[#FAF9F6]';

  return (
    <>
      <header className={`fixed top-0 left-0 right-0 z-50 px-6 py-2 flex items-center justify-between transition-colors duration-300 ${headerBgClass}`}>
        
        {/* LOGO */}
        <Link href="/" className="flex items-center gap-3 z-50">
          <div className="relative w-40 h-24 md:w-60 md:h-20 flex-shrink-0">
            <Image
              src="/skinlogo.png"
              alt="Skincares.lk Logo"
              fill 
              className="object-contain object-left"
              priority
            />
          </div>
        </Link>

        {/* RIGHT SIDE ACTIONS */}
        <div className="flex items-center gap-4 md:gap-6 z-50">
          
          {/* CART BUTTON (New) */}
          <button 
            onClick={toggleCart}
            className="text-[#000000] hover:text-[#ee3f5c] transition-colors focus:outline-none relative"
          >
            <ShoppingBag size={28} strokeWidth={1.5} />
            {cart.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-[#ee3f5c] text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full border border-[#FAF9F6]">
                {cart.length}
              </span>
            )}
          </button>

          {/* USER BUTTON */}
          <button 
            onClick={toggleLogin}
            className="text-[#000000] hover:text-[#ee3f5c] transition-colors focus:outline-none"
          >
             {isLoginOpen ? <X size={28} strokeWidth={1.5} /> : <UserCircle size={28} strokeWidth={1.5} />}
          </button>

          {/* MENU BUTTON */}
          <button onClick={toggleMenu} className="flex items-center gap-2 text-[#000000] focus:outline-none group">
            <div className="relative w-6 h-6">
              <motion.div initial={false} animate={{ opacity: isMenuOpen ? 0 : 1, rotate: isMenuOpen ? 90 : 0 }} className="absolute inset-0">
                <Menu size={28} strokeWidth={1.5} />
              </motion.div>
              <motion.div initial={false} animate={{ opacity: isMenuOpen ? 1 : 0, rotate: isMenuOpen ? 0 : -90 }} className="absolute inset-0">
                <X size={28} strokeWidth={1.5} />
              </motion.div>
            </div>
            <span className="text-2xl font-bold uppercase tracking-wide hidden sm:block">Menu</span>
          </button>
        </div>
      </header>

      {/* --- MENU OVERLAY --- */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            key="menu-overlay"
            initial={{ y: "-100%" }}
            animate={{ y: 0 }}
            exit={{ y: "-100%" }}
            transition={{ duration: 0.5, ease: [0.76, 0, 0.24, 1] }}
            className="fixed inset-0 z-40 bg-[#ee3f5c] pt-24 px-6 md:px-20 pb-10 flex flex-col justify-between"
          >
             <div className="h-full flex flex-col md:flex-row md:items-end justify-between pb-10">
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
                      onClick={() => setIsMenuOpen(false)}
                      className="text-5xl md:text-7xl font-medium text-[#000000] hover:text-white transition-colors block"
                    >
                      {link.title}
                    </Link>
                  </motion.div>
                ))}
              </nav>
              
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="hidden md:block text-right space-y-2 text-[#000000]"
              >
                <p className="text-lg opacity-70">Contact Us</p>
                <p className="text-2xl font-medium">+94 71 806 0000</p>
                <p className="text-2xl font-medium">skincares.lk@gmail.com</p>
              </motion.div>
            </div>

            <motion.div 
              initial={{ scaleX: 0 }} 
              animate={{ scaleX: 1 }} 
              transition={{ delay: 0.4, duration: 0.8 }}
              className="w-full h-[1px] bg-[#000000]/20 origin-left"
            />
            
            <div className="md:hidden mt-6 text-[#000000] space-y-1">
               <p className="font-medium">skincares.lk@gmail.com</p>
               <p className="opacity-60">+94 71 806 0000</p>
            </div>

          </motion.div>
        )}
      </AnimatePresence>

      {/* --- AUTH OVERLAY (Login / Signup) --- */}
      <AnimatePresence>
        {isLoginOpen && (
          <motion.div
            key="auth-overlay"
            initial={{ y: "-100%" }}
            animate={{ y: 0 }}
            exit={{ y: "-100%" }}
            transition={{ duration: 0.5, ease: [0.76, 0, 0.24, 1] }}
            className="fixed inset-0 z-40 bg-[#ee3f5c] flex items-center justify-center px-6"
          >
             {authMode === 'login' ? (
                <LoginForm 
                  onSwitch={() => setAuthMode('signup')} 
                  onClose={() => setIsLoginOpen(false)}
                />
             ) : (
                <SignupForm onSwitch={() => setAuthMode('login')} />
             )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}