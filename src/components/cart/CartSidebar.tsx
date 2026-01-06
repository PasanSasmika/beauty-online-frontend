'use client';

import { useCart } from '@/context/CartContext';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Minus, Plus, Trash2, ShoppingBag } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export default function CartSidebar() {
  const { cart, isCartOpen, toggleCart, removeFromCart, updateQuantity, cartTotal } = useCart();

  return (
    <AnimatePresence>
      {isCartOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={toggleCart}
            className="fixed inset-0 bg-black/40 z-50 backdrop-blur-sm"
          />

          {/* Sidebar */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl z-50 flex flex-col"
          >
            {/* Header */}
            <div className="p-6 border-b border-stone-100 flex items-center justify-between bg-[#FAF9F6]">
              <h2 className="text-xl font-serif font-bold text-[#2D241E] flex items-center gap-2">
                <ShoppingBag size={20} /> Your Cart ({cart.length})
              </h2>
              <button onClick={toggleCart} className="p-2 hover:bg-stone-200 rounded-full transition-colors">
                <X size={24} className="text-[#2D241E]" />
              </button>
            </div>

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {cart.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
                  <div className="w-16 h-16 bg-stone-100 rounded-full flex items-center justify-center">
                    <ShoppingBag size={32} className="text-stone-400" />
                  </div>
                  <p className="text-stone-500">Your cart is empty.</p>
                  <button onClick={toggleCart} className="text-[#ee3f5c] font-bold hover:underline">
                    Start Shopping
                  </button>
                </div>
              ) : (
                cart.map((item) => (
                  <div key={item.variantId} className="flex gap-4">
                    <div className="relative w-20 h-20 bg-stone-50 rounded-lg overflow-hidden shrink-0 border border-stone-100">
                      {/* --- FIX ADDED HERE: unoptimized={true} --- */}
                      <Image 
                          src={item.image} 
                          alt={item.name} 
                          fill 
                          className="object-cover" 
                          unoptimized={true}
                      />
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-bold text-[#2D241E] text-sm line-clamp-1">{item.name}</h3>
                          <p className="text-xs text-stone-500 mt-1">Size: {item.size}</p>
                        </div>
                        <button onClick={() => removeFromCart(item.variantId)} className="text-stone-400 hover:text-[#ee3f5c]">
                          <Trash2 size={16} />
                        </button>
                      </div>
                      <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center border border-stone-200 rounded-lg">
                          <button onClick={() => updateQuantity(item.variantId, -1)} className="p-1 px-2 hover:bg-stone-100"><Minus size={14} /></button>
                          <span className="text-xs font-bold w-6 text-center">{item.quantity}</span>
                          <button onClick={() => updateQuantity(item.variantId, 1)} className="p-1 px-2 hover:bg-stone-100"><Plus size={14} /></button>
                        </div>
                        <p className="font-bold text-[#2D241E] text-sm">LKR {(item.price * item.quantity).toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            {cart.length > 0 && (
              <div className="p-6 border-t border-stone-100 bg-[#FAF9F6]">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-stone-500">Subtotal</span>
                  <span className="text-xl font-bold text-[#2D241E]">LKR {cartTotal.toLocaleString()}</span>
                </div>
                <p className="text-xs text-stone-400 mb-6 text-center">Shipping & taxes calculated at checkout</p>
                <Link 
                  href="/checkout" 
                  onClick={toggleCart}
                  className="block w-full bg-[#2D241E] text-white text-center py-4 rounded-xl font-bold hover:bg-stone-800 transition-all shadow-lg"
                >
                  Checkout Now
                </Link>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}