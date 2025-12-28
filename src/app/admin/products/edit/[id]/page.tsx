'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { Loader2 } from 'lucide-react';

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id; 
  
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  // Setup Form
  const { register, handleSubmit, setValue, formState: { errors } } = useForm();

  // 1. Fetch Existing Data
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/products/${id}`);
        if (!res.ok) throw new Error('Product not found');
        
        const data = await res.json();
        
        // Pre-fill form fields with existing data
        setValue('name', data.name);
        setValue('brand', data.brand);
        setValue('category', data.category);
        setValue('price', data.price);
        setValue('original_price', data.original_price);
        setValue('quantity', data.quantity);
        setValue('size', data.size);
        setValue('country', data.country);
        setValue('description', data.description);
        
        // Convert 1/0 from MySQL to boolean
        setValue('is_koko_enabled', data.is_koko_enabled === 1 || data.is_koko_enabled === true); 
        
      } catch (error) {
        console.error(error);
        alert('Error loading product');
        router.push('/admin/products');
      } finally {
        setFetching(false);
      }
    };

    if (id) fetchProduct();
  }, [id, router, setValue]);

  // 2. Submit Update (No Image Logic)
  const onSubmit = async (data: any) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      
      // Use FormData to match the Backend expectation (Multipart), 
      // but we simply won't append any files.
      const formData = new FormData();
      
      formData.append('name', data.name);
      formData.append('brand', data.brand);
      formData.append('category', data.category);
      formData.append('price', data.price);
      formData.append('quantity', data.quantity);
      formData.append('size', data.size);
      
      if (data.original_price) formData.append('original_price', data.original_price);
      if (data.country) formData.append('country', data.country);
      if (data.description) formData.append('description', data.description);
      
      formData.append('is_koko_enabled', data.is_koko_enabled ? 'true' : 'false');

      // Send PUT Request
      const res = await fetch(`http://localhost:5000/api/products/${id}`, {
        method: 'PUT',
        headers: { 
            'Authorization': `Bearer ${token}` 
        },
        body: formData,
      });

      if (!res.ok) throw new Error('Failed to update');

      alert('Product Updated Successfully!');
      router.push('/admin/products');

    } catch (error) {
      console.error(error);
      alert('Error updating product');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return <div className="p-20 flex justify-center"><Loader2 className="animate-spin text-[#2D241E]" /></div>;

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-serif font-bold text-[#2D241E] mb-8">Edit Product</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="bg-white p-8 rounded-2xl shadow-sm border border-stone-200 space-y-6">
        
        {/* Row 1: Name & Brand */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
                <label className="block text-sm font-medium mb-1 text-stone-600">Product Name</label>
                <input 
                  {...register("name", { required: true })} 
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-[#8B9B86] outline-none" 
                />
            </div>
            <div>
                <label className="block text-sm font-medium mb-1 text-stone-600">Brand Name</label>
                <input 
                  {...register("brand", { required: true })} 
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-[#8B9B86] outline-none" 
                />
            </div>
        </div>

        {/* Row 2: Pricing & Category */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
                <label className="block text-sm font-medium mb-1 text-stone-600">Price (LKR)</label>
                <input 
                  type="number" 
                  {...register("price", { required: true })} 
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-[#8B9B86] outline-none" 
                />
            </div>
            <div>
                <label className="block text-sm font-medium mb-1 text-stone-600">Original Price</label>
                <input 
                  type="number" 
                  {...register("original_price")} 
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-[#8B9B86] outline-none" 
                />
            </div>
            <div>
                <label className="block text-sm font-medium mb-1 text-stone-600">Category</label>
                <select 
                  {...register("category", { required: true })} 
                  className="w-full p-3 border rounded-lg bg-white outline-none"
                >
                    <option value="skincare">Skincare</option>
                    <option value="haircare">Haircare</option>
                    <option value="body">Body</option>
                    <option value="wellness">Wellness</option>
                </select>
            </div>
        </div>

        {/* Row 3: Stock & Details */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
             <div>
                <label className="block text-sm font-medium mb-1 text-stone-600">Quantity</label>
                <input 
                  type="number" 
                  {...register("quantity", { required: true })} 
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-[#8B9B86] outline-none" 
                />
             </div>
             <div>
                <label className="block text-sm font-medium mb-1 text-stone-600">Size (e.g. 50ml)</label>
                <input 
                  {...register("size", { required: true })} 
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-[#8B9B86] outline-none" 
                />
             </div>
             <div>
                <label className="block text-sm font-medium mb-1 text-stone-600">Country</label>
                <input 
                  {...register("country")} 
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-[#8B9B86] outline-none" 
                />
             </div>
        </div>

        {/* Description */}
        <div>
            <label className="block text-sm font-medium mb-1 text-stone-600">Description</label>
            <textarea 
              {...register("description")} 
              rows={4} 
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-[#8B9B86] outline-none" 
            />
        </div>

        {/* Koko Toggle */}
        <div className="flex items-center gap-3">
             <input 
               type="checkbox" 
               {...register("is_koko_enabled")} 
               className="w-5 h-5 accent-[#2D241E] cursor-pointer" 
               id="koko" 
             />
             <label htmlFor="koko" className="text-stone-700 font-medium cursor-pointer">Enable Koko Installments</label>
        </div>

        {/* Submit Button */}
        <div className="pt-4 border-t border-stone-100">
            <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-[#2D241E] text-white py-4 rounded-xl font-medium hover:bg-stone-800 transition-colors flex justify-center disabled:opacity-70"
            >
                {loading ? <Loader2 className="animate-spin" /> : 'Save Changes'}
            </button>
        </div>
      </form>
    </div>
  );
}