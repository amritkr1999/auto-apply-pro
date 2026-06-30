import React, { createContext, useContext, useState, useEffect } from 'react';
import { secureStore } from '../services/secureStore';
import { authService, LoginResponse } from '../services/authService';
import { biometricService } from '../services/biometricService';
import { Alert } from 'react-native';

interface AuthContextType {
  token: string | null;
  user: Omit<LoginResponse, 'token'> | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (name: string, email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  checkBiometrics: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<Omit<LoginResponse, 'token'> | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check storage for token on mount
  useEffect(() => {
    async function loadStoredSession() {
      try {
        const storedToken = await secureStore.getToken();
        const storedUser = await secureStore.getUser();
        
        if (storedToken && storedUser) {
          // Check if biometrics is supported and prompt
          const isBiometricsSupported = await biometricService.isHardwareAvailable() && await biometricService.isEnrolled();
          
          if (isBiometricsSupported) {
            const success = await biometricService.authenticate('Unlock Auto Apply Pro');
            if (success) {
              setToken(storedToken);
              setUser(storedUser);
            } else {
              // Biometrics failed or was dismissed, clear session so they can login manually
              // or let them login via email/password. Here we don't clear immediately, we let them login.
              console.log('Biometric unlock cancelled or failed');
            }
          } else {
            // Fallback directly to stored session if no biometrics setup
            setToken(storedToken);
            setUser(storedUser);
          }
        }
      } catch (e) {
        console.error('Failed to load stored auth session:', e);
      } finally {
        setIsLoading(false);
      }
    }

    loadStoredSession();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const data = await authService.login(email, password);
      setToken(data.token);
      const { token: _, ...userInfo } = data;
      setUser(userInfo);
    } catch (error: any) {
      const errMsg = error.response?.data?.message || error.message || 'Login failed';
      Alert.alert('Error', errMsg);
      throw error;
    }
  };

  const signUp = async (name: string, email: string, password: string) => {
    try {
      const data = await authService.register(name, email, password);
      setToken(data.token);
      const { token: _, ...userInfo } = data;
      setUser(userInfo);
    } catch (error: any) {
      const errMsg = error.response?.data?.message || error.message || 'Registration failed';
      Alert.alert('Error', errMsg);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await authService.logout();
      setToken(null);
      setUser(null);
    } catch (e) {
      console.error('Logout failed:', e);
    }
  };

  const checkBiometrics = async (): Promise<boolean> => {
    try {
      const success = await biometricService.authenticate('Unlock Auto Apply Pro');
      if (success) {
        const storedToken = await secureStore.getToken();
        const storedUser = await secureStore.getUser();
        if (storedToken && storedUser) {
          setToken(storedToken);
          setUser(storedUser);
          return true;
        }
      }
      return false;
    } catch (e) {
      console.error('Biometric authentication failed:', e);
      return false;
    }
  };

  return (
    <AuthContext.Provider value={{ token, user, isLoading, signIn, signUp, signOut, checkBiometrics }}>
      {children}
    </AuthContext.Provider>
  );
};
