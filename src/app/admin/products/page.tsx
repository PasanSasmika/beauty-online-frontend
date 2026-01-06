'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Pencil, Trash2, Plus, Loader2, AlertCircle } from 'lucide-react';

// Updated Interface to match new DB response
interface Product {
  id: number;
  name: string;
  brand: string;
  category: string;
  images: string;
  // Variants come as a JSON array from the DB aggregation
  variants: any; 
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // 1. Fetch Products Logic
  const fetchProducts = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/products');
      if (!res.ok) throw new Error('Failed to fetch data');
      const data = await res.json();
      setProducts(data);
    } catch (err) {
      setError('Could not load products. Is the backend running?');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // 2. Delete Product Logic
  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this product?')) return;

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5000/api/products/${id}`, {
        method: 'DELETE',
        headers: { 
          'Authorization': `Bearer ${token}` 
        }
      });

      if (res.ok) {
        setProducts(prev => prev.filter(p => p.id !== id));
        alert('Product deleted successfully');
      } else {
        alert('Failed to delete.');
      }
    } catch (error) {
      console.error(error);
      alert('Error connecting to server');
    }
  };

  if (loading) return <div className="p-20 flex justify-center"><Loader2 className="animate-spin text-[#000000]" /></div>;
  if (error) return <div className="p-10 text-red-500 flex items-center gap-2"><AlertCircle /> {error}</div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-serif font-bold text-[#000000]">Product Inventory</h1>
        <Link 
            href="/admin/products/add" 
            className="flex items-center gap-2 bg-[#000000] text-white px-4 py-2 rounded-lg hover:bg-stone-800 transition-colors"
        >
            <Plus size={18} /> Add New
        </Link>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden">
        <table className="w-full text-left">
            <thead className="bg-stone-50 border-b border-stone-200">
                <tr>
                    <th className="p-4 font-semibold text-stone-600">Product</th>
                    <th className="p-4 font-semibold text-stone-600">Category</th>
                    <th className="p-4 font-semibold text-stone-600">Price (LKR)</th>
                    <th className="p-4 font-semibold text-stone-600">Total Stock</th>
                    <th className="p-4 font-semibold text-stone-600 text-right">Actions</th>
                </tr>
            </thead>
            <tbody>
                {products.length === 0 ? (
                    <tr>
                        <td colSpan={5} className="p-8 text-center text-stone-500">No products found.</td>
                    </tr>
                ) : (
                    products.map((product) => {
                        // A. Image Parsing
                        let imageSrc = '/placeholder.jpg';
                        try {
                            const parsed = typeof product.images === 'string' ? JSON.parse(product.images) : product.images;
                            if (Array.isArray(parsed) && parsed.length > 0) imageSrc = `http://localhost:5000${parsed[0]}`;
                        } catch (e) {}

                        // B. Variants Parsing (Price & Stock)
                        let displayPrice = 0;
                        let totalStock = 0;
                        try {
                            const vRaw = product.variants;
                            const variants = typeof vRaw === 'string' ? JSON.parse(vRaw) : vRaw;
                            
                            if (Array.isArray(variants) && variants.length > 0) {
                                displayPrice = variants[0].price; // Show first price
                                // Sum up quantities
                                totalStock = variants.reduce((acc: number, curr: any) => acc + (parseInt(curr.quantity) || 0), 0);
                            }
                        } catch(e) {}

                        return (
                            <tr key={product.id} className="border-b border-stone-100 hover:bg-stone-50/50 transition-colors">
                                <td className="p-4 flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-lg bg-stone-200 overflow-hidden shrink-0">
                                        <img src={imageSrc} alt={product.name} className="w-full h-full object-cover" />
                                    </div>
                                    <div>
                                        <p className="font-medium text-[#000000]">{product.name}</p>
                                        <p className="text-xs text-stone-500">{product.brand}</p>
                                    </div>
                                </td>
                                <td className="p-4 text-stone-600 capitalize">{product.category}</td>
                                <td className="p-4 font-medium">
                                    {displayPrice > 0 ? displayPrice.toLocaleString() : 'N/A'}
                                </td>
                                <td className="p-4">
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${totalStock > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                        {totalStock > 0 ? `${totalStock} in stock` : 'Out of Stock'}
                                    </span>
                                </td>
                                <td className="p-4 text-right">
                                    <div className="flex items-center justify-end gap-2">
                                        <Link href={`/admin/products/edit/${product.id}`} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                                            <Pencil size={18} />
                                        </Link>
                                        <button 
                                            onClick={() => handleDelete(product.id)}
                                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        );
                    })
                )}
            </tbody>
        </table>
      </div>
    </div>
  );
}