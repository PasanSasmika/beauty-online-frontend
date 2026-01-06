'use client';

import { useEffect, useState } from 'react';
import { Trash2, Plus, Loader2, Tags } from 'lucide-react';

interface Category {
  id: number;
  name: string;
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [newCategory, setNewCategory] = useState('');
  const [loading, setLoading] = useState(false);

  // Fetch Categories
  const fetchCategories = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/categories');
      const data = await res.json();
      setCategories(data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  useEffect(() => { fetchCategories(); }, []);

  // Add Category
  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategory.trim()) return;
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/categories', {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ name: newCategory })
      });

      if (res.ok) {
        setNewCategory('');
        fetchCategories(); // Refresh list
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to add category');
      }
    } catch (e) { console.error(e); } 
    finally { setLoading(false); }
  };

  // Delete Category
  const handleDelete = async (id: number) => {
    if(!confirm("Are you sure you want to delete this category?")) return;
    try {
        const token = localStorage.getItem('token');
        await fetch(`http://localhost:5000/api/categories/${id}`, { 
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        fetchCategories();
    } catch (e) { console.error(e); }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 bg-[#000000] rounded-lg text-white">
            <Tags size={24} />
        </div>
        <h1 className="text-3xl font-serif font-bold text-[#000000]">Manage Categories</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left: Add Form */}
        <div className="md:col-span-1">
            <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm sticky top-8">
                <h2 className="font-bold text-[#000000] mb-4">Add New Category</h2>
                <form onSubmit={handleAdd} className="space-y-4">
                    <div>
                        <label className="text-xs font-semibold text-stone-500 uppercase mb-1 block">Category Name</label>
                        <input 
                            value={newCategory}
                            onChange={(e) => setNewCategory(e.target.value)}
                            placeholder="e.g. Serums"
                            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-[#000000] outline-none"
                        />
                    </div>
                    <button 
                        disabled={loading || !newCategory} 
                        className="w-full bg-[#000000] text-white px-4 py-3 rounded-lg font-medium hover:bg-stone-800 transition-colors flex justify-center items-center gap-2 disabled:opacity-70"
                    >
                        {loading ? <Loader2 className="animate-spin" size={20} /> : <><Plus size={20} /> Add Category</>}
                    </button>
                </form>
            </div>
        </div>

        {/* Right: List */}
        <div className="md:col-span-2">
            <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-sm">
                <div className="p-4 bg-stone-50 border-b border-stone-200">
                    <h3 className="font-bold text-stone-700">Existing Categories ({categories.length})</h3>
                </div>
                <div className="divide-y divide-stone-100">
                    {categories.map((cat) => (
                        <div key={cat.id} className="flex items-center justify-between p-4 hover:bg-stone-50 transition-colors group">
                            <span className="font-medium text-[#000000]">{cat.name}</span>
                            <button 
                                onClick={() => handleDelete(cat.id)} 
                                className="text-stone-300 hover:text-red-500 p-2 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                                title="Delete Category"
                            >
                                <Trash2 size={18} />
                            </button>
                        </div>
                    ))}
                    {categories.length === 0 && (
                        <div className="p-8 text-center text-stone-400">
                            No categories found. Add one on the left.
                        </div>
                    )}
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}