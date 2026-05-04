'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useForm, useFieldArray } from 'react-hook-form';
import { Loader2, Plus, Trash2, Save, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

// Data Interfaces
interface Variant {
  size: string;
  price: number;
  quantity: number;
  original_price: number;
}

interface ProductFormData {
  name: string;
  brand: string;
  category: string;
  country: string;
  description: string;
  howToUse: string;
  is_koko_enabled: boolean;
  variants: Variant[];
  document?: string;
}

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const [newDocument, setNewDocument] = useState<File | null>(null);

  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // 1. Setup Form
  const { 
    register, 
    control, 
    handleSubmit, 
    reset,
    watch,  // ← fixed: was missing
    formState: { errors } 
  } = useForm<ProductFormData>({
    defaultValues: {
      name: '',
      brand: '',
      variants: []
    }
  });

  const { fields, append, remove, replace } = useFieldArray({
    control,
    name: "variants"
  });

  // 2. Fetch Data
  useEffect(() => {
    const fetchProductData = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/products/${id}`);

        if (!res.ok) throw new Error('Product not found');
        
        const dbData = await res.json();
        
        // --- PARSE VARIANTS LOGIC ---
        let parsedVariants: Variant[] = [];
        try {
           const vRaw = dbData.variants;
           const vJson = typeof vRaw === 'string' ? JSON.parse(vRaw) : vRaw;
           
           if (Array.isArray(vJson)) {
             parsedVariants = vJson.map((v: any) => ({
               size: v.size || '',
               price: parseFloat(v.price) || 0,
               quantity: parseInt(v.quantity) || 0,
               original_price: v.original_price ? parseFloat(v.original_price) : 0
             }));
           }
        } catch (e) {
           console.error("Variant parse error", e);
        }

        parsedVariants = parsedVariants.filter(v => v.size !== null && v.size !== '');

        if (parsedVariants.length === 0) {
            parsedVariants.push({ size: '', price: 0, quantity: 0, original_price: 0 });
        }

        // --- UPDATE FORM ---
        reset({
            name: dbData.name || '',
            brand: dbData.brand || '',
            category: dbData.category || '',
            country: dbData.country || '',
            description: dbData.description || '',
            howToUse: dbData.howToUse || '',
            is_koko_enabled: (dbData.is_koko_enabled === 1 || dbData.is_koko_enabled === true),
            document: dbData.document || '',
            variants: parsedVariants
        });
        
        replace(parsedVariants);

        setIsDataLoaded(true);

      } catch (error) {
        console.error(error);
        toast.error('Error loading product');
        router.push('/admin/products');
      }
    };

    if (id) fetchProductData();
  }, [id, reset, replace, router]);

  // 3. Submit Handler
  const onSubmit = async (data: ProductFormData) => {
    setIsSaving(true);
    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      
      formData.append('name', data.name);
      formData.append('brand', data.brand);
      formData.append('category', data.category);
      if (data.country) formData.append('country', data.country);
      if (newDocument) formData.append('document', newDocument);
      if (data.description) formData.append('description', data.description);
      if (data.howToUse) formData.append('howToUse', data.howToUse);
      formData.append('is_koko_enabled', data.is_koko_enabled ? 'true' : 'false');
      formData.append('variants', JSON.stringify(data.variants));

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/products/${id}`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData,
      });

      if (!res.ok) throw new Error('Failed to update');

      toast.success('Product Updated Successfully!');
      router.push('/admin/products');

    } catch (error) {
      console.error(error);
      toast.error('Error updating product');
    } finally {
      setIsSaving(false);
    }
  };

  if (!isDataLoaded) {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-stone-50">
            <Loader2 className="animate-spin text-[#000000] w-10 h-10 mb-4" />
            <p className="text-stone-500 font-medium">Loading product details...</p>
        </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto pb-20">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
            <Link href="/admin/products" className="p-2 bg-white rounded-full hover:bg-stone-200 transition-colors">
                <ArrowLeft size={20} className="text-[#000000]" />
            </Link>
            <h1 className="text-3xl font-serif font-bold text-[#000000]">Edit Product</h1>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        
        {/* DETAILS SECTION */}
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-stone-200 space-y-6">
            <h2 className="font-bold text-lg text-[#000000] border-b pb-2 mb-4">Product Information</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-semibold text-stone-600 mb-2">Product Name</label>
                    <input {...register("name", { required: true })} className="w-full p-3 border border-stone-300 rounded-lg outline-none" />
                </div>
                <div>
                    <label className="block text-sm font-semibold text-stone-600 mb-2">Brand</label>
                    <input {...register("brand", { required: true })} className="w-full p-3 border border-stone-300 rounded-lg outline-none" />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div>
                    <label className="block text-sm font-semibold text-stone-600 mb-2">Category</label>
                    <select {...register("category", { required: true })} className="w-full p-3 border border-stone-300 rounded-lg bg-white outline-none">
                        <option value="skincare">Skincare</option>
                        <option value="haircare">Haircare</option>
                        <option value="body">Body</option>
                        <option value="wellness">Wellness</option>
                    </select>
                 </div>
                 <div>
                    <label className="block text-sm font-semibold text-stone-600 mb-2">Country</label>
                    <input {...register("country")} className="w-full p-3 border border-stone-300 rounded-lg outline-none" />
                 </div>
            </div>

            <div>
                <label className="block text-sm font-semibold text-stone-600 mb-2">Description</label>
                <textarea {...register("description")} rows={4} className="w-full p-3 border border-stone-300 rounded-lg outline-none" />
            </div>

            <div>
                <label className="block text-sm font-semibold text-stone-600 mb-2">How to Use</label>
                <textarea 
                    {...register("howToUse")} 
                    rows={5} 
                    className="w-full p-3 border border-stone-300 rounded-lg outline-none"
                    placeholder="How should the customer use this product..."
                />
            </div>
        </div>

        {/* VARIANTS SECTION */}
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-stone-200">
           <div className="flex justify-between items-center mb-6 border-b pb-4">
             <div>
                <h2 className="font-bold text-lg text-[#000000]">Sizes & Prices</h2>
             </div>
             <button 
               type="button"
               onClick={() => append({ size: '', price: 0, quantity: 0, original_price: 0 })}
               className="flex items-center gap-2 px-4 py-2 bg-[#F5F5F4] hover:bg-[#E7E5E4] text-[#000000] rounded-lg text-sm font-medium transition-colors"
             >
               <Plus size={16} /> Add Size
             </button>
           </div>

           <div className="space-y-3">
             {fields.map((field, index) => (
               <div key={field.id} className="grid grid-cols-12 gap-4 items-start p-4 bg-stone-50 border border-stone-200 rounded-xl relative group">
                  
                  <div className="col-span-3">
                    <label className="text-[10px] uppercase font-bold text-stone-500 mb-1 block">Size</label>
                    <input {...register(`variants.${index}.size`, { required: true })} className="w-full p-2 border border-stone-300 rounded text-sm" />
                  </div>

                  <div className="col-span-3">
                    <label className="text-[10px] uppercase font-bold text-stone-500 mb-1 block">Price</label>
                    <input type="number" step="0.01" {...register(`variants.${index}.price`, { required: true })} className="w-full p-2 border border-stone-300 rounded text-sm" />
                  </div>

                  <div className="col-span-3">
                    <label className="text-[10px] uppercase font-bold text-stone-500 mb-1 block">Org. Price</label>
                    <input type="number" step="0.01" {...register(`variants.${index}.original_price`)} className="w-full p-2 border border-stone-300 rounded text-sm" />
                  </div>

                  <div className="col-span-2">
                    <label className="text-[10px] uppercase font-bold text-stone-500 mb-1 block">Stock</label>
                    <input type="number" {...register(`variants.${index}.quantity`, { required: true })} className="w-full p-2 border border-stone-300 rounded text-sm" />
                  </div>

                  <div className="col-span-1 flex justify-center pt-6">
                    {fields.length > 1 && (
                        <button type="button" onClick={() => remove(index)} className="text-stone-400 hover:text-red-500 transition-colors p-1">
                           <Trash2 size={18} />
                        </button>
                    )}
                  </div>
               </div>
             ))}
           </div>
        </div>

        {/* DOCUMENT SECTION */}
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-stone-200 space-y-4">
          <h2 className="font-bold text-lg text-[#000000] border-b pb-2">
            Product Document <span className="text-stone-400 font-normal text-sm">(Optional)</span>
          </h2>

          {/* Show existing document if present */}
          {watch("document") && (
            <div className="flex items-center gap-3 p-3 bg-stone-50 rounded-lg border border-stone-200">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-red-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
              </svg>
              <a  
                href={`${process.env.NEXT_PUBLIC_API_URL}${watch("document")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-600 underline truncate"
              >
                View current document
              </a>
            </div>
          )}

          <div className="border-2 border-dashed border-stone-300 rounded-xl p-6 text-center hover:bg-stone-50 transition-colors">
            <input
              type="file"
              accept="application/pdf"
              className="hidden"
              id="doc-upload"
              onChange={(e) => {
                if (e.target.files?.[0]) setNewDocument(e.target.files[0]);
              }}
            />
            <label htmlFor="doc-upload" className="cursor-pointer flex flex-col items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7 text-stone-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
              </svg>
              <span className="text-sm text-stone-600 font-medium">
                {watch("document") ? 'Replace document (PDF)' : 'Upload PDF document'}
              </span>
            </label>
          </div>

          {newDocument && (
            <p className="text-sm text-green-600 flex items-center gap-1">
              <Save size={13} /> New file selected: {newDocument.name}
            </p>
          )}
        </div>

        {/* SETTINGS */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-200 flex items-center gap-4">
             <input type="checkbox" id="koko_toggle" {...register("is_koko_enabled")} className="w-5 h-5 accent-[#000000] cursor-pointer" />
             <label htmlFor="koko_toggle" className="cursor-pointer">
                <span className="block font-bold text-[#000000]">Enable Koko Installments</span>
             </label>
        </div>

        {/* SUBMIT */}
        <div className="flex justify-end pt-4 border-t border-stone-200">
            <button type="submit" disabled={isSaving} className="flex items-center gap-2 bg-[#000000] text-white px-8 py-4 rounded-xl font-bold hover:bg-stone-800 transition-all shadow-lg disabled:opacity-70">
                {isSaving ? <Loader2 className="animate-spin w-5 h-5" /> : <><Save className="w-5 h-5" /> Save Changes</>}
            </button>
        </div>

      </form>
    </div>
  );
}