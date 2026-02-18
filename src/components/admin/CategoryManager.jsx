import React, { useState } from 'react';

export default function CategoryManager({ categories, setCategories }) {
  const [showCatModal, setShowCatModal] = useState(false);
  const [editCatId, setEditCatId] = useState(null);
  const [catPreview, setCatPreview] = useState(null);
  const [catData, setCatData] = useState({ name: '', section: 'bulk', image: '' });

  const handleCatFileUpload = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onloadend = () => {
      setCatPreview(reader.result);
      setCatData({ ...catData, image: reader.result });
    };
    if (file) reader.readAsDataURL(file);
  };

  const openEditCat = (cat) => {
    setEditCatId(cat.id);
    setCatData(cat);
    setCatPreview(cat.image);
    setShowCatModal(true);
  };

  const saveCategory = (e) => {
    e.preventDefault();
    let updated;
    if (editCatId) {
      updated = categories.map(c => c.id === editCatId ? { ...catData } : c);
    } else {
      updated = [...categories, { ...catData, id: Date.now() }];
    }
    setCategories(updated);
    setShowCatModal(false);
    setEditCatId(null);
    setCatPreview(null);
    setCatData({ name: '', section: 'bulk', image: '' });
  };

  const deleteCategory = (id) => {
    if (window.confirm("Delete this category? Products in this category will lose their link.")) {
      setCategories(categories.filter(c => c.id !== id));
    }
  };

  return (
    <div className="mb-12">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold uppercase tracking-widest italic text-white">Categories</h2>
        <button 
          onClick={() => { setEditCatId(null); setCatPreview(null); setCatData({name:'', section:'bulk', image:''}); setShowCatModal(true); }}
          className="text-primary text-[10px] font-black uppercase tracking-widest border border-primary/30 px-4 py-2 rounded-xl hover:bg-primary/10"
        >
          + Add Category
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {categories.map(cat => (
          <div key={cat.id} className="glass-card p-4 flex flex-col items-center group relative">
            <div className="w-16 h-16 rounded-full overflow-hidden mb-3 border border-white/10">
              <img src={cat.image || 'https://via.placeholder.com/64'} className="w-full h-full object-cover" alt="" />
            </div>
            <span className="text-[10px] font-black uppercase text-white mb-1">{cat.name}</span>
            <span className="text-[8px] text-gray-500 uppercase font-bold">{cat.section}</span>
            
            {/* Hover Actions */}
            <div className="absolute inset-0 bg-black/80 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl">
              <button onClick={() => openEditCat(cat)} className="text-primary text-[10px] font-black uppercase">Edit</button>
              <button onClick={() => deleteCategory(cat.id)} className="text-red-500 text-[10px] font-black uppercase">Del</button>
            </div>
          </div>
        ))}
      </div>

      {showCatModal && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-xl z-[250] flex items-center justify-center p-6">
          <form onSubmit={saveCategory} className="glass-card p-10 w-full max-w-md border-primary/30 space-y-6">
            <h2 className="text-2xl font-black text-primary italic text-center uppercase tracking-tighter">
              {editCatId ? 'Edit Category' : 'New Category'}
            </h2>
            
            <div className="space-y-4">
              <input 
                type="text" 
                placeholder="Category Name (e.g. Rice)" 
                required 
                value={catData.name} 
                className="w-full bg-white/5 border border-white/10 p-4 rounded-xl text-white outline-none focus:border-primary"
                onChange={e => setCatData({...catData, name: e.target.value})} 
              />
              
              <select 
                className="w-full bg-[#1a1a1a] text-white p-4 rounded-xl border border-white/10 outline-none" 
                value={catData.section}
                onChange={e => setCatData({...catData, section: e.target.value})}
              >
                <option value="bulk">Bulk Section</option>
                <option value="daily">Daily Needs</option>
              </select>

              <label className="block border-2 border-dashed border-white/10 rounded-2xl p-6 text-center cursor-pointer hover:border-primary transition-colors">
                <input type="file" className="hidden" onChange={handleCatFileUpload} />
                {catPreview ? (
                  <img src={catPreview} className="w-20 h-20 mx-auto rounded-full object-cover" />
                ) : (
                  <p className="text-gray-500 text-xs font-bold uppercase tracking-widest">Upload Category Icon</p>
                )}
              </label>
            </div>

            <div className="flex gap-4">
              <button type="button" onClick={() => setShowCatModal(false)} className="flex-1 text-gray-500 font-bold uppercase text-xs">Cancel</button>
              <button type="submit" className="flex-2 bg-primary text-black py-4 rounded-xl font-black uppercase text-xs shadow-lg shadow-primary/20">
                {editCatId ? 'Update' : 'Save'} Category
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}