'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, useFieldArray } from 'react-hook-form';
import * as z from 'zod';
import { Loader2, UploadCloud, CheckCircle, AlertCircle, Plus, Trash2 } from 'lucide-react';

// --- 1. ZOD SCHEMA ---
const productSchema = z.object({
  name: z.string().min(1, "Product name is required"),
  brand: z.string().min(1, "Brand is required"),
  category: z.string().min(1, "Category is required"),
  country: z.string().optional(),
  description: z.string().optional(),
  is_koko_enabled: z.boolean().default(false),
  
  variants: z.array(z.object({
    size: z.string().min(1, "Size is required"),
    price: z.coerce.number().min(1, "Price must be greater than 0"),
    quantity: z.coerce.number().min(0, "Quantity cannot be negative"),
    original_price: z.coerce.number().optional()
  })).min(1, "At least one size variant is required"),

  images: z.any()
    .refine((files) => files instanceof FileList && files.length > 0, "At least one image is required")
    .refine((files) => files instanceof FileList && files.length <= 5, "Maximum 5 images allowed"),
});

type ProductSchemaType = z.infer<typeof productSchema>;

export default function AddProductPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  
  // NEW: Categories State
  const [categories, setCategories] = useState<{id: number, name: string}[]>([]);

  // NEW: Fetch Categories on Load
  useEffect(() => {
  fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/categories`)
    .then(res => {
      if (!res.ok) throw new Error('Failed to load categories');
      return res.json();
    })
    .then(data => setCategories(data))
    .catch(err => console.error('Error loading categories:', err));
}, []);

  // --- 2. SETUP FORM ---
  const {
    register,
    control,
    handleSubmit,
    watch,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm<ProductSchemaType>({
    defaultValues: {
      is_koko_enabled: false,
      variants: [{ size: '', price: 0, quantity: 100 }]
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "variants"
  });

  const selectedImages = watch("images");

  // --- 3. SUBMIT HANDLER ---
  const onSubmit = async (rawData: ProductSchemaType) => {
    setLoading(true);
    clearErrors();

    const result = productSchema.safeParse(rawData);

    if (!result.success) {
      result.error.issues.forEach((issue) => {
        const fieldName = issue.path.join('.') as any;
        setError(fieldName, { message: issue.message });
      });
      setLoading(false);
      return; 
    }

    const data = result.data;

    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error("Unauthorized");

      const formData = new FormData();
      formData.append('name', data.name);
      formData.append('brand', data.brand);
      formData.append('category', data.category);
      if (data.country) formData.append('country', data.country);
      if (data.description) formData.append('description', data.description || "");
      formData.append('is_koko_enabled', data.is_koko_enabled ? 'true' : 'false');
      formData.append('variants', JSON.stringify(data.variants));

      if (data.images && data.images.length > 0) {
        Array.from(data.images as unknown as FileList).forEach((file) => {
          formData.append('images', file);
        });
      }

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/products`,
  {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`
    },
    body: formData
  }
);

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to upload');
      }

      alert('Product Created Successfully!');
      router.push('/admin/products');

    } catch (error: any) {
      console.error(error);
      alert(error.message || 'Error creating product');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto pb-20">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-serif font-bold text-[#000000]">Add New Product</h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        
        {/* 1. BASIC INFO */}
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-stone-200 space-y-6">
          <h2 className="font-bold text-lg text-[#000000] border-b pb-2 mb-4">Basic Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-stone-600">Product Name</label>
              <input {...register("name")} className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-[#ee3f5c] outline-none" placeholder="e.g. Aloe Vera Gel" />
              {errors.name && <p className="text-red-500 text-xs flex items-center gap-1"><AlertCircle size={12}/> {errors.name.message}</p>}
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-stone-600">Brand Name</label>
              <input {...register("brand")} className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-[#ee3f5c] outline-none" placeholder="e.g. LotusW" />
              {errors.brand && <p className="text-red-500 text-xs flex items-center gap-1"><AlertCircle size={12}/> {errors.brand.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div className="space-y-2">
                <label className="text-sm font-medium text-stone-600">Category</label>
                
                {/* DYNAMIC CATEGORY SELECT */}
                <select 
                  {...register("category")} 
                  className="w-full p-3 border rounded-lg bg-white outline-none"
                >
                  <option value="">Select Category...</option>
                  {categories.map((cat) => (
                    // Using lowercase name as value to match previous logic
                    <option key={cat.id} value={cat.name.toLowerCase()}>{cat.name}</option>
                  ))}
                </select>
                
                {errors.category && <p className="text-red-500 text-xs">{errors.category.message}</p>}
             </div>

             <div className="space-y-2">
                <label className="text-sm font-medium text-stone-600">Country (Optional)</label>
                <input {...register("country")} className="w-full p-3 border rounded-lg outline-none" placeholder="Sri Lanka" />
             </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-stone-600">Description</label>
            <textarea {...register("description")} rows={3} className="w-full p-3 border rounded-lg outline-none" placeholder="Product details..." />
          </div>
        </div>

        {/* 2. VARIANTS */}
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-stone-200">
           <div className="flex justify-between items-center mb-6 border-b pb-2">
             <h2 className="font-bold text-lg text-[#000000]">Sizes & Prices</h2>
             <button type="button" onClick={() => append({ size: '', price: 0, quantity: 100, original_price: undefined })} className="text-sm flex items-center gap-1 text-[#ee3f5c] hover:text-[#000000] transition-colors font-medium">
               <Plus size={16} /> Add Another Size
             </button>
           </div>
           <div className="space-y-4">
             {fields.map((field, index) => (
               <div key={field.id} className="flex flex-col md:flex-row gap-4 items-start p-4 bg-stone-50 rounded-xl border border-stone-100 relative group">
                  <div className="flex-1 w-full">
                    <label className="text-xs font-semibold text-stone-500 mb-1 block">Size</label>
                    <input {...register(`variants.${index}.size` as const)} placeholder="e.g. 50ml" className="w-full p-2 border rounded bg-white" />
                    {errors.variants?.[index]?.size && <p className="text-red-500 text-[10px] mt-1">{errors.variants[index]?.size?.message}</p>}
                  </div>
                  <div className="flex-1 w-full">
                    <label className="text-xs font-semibold text-stone-500 mb-1 block">Price (LKR)</label>
                    <input type="number" {...register(`variants.${index}.price` as const)} placeholder="3000" className="w-full p-2 border rounded bg-white" />
                    {errors.variants?.[index]?.price && <p className="text-red-500 text-[10px] mt-1">{errors.variants[index]?.price?.message}</p>}
                  </div>
                  <div className="flex-1 w-full">
                    <label className="text-xs font-semibold text-stone-500 mb-1 block">Org. Price (Opt)</label>
                    <input type="number" {...register(`variants.${index}.original_price` as const)} placeholder="4500" className="w-full p-2 border rounded bg-white" />
                  </div>
                  <div className="flex-1 w-full">
                    <label className="text-xs font-semibold text-stone-500 mb-1 block">Stock</label>
                    <input type="number" {...register(`variants.${index}.quantity` as const)} placeholder="100" className="w-full p-2 border rounded bg-white" />
                     {errors.variants?.[index]?.quantity && <p className="text-red-500 text-[10px] mt-1">{errors.variants[index]?.quantity?.message}</p>}
                  </div>
                  {fields.length > 1 && (
                    <button type="button" onClick={() => remove(index)} className="mt-6 p-2 text-stone-400 hover:text-red-500 transition-colors" title="Remove variant">
                      <Trash2 size={18} />
                    </button>
                  )}
               </div>
             ))}
           </div>
        </div>

        {/* 3. IMAGES */}
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-stone-200 space-y-6">
          <h2 className="font-bold text-lg text-[#000000] border-b pb-2">Media & Settings</h2>
          <div className={`border-2 border-dashed rounded-xl p-8 text-center hover:bg-stone-50 transition-colors ${errors.images ? 'border-red-300 bg-red-50' : 'border-stone-300'}`}>
            <input type="file" multiple accept="image/*" className="hidden" id="img-upload" {...register("images")} />
            <label htmlFor="img-upload" className="cursor-pointer flex flex-col items-center gap-2">
              <UploadCloud size={32} className={errors.images ? "text-red-400" : "text-stone-400"} />
              <span className={errors.images ? "text-red-600 font-medium" : "text-stone-600 font-medium"}>Click to upload images</span>
              <span className="text-xs text-stone-400">JPG, PNG, WEBP up to 5MB</span>
            </label>
          </div>
          {selectedImages && (selectedImages as unknown as FileList).length > 0 && (
             <p className="text-sm text-green-600 flex items-center gap-1"><CheckCircle size={14} /> {(selectedImages as unknown as FileList).length} files selected</p>
          )}
          {errors.images && (
             <p className="text-sm text-red-500 flex items-center gap-1"><AlertCircle size={14} /> {errors.images.message as string}</p>
          )}
          <div className="pt-4 border-t border-stone-100">
             <label className="flex items-center gap-3 cursor-pointer">
               <input type="checkbox" {...register("is_koko_enabled")} className="w-5 h-5 accent-[#000000]" />
               <span className="font-medium text-[#000000]">Enable Koko Installments</span>
             </label>
          </div>
        </div>

        <div className="pt-4">
          <button type="submit" disabled={loading} className="w-full bg-[#000000] text-white py-4 rounded-xl font-medium hover:bg-stone-800 transition-colors flex items-center justify-center gap-2 disabled:opacity-70">
            {loading ? <Loader2 className="animate-spin" /> : 'Publish Product'}
          </button>
        </div>

      </form>
    </div>
  );
}