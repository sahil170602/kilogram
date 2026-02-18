import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../lib/supabase'; //

export default function CategoryManager() {
  // --- State Management ---
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCatModal, setShowCatModal] = useState(false);
  const [editCatId, setEditCatId] = useState(null);
  const [catPreview, setCatPreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Data structure for Supabase
  const [catData, setCatData] = useState({ 
    name: '', 
    section: 'bulk', 
    image: '',
    description: '' 
  });

  // --- Database Operations ---

  // Fetch all categories from Supabase
  const fetchCategories = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error("Fetch Error:", error.message);
      alert("Database sync failed: " + error.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initialize data on component mount
  useEffect(() => {
    fetchCategories();
    
    // Optional: Real-time subscription to catch changes from other devices
    const subscription = supabase
      .channel('category_changes')
      .on('postgres_changes', { event: '*', table: 'categories' }, fetchCategories)
      .subscribe();

    return () => supabase.removeChannel(subscription);
  }, [fetchCategories]);

  // Handle File to Base64 (Store directly in DB for small icons)
  const handleCatFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setCatPreview(reader.result);
      setCatData(prev => ({ ...prev, image: reader.result }));
    };
    reader.readAsDataURL(file);
  };

  // Create or Update Record in Supabase
  const saveCategory = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (editCatId) {
        // UPDATE Existing
        const { error } = await supabase
          .from('categories')
          .update({ 
            name: catData.name, 
            section: catData.section, 
            image: catData.image 
          })
          .eq('id', editCatId);
        
        if (error) throw error;
      } else {
        // INSERT New
        const { error } = await supabase
          .from('categories')
          .insert([{ 
            name: catData.name, 
            section: catData.section, 
            image: catData.image 
          }]);
        
        if (error) throw error;
      }

      // Cleanup UI
      closeModal();
      fetchCategories();
    } catch (error) {
      alert("Save failed: " + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete Record from Supabase
  const deleteCategory = async (id) => {
    if (!window.confirm("Delete this category? Products in this category will lose their link.")) return;

    try {
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setCategories(prev => prev.filter(c => c.id !== id));
    } catch (error) {
      alert("Delete error: " + error.message);
    }
  };

  // Modal Controllers
  const openEditCat = (cat) => {
    setEditCatId(cat.id);
    setCatData({ name: cat.name, section: cat.section, image: cat.image });
    setCatPreview(cat.image);
    setShowCatModal(true);
  };

  const closeModal = () => {
    setShowCatModal(false);
    setEditCatId(null);
    setCatPreview(null);
    setCatData({ name: '', section: 'bulk', image: '' });
  };

  // --- Render UI ---
  return (
    <div className="mb-12 animate-in fade-in duration-700">
      {/* Header Section */}
      <div className="flex justify-between items-center mb-8">
        <div className="space-y-1">
          <h2 className="text-2xl font-black uppercase tracking-tighter italic text-white leading-none">
            Categories <span className="text-primary">Vault</span>
          </h2>
          <p className="text-[9px] text-gray-500 font-black uppercase tracking-[0.3em]">
            Syncing with Supabase v2.0
          </p>
        </div>
        <button 
          onClick={() => setShowCatModal(true)}
          className="text-primary text-[10px] font-black uppercase tracking-widest border border-primary/30 px-6 py-3 rounded-2xl hover:bg-primary hover:text-black transition-all shadow-lg shadow-primary/5 active:scale-95"
        >
          + Add New Entry
        </button>
      </div>

      {/* Grid Display */}
      {loading ? (
        <div className="py-20 text-center space-y-4">
          <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-primary font-black text-[10px] uppercase animate-pulse">Syncing Database...</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
          {categories.map(cat => (
            <div key={cat.id} className="glass-card p-6 flex flex-col items-center group relative border-white/5 bg-white/[0.02] hover:border-primary/20 transition-all">
              <div className="w-20 h-20 rounded-3xl overflow-hidden mb-4 border border-white/10 shadow-2xl relative">
                <img 
                  src={cat.image || 'https://via.placeholder.com/100'} 
                  className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" 
                  alt={cat.name} 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              
              <span className="text-[11px] font-black uppercase text-white mb-1 tracking-tight">{cat.name}</span>
              <span className="text-[8px] text-primary/60 uppercase font-black tracking-widest bg-primary/5 px-2 py-0.5 rounded-full">
                {cat.section}
              </span>
              
              {/* Floating Action Overlay */}
              <div className="absolute inset-0 bg-black/90 flex flex-col items-center justify-center gap-3 opacity-0 group-hover:opacity-100 transition-all duration-300 rounded-2xl backdrop-blur-sm">
                <button 
                  onClick={() => openEditCat(cat)} 
                  className="w-20 bg-primary text-black text-[9px] font-black py-2 rounded-lg uppercase shadow-lg active:scale-90"
                >
                  Configure
                </button>
                <button 
                  onClick={() => deleteCategory(cat.id)} 
                  className="w-20 border border-red-500/30 text-red-500 text-[9px] font-black py-2 rounded-lg uppercase hover:bg-red-500 hover:text-white transition-colors"
                >
                  Destroy
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* --- CRUD Modal --- */}
      {showCatModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xl z-[250] flex items-center justify-center p-6 animate-in fade-in duration-300">
          <form 
            onSubmit={saveCategory} 
            className="glass-card p-10 w-full max-w-md border-primary/20 bg-[#0a0a0a] space-y-8 shadow-[0_0_100px_rgba(var(--primary-rgb),0.1)]"
          >
            <div className="text-center space-y-2">
              <h2 className="text-3xl font-black text-primary italic uppercase tracking-tighter leading-none">
                {editCatId ? 'Modify Entry' : 'Initialize Entry'}
              </h2>
              <p className="text-[9px] text-gray-500 font-black uppercase tracking-widest">Category Configuration Terminal</p>
            </div>
            
            <div className="space-y-5">
              <div className="space-y-2">
                <label className="text-[9px] font-black text-gray-500 uppercase ml-2 tracking-widest">Label Name</label>
                <input 
                  type="text" 
                  placeholder="e.g. ORGANIC PULSES" 
                  required 
                  value={catData.name} 
                  className="w-full bg-white/5 border border-white/10 p-5 rounded-2xl text-white outline-none focus:border-primary transition-all font-bold placeholder:text-gray-700"
                  onChange={e => setCatData({...catData, name: e.target.value.toUpperCase()})} 
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-[9px] font-black text-gray-500 uppercase ml-2 tracking-widest">Section Mapping</label>
                <select 
                  className="w-full bg-[#111] text-white p-5 rounded-2xl border border-white/10 outline-none focus:border-primary transition-all appearance-none cursor-pointer font-bold" 
                  value={catData.section}
                  onChange={e => setCatData({...catData, section: e.target.value})}
                >
                  <option value="bulk">BULK LOGISTICS</option>
                  <option value="daily">DAILY ESSENTIALS</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[9px] font-black text-gray-500 uppercase ml-2 tracking-widest">Visual Asset</label>
                <label className="block border-2 border-dashed border-white/10 rounded-2xl p-8 text-center cursor-pointer hover:border-primary transition-all bg-white/[0.02]">
                  <input type="file" className="hidden" accept="image/*" onChange={handleCatFileUpload} />
                  {catPreview ? (
                    <img src={catPreview} className="w-24 h-24 mx-auto rounded-2xl object-cover shadow-2xl animate-in zoom-in duration-300" alt="Preview" />
                  ) : (
                    <div className="py-4">
                      <p className="text-white text-2xl mb-2">📁</p>
                      <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest">Drop Visual Identity Here</p>
                    </div>
                  )}
                </label>
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <button 
                type="button" 
                onClick={closeModal} 
                className="flex-1 text-gray-500 font-black uppercase text-[10px] tracking-widest hover:text-white transition-colors"
              >
                Abort
              </button>
              <button 
                type="submit" 
                disabled={isSubmitting}
                className="flex-[2] bg-primary text-black py-5 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl shadow-primary/20 active:scale-95 disabled:opacity-50 transition-all flex justify-center items-center"
              >
                {isSubmitting ? (
                  <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                ) : (
                  editCatId ? 'Sync Modification' : 'Publish to Store'
                )}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}