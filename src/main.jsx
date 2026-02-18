import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css'; 


ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <div className="bg-[#050505] min-h-screen selection:bg-primary/30 selection:text-white">
      <App />
    </div>
  </React.StrictMode>,
);