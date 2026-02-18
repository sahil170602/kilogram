import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';

/**
 * AddProduct Component
 * Admin terminal to initialize and sync new products with Supabase.
 */
export default function AddProduct() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '', 
    price: '', 
    section: 'bulk', 
    category: '', 
    showOnHome: false, 
    image: ''
  });

  // 1. Load Categories from Supabase to populate the dropdown
  useEffect(() => {
    const fetchCategories = async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name', { ascending: true });

      if (!error && data) {
        setCategories(data);
      }
    };
    fetchCategories();
  }, []);

  // 2. Handle Image Upload & Base64 conversion
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result);
      setFormData({ ...formData, image: reader.result });
    };
    reader.readAsDataURL(file);
  };

  // 3. Save Product to Supabase
  const saveProduct = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase
        .from('products')
        .insert([{
          name: formData.name,
          price: parseFloat(formData.price),
          section: formData.section,
          category: formData.category,
          showOnHome: formData.showOnHome,
          image: formData.image,
          created_at: new Date().toISOString()
        }]);

      if (error) throw error;

      // Navigate back to the inventory list
      navigate('/admin/inventory');
    } catch (error) {
      console.error("Supabase Save Error:", error.message);
      alert("Failed to initialize product: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto animate-in slide-in-from-right-4 duration-500 pb-20">
      <h1 className="text-3xl font-black italic uppercase text-white mb-10 tracking-tighter">
        New Product <span className="text-primary">Entry</span>
      </h1>
      
      <form onSubmit={saveProduct} className="glass-card p-10 space-y-8 border-white/5 bg-white/[0.02] shadow-2xl">
        
        {/* Row 1: Identity & Pricing */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-2">
            <label className="text-[10px] text-gray-500 font-black uppercase tracking-widest ml-1">Identity</label>
            <input 
              type="text" 
              placeholder="Product Name" 
              required 
              className="w-full bg-white/5 border border-white/10 p-5 rounded-2xl text-white outline-none focus:border-primary transition-all font-bold" 
              onChange={e => setFormData({...formData, name: e.target.value})} 
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] text-gray-500 font-black uppercase tracking-widest ml-1">Price Point (₹)</label>
            <input 
              type="number" 
              placeholder="Amount" 
              required 
              className="w-full bg-white/5 border border-white/10 p-5 rounded-2xl text-white outline-none focus:border-primary transition-all font-bold" 
              onChange={e => setFormData({...formData, price: e.target.value})} 
            />
          </div>
        </div>

        {/* Row 2: Section & Category Mapping */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-2">
            <label className="text-[10px] text-gray-500 font-black uppercase tracking-widest ml-1">Storage Section</label>
            <select 
              className="w-full bg-[#111] text-white p-5 rounded-2xl border border-white/10 outline-none focus:border-primary appearance-none cursor-pointer font-bold" 
              value={formData.section}
              onChange={e => setFormData({...formData, section: e.target.value, category: ''})}
            >
              <option value="bulk">Bulk Section</option>
              <option value="daily">Daily Essentials</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] text-gray-500 font-black uppercase tracking-widest ml-1">Assigned Category</label>
            <select 
              required 
              className="w-full bg-[#111] text-white p-5 rounded-2xl border border-white/10 outline-none focus:border-primary appearance-none cursor-pointer font-bold" 
              value={formData.category}
              onChange={e => setFormData({...formData, category: e.target.value})}
            >
              <option value="">Select Category...</option>
              {categories
                .filter(c => c.section === formData.section)
                .map(c => (
                  <option key={c.id} value={c.name}>{c.name}</option>
                ))
              }
            </select>
          </div>
        </div>

        {/* Visual Asset Upload */}
        <div className="space-y-2">
          <label className="text-[10px] text-gray-500 font-black uppercase tracking-widest ml-1">Visual Identity</label>
          <label className="block border-2 border-dashed border-white/10 rounded-[2.5rem] p-12 text-center cursor-pointer hover:border-primary/50 transition-all bg-white/[0.01] group">
            <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} />
            {preview ? (
              <img src={preview} className="h-48 mx-auto rounded-3xl object-cover shadow-[0_20px_50px_rgba(0,0,0,0.5)] animate-in zoom-in duration-300" alt="Product Preview" />
            ) : (
              <div className="py-4">
                <span className="text-4xl block mb-4 grayscale group-hover:grayscale-0 transition-all">📦</span>
                <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest">Upload High-Res Visual Asset</p>
              </div>
            )}
          </label>
        </div>

        {/* Promotion Toggle */}
        <div className="flex items-center gap-4 p-6 bg-primary/5 rounded-3xl border border-primary/20 transition-all hover:bg-primary/10">
          <input 
            type="checkbox" 
            id="home-check" 
            className="w-6 h-6 accent-primary cursor-pointer" 
            checked={formData.showOnHome} 
            onChange={e => setFormData({...formData, showOnHome: e.target.checked})} 
          />
          <label htmlFor="home-check" className="text-[10px] font-black text-primary uppercase tracking-widest cursor-pointer select-none">
            Promote to Featured Homepage Grid
          </label>
        </div>

        {/* Action controls */}
        <div className="flex gap-6 pt-4">
          <button 
            type="button" 
            onClick={() => navigate(-1)} 
            className="flex-1 text-gray-600 font-black uppercase text-[10px] tracking-widest hover:text-white transition-colors"
          >
            Abort
          </button>
          <button 
            type="submit" 
            disabled={loading}
            className="flex-[2] bg-primary text-black py-5 rounded-2xl font-black uppercase text-xs shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 flex justify-center items-center"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
            ) : (
              "Initialize Product"
            )}
          </button>
        </div>
      </form>
      
      <p className="mt-8 text-center text-gray-700 text-[9px] font-black uppercase tracking-[0.4em] italic opacity-40">
        Kilogram Logistics Inventory Protocol v2.0
      </p>
    </div>
  );
}