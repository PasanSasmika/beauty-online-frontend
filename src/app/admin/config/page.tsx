'use client';

import { useEffect, useState, useRef } from 'react';
import { Loader2, Settings2, Save, Truck, ImagePlus, Trash2, Eye, EyeOff, UploadCloud, X } from 'lucide-react';
import toast from 'react-hot-toast';
import Image from 'next/image';

interface Banner {
  _id: string;
  image: string;
  description: string;
  isVisible: boolean;
}

export default function AdminSettingsPage() {
  const [shippingCost, setShippingCost] = useState<number | ''>('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // ── Banner state ──────────────────────────────────────────
  const [banners, setBanners] = useState<Banner[]>([]);
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);
  const [bannerDesc, setBannerDesc] = useState('');
  const [uploadingBanner, setUploadingBanner] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── Fetch settings on mount ───────────────────────────────
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/settings`);
        if (!res.ok) throw new Error('Failed to fetch settings');
        const data = await res.json();
        setShippingCost(data.shipping_cost);
        setBanners(data.banners || []);
      } catch (error) {
        console.error(error);
        toast.error('Failed to load settings');
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  // ── Existing: Save shipping cost ──────────────────────────
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/settings`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ shipping_cost: Number(shippingCost) }),
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

  // ── Banner: file pick ─────────────────────────────────────
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setBannerFile(file);
    setBannerPreview(URL.createObjectURL(file));
  };

  const clearFileSelection = () => {
    setBannerFile(null);
    setBannerPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // ── Banner: Add ───────────────────────────────────────────
  const handleAddBanner = async () => {
    if (!bannerFile) { toast.error('Please select an image'); return; }
    setUploadingBanner(true);
    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('image', bannerFile);
      formData.append('description', bannerDesc);

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/settings/banners`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData,
      });
      if (!res.ok) throw new Error('Failed to add banner');
      const data = await res.json();
      setBanners(prev => [...prev, data.banner]);
      setBannerDesc('');
      clearFileSelection();
      toast.success('Banner added!');
    } catch (error) {
      console.error(error);
      toast.error('Failed to add banner');
    } finally {
      setUploadingBanner(false);
    }
  };

  // ── Banner: Toggle visibility ─────────────────────────────
  const handleToggle = async (bannerId: string) => {
    setTogglingId(bannerId);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/settings/banners/${bannerId}/toggle`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to toggle banner');
      const data = await res.json();
      setBanners(prev => prev.map(b => b._id === bannerId ? { ...b, isVisible: data.banner.isVisible } : b));
      toast.success(data.message);
    } catch (error) {
      console.error(error);
      toast.error('Failed to toggle banner');
    } finally {
      setTogglingId(null);
    }
  };

  // ── Banner: Delete ────────────────────────────────────────
  const handleDelete = async (bannerId: string) => {
    if (!confirm('Delete this banner?')) return;
    setDeletingId(bannerId);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/settings/banners/${bannerId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to delete banner');
      setBanners(prev => prev.filter(b => b._id !== bannerId));
      toast.success('Banner deleted');
    } catch (error) {
      console.error(error);
      toast.error('Failed to delete banner');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="max-w-4xl mx-auto pb-20 relative">
      <h1 className="text-3xl font-serif font-bold text-[#2D241E] mb-8 flex items-center gap-3">
        <Settings2 size={32} /> Store Settings
      </h1>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="animate-spin text-[#2D241E]" size={40} />
        </div>
      ) : (
        <div className="space-y-6">

          {/* ── Existing: Shipping form ── */}
          <form onSubmit={handleSave} className="bg-white p-8 rounded-2xl shadow-sm border border-stone-200 space-y-8">
            <div>
              <h2 className="font-bold text-lg text-[#2D241E] border-b border-stone-100 pb-3 mb-5 flex items-center gap-2">
                <Truck size={20} className="text-stone-400" /> Shipping & Delivery
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

          {/* ── NEW: Banner Management ── */}
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-stone-200 space-y-7">
            <h2 className="font-bold text-lg text-[#2D241E] border-b border-stone-100 pb-3 flex items-center gap-2">
              <ImagePlus size={20} className="text-stone-400" /> Banner Management
            </h2>

            {/* Add Banner Form */}
            <div className="space-y-4">
              <p className="text-sm font-semibold text-stone-500 uppercase tracking-wide">Add New Banner</p>

              {/* Drop zone */}
              {!bannerPreview ? (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full border-2 border-dashed border-stone-200 rounded-2xl p-8 flex flex-col items-center gap-3 text-stone-400 hover:border-[#2D241E] hover:text-[#2D241E] transition-colors group"
                >
                  <UploadCloud size={36} className="group-hover:scale-110 transition-transform" />
                  <span className="text-sm font-medium">Click to upload banner image</span>
                  <span className="text-xs">JPG, PNG, WEBP — max 5MB</span>
                </button>
              ) : (
                <div className="relative rounded-2xl overflow-hidden border border-stone-200 aspect-[3/1] w-full">
                  <Image
                    src={bannerPreview}
                    alt="Banner preview"
                    fill
                    className="object-cover"
                  />
                  <button
                    type="button"
                    onClick={clearFileSelection}
                    className="absolute top-3 right-3 bg-black/60 hover:bg-black/80 text-white rounded-full p-1.5 transition-colors"
                  >
                    <X size={16} />
                  </button>
                </div>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp"
                onChange={handleFileChange}
                className="hidden"
              />

              {/* Description */}
              <div className="space-y-1">
                <label className="text-sm font-bold text-stone-600 block">Description (optional)</label>
                <textarea
                  rows={2}
                  value={bannerDesc}
                  onChange={(e) => setBannerDesc(e.target.value)}
                  placeholder="e.g. Summer Sale — Up to 40% off all skincare"
                  className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl outline-none focus:ring-2 focus:ring-[#2D241E] text-sm resize-none"
                />
              </div>

              <button
                type="button"
                onClick={handleAddBanner}
                disabled={uploadingBanner || !bannerFile}
                className="bg-[#2D241E] text-white px-6 py-2.5 rounded-xl font-medium hover:bg-stone-800 transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                {uploadingBanner ? <Loader2 className="animate-spin" size={16} /> : <ImagePlus size={16} />}
                {uploadingBanner ? 'Uploading...' : 'Add Banner'}
              </button>
            </div>

            {/* Banners List */}
            {banners.length > 0 && (
              <div className="space-y-4 pt-2">
                <p className="text-sm font-semibold text-stone-500 uppercase tracking-wide">
                  Active Banners ({banners.length})
                </p>
                <div className="space-y-3">
                  {banners.map((banner) => (
                    <div
                      key={banner._id}
                      className={`flex items-center gap-4 p-3 rounded-2xl border transition-all ${
                        banner.isVisible ? 'border-stone-200 bg-white' : 'border-stone-100 bg-stone-50 opacity-60'
                      }`}
                    >
                      {/* Thumbnail */}
                      <div className="relative w-28 h-16 rounded-xl overflow-hidden flex-shrink-0 border border-stone-100">
                        <Image
                          src={`${process.env.NEXT_PUBLIC_API_URL}/uploads/${banner.image}`}
                          alt={banner.description || 'Banner'}
                          fill
                          className="object-cover"
                        />
                      </div>

                      {/* Description & badge */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-[#2D241E] truncate">
                          {banner.description || <span className="text-stone-400 italic">No description</span>}
                        </p>
                        <span className={`inline-block mt-1 text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                          banner.isVisible
                            ? 'bg-emerald-50 text-emerald-600'
                            : 'bg-stone-100 text-stone-400'
                        }`}>
                          {banner.isVisible ? 'Visible' : 'Hidden'}
                        </span>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {/* Toggle */}
                        <button
                          type="button"
                          onClick={() => handleToggle(banner._id)}
                          disabled={togglingId === banner._id}
                          title={banner.isVisible ? 'Hide banner' : 'Show banner'}
                          className="p-2 rounded-xl hover:bg-stone-100 transition-colors text-stone-500 hover:text-[#2D241E] disabled:opacity-50"
                        >
                          {togglingId === banner._id
                            ? <Loader2 size={18} className="animate-spin" />
                            : banner.isVisible ? <EyeOff size={18} /> : <Eye size={18} />
                          }
                        </button>

                        {/* Delete */}
                        <button
                          type="button"
                          onClick={() => handleDelete(banner._id)}
                          disabled={deletingId === banner._id}
                          title="Delete banner"
                          className="p-2 rounded-xl hover:bg-red-50 transition-colors text-stone-400 hover:text-red-500 disabled:opacity-50"
                        >
                          {deletingId === banner._id
                            ? <Loader2 size={18} className="animate-spin" />
                            : <Trash2 size={18} />
                          }
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Empty state */}
            {banners.length === 0 && (
              <div className="text-center py-8 text-stone-300">
                <ImagePlus size={40} className="mx-auto mb-2" />
                <p className="text-sm">No banners yet. Add your first one above.</p>
              </div>
            )}
          </div>

        </div>
      )}
    </div>
  );
}