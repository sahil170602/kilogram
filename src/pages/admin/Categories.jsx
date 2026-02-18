import React, { useState, useEffect } from 'react';

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [preview, setPreview] = useState(null);
  const [formData, setFormData] = useState({ name: '', section: 'bulk', image: '' });

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('kilogram_categories') || '[]');
    setCategories(saved);
  }, []);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result);
      setFormData({ ...formData, image: reader.result });
    };
    if (file) reader.readAsDataURL(file);
  };

  const saveCategory = (e) => {
    e.preventDefault();
    const updated = [...categories, { ...formData, id: Date.now() }];
    localStorage.setItem('kilogram_categories', JSON.stringify(updated));
    setCategories(updated);
    setShowModal(false);
    setPreview(null);
    setFormData({ name: '', section: 'bulk', image: '' });
  };

  const deleteCategory = (id) => {
    if (window.confirm("Delete this category map?")) {
      const updated = categories.filter(c => c.id !== id);
      setCategories(updated);
      localStorage.setItem('kilogram_categories', JSON.stringify(updated));
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-center mb-10 shrink-0">
        <h1 className="text-4xl font-black italic tracking-tighter uppercase">Categories</h1>
        <button onClick={() => setShowModal(true)} className="bg-primary text-black px-8 py-3 rounded-2xl font-black text-xs uppercase shadow-xl shadow-primary/20 hover:scale-105 transition-all">
          + New Category
        </button>
      </div>

      <div className="grid grid-cols-2 gap-10 flex-1 overflow-y-auto no-scrollbar">
        {['bulk', 'daily'].map(sec => (
          <div key={sec} className="space-y-6">
            <h2 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.4em] px-2">{sec} Architecture</h2>
            <div className="grid grid-cols-1 gap-4">
              {categories.filter(c => c.section === sec).map(cat => (
                <div key={cat.id} className="glass-card p-5 flex justify-between items-center border-white/5 bg-white/[0.02] group">
                  <div className="flex items-center gap-5">
                    <img src={cat.image || 'https://via.placeholder.com/50'} className="w-14 h-14 rounded-2xl object-cover bg-black" />
                    <p className="font-black uppercase text-sm tracking-widest italic">{cat.name}</p>
                  </div>
                  <button onClick={() => deleteCategory(cat.id)} className="opacity-0 group-hover:opacity-100 text-red-500/50 hover:text-red-500 font-black text-[9px] uppercase transition-all">Remove</button>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* --- FLOATING BLUR MODAL --- */}
      {showModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-black/60 backdrop-blur-xl animate-in fade-in zoom-in-95 duration-300">
          <form onSubmit={saveCategory} className="glass-card p-10 w-full max-w-lg border-primary/20 bg-[#0a0a0a] shadow-2xl">
            <h2 className="text-2xl font-black italic text-primary uppercase mb-8 tracking-tighter">Create Category</h2>
            
            <input type="text" placeholder="Category Name" required className="w-full bg-white/5 border border-white/10 p-5 rounded-2xl text-white outline-none mb-4" onChange={e => setFormData({...formData, name: e.target.value})} />
            
            <select className="w-full bg-[#111] border border-white/10 p-5 rounded-2xl mb-6 text-xs font-black uppercase tracking-widest text-gray-400" onChange={e => setFormData({...formData, section: e.target.value})}>
              <option value="bulk">Bulk Section</option>
              <option value="daily">Daily Essentials</option>
            </select>

            <label className="block border-2 border-dashed border-white/10 rounded-2xl p-10 text-center cursor-pointer mb-8 hover:border-primary/50 transition-all">
              <input type="file" className="hidden" onChange={handleFileUpload} />
              {preview ? <img src={preview} className="h-32 mx-auto rounded-xl" /> : <span className="text-gray-500 text-[10px] font-black uppercase tracking-widest">Upload Icon / Image</span>}
            </label>

            <div className="flex gap-6">
              <button type="button" onClick={() => setShowModal(false)} className="flex-1 text-gray-600 font-black uppercase text-[10px]">Cancel</button>
              <button type="submit" className="flex-[2] bg-primary text-black py-5 rounded-2xl font-black uppercase text-[10px] shadow-lg shadow-primary/20">Confirm Category</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}