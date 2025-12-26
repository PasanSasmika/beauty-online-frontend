'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation'; // Import router for redirection
import { ArrowRight, Loader2 } from 'lucide-react';

interface LoginFormProps {
  onSwitch: () => void;
  // Optional: Function to close the modal after login
  onClose?: () => void; 
}

export default function LoginForm({ onSwitch, onClose }: LoginFormProps) {
  const router = useRouter();
  
  // Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      
      const res = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Login failed');
      }

     
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      if (onClose) onClose();

      // 4. Redirect based on Role
      if (data.user.role === 'admin') {
   router.push('/admin/dashboard');
      } else {
        router.push('/');
        window.location.reload(); 
      }

    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md bg-[#FAF9F6] p-8 md:p-12 rounded-3xl shadow-2xl">
      <div className="text-center mb-10">
        <h2 className="text-3xl font-serif font-bold text-[#2D241E]">Welcome Back</h2>
        <p className="text-stone-500 mt-2">Please enter your details to sign in.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Error Message */}
        {error && (
          <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg text-center">
            {error}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-[#2D241E] mb-2">Email Address</label>
          <input 
            type="email" 
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="w-full px-4 py-3 rounded-xl bg-white border border-stone-200 focus:outline-none focus:ring-2 focus:ring-[#8B9B86] text-[#2D241E]"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-[#2D241E] mb-2">Password</label>
          <input 
            type="password" 
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full px-4 py-3 rounded-xl bg-white border border-stone-200 focus:outline-none focus:ring-2 focus:ring-[#8B9B86] text-[#2D241E]"
          />
        </div>

        <button 
          type="submit" 
          disabled={loading}
          className="w-full bg-[#2D241E] text-white py-4 rounded-xl font-medium hover:bg-stone-800 transition-colors flex items-center justify-center gap-2 group disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <Loader2 size={18} className="animate-spin" /> Signing In...
            </>
          ) : (
            <>
              Sign In
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </>
          )}
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