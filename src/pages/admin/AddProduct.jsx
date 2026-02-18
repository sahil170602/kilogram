import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function AddProduct() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [preview, setPreview] = useState(null);
  const [formData, setFormData] = useState({
    name: '', price: '', section: 'bulk', category: '', showOnHome: false, image: ''
  });

  useEffect(() => {
    const savedCats = JSON.parse(localStorage.getItem('kilogram_categories') || '[]');
    setCategories(savedCats);
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

  const saveProduct = (e) => {
    e.preventDefault();
    const products = JSON.parse(localStorage.getItem('kilogram_products') || '[]');
    const updated = [...products, { ...formData, id: Date.now() }];
    localStorage.setItem('kilogram_products', JSON.stringify(updated));
    window.dispatchEvent(new Event('storage'));
    navigate('/admin/inventory');
  };

  return (
    <div className="max-w-4xl mx-auto animate-in slide-in-from-right-4 duration-500">
      <h1 className="text-3xl font-black italic uppercase text-white mb-10 tracking-tighter">New Product Entry</h1>
      
      <form onSubmit={saveProduct} className="glass-card p-10 space-y-8 border-white/5 bg-white/[0.02]">
        <div className="grid grid-cols-2 gap-8">
          <div className="space-y-2">
            <label className="text-[10px] text-gray-500 font-black uppercase tracking-widest ml-1">Identity</label>
            <input type="text" placeholder="Product Name" required className="w-full bg-white/5 border border-white/10 p-5 rounded-2xl text-white outline-none focus:border-primary transition-all" onChange={e => setFormData({...formData, name: e.target.value})} />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] text-gray-500 font-black uppercase tracking-widest ml-1">Price Point (₹)</label>
            <input type="number" placeholder="Amount" required className="w-full bg-white/5 border border-white/10 p-5 rounded-2xl text-white outline-none focus:border-primary transition-all" onChange={e => setFormData({...formData, price: e.target.value})} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-8">
          <div className="space-y-2">
            <label className="text-[10px] text-gray-500 font-black uppercase tracking-widest ml-1">Storage Section</label>
            <select className="w-full bg-[#111] text-white p-5 rounded-2xl border border-white/10 outline-none focus:border-primary" onChange={e => setFormData({...formData, section: e.target.value, category: ''})}>
              <option value="bulk">Bulk Section</option>
              <option value="daily">Daily Essentials</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] text-gray-500 font-black uppercase tracking-widest ml-1">Assigned Category</label>
            <select required className="w-full bg-[#111] text-white p-5 rounded-2xl border border-white/10 outline-none focus:border-primary" onChange={e => setFormData({...formData, category: e.target.value})}>
              <option value="">Select Category...</option>
              {categories.filter(c => c.section === formData.section).map(c => (
                <option key={c.id} value={c.name}>{c.name}</option>
              ))}
            </select>
          </div>
        </div>

        <label className="block border-2 border-dashed border-white/10 rounded-3xl p-12 text-center cursor-pointer hover:border-primary/50 transition-all bg-white/[0.01]">
          <input type="file" className="hidden" onChange={handleFileUpload} />
          {preview ? <img src={preview} className="h-40 mx-auto rounded-2xl object-cover shadow-2xl" /> : <p className="text-gray-500 text-xs font-black uppercase tracking-widest">Upload High-Res Product Image</p>}
        </label>

        <div className="flex items-center gap-4 p-5 bg-primary/5 rounded-2xl border border-primary/20">
          <input type="checkbox" id="home-check" className="w-6 h-6 accent-primary" checked={formData.showOnHome} onChange={e => setFormData({...formData, showOnHome: e.target.checked})} />
          <label htmlFor="home-check" className="text-[10px] font-black text-primary uppercase tracking-widest cursor-pointer">Promote to Featured Homepage Grid</label>
        </div>

        <div className="flex gap-6 pt-4">
          <button type="button" onClick={() => navigate(-1)} className="flex-1 text-gray-600 font-black uppercase text-[10px] hover:text-white transition-colors">Abort</button>
          <button type="submit" className="flex-[2] bg-primary text-black py-5 rounded-2xl font-black uppercase text-xs shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all">
            Initialize Product
          </button>
        </div>
      </form>
    </div>
  );
}