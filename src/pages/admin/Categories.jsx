import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../lib/supabase';

/**
 * Admin Categories Component
 * Terminal for managing store hierarchy synced with Supabase Cloud.
 */
export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({ name: '', section: 'bulk', image: '' });

  // 1. Fetch Categories from Supabase
  const loadCategories = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;
      setCategories(data || []);
    } catch (err) {
      console.error("Fetch Error:", err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  // 2. Handle File Upload (Base64)
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

  // 3. Save to Supabase
  const saveCategory = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from('categories')
        .insert([{ 
          name: formData.name, 
          section: formData.section, 
          image: formData.image,
          created_at: new Date().toISOString()
        }]);

      if (error) throw error;

      setShowModal(false);
      setPreview(null);
      setFormData({ name: '', section: 'bulk', image: '' });
      loadCategories(); // Refresh list
    } catch (err) {
      alert("Sync failed: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // 4. Delete from Supabase
  const deleteCategory = async (id) => {
    if (!window.confirm("Terminate this category map? Products linked to this will be orphaned.")) return;

    try {
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setCategories(prev => prev.filter(c => c.id !== id));
    } catch (err) {
      alert("Delete failed: " + err.message);
    }
  };

  return (
    <div className="h-full flex flex-col animate-in fade-in duration-700">
      {/* Header Suite */}
      <div className="flex justify-between items-center mb-10 shrink-0">
        <div className="space-y-1">
          <h1 className="text-4xl font-black italic tracking-tighter uppercase text-white leading-none">
            Categories <span className="text-primary">Architecture</span>
          </h1>
          <p className="text-[10px] text-gray-500 font-black uppercase tracking-[0.3em]">Mapping Logistics Nodes</p>
        </div>
        <button 
          onClick={() => setShowModal(true)} 
          className="bg-primary text-black px-8 py-4 rounded-2xl font-black text-[10px] uppercase shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all"
        >
          + New Category Node
        </button>
      </div>

      {/* Main Grid */}
      {loading ? (
        <div className="flex-1 flex items-center justify-center">
           <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 flex-1 overflow-y-auto no-scrollbar pb-20">
          {['bulk', 'daily'].map(sec => (
            <div key={sec} className="space-y-6">
              <h2 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.5em] px-2 flex items-center gap-4">
                {sec} Segment <div className="h-px flex-1 bg-white/5"></div>
              </h2>
              <div className="grid grid-cols-1 gap-4">
                {categories.filter(c => c.section === sec).map(cat => (
                  <div key={cat.id} className="glass-card p-5 flex justify-between items-center border-white/5 bg-white/[0.01] hover:bg-white/[0.03] transition-all group relative overflow-hidden">
                    <div className="flex items-center gap-5 relative z-10">
                      <div className="w-14 h-14 rounded-2xl overflow-hidden border border-white/10 shadow-2xl bg-black">
                        <img src={cat.image || 'https://via.placeholder.com/60'} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" alt="" />
                      </div>
                      <p className="font-black uppercase text-sm tracking-widest italic group-hover:text-primary transition-colors">{cat.name}</p>
                    </div>
                    <button 
                      onClick={() => deleteCategory(cat.id)} 
                      className="opacity-0 group-hover:opacity-100 bg-red-500/10 text-red-500 border border-red-500/20 px-4 py-2 rounded-xl font-black text-[9px] uppercase tracking-widest transition-all relative z-10 hover:bg-red-500 hover:text-white"
                    >
                      Remove
                    </button>
                    {/* Decorative Background Text */}
                    <span className="absolute -right-2 -bottom-2 text-4xl font-black text-white/[0.02] italic uppercase pointer-events-none">
                      {cat.name.slice(0, 3)}
                    </span>
                  </div>
                ))}
                {categories.filter(c => c.section === sec).length === 0 && (
                  <div className="p-10 border-2 border-dashed border-white/5 rounded-2xl text-center opacity-20">
                    <p className="text-[9px] font-black uppercase tracking-widest">No nodes mapped</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* --- FLOATING BLUR MODAL --- */}
      {showModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-black/90 backdrop-blur-xl animate-in fade-in zoom-in-95 duration-300">
          <form 
            onSubmit={saveCategory} 
            className="glass-card p-10 w-full max-w-lg border-primary/20 bg-[#0a0a0a] shadow-[0_0_100px_rgba(var(--primary-rgb),0.1)] space-y-8"
          >
            <div className="text-center">
              <h2 className="text-2xl font-black italic text-primary uppercase tracking-tighter leading-none">Initialize Category</h2>
              <p className="text-[9px] text-gray-600 font-black uppercase tracking-widest mt-2">Cloud Node Configuration</p>
            </div>
            
            <div className="space-y-5">
              <div className="space-y-2">
                <label className="text-[9px] font-black text-gray-500 uppercase ml-2 tracking-widest">Category Label</label>
                <input 
                  type="text" 
                  placeholder="e.g. ORGANIC PRODUCE" 
                  required 
                  className="w-full bg-white/5 border border-white/10 p-5 rounded-2xl text-xs font-black uppercase text-white outline-none focus:border-primary transition-all" 
                  onChange={e => setFormData({...formData, name: e.target.value})} 
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-[9px] font-black text-gray-500 uppercase ml-2 tracking-widest">Architecture Mapping</label>
                <select 
                  className="w-full bg-[#111] border border-white/10 p-5 rounded-2xl text-[10px] font-black uppercase text-gray-400 outline-none focus:border-primary cursor-pointer" 
                  onChange={e => setFormData({...formData, section: e.target.value})}
                >
                  <option value="bulk">Bulk Section</option>
                  <option value="daily">Daily Essentials</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[9px] font-black text-gray-500 uppercase ml-2 tracking-widest">Visual Asset</label>
                <label className="block border-2 border-dashed border-white/10 rounded-2xl p-10 text-center cursor-pointer hover:border-primary transition-all bg-white/[0.01] group">
                  <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} />
                  {preview ? (
                    <img src={preview} className="h-32 mx-auto rounded-2xl object-cover shadow-2xl animate-in zoom-in" alt="Preview" />
                  ) : (
                    <div className="py-2">
                      <span className="text-3xl block mb-2 grayscale group-hover:grayscale-0 transition-all">🖼️</span>
                      <span className="text-gray-500 text-[10px] font-black uppercase tracking-widest">Drop Icon / Visual Identity</span>
                    </div>
                  )}
                </label>
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <button 
                type="button" 
                onClick={() => { setShowModal(false); setPreview(null); }} 
                className="flex-1 text-gray-600 font-black uppercase text-[10px] tracking-widest hover:text-white transition-colors"
              >
                Abort
              </button>
              <button 
                type="submit" 
                disabled={isSubmitting}
                className="flex-[2] bg-primary text-black py-5 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 disabled:opacity-50 transition-all flex justify-center items-center"
              >
                {isSubmitting ? (
                  <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                ) : "Sync with Cloud"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}