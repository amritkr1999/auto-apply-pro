import React, { createContext, useContext, useState, useEffect } from "react";
import { isTokenExpired } from "../services/apiClient";

export interface User {
  id: number;
  name: string;
  email: string;
  role?: string;
  token?: string;
  avatar?: string;
  mobile?: string;
  loginStreak?: number;
  isTrialActive?: boolean;
  trialDaysRemaining?: number;
  trialEndAt?: string;
  trialTier?: string;
  trialUsed?: boolean;
  [key: string]: any;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (userData: User, rememberMe?: boolean) => void;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

const getInitialAuthState = (): { user: User | null; token: string | null } => {
  try {
    const storedUserStr = localStorage.getItem("user") || sessionStorage.getItem("user");
    if (storedUserStr) {
      const parsedUser = JSON.parse(storedUserStr);
      if (parsedUser && typeof parsedUser === "object" && parsedUser.id) {
        if (parsedUser.token && isTokenExpired(parsedUser.token)) {
          console.warn("Stored JWT token has expired. Clearing session.");
          localStorage.removeItem("user");
          sessionStorage.removeItem("user");
          return { user: null, token: null };
        }
        return {
          user: parsedUser,
          token: parsedUser.token || null,
        };
      }
    }
  } catch (err) {
    console.error("Failed to parse stored user session on mount:", err);
    localStorage.removeItem("user");
    sessionStorage.removeItem("user");
  }
  return { user: null, token: null };
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [initialSession] = useState(getInitialAuthState);
  const [user, setUser] = useState<User | null>(initialSession.user);
  const [token, setToken] = useState<string | null>(initialSession.token);
  const [isLoading] = useState<boolean>(false);

  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "user") {
        if (e.newValue) {
          try {
            const parsed = JSON.parse(e.newValue);
            if (parsed.token && isTokenExpired(parsed.token)) {
              setUser(null);
              setToken(null);
            } else {
              setUser(parsed);
              setToken(parsed.token || null);
            }
          } catch {
            setUser(null);
            setToken(null);
          }
        } else {
          setUser(null);
          setToken(null);
        }
      }
    };

    const handleUnauthorized = () => {
      logout();
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("auth:session-expired", handleUnauthorized);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("auth:session-expired", handleUnauthorized);
    };
  }, []);

  const login = (userData: User, rememberMe: boolean = false) => {
    localStorage.setItem("user", JSON.stringify(userData));
    if (userData.token) {
      localStorage.setItem("token", userData.token);
    }
    if (rememberMe) {
      sessionStorage.setItem("user", JSON.stringify(userData));
    }
    setUser(userData);
    setToken(userData.token || null);
  };

  const logout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    sessionStorage.removeItem("user");
    setUser(null);
    setToken(null);
  };

  const updateUser = (updatedFields: Partial<User>) => {
    setUser((prev) => {
      if (!prev) return null;
      const updated = { ...prev, ...updatedFields };
      localStorage.setItem("user", JSON.stringify(updated));
      if (updated.token) {
        localStorage.setItem("token", updated.token);
      }
      if (sessionStorage.getItem("user")) {
        sessionStorage.setItem("user", JSON.stringify(updated));
      }
      return updated;
    });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthenticated: !!user,
        login,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

