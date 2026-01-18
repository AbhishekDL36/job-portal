import React, { createContext, useContext, useState, useEffect } from 'react';
import client from '../api/client';

const AuthContext = createContext();

// Function to validate token with backend
const validateToken = async (token) => {
  try {
    const response = await client.get('/auth/me', {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    return null;
  }
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load and validate token from localStorage on mount
    const initializeAuth = async () => {
      try {
        const savedToken = localStorage.getItem('token');
        const savedUser = localStorage.getItem('user');
        
        if (savedToken && savedUser) {
          // Validate token with backend
          const validUser = await validateToken(savedToken);
          
          if (validUser) {
            // Token is valid
            setToken(savedToken);
            setUser(JSON.parse(savedUser));
          } else {
            // Token is invalid or expired - clear localStorage
            console.warn('⚠️ Stored token is invalid or expired. Clearing auth data.');
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            setToken(null);
            setUser(null);
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    
    initializeAuth();
  }, []);

  const login = (token, user) => {
    setToken(token);
    setUser(user);
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  // Add periodic token validation (every 5 minutes)
  useEffect(() => {
    if (!token) return;

    const validatePeriodically = setInterval(async () => {
      const isValid = await validateToken(token);
      if (!isValid) {
        console.warn('⚠️ Token validation failed. Logging out user.');
        logout();
      }
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(validatePeriodically);
  }, [token]);

  // Handle page visibility - validate token when user returns to tab
  useEffect(() => {
    const handleVisibilityChange = async () => {
      if (document.visibilityState === 'visible' && token) {
        const isValid = await validateToken(token);
        if (!isValid) {
          console.warn('⚠️ Token invalid when returning to tab. Logging out user.');
          logout();
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [token]);

  const isAuthenticated = !!token && !!user;

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
