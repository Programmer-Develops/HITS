import { createContext, useContext, useEffect, useState } from 'react';
import axios from 'axios';

const API = import.meta.env.VITE_BACKEND_URL || '';
const SocketContext = createContext({ on: () => {}, off: () => {}, emit: () => {}, connected: true });

export const SocketProvider = ({ children }) => {
  // Vercel serverless doesn't support WebSockets; verify REST availability cleanly.
  const [connected, setConnected] = useState(() => (typeof navigator !== 'undefined' ? navigator.onLine : true));

  useEffect(() => {
    let active = true;
    const checkHealth = async () => {
      if (typeof navigator !== 'undefined' && !navigator.onLine) {
        if (active) setConnected(false);
        return;
      }
      try {
        const res = await axios.get(`${API}/api/health`, { timeout: 4000 });
        if (active) setConnected(Boolean(res.data?.ok));
      } catch {
        if (active) setConnected(false);
      }
    };

    checkHealth();
    const timer = setInterval(checkHealth, 60_000);
    const onOnline = () => checkHealth();
    const onOffline = () => { if (active) setConnected(false); };

    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);
    return () => {
      active = false;
      clearInterval(timer);
      window.removeEventListener('online', onOnline);
      window.removeEventListener('offline', onOffline);
    };
  }, []);

  const mockSocket = {
    on: () => {},
    off: () => {},
    emit: () => {},
    connected
  };

  return (
    <SocketContext.Provider value={mockSocket}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
