import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../lib/supabase';

export default function Inventory() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({ 
    name: '', 
    price: '', 
    section: 'bulk', 
    category: '', 
    showOnHome: false, 
    image: '',
    specification: '' 
  });

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [pRes, cRes] = await Promise.all([
        supabase.from('products').select('*').order('created_at', { ascending: false }),
        supabase.from('categories').select('*')
      ]);
      setProducts(pRes.data || []);
      setCategories(cRes.data || []);
    } catch (err) {
      console.error("Ledger Sync Error:", err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleEdit = (product) => {
    setEditingId(product.id);
    setFormData({
      name: product.name,
      price: product.price,
      section: product.section,
      category: product.category,
      showOnHome: product.showOnHome,
      image: product.image,
      specification: product.specification || ''
    });
    setPreview(product.image);
    setShowModal(true);
  };

  const deleteProduct = async (id) => {
    if (!window.confirm("Permanently decommission this asset?")) return;
    try {
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (error) throw error;
      loadData();
    } catch (err) {
      alert("Delete failed: " + err.message);
    }
  };

  const saveProduct = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload = { ...formData, price: parseFloat(formData.price) };
      const response = editingId 
        ? await supabase.from('products').update(payload).eq('id', editingId)
        : await supabase.from('products').insert([payload]);

      if (response.error) throw response.error;
      closeModal();
      loadData();
    } catch (err) {
      alert("Error: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingId(null);
    setPreview(null);
    setFormData({ name: '', price: '', section: 'bulk', category: '', showOnHome: false, image: '', specification: '' });
  };

  return (
    <div className="h-full flex flex-col p-8 bg-[#050505] selection:bg-primary/30">
      <div className="flex justify-between items-center mb-10 shrink-0">
        <h1 className="text-5xl font-black italic text-white uppercase tracking-tighter">Stock <span className="text-primary italic">Ledger</span></h1>
        <button onClick={() => setShowModal(true)} className="bg-primary text-black px-10 py-5 rounded-2xl font-black text-[11px] uppercase shadow-2xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all">+ New Asset Deployment</button>
      </div>

      <div className="flex-1 glass-card overflow-hidden bg-white/[0.01] flex flex-col shadow-2xl border-white/5">
        <div className="overflow-y-auto no-scrollbar">
          <table className="w-full text-left">
            <thead className="sticky top-0 bg-[#0a0a0a] border-b border-white/5 text-[9px] font-black text-gray-600 uppercase tracking-[0.3em] z-30">
              <tr>
                <th className="px-10 py-6">Asset Identity</th>
                <th className="px-8 py-6">Node Mapping</th>
                <th className="px-8 py-6">Visibility</th>
                <th className="px-8 py-6">Valuation</th>
                <th className="px-10 py-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {products.map(p => (
                <tr key={p.id} className="hover:bg-white/[0.03] group transition-colors">
                  <td className="px-10 py-5 flex items-center gap-5">
                    <img src={p.image} className="w-16 h-16 rounded-2xl object-cover border border-white/10" alt="" />
                    <p className="font-black text-primary uppercase text-sm tracking-widest group-hover:text-primary transition-colors">{p.name}</p>
                  </td>
                  <td className="px-8 py-5 text-[10px] font-black text-primary uppercase tracking-tighter">{p.category}</td>
                  <td className="px-8 py-5">
                    <span className={`text-[8px] font-black px-3 py-1.5 rounded-lg uppercase ${p.showOnHome ? 'bg-primary/10 text-primary border border-primary/20' : 'bg-white/5 text-gray-600'}`}>
                      {p.showOnHome ? 'Home Featured' : 'Inventory Only'}
                    </span>
                  </td>
                  <td className="px-8 py-5 font-black text-white italic">₹{p.price}</td>
                  <td className="px-10 py-5 text-right space-x-3">
                    <button onClick={() => handleEdit(p)} className="text-[9px] font-black text-primary border border-primary/20 px-4 py-2 rounded-xl uppercase hover:bg-primary hover:text-black transition-all">Modify</button>
                    <button onClick={() => deleteProduct(p.id)} className="text-[9px] font-black text-red-500/40 border border-red-500/10 px-4 py-2 rounded-xl uppercase hover:bg-red-500 hover:text-white transition-all">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-black/95 backdrop-blur-3xl animate-in fade-in duration-300">
          <form onSubmit={saveProduct} className="glass-card p-10 w-full max-w-4xl border-primary/20 bg-[#0a0a0a] space-y-6 shadow-[0_0_80px_rgba(255,77,148,0.1)]">
            <div className="flex justify-between items-center">
              <h2 className="text-3xl font-black italic text-primary uppercase tracking-tighter">{editingId ? 'Modify Asset' : 'Deploy Asset'}</h2>
              <button type="button" onClick={closeModal} className="text-gray-600 hover:text-white transition-colors text-xl">✕</button>
            </div>

            <div className="grid grid-cols-5 gap-8">
              <div className="col-span-2 space-y-4">
                {/* Visual Identity Zone - Always Colorful  */}
                <label className="relative h-64 border-2 border-dashed border-primary/30 rounded-[2.5rem] flex flex-col items-center justify-center cursor-pointer hover:border-primary bg-primary/[0.02] overflow-hidden group transition-all">
                  <input type="file" className="hidden" onChange={(e) => {
                    const file = e.target.files[0];
                    const reader = new FileReader();
                    reader.onloadend = () => { setPreview(reader.result); setFormData({ ...formData, image: reader.result }); };
                    reader.readAsDataURL(file);
                  }} />
                  {preview ? (
                    <img src={preview} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                  ) : (
                    <div className="text-center p-10 flex flex-col items-center gap-3">
                      <span className="text-4xl">📸</span>
                      <span className="text-primary text-[10px] font-black uppercase tracking-widest opacity-60">Identify Visual Asset</span>
                    </div>
                  )}
                </label>

                <div className="space-y-1.5">
                  <label className="text-[9px] font-black text-gray-600 uppercase tracking-widest ml-1">Asset Specifications</label>
                  <textarea 
                    value={formData.specification} 
                    className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl text-white outline-none focus:border-primary text-xs h-32 resize-none italic font-medium"
                    placeholder="Technical details, logistics data..."
                    onChange={e => setFormData({...formData, specification: e.target.value})}
                  />
                </div>
              </div>

              <div className="col-span-3 space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black text-gray-600 uppercase tracking-widest ml-1">Asset Label</label>
                    <input type="text" value={formData.name} className="w-full bg-white/5 border border-white/10 p-5 rounded-2xl text-white outline-none focus:border-primary text-xs font-bold uppercase" onChange={e => setFormData({...formData, name: e.target.value})} required />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black text-gray-600 uppercase tracking-widest ml-1">Valuation (₹)</label>
                    <input type="number" value={formData.price} className="w-full bg-white/5 border border-white/10 p-5 rounded-2xl text-white outline-none focus:border-primary text-xs font-bold" onChange={e => setFormData({...formData, price: e.target.value})} required />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black text-gray-600 uppercase tracking-widest ml-1">Segment Mapping</label>
                    <select className="w-full bg-[#050505] border border-white/10 p-5 rounded-2xl text-[10px] font-black uppercase text-gray-400 focus:border-primary" value={formData.section} onChange={e => setFormData({...formData, section: e.target.value, category: ''})}>
                      <option value="bulk">Bulk Logistics</option>
                      <option value="daily">Daily Essentials</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black text-gray-600 uppercase tracking-widest ml-1">Category Node</label>
                    <select className="w-full bg-[#050505] border border-white/10 p-5 rounded-2xl text-[10px] font-black uppercase text-gray-400 focus:border-primary" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} required>
                      <option value="">Link Category Node...</option>
                      {categories.filter(c => c.section === formData.section).map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                    </select>
                  </div>
                </div>

                <label className="flex items-center gap-4 p-5 rounded-2xl bg-white/[0.03] border border-white/5 cursor-pointer hover:bg-white/[0.05] transition-all group">
                  <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${formData.showOnHome ? 'bg-primary border-primary shadow-[0_0_10px_#ff4d94]' : 'border-white/20'}`}>
                    {formData.showOnHome && <span className="text-black font-black text-xs">✓</span>}
                  </div>
                  <input type="checkbox" className="hidden" checked={formData.showOnHome} onChange={e => setFormData({...formData, showOnHome: e.target.checked})} />
                  <div>
                    <p className="text-[11px] font-black uppercase tracking-widest group-hover:text-primary transition-colors">Featured Visibility</p>
                    <p className="text-[8px] text-gray-600 font-bold uppercase italic mt-1 leading-none">Display on storefront dashboard</p>
                  </div>
                </label>

                <div className="flex gap-6 pt-4">
                  <button type="button" onClick={closeModal} className="flex-1 text-gray-700 font-black uppercase text-[10px] tracking-[0.4em] hover:text-white transition-all">Abort</button>
                  <button type="submit" disabled={isSubmitting} className="flex-[2] bg-primary text-black py-6 rounded-[2rem] font-black uppercase text-[11px] tracking-[0.4em] shadow-2xl active:scale-95 transition-all flex justify-center items-center">
                    {isSubmitting ? <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" /> : (editingId ? "Update Deployment" : "Confirm Deployment")}
                  </button>
                </div>
              </div>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}