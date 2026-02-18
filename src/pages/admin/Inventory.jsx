import React, { useState, useEffect } from 'react';

export default function Inventory() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [preview, setPreview] = useState(null);
  const [formData, setFormData] = useState({ name: '', price: '', section: 'bulk', category: '', showOnHome: false, image: '' });

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('kilogram_products') || '[]');
    const savedCats = JSON.parse(localStorage.getItem('kilogram_categories') || '[]');
    setProducts(saved);
    setCategories(savedCats);
  }, []);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onloadend = () => { setPreview(reader.result); setFormData({ ...formData, image: reader.result }); };
    if (file) reader.readAsDataURL(file);
  };

  const saveProduct = (e) => {
    e.preventDefault();
    const updated = [...products, { ...formData, id: Date.now() }];
    localStorage.setItem('kilogram_products', JSON.stringify(updated));
    setProducts(updated);
    setShowModal(false);
    setFormData({ name: '', price: '', section: 'bulk', category: '', showOnHome: false, image: '' });
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-center mb-8 shrink-0">
        <h1 className="text-3xl font-black italic uppercase tracking-tighter">Stock Ledger</h1>
        <button onClick={() => setShowModal(true)} className="bg-primary text-black px-6 py-2 rounded-xl font-black text-[10px] uppercase shadow-lg shadow-primary/20">
          + New Product
        </button>
      </div>

      {/* Product List Table */}
      <div className="flex-1 glass-card border-white/5 overflow-hidden bg-white/[0.01] flex flex-col">
        <div className="overflow-y-auto no-scrollbar">
          <table className="w-full text-left">
            <thead className="sticky top-0 bg-[#0a0a0a] border-b border-white/5 text-[10px] font-black text-gray-500 uppercase tracking-widest">
              <tr><th className="p-5">Product</th><th className="p-5">Section</th><th className="p-5">Price</th></tr>
            </thead>
            <tbody>
              {products.map(p => (
                <tr key={p.id} className="border-b border-white/5 text-xs">
                  <td className="p-4 flex items-center gap-3"><img src={p.image} className="w-10 h-10 rounded-lg object-cover" /> {p.name}</td>
                  <td className="p-4 uppercase text-gray-500 font-bold">{p.section}</td>
                  <td className="p-4 font-black text-primary italic">₹{p.price}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- FLOATING NEW PRODUCT MODAL --- */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
          <form onSubmit={saveProduct} className="glass-card p-8 w-full max-w-lg border-primary/20 bg-[#0a0a0a] shadow-2xl scale-in-center">
            <h2 className="text-xl font-black italic uppercase text-primary mb-6">Initialize Product</h2>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <input type="text" placeholder="Name" required className="bg-white/5 border border-white/10 p-4 rounded-xl text-white outline-none text-xs" onChange={e => setFormData({...formData, name: e.target.value})} />
              <input type="number" placeholder="Price" required className="bg-white/5 border border-white/10 p-4 rounded-xl text-white outline-none text-xs" onChange={e => setFormData({...formData, price: e.target.value})} />
            </div>
            <select className="w-full bg-[#111] border border-white/10 p-4 rounded-xl mb-4 text-xs" onChange={e => setFormData({...formData, section: e.target.value})}>
              <option value="bulk">Bulk</option>
              <option value="daily">Daily</option>
            </select>
            <label className="block border-2 border-dashed border-white/10 rounded-xl p-6 text-center cursor-pointer mb-6">
              <input type="file" className="hidden" onChange={handleFileUpload} />
              {preview ? <img src={preview} className="h-24 mx-auto rounded-lg" /> : <span className="text-gray-500 text-[10px] font-black uppercase">Upload Image</span>}
            </label>
            <div className="flex gap-4">
              <button type="button" onClick={() => setShowModal(false)} className="flex-1 text-gray-500 font-black uppercase text-[10px]">Cancel</button>
              <button type="submit" className="flex-2 bg-primary text-black py-4 rounded-xl font-black uppercase text-[10px]">Save Product</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}