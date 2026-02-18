import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function AddCategory() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ name: '', section: 'bulk', icon: '🛒' });

  const saveCategory = (e) => {
    e.preventDefault();
    const cats = JSON.parse(localStorage.getItem('kilogram_categories') || '[]');
    localStorage.setItem('kilogram_categories', JSON.stringify([...cats, { ...formData, id: Date.now() }]));
    window.dispatchEvent(new Event('storage'));
    navigate('/admin/categories');
  };

  return (
    <div className="max-w-2xl mx-auto animate-in fade-in duration-500">
      <h1 className="text-3xl font-black italic uppercase text-white mb-10">Create Category</h1>
      <form onSubmit={saveCategory} className="glass-card p-10 space-y-6 border-white/5 bg-white/[0.02]">
        <div className="space-y-2">
          <label className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Category Name</label>
          <input type="text" required className="w-full bg-white/5 border border-white/10 p-5 rounded-2xl text-white outline-none focus:border-primary" onChange={e => setFormData({...formData, name: e.target.value})} />
        </div>
        <div className="space-y-2">
          <label className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Parent Section</label>
          <select className="w-full bg-[#111] text-white p-5 rounded-2xl border border-white/10 outline-none" onChange={e => setFormData({...formData, section: e.target.value})}>
            <option value="bulk">Bulk</option>
            <option value="daily">Daily</option>
          </select>
        </div>
        <button type="submit" className="w-full bg-primary text-black py-5 rounded-2xl font-black uppercase text-xs shadow-xl shadow-primary/20">
          Confirm Category
        </button>
      </form>
    </div>
  );
}