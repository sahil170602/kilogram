import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * SearchBar Component
 * Features AI Voice recognition, Camera vision triggers, and dynamic placeholders.
 * All queries are routed to the Supabase-powered SearchResults terminal.
 */
export default function SearchBar() {
  const [query, setQuery] = useState("");
  const [placeholder, setPlaceholder] = useState("");
  const navigate = useNavigate();

  // 1. Animated Placeholder Logic (Premium UX)
  const popularItems = ["Organic Rice", "Fresh Milk", "Whole Bread", "Brown Sugar", "Spices"];

  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      setPlaceholder(`Search "${popularItems[i % popularItems.length]}"`);
      i++;
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // 2. Web Speech API: Voice Search Integration
  const startVoiceSearch = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("AI Voice search is not supported in this browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-IN';
    recognition.start();

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setQuery(transcript);
      // Logic: Auto-navigate to result terminal with voice query
      navigate(`/search?q=${encodeURIComponent(transcript)}&mode=voice`);
    };
  };

  // 3. AI Camera Search Trigger
  const handleCameraSearch = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Logic: Navigate to results with image mode parameter
      // The SearchResults page handles the AI vision processing simulation.
      navigate(`/search?mode=image&file=${encodeURIComponent(file.name)}`);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query)}`);
    }
  };

  return (
    <div className="px-4 mb-6 animate-in fade-in slide-in-from-top-2 duration-700">
      <form 
        onSubmit={handleSubmit} 
        className="glass-card flex items-center p-1 pl-4 border-white/10 bg-white/[0.03] focus-within:border-primary/40 focus-within:bg-white/[0.05] transition-all shadow-2xl"
      >
        {/* Search Icon */}
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>

        {/* Search Input */}
        <input 
          type="text" 
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder} 
          className="flex-1 bg-transparent border-none outline-none px-3 text-sm text-white placeholder:text-gray-600 h-12 italic font-medium"
        />

        <div className="flex items-center gap-1 pr-2">
          {/* Voice Search Component */}
          <button 
            type="button"
            onClick={startVoiceSearch} 
            className="p-2.5 hover:bg-white/10 rounded-xl text-primary transition-all active:scale-75 group"
            title="Voice Search"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 drop-shadow-[0_0_8px_rgba(var(--primary-rgb),0.5)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            </svg>
          </button>

          {/* AI Camera Search Label */}
          <label className="p-2.5 hover:bg-white/10 rounded-xl text-primary transition-all cursor-pointer active:scale-75 group">
            <input 
              type="file" 
              className="hidden" 
              accept="image/*" 
              capture="environment" 
              onChange={handleCameraSearch} 
            />
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 drop-shadow-[0_0_8px_rgba(var(--primary-rgb),0.5)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </label>
        </div>
      </form>
    </div>
  );
}