import { createContext, useState, useEffect, useContext } from 'react';
import { API_BASE_URL } from '../config';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch (e) {
      return null;
    }
  });
  // Initialize loading to false if we have a user, otherwise true only if we also have a token (checking validity)
  // Actually, for best UX, we should default to false and let the background check handle validity.
  // If there is no token, we are definitely not loading (we are anonymous).
  // If there is a token, we optimistically say "not loading" (we are logged in) and verify in background.
  const [loading, setLoading] = useState(false);

  const login = (token, userData) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
  };

  const updateUser = (userData) => {
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  const checkUserStatus = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      // console.log('Checking user status...');
      const res = await fetch(`${API_BASE_URL}/api/auth/me`, {
        headers: { 'x-auth-token': token }
      });
      
      if (res.status === 401) {
        // Token invalid or user deactivated
        console.log('User unauthorized (401) during status check.');
        logout(); 
      } else if (res.ok) {
        const userData = await res.json();
        // Update user data if needed, or just ensure active
        if (userData.isActive === false) {
            console.log('User is deactivated (isActive=false), logging out.');
            logout();
        } else {
             // Optional: Update user state with fresh data
             // setUser(userData); 
        }
      }
    } catch (err) {
      console.error('Error checking user status:', err);
    }
  };

  useEffect(() => {
    // Initial check
    checkUserStatus();

    // Periodic check (every 30 seconds) to ensure active status
    const interval = setInterval(checkUserStatus, 30000);

    return () => clearInterval(interval);
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, logout, updateUser, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
