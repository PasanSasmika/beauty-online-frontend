'use client';

import { ArrowRight } from 'lucide-react';

interface LoginFormProps {
  onSwitch: () => void; // Function to switch to Signup
}

export default function LoginForm({ onSwitch }: LoginFormProps) {
  return (
    <div className="w-full max-w-md bg-[#FAF9F6] p-8 md:p-12 rounded-3xl shadow-2xl">
      <div className="text-center mb-10">
        <h2 className="text-3xl  font-bold text-[#2D241E]">Welcome Back</h2>
        <p className="text-stone-500 mt-2">Please enter your details to sign in.</p>
      </div>

      <form className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-[#2D241E] mb-2">Email Address</label>
          <input 
            type="email" 
            placeholder="you@example.com"
            className="w-full px-4 py-3 rounded-xl bg-white border border-stone-200 focus:outline-none focus:ring-2 focus:ring-[#8B9B86] text-[#2D241E]"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-[#2D241E] mb-2">Password</label>
          <input 
            type="password" 
            placeholder="••••••••"
            className="w-full px-4 py-3 rounded-xl bg-white border border-stone-200 focus:outline-none focus:ring-2 focus:ring-[#8B9B86] text-[#2D241E]"
          />
        </div>

        <button className="w-full bg-[#2D241E] text-white py-4 rounded-xl font-medium hover:bg-stone-800 transition-colors flex items-center justify-center gap-2 group">
          Sign In
          <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
        </button>
      </form>

      <p className="text-center mt-8 text-stone-500 text-sm">
        Don't have an account?{' '}
        <button onClick={onSwitch} className="text-[#2D241E] font-bold hover:underline">
          Sign up
        </button>
      </p>
    </div>
  );
}