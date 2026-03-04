import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';
import { API_BASE_URL } from '../config';
import { useAuth } from './AuthContext';

const SocketContext = createContext(null);

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
  const { user } = useAuth();
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef(null);

  useEffect(() => {
    const token = localStorage.getItem('token');

    if (token && !socketRef.current) {
      // Initialize socket only if token exists and socket not already created
      console.log('Initializing Global Socket...');
      
      const newSocket = io(API_BASE_URL, {
        auth: { token },
        transports: ['websocket'], // Force websocket for better performance
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
      });

      newSocket.on('connect', () => {
        console.log('Global Socket Connected:', newSocket.id);
        setIsConnected(true);
      });

      newSocket.on('disconnect', () => {
        console.log('Global Socket Disconnected');
        setIsConnected(false);
      });

      newSocket.on('connect_error', (err) => {
        console.error('Global Socket Connection Error:', err.message);
      });

      socketRef.current = newSocket;
      setSocket(newSocket);
    } else if (!token && socketRef.current) {
      // User logged out, disconnect socket
      console.log('Disconnecting Global Socket (User Logout)...');
      socketRef.current.disconnect();
      socketRef.current = null;
      setSocket(null);
      setIsConnected(false);
    }

    // Cleanup on unmount is tricky because we want the socket to persist across navigation.
    // However, if the provider unmounts (e.g. app close), we should clean up.
    // Since this provider wraps the entire App, it only unmounts on close/refresh.
    return () => {
      // Optional: don't disconnect on unmount to keep it alive during hot reloads?
      // But for production, if the root unmounts, we should disconnect.
    };
  }, [user]); // Re-run when user changes (login/logout)

  return (
    <SocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
};
