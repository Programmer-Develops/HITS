import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import HitAmVisualRefresh from './hit_am.jsx';
import './index.css';
import { ThemeProvider } from './context/ThemeContext.jsx';
import { LanguageProvider } from './context/LanguageContext.jsx';
import { SocketProvider } from './context/SocketContext.jsx';

// Ashish
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider>
      <LanguageProvider>
        <SocketProvider>
          <>
            <HitAmVisualRefresh />
            <App />
          </>
        </SocketProvider>
      </LanguageProvider>
    </ThemeProvider>
  </React.StrictMode>
);
