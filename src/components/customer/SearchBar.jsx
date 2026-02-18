import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function SearchBar() {
  const [query, setQuery] = useState("");
  const [placeholder, setPlaceholder] = useState("");
  const navigate = useNavigate();

  // Animated Placeholder Logic
  const popularItems = ["Rice", "Milk", "Bread", "Sugar", "Ghee", "Spices"];

  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      setPlaceholder(`Search "${popularItems[i % popularItems.length]}"`);
      i++;
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // Web Speech API Logic
  const startVoiceSearch = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Voice search is not supported in this browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-IN';
    recognition.start();

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setQuery(transcript);
      // Automatically navigate to search page with the spoken text
      navigate(`/search?q=${transcript}`);
    };
  };

  const handleCameraSearch = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Navigate to search page with image mode
      // In a real app, you'd upload the file to a cloud bucket or use a Vision API
      navigate(`/search?mode=image&file=${file.name}`);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/search?q=${query}`);
    }
  };

  return (
    <div className="px-4 mb-4">
      <form onSubmit={handleSubmit} className="glass-card flex items-center p-1 pl-4 border-white/5 bg-white/5 focus-within:border-primary/30 transition-all">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>

        <input 
          type="text" 
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder} 
          className="flex-1 bg-transparent border-none outline-none px-3 text-sm text-white placeholder:text-gray-500 h-10 italic"
        />

        <div className="flex items-center gap-1 pr-2">
          {/* Voice Search */}
          <button 
            type="button"
            onClick={startVoiceSearch} 
            className="p-2 hover:bg-white/5 rounded-full text-primary transition-colors active:scale-90"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            </svg>
          </button>

          {/* AI Camera Search */}
          <label className="p-2 hover:bg-white/5 rounded-full text-primary transition-colors cursor-pointer active:scale-90">
            <input 
              type="file" 
              accept="image/*" 
              capture="environment" 
              className="hidden" 
              onChange={handleCameraSearch} 
            />
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </label>
        </div>
      </form>
    </div>
  );
}