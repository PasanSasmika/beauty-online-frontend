'use client';

import { useState } from 'react';
import { ArrowRight, Loader2 } from 'lucide-react';

interface SignupFormProps {
  onSwitch: () => void;
}

export default function SignupForm({ onSwitch }: SignupFormProps) {
  const [formData, setFormData] = useState({ full_name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Signup failed');

      // Success! Switch to login so they can sign in
      alert('Account created! Please sign in.');
      onSwitch();
      
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md bg-[#FAF9F6] p-8 md:p-12 rounded-3xl shadow-2xl">
      <div className="text-center mb-10">
        <h2 className="text-3xl font-serif font-bold text-[#000000]">Create Account</h2>
        <p className="text-stone-500 mt-2">Join us for a premium experience.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && <div className="text-red-500 text-center text-sm">{error}</div>}
        
        <div>
          <label className="block text-sm font-medium text-[#000000] mb-2">Full Name</label>
          <input 
            type="text" 
            required
            value={formData.full_name}
            onChange={(e) => setFormData({...formData, full_name: e.target.value})}
            placeholder="Jane Doe"
            className="w-full px-4 py-3 rounded-xl bg-white border border-stone-200 focus:outline-none focus:ring-2 focus:ring-[#ee3f5c] text-[#000000]"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-[#000000] mb-2">Email Address</label>
          <input 
            type="email" 
            required
            value={formData.email}
            onChange={(e) => setFormData({...formData, email: e.target.value})}
            placeholder="you@example.com"
            className="w-full px-4 py-3 rounded-xl bg-white border border-stone-200 focus:outline-none focus:ring-2 focus:ring-[#ee3f5c] text-[#000000]"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-[#000000] mb-2">Password</label>
          <input 
            type="password" 
            required
            value={formData.password}
            onChange={(e) => setFormData({...formData, password: e.target.value})}
            placeholder="••••••••"
            className="w-full px-4 py-3 rounded-xl bg-white border border-stone-200 focus:outline-none focus:ring-2 focus:ring-[#ee3f5c] text-[#000000]"
          />
        </div>

        <button 
          disabled={loading}
          className="w-full bg-[#000000] text-white py-4 rounded-xl font-medium hover:bg-stone-800 transition-colors flex items-center justify-center gap-2 group disabled:opacity-70"
        >
          {loading ? <Loader2 className="animate-spin" /> : 'Create Account'}
        </button>
      </form>

      <p className="text-center mt-8 text-stone-500 text-sm">
        Already a member?{' '}
        <button onClick={onSwitch} className="text-[#000000] font-bold hover:underline">
          Sign In
        </button>
      </p>
    </div>
  );
}