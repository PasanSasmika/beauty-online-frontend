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

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
            ? 'bg-white/95 backdrop-blur-md shadow-md'
            : 'bg-[#FAF9F6]'
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 md:px-10 flex items-center justify-between h-16 md:h-20">

          {/* LOGO */}
          <Link href="/" className="relative w-36 h-12 md:w-48 md:h-16 shrink-0">
            <Image
              src="/skinlogo.png"
              alt="Skincares.lk"
              fill
              className="object-contain object-left"
              priority
              unoptimized
            />
          </Link>

          {/* DESKTOP NAV LINKS */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`relative px-4 py-2 text-sm font-semibold rounded-lg transition-colors duration-200 group ${
                    isActive
                      ? 'text-[#ee3f5c]'
                      : 'text-stone-600 hover:text-[#000000]'
                  }`}
                >
                  {link.title}
                  <span
                    className={`absolute bottom-0 left-4 right-4 h-0.5 bg-[#ee3f5c] rounded-full transition-transform duration-200 origin-left ${
                      isActive ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
                    }`}
                  />
                </Link>
              );
            })}
          </nav>

          {/* RIGHT ACTIONS */}
          <div className="flex items-center gap-2 md:gap-3">

            {/* CART */}
            <button
              onClick={toggleCart}
              className="relative flex items-center justify-center w-10 h-10 rounded-xl hover:bg-stone-100 text-stone-700 hover:text-[#ee3f5c] transition-colors"
              aria-label="Cart"
            >
              <ShoppingBag size={22} strokeWidth={1.8} />
              {cart.length > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-[#ee3f5c] text-white text-[9px] font-bold min-w-[18px] h-[18px] flex items-center justify-center rounded-full px-1 border-2 border-white">
                  {cart.length}
                </span>
              )}
            </button>

            {/* USER — Desktop */}
            {user ? (
              <Link
                href="/profile"
                className="hidden md:flex items-center justify-center w-10 h-10 rounded-xl bg-[#000000] text-white hover:bg-[#ee3f5c] transition-colors"
                title="My Profile"
              >
                <User size={18} />
              </Link>
            ) : (
              <div className="hidden md:flex items-center gap-2">
                <button
                  onClick={() => openAuth('login')}
                  className="px-4 py-2 text-sm font-semibold text-stone-700 hover:text-[#000000] rounded-lg hover:bg-stone-100 transition-colors"
                >
                  Sign In
                </button>
                <button
                  onClick={() => openAuth('signup')}
                  className="px-4 py-2 text-sm font-semibold bg-[#ee3f5c] text-white rounded-xl hover:bg-[#c1023e] transition-colors shadow-sm"
                >
                  Sign Up
                </button>
              </div>
            )}

            {/* MOBILE MENU TOGGLE */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden flex items-center justify-center w-10 h-10 rounded-xl hover:bg-stone-100 text-stone-700 transition-colors"
              aria-label="Menu"
            >
              {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
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
              transition={{ duration: 0.25, ease: 'easeInOut' }}
              className="md:hidden overflow-hidden bg-white border-t border-stone-100 shadow-xl"
            >
              <div className="px-6 py-4 flex flex-col gap-1">
                {navLinks.map((link) => {
                  const isActive = pathname === link.href;
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`px-4 py-3 rounded-xl text-base font-semibold transition-colors ${
                        isActive
                          ? 'bg-[#ee3f5c]/10 text-[#ee3f5c]'
                          : 'text-stone-700 hover:bg-stone-50 hover:text-[#000000]'
                      }`}
                    >
                      {link.title}
                    </Link>
                  );
                })}

                {!user ? (
                  <div className="flex gap-2 mt-3 pt-3 border-t border-stone-100">
                    <button
                      onClick={() => openAuth('login')}
                      className="flex-1 py-3 text-sm font-semibold border-2 border-[#000000] text-[#000000] rounded-xl hover:bg-stone-50 transition-colors"
                    >
                      Sign In
                    </button>
                    <button
                      onClick={() => openAuth('signup')}
                      className="flex-1 py-3 text-sm font-semibold bg-[#ee3f5c] text-white rounded-xl hover:bg-[#c1023e] transition-colors"
                    >
                      Sign Up
                    </button>
                  </div>
                ) : (
                  <Link
                    href="/profile"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="mt-3 pt-3 border-t border-stone-100 flex items-center gap-3 px-4 py-3 rounded-xl text-stone-700 hover:bg-stone-50 font-semibold"
                  >
                    <div className="w-8 h-8 rounded-full bg-[#000000] flex items-center justify-center">
                      <User size={16} className="text-white" />
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
            key="auth-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center px-6"
            onClick={(e) => { if (e.target === e.currentTarget) setIsAuthOpen(false); }}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              transition={{ duration: 0.2 }}
              className="relative w-full max-w-md"
            >
              <button
                onClick={() => setIsAuthOpen(false)}
                className="absolute -top-3 -right-3 z-10 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center text-stone-500 hover:text-[#000000] transition-colors"
              >
                <X size={16} />
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