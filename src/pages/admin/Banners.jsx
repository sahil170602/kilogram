import React, { useState, useEffect } from 'react';

export default function Banners() {
  const [banners, setBanners] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [preview, setPreview] = useState(null);
  const [formData, setFormData] = useState({ 
    title: '', 
    tag: '', 
    color: 'from-primary/30', 
    image: '', 
    type: 'text' // tracks 'text' or 'image' mode
  });

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('kilogram_banners') || '[]');
    setBanners(saved);
  }, []);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result);
      setFormData({ ...formData, image: reader.result, type: 'image', title: '' });
    };
    if (file) reader.readAsDataURL(file);
  };

  const saveBanner = (e) => {
    e.preventDefault();
    const updated = [...banners, { ...formData, id: Date.now() }];
    localStorage.setItem('kilogram_banners', JSON.stringify(updated));
    setBanners(updated);
    resetForm();
    window.dispatchEvent(new Event('storage'));
  };

  const resetForm = () => {
    setShowModal(false);
    setPreview(null);
    setFormData({ title: '', tag: '', color: 'from-primary/30', image: '', type: 'text' });
  };

  const deleteBanner = (id) => {
    const updated = banners.filter(b => b.id !== id);
    localStorage.setItem('kilogram_banners', JSON.stringify(updated));
    setBanners(updated);
    window.dispatchEvent(new Event('storage'));
  };

  return (
    <div className="h-full flex flex-col animate-in fade-in duration-500">
      <div className="flex justify-between items-center mb-8 shrink-0">
        <div>
          <h1 className="text-3xl font-black italic uppercase tracking-tighter">Marketing Banners</h1>
          <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest mt-1">Manage store-front slides</p>
        </div>
        <button onClick={() => setShowModal(true)} className="bg-primary text-black px-6 py-3 rounded-xl font-black text-[10px] uppercase shadow-lg shadow-primary/20 hover:scale-105 transition-all">
          + Add New Slide
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 overflow-y-auto no-scrollbar pb-10">
        {banners.map(banner => (
          <div key={banner.id} className={`glass-card overflow-hidden border-white/5 flex justify-between items-center group relative h-32`}>
            {/* Background Layer */}
            {banner.type === 'image' ? (
              <img src={banner.image} className="absolute inset-0 w-full h-full object-cover opacity-60" alt="" />
            ) : (
              <div className={`absolute inset-0 bg-gradient-to-r ${banner.color} to-transparent opacity-40`} />
            )}

            {/* Content Layer */}
            <div className="relative z-10 p-6">
              <span className="text-[8px] font-black uppercase text-primary border border-primary/20 bg-black/40 px-2 py-0.5 rounded-full">{banner.tag}</span>
              <h3 className="text-lg font-black uppercase italic mt-2 text-white drop-shadow-md">
                {banner.type === 'image' ? 'Image Banner' : banner.title}
              </h3>
            </div>
            
            <div className="relative z-10 p-6">
              <button onClick={() => deleteBanner(banner.id)} className="bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white p-3 rounded-xl transition-all font-black text-[9px] uppercase border border-red-500/20">
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* --- FLOATING MODAL --- */}
      {showModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-black/80 backdrop-blur-xl animate-in fade-in duration-300">
          <form onSubmit={saveBanner} className="glass-card p-10 w-full max-w-xl border-primary/20 bg-[#0a0a0a] shadow-2xl">
            <h2 className="text-xl font-black italic uppercase text-primary mb-8 text-center tracking-tighter">Configure Slide</h2>
            
            <div className="space-y-6">
              {/* Image Upload Toggle */}
              <div className="grid grid-cols-1 gap-4">
                <label className="block border-2 border-dashed border-white/10 rounded-2xl p-6 text-center cursor-pointer hover:border-primary/50 transition-all bg-white/[0.02]">
                  <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} />
                  {preview ? (
                    <div className="relative">
                      <img src={preview} className="h-32 mx-auto rounded-xl object-cover shadow-2xl" alt="" />
                      <p className="mt-2 text-[8px] font-black text-primary uppercase">Image Detected - Text Title Disabled</p>
                    </div>
                  ) : (
                    <div className="py-4">
                      <span className="text-2xl mb-2 block">🖼️</span>
                      <span className="text-gray-500 text-[10px] font-black uppercase tracking-widest leading-none">Upload Visual Asset</span>
                    </div>
                  )}
                </label>
              </div>

              {/* Text Option (Only enabled if no image) */}
              {!preview && (
                <div className="animate-in slide-in-from-top-2 duration-300">
                  <div className="flex flex-col gap-4">
                    <input 
                      type="text" 
                      placeholder="Offer Title (e.g. 50% OFF)" 
                      required={!preview}
                      className="w-full bg-white/5 border border-white/10 p-5 rounded-2xl text-xs uppercase font-black text-white outline-none focus:border-primary" 
                      onChange={e => setFormData({...formData, title: e.target.value, type: 'text'})} 
                    />
                    <select 
                      className="w-full bg-[#111] border border-white/10 p-5 rounded-2xl text-[10px] font-black uppercase text-gray-400 outline-none" 
                      onChange={e => setFormData({...formData, color: e.target.value})}
                    >
                      <option value="from-primary/30">Theme: Pink (Primary)</option>
                      <option value="from-blue-500/20">Theme: Blue (Fresh)</option>
                      <option value="from-green-500/20">Theme: Green (Express)</option>
                    </select>
                  </div>
                </div>
              )}

              <input 
                type="text" 
                placeholder="Marketing Tag (e.g. MEGA OFFER)" 
                required 
                className="w-full bg-white/5 border border-white/10 p-5 rounded-2xl text-xs uppercase font-black text-white outline-none focus:border-primary" 
                onChange={e => setFormData({...formData, tag: e.target.value})} 
              />
            </div>

            <div className="flex gap-4 mt-10">
              <button type="button" onClick={resetForm} className="flex-1 text-gray-600 font-black text-[10px] uppercase hover:text-white transition-colors">Abort</button>
              <button type="submit" className="flex-[2] bg-primary text-black py-5 rounded-2xl font-black text-[10px] uppercase shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all">
                Publish to Store
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}