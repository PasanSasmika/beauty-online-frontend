'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Loader2, UploadCloud, CheckCircle, AlertCircle } from 'lucide-react';

// --- 1. ZOD SCHEMA ---
const productSchema = z.object({
  name: z.string().min(1, "Product name is required"),
  brand: z.string().min(1, "Brand is required"),
  category: z.string().min(1, "Category is required"),
  // coerce handles "100" string -> 100 number conversion automatically
  price: z.coerce.number().min(1, "Price must be greater than 0"),
  original_price: z.coerce.number().optional(),
  quantity: z.coerce.number().min(0, "Quantity cannot be negative"),
  size: z.string().min(1, "Size is required"),
  country: z.string().optional(),
  description: z.string().optional(),
  is_koko_enabled: z.boolean().default(false),
  // We check images manually or via custom refinement
  images: z.any()
    .refine((files) => files instanceof FileList && files.length > 0, "At least one image is required")
    .refine((files) => files instanceof FileList && files.length <= 5, "Maximum 5 images allowed"),
});

// Type for the finalized data after Zod parses it
type ProductSchemaType = z.infer<typeof productSchema>;

export default function AddProductPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  // --- 2. SETUP REACT HOOK FORM (No Resolver) ---
  const {
    register,
    handleSubmit,
    watch,
    setError, // We need this to manually set errors
    clearErrors,
    formState: { errors },
  } = useForm<ProductSchemaType>({
    // resolver line is REMOVED as requested
    defaultValues: {
      is_koko_enabled: false,
      quantity: 100,
    },
  });

  // Watch for preview logic
  const watchedPrice = watch("price");
  const isKokoEnabled = watch("is_koko_enabled");
  const selectedImages = watch("images");

  // --- 3. MANUAL SUBMIT HANDLER ---
  const onSubmit = async (rawData: ProductSchemaType) => {
    setLoading(true);
    clearErrors(); // Clear previous errors

    // A. MANUAL ZOD VALIDATION
    const result = productSchema.safeParse(rawData);

    if (!result.success) {
      // If validation fails, loop through Zod errors and set them in RHF
      result.error.issues.forEach((issue) => {
        // Path[0] is the field name (e.g., "price", "images")
        const fieldName = issue.path[0] as keyof ProductSchemaType;
        setError(fieldName, { message: issue.message });
      });
      setLoading(false);
      return; // Stop here
    }

    // If validation passes, use the clean data from Zod
    const data = result.data;

    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error("Unauthorized");

      // B. CREATE FORM DATA
      const formData = new FormData();
      formData.append('name', data.name);
      formData.append('brand', data.brand);
      formData.append('category', data.category);
      formData.append('price', data.price.toString());
      
      if (data.original_price) formData.append('original_price', data.original_price.toString());
      
      formData.append('quantity', data.quantity.toString());
      formData.append('size', data.size);
      
      if (data.country) formData.append('country', data.country || "");
      if (data.description) formData.append('description', data.description || "");
      
      formData.append('is_koko_enabled', data.is_koko_enabled ? 'true' : 'false');

      // Append Images
      if (data.images && data.images.length > 0) {
        // Zod confirmed this is a FileList
        Array.from(data.images as unknown as FileList).forEach((file) => {
          formData.append('images', file);
        });
      }

      // C. SEND REQUEST
      const res = await fetch('http://localhost:5000/api/products', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}` 
        },
        body: formData, 
      });

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

  const kokoInstallment = watchedPrice ? (watchedPrice / 3).toFixed(2) : '0.00';

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-serif font-bold text-[#2D241E]">Add New Product</h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="bg-white p-8 rounded-2xl shadow-sm border border-stone-200 space-y-8">
        
        {/* 1. BASIC INFO */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-stone-600">Product Name</label>
            <input 
              {...register("name")} 
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-[#8B9B86] outline-none" 
              placeholder="e.g. Aloe Vera Gel" 
            />
            {errors.name && <p className="text-red-500 text-xs flex items-center gap-1"><AlertCircle size={12}/> {errors.name.message}</p>}
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-stone-600">Brand Name</label>
            <input 
              {...register("brand")} 
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-[#8B9B86] outline-none" 
              placeholder="e.g. LotusW" 
            />
            {errors.brand && <p className="text-red-500 text-xs flex items-center gap-1"><AlertCircle size={12}/> {errors.brand.message}</p>}
          </div>
        </div>

        {/* 2. PRICING & KOKO */}
        <div className="p-6 bg-stone-50 rounded-xl border border-stone-100">
          <h3 className="font-serif font-bold text-[#2D241E] mb-4">Pricing Strategy</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-stone-600">Selling Price (LKR)</label>
              <input 
                type="number" 
                {...register("price")} 
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-[#8B9B86] outline-none" 
                placeholder="3000" 
              />
              {errors.price && <p className="text-red-500 text-xs">{errors.price.message}</p>}
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-stone-600">Original Price (Optional)</label>
              <input 
                type="number" 
                {...register("original_price")} 
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-[#8B9B86] outline-none" 
                placeholder="4500" 
              />
            </div>
            
            {/* KOKO TOGGLE */}
            <div className="flex flex-col justify-end">
              <label className="flex items-center gap-3 p-3 bg-white border rounded-lg cursor-pointer hover:border-[#8B9B86] transition-colors">
                <input 
                  type="checkbox" 
                  {...register("is_koko_enabled")} 
                  className="w-5 h-5 accent-[#2D241E]" 
                />
                <span className="font-medium text-[#2D241E]">Koko Available?</span>
              </label>
            </div>
          </div>

          {/* KOKO PREVIEW */}
          {isKokoEnabled && watchedPrice > 0 && (
            <div className="mt-4 flex items-center gap-2 text-sm text-[#2D241E] bg-[#EBE5D9] p-3 rounded-lg inline-block">
               <span className="font-bold">Koko Installment:</span> 
               <span>LKR {kokoInstallment} x 3 months</span>
            </div>
          )}
        </div>

        {/* 3. DETAILS */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-stone-600">Category</label>
            <select 
              {...register("category")} 
              className="w-full p-3 border rounded-lg bg-white outline-none"
            >
              <option value="">Select...</option>
              <option value="skincare">Skincare</option>
              <option value="haircare">Haircare</option>
              <option value="body">Body</option>
              <option value="wellness">Wellness</option>
            </select>
            {errors.category && <p className="text-red-500 text-xs">{errors.category.message}</p>}
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-stone-600">Quantity</label>
            <input 
              type="number" 
              {...register("quantity")} 
              className="w-full p-3 border rounded-lg outline-none" 
              placeholder="100" 
            />
            {errors.quantity && <p className="text-red-500 text-xs">{errors.quantity.message}</p>}
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-stone-600">Size/Volume</label>
            <input 
              {...register("size")} 
              className="w-full p-3 border rounded-lg outline-none" 
              placeholder="50ml" 
            />
            {errors.size && <p className="text-red-500 text-xs">{errors.size.message}</p>}
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-stone-600">Country (Optional)</label>
            <input 
              {...register("country")} 
              className="w-full p-3 border rounded-lg outline-none" 
              placeholder="Sri Lanka" 
            />
          </div>
        </div>

        {/* 4. DESCRIPTION */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-stone-600">Description</label>
          <textarea 
            {...register("description")} 
            rows={4} 
            className="w-full p-3 border rounded-lg outline-none" 
            placeholder="Product details..." 
          />
        </div>

        {/* 5. IMAGE UPLOAD */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-stone-600">Product Images</label>
          <div className={`border-2 border-dashed rounded-xl p-8 text-center hover:bg-stone-50 transition-colors ${errors.images ? 'border-red-300 bg-red-50' : 'border-stone-300'}`}>
            <input 
              type="file" 
              multiple 
              accept="image/*" 
              className="hidden" 
              id="img-upload"
              {...register("images")} 
            />
            <label htmlFor="img-upload" className="cursor-pointer flex flex-col items-center gap-2">
              <UploadCloud size={32} className={errors.images ? "text-red-400" : "text-stone-400"} />
              <span className={errors.images ? "text-red-600 font-medium" : "text-stone-600 font-medium"}>
                Click to upload images
              </span>
              <span className="text-xs text-stone-400">JPG, PNG, WEBP up to 5MB</span>
            </label>
          </div>
          
          {/* File Preview Count */}
          {selectedImages && (selectedImages as unknown as FileList).length > 0 && (
             <p className="text-sm text-green-600 flex items-center gap-1 mt-2">
               <CheckCircle size={14} /> {(selectedImages as unknown as FileList).length} files selected
             </p>
          )}
          {/* File Error Message */}
          {errors.images && (
             <p className="text-sm text-red-500 flex items-center gap-1 mt-2">
               <AlertCircle size={14} /> {errors.images.message as string}
             </p>
          )}
        </div>

        {/* SUBMIT BUTTON */}
        <div className="pt-4">
          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-[#2D241E] text-white py-4 rounded-xl font-medium hover:bg-stone-800 transition-colors flex items-center justify-center gap-2 disabled:opacity-70"
          >
            {loading ? <Loader2 className="animate-spin" /> : 'Publish Product'}
          </button>
        </div>

      </form>
    </div>
  );
}