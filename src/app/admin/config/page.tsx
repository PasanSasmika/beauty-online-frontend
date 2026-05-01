'use client';

import { useEffect, useState } from 'react';
import { Loader2, Settings2, Save, Truck } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminSettingsPage() {
  const [shippingCost, setShippingCost] = useState<number | ''>('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Fetch settings on mount
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/settings`);
        if (!res.ok) throw new Error('Failed to fetch settings');
        const data = await res.json();
        setShippingCost(data.shipping_cost);
      } catch (error) {
        console.error(error);
        toast.error('Failed to load settings');
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/settings`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` // If you added auth middleware
        },
        body: JSON.stringify({ shipping_cost: Number(shippingCost) })
      });

      if (!res.ok) throw new Error('Failed to update settings');
      toast.success('Settings updated successfully!');
    } catch (error) {
      console.error(error);
      toast.error('Error updating settings');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto pb-20 relative">
      <h1 className="text-3xl font-serif font-bold text-[#2D241E] mb-8 flex items-center gap-3">
        <Settings2 size={32} /> Store Settings
      </h1>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="animate-spin text-[#2D241E]" size={40} /></div>
      ) : (
        <form onSubmit={handleSave} className="bg-white p-8 rounded-2xl shadow-sm border border-stone-200 space-y-8">
          
          {/* Shipping Settings Section */}
          <div>
            <h2 className="font-bold text-lg text-[#2D241E] border-b border-stone-100 pb-3 mb-5 flex items-center gap-2">
              <Truck size={20} className="text-stone-400"/> Shipping & Delivery
            </h2>
            
            <div className="max-w-md space-y-2">
              <label className="text-sm font-bold text-stone-600 block">Flat Shipping Cost (LKR)</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400 font-medium">LKR</span>
                <input 
                  type="number" 
                  required
                  min="0"
                  value={shippingCost}
                  onChange={(e) => setShippingCost(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full pl-14 p-3 bg-stone-50 border border-stone-200 rounded-xl outline-none focus:ring-2 focus:ring-[#2D241E] font-medium" 
                  placeholder="e.g. 500"
                />
              </div>
              <p className="text-xs text-stone-400">This fee will be applied to all orders at checkout.</p>
            </div>
          </div>

          <div className="pt-4 border-t border-stone-100">
            <button 
              type="submit" 
              disabled={saving} 
              className="bg-[#2D241E] text-white px-8 py-3 rounded-xl font-medium hover:bg-stone-800 transition-colors flex items-center justify-center gap-2 disabled:opacity-70"
            >
              {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
              {saving ? 'Saving...' : 'Save Settings'}
            </button>
          </div>

        </form>
      )}
    </div>
  );
}