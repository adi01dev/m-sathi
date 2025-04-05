
import React, { createContext, useState, useEffect, useContext } from 'react';
import { User } from '@/lib/types';
import { authAPI } from '@/lib/api';
import { useToast } from '@/components/ui/use-toast';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: Partial<User>) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        const currentUser = await authAPI.getCurrentUser();
        setUser(currentUser);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      localStorage.removeItem('token');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const { user, token } = await authAPI.login(email, password);
      setUser(user);
      localStorage.setItem('token', token);
      toast({
        title: "Login successful",
        description: `Welcome back, ${user.name}!`,
      });
    } catch (error) {
      console.error('Login failed:', error);
      toast({
        variant: "destructive",
        title: "Login failed",
        description: "Please check your credentials and try again.",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: Partial<User>) => {
    setIsLoading(true);
    try {
      const user = await authAPI.register(userData);
      toast({
        title: "Registration successful",
        description: "Your account has been created. Please login.",
      });
    } catch (error) {
      console.error('Registration failed:', error);
      toast({
        variant: "destructive",
        title: "Registration failed",
        description: "Please try again with different information.",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('token');
    toast({
      title: "Logged out",
      description: "You have been successfully logged out.",
    });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
