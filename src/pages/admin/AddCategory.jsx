import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';

/**
 * AddCategory Component
 * Admin terminal for initializing new product categories in Supabase.
 */
export default function AddCategory() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState(null);
  const [formData, setFormData] = useState({ 
    name: '', 
    section: 'bulk', 
    image: '' 
  });

  // Handle visual asset upload and conversion to Base64
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

  // Persist data to Supabase
  const saveCategory = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Logic: Insert into 'categories' table
      const { error } = await supabase
        .from('categories')
        .insert([{ 
          name: formData.name, 
          section: formData.section, 
          image: formData.image,
          created_at: new Date().toISOString()
        }]);

      if (error) throw error;

      // Navigate back to management suite
      navigate('/admin/categories');
    } catch (error) {
      console.error("Database Error:", error.message);
      alert("Failed to sync category: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header Identity */}
      <div className="mb-10 space-y-2">
        <h1 className="text-4xl font-black italic uppercase text-white tracking-tighter">
          Create <span className="text-primary">Category</span>
        </h1>
        <p className="text-[10px] text-gray-500 font-black uppercase tracking-[0.3em]">
          Logistics Mapping Terminal v2.0
        </p>
      </div>

      <form onSubmit={saveCategory} className="glass-card p-10 space-y-8 border-white/5 bg-white/[0.02] shadow-2xl relative overflow-hidden">
        {/* Background Visual Glow */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/10 blur-[100px] rounded-full pointer-events-none" />

        {/* Input: Label Name */}
        <div className="space-y-3">
          <label className="text-[10px] text-gray-500 font-black uppercase tracking-widest ml-1">
            Category Identity
          </label>
          <input 
            type="text" 
            required 
            placeholder="e.g. Organic Pulses"
            className="w-full bg-white/5 border border-white/10 p-5 rounded-2xl text-white outline-none focus:border-primary transition-all font-bold placeholder:text-gray-700" 
            onChange={e => setFormData({...formData, name: e.target.value})} 
          />
        </div>

        {/* Input: Section Mapping */}
        <div className="space-y-3">
          <label className="text-[10px] text-gray-500 font-black uppercase tracking-widest ml-1">
            Logistics Section
          </label>
          <div className="relative">
            <select 
              className="w-full bg-[#0a0a0a] text-white p-5 rounded-2xl border border-white/10 outline-none focus:border-primary transition-all appearance-none cursor-pointer font-bold" 
              onChange={e => setFormData({...formData, section: e.target.value})}
            >
              <option value="bulk">Bulk Logistics</option>
              <option value="daily">Daily Essentials</option>
            </select>
            <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-primary font-black">
              ▼
            </div>
          </div>
        </div>

        {/* Input: Visual Identity (Icon) */}
        <div className="space-y-3">
          <label className="text-[10px] text-gray-500 font-black uppercase tracking-widest ml-1">
            Visual Asset
          </label>
          <label className="block border-2 border-dashed border-white/10 rounded-[2rem] p-12 text-center cursor-pointer hover:border-primary/40 transition-all bg-white/[0.01] group">
            <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} />
            {preview ? (
              <div className="relative inline-block">
                <img src={preview} className="h-32 w-32 rounded-3xl object-cover shadow-2xl border border-white/10 animate-in zoom-in duration-300" alt="Preview" />
                <div className="absolute inset-0 bg-primary/10 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <span className="text-[10px] font-black text-white uppercase">Change</span>
                </div>
              </div>
            ) : (
              <div className="space-y-2 py-4">
                <p className="text-3xl grayscale group-hover:grayscale-0 transition-all">🖼️</p>
                <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest leading-none">
                  Upload Category Icon
                </p>
              </div>
            )}
          </label>
        </div>

        {/* Action Controls */}
        <div className="flex gap-4 pt-4">
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
            className="flex-[2] bg-primary text-black py-5 rounded-2xl font-black uppercase text-xs shadow-[0_10px_30px_rgba(var(--primary-rgb),0.3)] active:scale-95 transition-all disabled:opacity-50 flex justify-center items-center gap-3"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                <span>Syncing...</span>
              </>
            ) : (
              "Confirm Category"
            )}
          </button>
        </div>
      </form>
      
      <p className="mt-8 text-center text-gray-700 text-[9px] font-black uppercase tracking-[0.4em] italic opacity-40">
        Data Encrypted via Supabase Cloud Protocol
      </p>
    </div>
  );
}