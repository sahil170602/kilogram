import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../lib/supabase'; //

/**
 * Admin Banners Component
 * Terminal for managing promotional slides synced with Supabase.
 */
export default function Banners() {
  const [banners, setBanners] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({ 
    title: '', 
    tag: '', 
    color: 'from-primary/30', 
    image: '', 
    type: 'text' 
  });

  // 1. Fetch Banners from Supabase
  const fetchBanners = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('banners')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setBanners(data || []);
    } catch (err) {
      console.error("Fetch Error:", err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBanners();
  }, [fetchBanners]);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result);
      setFormData({ ...formData, image: reader.result, type: 'image', title: '' });
    };
    reader.readAsDataURL(file);
  };

  // 2. Persist to Supabase
  const saveBanner = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from('banners')
        .insert([{ 
          ...formData, 
          created_at: new Date().toISOString() 
        }]);

      if (error) throw error;

      resetForm();
      fetchBanners();
    } catch (err) {
      alert("Publish failed: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setShowModal(false);
    setPreview(null);
    setFormData({ title: '', tag: '', color: 'from-primary/30', image: '', type: 'text' });
  };

  // 3. Delete from Supabase
  const deleteBanner = async (id) => {
    if (!window.confirm("Terminate this banner track?")) return;

    try {
      const { error } = await supabase
        .from('banners')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setBanners(prev => prev.filter(b => b.id !== id));
    } catch (err) {
      alert("Delete failed: " + err.message);
    }
  };

  return (
    <div className="h-full flex flex-col animate-in fade-in duration-700">
      <div className="flex justify-between items-center mb-10 shrink-0">
        <div className="space-y-1">
          <h1 className="text-4xl font-black italic uppercase tracking-tighter text-white">
            Marketing <span className="text-primary">Banners</span>
          </h1>
          <p className="text-[10px] text-gray-500 font-black uppercase tracking-[0.3em]">Cloud Asset Management Suite</p>
        </div>
        <button 
          onClick={() => setShowModal(true)} 
          className="bg-primary text-black px-8 py-3 rounded-2xl font-black text-[16px]  shadow-lg shadow-primary/20 hover:scale-105 transition-all active:scale-95"
        >
          + New Banner
        </button>
      </div>

      {loading ? (
        <div className="flex-1 flex items-center justify-center font-black text-primary animate-pulse tracking-widest text-xs uppercase">
          Establishing Database Stream...
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 overflow-y-auto no-scrollbar pb-10">
          {banners.map(banner => (
            <div key={banner.id} className="glass-card overflow-hidden border-white/5 flex justify-between items-center group relative h-36 bg-white/[0.01] hover:border-primary/20 transition-all shadow-2xl">
              {/* Background Visual Layer */}
              {banner.type === 'image' ? (
                <>
                  <img src={banner.image} className="absolute inset-0 w-full h-full object-cover opacity-40 grayscale group-hover:grayscale-0 group-hover:opacity-60 transition-all duration-700" alt="" />
                  <div className="absolute inset-0 bg-gradient-to-r from-black via-transparent to-transparent z-0" />
                </>
              ) : (
                <div className={`absolute inset-0 bg-gradient-to-r ${banner.color} to-transparent opacity-30 group-hover:opacity-50 transition-opacity`} />
              )}

              {/* Data Layer */}
              <div className="relative z-10 p-8">
                <span className="text-[9px] font-black uppercase text-primary border border-primary/30 bg-primary/5 px-3 py-1 rounded-full tracking-widest">
                  {banner.tag}
                </span>
                <h3 className="text-2xl font-black uppercase italic mt-3 text-white drop-shadow-2xl tracking-tighter">
                  {banner.type === 'image' ? 'Visual Asset Optimized' : banner.title}
                </h3>
                <p className="text-[8px] text-gray-500 font-bold uppercase mt-2 opacity-60">Created: {new Date(banner.created_at).toLocaleDateString()}</p>
              </div>
              
              {/* Controls */}
              <div className="relative z-10 p-8">
                <button 
                  onClick={() => deleteBanner(banner.id)} 
                  className="bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white px-6 py-3 rounded-xl transition-all font-black text-[10px] uppercase border border-red-500/20 active:scale-90"
                >
                  Terminate
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* --- FLOATING CONFIGURATION MODAL --- */}
      {showModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-black/90 backdrop-blur-xl animate-in fade-in duration-500">
          <form 
            onSubmit={saveBanner} 
            className="glass-card p-10 w-full max-w-xl border-primary/20 bg-[#0a0a0a] shadow-[0_0_100px_rgba(var(--primary-rgb),0.1)] space-y-8"
          >
            <div className="text-center">
              <h2 className="text-2xl font-black italic uppercase text-primary tracking-tighter leading-none">Configure Asset</h2>
              <p className="text-[9px] text-gray-600 font-black uppercase tracking-widest mt-2">Publish directly to customer frontend</p>
            </div>
            
            <div className="space-y-6">
              {/* Asset Upload Segment */}
              <label className="block border-2 border-dashed border-white/10 rounded-[2rem] p-10 text-center cursor-pointer hover:border-primary/50 transition-all bg-white/[0.01] group">
                <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} />
                {preview ? (
                  <div className="relative inline-block animate-in zoom-in duration-300">
                    <img src={preview} className="h-40 rounded-2xl object-cover shadow-2xl border border-white/10" alt="" />
                    <p className="mt-3 text-[9px] font-black text-primary uppercase animate-pulse">Image Mode Active</p>
                  </div>
                ) : (
                  <div className="py-6">
                    <span className="text-4xl mb-4 block grayscale group-hover:grayscale-0 transition-all duration-500">🖼️</span>
                    <span className="text-gray-500 text-[11px] font-black uppercase tracking-[0.2em] leading-none">Drop High-Res Asset Here</span>
                  </div>
                )}
              </label>

              {/* Text Configuration (Dynamic UI) */}
              {!preview && (
                <div className="animate-in slide-in-from-top-4 duration-500 space-y-4">
                  <div className="space-y-2">
                    <label className="text-[9px] font-black text-gray-600 uppercase ml-2 tracking-widest">Offer Title</label>
                    <input 
                      type="text" 
                      placeholder="e.g. FLASH 50% OFF" 
                      required={!preview}
                      className="w-full bg-white/5 border border-white/10 p-5 rounded-2xl text-xs uppercase font-black text-white outline-none focus:border-primary transition-all" 
                      onChange={e => setFormData({...formData, title: e.target.value.toUpperCase(), type: 'text'})} 
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-[9px] font-black text-gray-600 uppercase ml-2 tracking-widest">Aura Color</label>
                    <select 
                      className="w-full bg-[#111] border border-white/10 p-5 rounded-2xl text-[11px] font-black uppercase text-gray-400 outline-none focus:border-primary cursor-pointer" 
                      onChange={e => setFormData({...formData, color: e.target.value})}
                    >
                      <option value="from-primary/30">Theme: Kilogram Pink</option>
                      <option value="from-blue-500/20">Theme: Fresh Blue</option>
                      <option value="from-green-500/20">Theme: Express Green</option>
                      <option value="from-yellow-500/20">Theme: Bulk Gold</option>
                    </select>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <label className="text-[9px] font-black text-gray-600 uppercase ml-2 tracking-widest">Promotion Tag</label>
                <input 
                  type="text" 
                  placeholder="e.g. LIMITED TIME SYNC" 
                  required 
                  className="w-full bg-white/5 border border-white/10 p-5 rounded-2xl text-xs uppercase font-black text-white outline-none focus:border-primary transition-all" 
                  onChange={e => setFormData({...formData, tag: e.target.value.toUpperCase()})} 
                />
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <button type="button" onClick={resetForm} className="flex-1 text-gray-600 font-black text-[11px] uppercase tracking-widest hover:text-white transition-colors">Cancle</button>
              <button 
                type="submit" 
                disabled={isSubmitting}
                className="flex-[2] bg-primary text-black py-5 rounded-2xl font-black text-[11px] uppercase tracking-widest shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 flex justify-center items-center gap-3"
              >
                {isSubmitting ? (
                  <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                ) : "Publish"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}