'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, ShoppingBag, User } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';

import LoginForm from '@/components/auth/LoginForm';
import SignupForm from '@/components/auth/SignupForm';

const navLinks = [
  { title: "Home", href: "/" },
  { title: "Products", href: "/products" },
  { title: "About Us", href: "/about" },
  { title: "Contact", href: "/contact" },
  { title: "Track My Order", href: "/track-order" },
];

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [scrolled, setScrolled] = useState(false);

  const pathname = usePathname();
  const { toggleCart, cart } = useCart();
  const { user } = useAuth();

  // Scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close menus on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsAuthOpen(false);
  }, [pathname]);

  const openAuth = (mode: 'login' | 'signup') => {
    setAuthMode(mode);
    setIsAuthOpen(true);
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'bg-white/95 backdrop-blur-md shadow-lg'
            : 'bg-[#FAF9F6]'
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 md:px-10 flex items-center justify-between h-16 md:h-20">

          {/* LOGO */}
          <Link 
            href="/" 
            className="relative w-44 h-14 md:w-40 md:h-40 shrink-0 transition-transform hover:scale-105 active:scale-95"
          >
            <Image
              src="/skinlogo.png"
              alt="Skincares.lk"
              fill
              className="object-contain object-left"
              priority
              unoptimized
            />
          </Link>

          {/* DESKTOP NAVIGATION */}
          <nav className="hidden md:flex items-center gap-2">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`relative px-5 py-2.5 text-sm font-semibold rounded-xl transition-all duration-200 group ${
                    isActive
                      ? 'text-[#ee3f5c]'
                      : 'text-stone-600 hover:text-black'
                  }`}
                >
                  {link.title}
                  <span
                    className={`absolute bottom-1.5 left-5 right-5 h-0.5 bg-[#ee3f5c] rounded-full transition-transform duration-300 origin-left ${
                      isActive ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
                    }`}
                  />
                </Link>
              );
            })}
          </nav>

          {/* RIGHT SECTION */}
          <div className="flex items-center gap-3">

            {/* Cart Button */}
            <button
              onClick={toggleCart}
              className="relative flex items-center justify-center w-10 h-10 rounded-2xl hover:bg-stone-100 text-stone-700 hover:text-[#ee3f5c] transition-all active:scale-95"
              aria-label="Shopping Cart"
            >
              <ShoppingBag size={23} strokeWidth={1.75} />
              {cart.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#ee3f5c] text-white text-[10px] font-bold min-w-[19px] h-[19px] flex items-center justify-center rounded-full border-2 border-white shadow">
                  {cart.length}
                </span>
              )}
            </button>

            {/* User Actions - Desktop */}
            {user ? (
              <Link
                href="/profile"
                className="hidden md:flex items-center justify-center w-10 h-10 rounded-2xl bg-black text-white hover:bg-[#ee3f5c] transition-all active:scale-95"
                title="My Profile"
              >
                <User size={19} />
              </Link>
            ) : (
              <div className="hidden md:flex items-center gap-3">
                <button
                  onClick={() => openAuth('login')}
                  className="px-5 py-2 text-sm font-semibold text-stone-700 hover:text-black rounded-xl hover:bg-stone-100 transition-all"
                >
                  Sign In
                </button>
                <button
                  onClick={() => openAuth('signup')}
                  className="px-5 py-2 text-sm font-semibold bg-[#ee3f5c] text-white rounded-2xl hover:bg-[#c1023e] transition-all shadow-sm active:scale-[0.98]"
                >
                  Sign Up
                </button>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden flex items-center justify-center w-10 h-10 rounded-2xl hover:bg-stone-100 text-stone-700 transition-all active:scale-95"
              aria-label="Toggle Menu"
            >
              <AnimatePresence mode="wait">
                {isMobileMenuOpen ? (
                  <motion.div
                    key="close"
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                  >
                    <X size={24} />
                  </motion.div>
                ) : (
                  <motion.div
                    key="menu"
                    initial={{ rotate: 90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: -90, opacity: 0 }}
                  >
                    <Menu size={24} />
                  </motion.div>
                )}
              </AnimatePresence>
            </button>
          </div>
        </div>

        {/* MOBILE MENU */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="md:hidden bg-white border-t border-stone-100 shadow-xl overflow-hidden"
            >
              <div className="px-6 py-6 flex flex-col gap-2">
                {navLinks.map((link) => {
                  const isActive = pathname === link.href;
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`px-5 py-4 rounded-2xl text-base font-semibold transition-all ${
                        isActive
                          ? 'bg-[#ee3f5c]/10 text-[#ee3f5c]'
                          : 'text-stone-700 hover:bg-stone-50'
                      }`}
                    >
                      {link.title}
                    </Link>
                  );
                })}

                {!user ? (
                  <div className="flex flex-col gap-3 mt-6 pt-6 border-t border-stone-100">
                    <button
                      onClick={() => openAuth('login')}
                      className="py-4 text-base font-semibold border-2 border-black rounded-2xl hover:bg-stone-50 transition-all"
                    >
                      Sign In
                    </button>
                    <button
                      onClick={() => openAuth('signup')}
                      className="py-4 text-base font-semibold bg-[#ee3f5c] text-white rounded-2xl hover:bg-[#c1023e] transition-all"
                    >
                      Sign Up
                    </button>
                  </div>
                ) : (
                  <Link
                    href="/profile"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="mt-6 pt-6 border-t border-stone-100 flex items-center gap-4 px-5 py-4 rounded-2xl text-stone-700 hover:bg-stone-50 font-semibold"
                  >
                    <div className="w-9 h-9 rounded-full bg-black flex items-center justify-center">
                      <User size={18} className="text-white" />
                    </div>
                    My Profile
                  </Link>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* AUTH MODAL */}
      <AnimatePresence>
        {isAuthOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm flex items-center justify-center px-4"
            onClick={(e) => e.target === e.currentTarget && setIsAuthOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="relative w-full max-w-md"
            >
              <button
                onClick={() => setIsAuthOpen(false)}
                className="absolute -top-4 -right-4 z-10 w-9 h-9 bg-white rounded-full shadow-xl flex items-center justify-center text-stone-500 hover:text-black transition-colors"
              >
                <X size={18} />
              </button>

              {authMode === 'login' ? (
                <LoginForm
                  onSwitch={() => setAuthMode('signup')}
                  onClose={() => setIsAuthOpen(false)}
                />
              ) : (
                <SignupForm onSwitch={() => setAuthMode('login')} />
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}