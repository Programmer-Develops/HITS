import { createContext, useContext } from 'react';

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  // Vercel serverless doesn't support WebSockets, so we mock the socket object
  // to prevent the app from crashing and stop the 404 console spam.
  const mockSocket = {
    on: () => {},
    off: () => {},
    emit: () => {},
    connected: true  // Always "online" — we use REST API polling instead of WebSockets
  };

  return (
    <SocketContext.Provider value={mockSocket}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
