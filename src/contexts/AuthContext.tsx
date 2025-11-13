import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  id: string;
  name: string;
  email: string;
  avatar_url?: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in (from localStorage)
    const checkAuth = async () => {
      try {
        const savedUser = localStorage.getItem('schedulr_user');
        if (savedUser) {
          const userData = JSON.parse(savedUser) as User;
          setUser(userData);
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error('Error checking authentication:', error);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      // Simple email/password login (client-side demo). In production, call backend API.
      const trimmedEmail = (email || '').trim();
      const trimmedPassword = (password || '').trim();

      if (!trimmedEmail || !trimmedPassword) {
        throw new Error('Email and password are required');
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(trimmedEmail)) {
        throw new Error('Invalid email format');
      }
      if (trimmedPassword.length < 6) {
        throw new Error('Password must be at least 6 characters');
      }

      const nameFromEmail = trimmedEmail.split('@')[0];
      const mockUser: User = {
        id: `user-${Date.now()}`,
        name: nameFromEmail,
        email: trimmedEmail,
        avatar_url: 'https://via.placeholder.com/80'
      };

      setUser(mockUser);
      setIsAuthenticated(true);
      localStorage.setItem('schedulr_user', JSON.stringify(mockUser));
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('schedulr_user');
  };

  const value = {
    isAuthenticated,
    user,
    loading,
    login,
    logout
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};