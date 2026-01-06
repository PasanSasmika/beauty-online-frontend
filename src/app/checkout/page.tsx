'use client';

import { useCart } from '@/context/CartContext';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, CheckCircle, ArrowLeft, Truck, Banknote } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export default function CheckoutPage() {
  const { cart, cartTotal, clearCart } = useCart();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  
  // --- DEFINE SHIPPING COST ---
  const SHIPPING_COST = 500;
  
  // Form State
  const [formData, setFormData] = useState({
    firstName: '', lastName: '', email: '', phone: '',
    address: '', city: '', postalCode: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Simulate API Call
    await new Promise(r => setTimeout(r, 2000));

    // Here you would normally send data to your backend, including cartTotal + SHIPPING_COST
    
    setLoading(false);
    clearCart();
    alert('Order Placed Successfully! Order ID: #ORD-' + Math.floor(Math.random() * 10000));
    router.push('/');
  };

  if (cart.length === 0) {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-[#FAF9F6]">
            <h2 className="text-2xl font-bold text-[#2D241E] mb-4">Your cart is empty</h2>
            <Link href="/products" className="text-[#ee3f5c] hover:underline">Continue Shopping</Link>
        </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF9F6] py-12 px-4 md:px-20">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12">
        
        {/* LEFT: FORM */}
        <div className="lg:col-span-7">
            <h1 className="text-3xl font-serif font-bold text-[#2D241E] mb-8">Checkout</h1>
            
            <form onSubmit={handlePlaceOrder} className="bg-white p-8 rounded-3xl shadow-sm border border-stone-100 space-y-6">
                <h3 className="font-bold text-lg text-[#2D241E]">Shipping Information</h3>
                
                <div className="grid grid-cols-2 gap-4">
                    <input required name="firstName" onChange={handleInputChange} placeholder="First Name" className="p-4 bg-stone-50 rounded-xl outline-none focus:ring-2 focus:ring-[#ee3f5c]" />
                    <input required name="lastName" onChange={handleInputChange} placeholder="Last Name" className="p-4 bg-stone-50 rounded-xl outline-none focus:ring-2 focus:ring-[#ee3f5c]" />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                    <input required name="email" type="email" onChange={handleInputChange} placeholder="Email" className="p-4 bg-stone-50 rounded-xl outline-none focus:ring-2 focus:ring-[#ee3f5c]" />
                    <input required name="phone" type="tel" onChange={handleInputChange} placeholder="Phone Number" className="p-4 bg-stone-50 rounded-xl outline-none focus:ring-2 focus:ring-[#ee3f5c]" />
                </div>

                <input required name="address" onChange={handleInputChange} placeholder="Street Address" className="w-full p-4 bg-stone-50 rounded-xl outline-none focus:ring-2 focus:ring-[#ee3f5c]" />
                
                <div className="grid grid-cols-2 gap-4">
                    <input required name="city" onChange={handleInputChange} placeholder="City" className="p-4 bg-stone-50 rounded-xl outline-none focus:ring-2 focus:ring-[#ee3f5c]" />
                    <input required name="postalCode" onChange={handleInputChange} placeholder="Postal Code" className="p-4 bg-stone-50 rounded-xl outline-none focus:ring-2 focus:ring-[#ee3f5c]" />
                </div>

                {/* Payment Method */}
                <div className="pt-6">
                    <h3 className="font-bold text-lg text-[#2D241E] mb-4">Payment Method</h3>
                    <div className="flex items-center gap-4 p-4 border border-[#ee3f5c] bg-[#ee3f5c]/5 rounded-xl cursor-pointer">
                        <Banknote size={24} className="text-[#ee3f5c]" />
                        <span className="font-medium text-[#2D241E]">Cash on Delivery (COD)</span>
                        <CheckCircle size={20} className="ml-auto text-[#ee3f5c]" fill="currentColor" color="white" />
                    </div>
                </div>

                <button 
                    type="submit" 
                    disabled={loading}
                    className="w-full bg-[#2D241E] text-white py-5 rounded-xl font-bold text-lg hover:bg-stone-800 transition-all shadow-lg flex items-center justify-center gap-2 mt-4"
                >
                    {loading ? <Loader2 className="animate-spin" /> : 'Confirm Order'}
                </button>
            </form>
        </div>

        {/* RIGHT: SUMMARY */}
        <div className="lg:col-span-5">
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-stone-100 sticky top-8">
                <h3 className="font-bold text-xl text-[#2D241E] mb-6">Order Summary</h3>
                
                <div className="space-y-4 max-h-80 overflow-y-auto pr-2 scrollbar-thin">
                    {cart.map((item) => (
                        <div key={item.variantId} className="flex gap-4">
                            <div className="relative w-16 h-16 bg-stone-50 rounded-lg overflow-hidden shrink-0">
                                <Image 
                                    src={item.image} 
                                    alt={item.name} 
                                    fill 
                                    className="object-cover" 
                                    unoptimized={true}
                                />
                                <span className="absolute top-0 right-0 bg-[#ee3f5c] text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-bl-lg font-bold">
                                    {item.quantity}
                                </span>
                            </div>
                            <div className="flex-1">
                                <p className="font-medium text-[#2D241E] text-sm line-clamp-1">{item.name}</p>
                                <p className="text-xs text-stone-500">Size: {item.size}</p>
                                <p className="text-sm font-bold text-[#2D241E] mt-1">LKR {(item.price * item.quantity).toLocaleString()}</p>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="border-t border-stone-100 mt-6 pt-6 space-y-3">
                    <div className="flex justify-between text-stone-600">
                        <span>Subtotal</span>
                        <span>LKR {cartTotal.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-stone-600">
                        <span>Shipping</span>
                        {/* UPDATE: Added Shipping Cost */}
                        <span className="text-[#ee3f5c] font-medium">LKR {SHIPPING_COST}</span>
                    </div>
                    <div className="flex justify-between text-[#2D241E] font-bold text-xl pt-2 border-t border-stone-100">
                        <span>Total</span>
                        {/* UPDATE: Added Shipping to Total */}
                        <span>LKR {(cartTotal + SHIPPING_COST).toLocaleString()}</span>
                    </div>
                </div>
            </div>
        </div>

      </div>
    </div>
  );
}