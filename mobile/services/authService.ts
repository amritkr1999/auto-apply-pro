import { api } from './api';
import { secureStore } from './secureStore';

export interface LoginResponse {
  token: string;
  id: number;
  email: string;
  name: string;
  mobile?: string;
  officialEmail?: string;
  role: string;
}

export const authService = {
  /**
   * Log in user with email and password
   */
  async login(email: string, password: string): Promise<LoginResponse> {
    const response = await api.post<LoginResponse>('/auth/login', {
      email,
      password,
    });
    
    const { token, ...userInfo } = response.data;
    if (token) {
      await secureStore.saveToken(token);
      await secureStore.saveUser(userInfo);
    }
    return response.data;
  },

  /**
   * Register a new candidate
   */
  async register(name: string, email: string, password: string): Promise<LoginResponse> {
    const response = await api.post<LoginResponse>('/auth/register', {
      name,
      email,
      password,
      role: 'CANDIDATE', // Default role for job seekers signing up on mobile
    });

    const { token, ...userInfo } = response.data;
    if (token) {
      await secureStore.saveToken(token);
      await secureStore.saveUser(userInfo);
    }
    return response.data;
  },

  /**
   * Exchange Google Sign-in ID Token for server session JWT
   */
  async loginWithGoogle(idToken: string): Promise<LoginResponse> {
    const response = await api.post<LoginResponse>('/auth/google', {
      idToken,
    });

    const { token, ...userInfo } = response.data;
    if (token) {
      await secureStore.saveToken(token);
      await secureStore.saveUser(userInfo);
    }
    return response.data;
  },

  /**
   * Exchange Apple Sign-in Identity Token for server session JWT
   */
  async loginWithApple(identityToken: string, name?: string): Promise<LoginResponse> {
    const response = await api.post<LoginResponse>('/auth/apple', {
      identityToken,
      name,
    });

    const { token, ...userInfo } = response.data;
    if (token) {
      await secureStore.saveToken(token);
      await secureStore.saveUser(userInfo);
    }
    return response.data;
  },

  /**
   * Logs out the user locally by clearing secure tokens.
   */
  async logout(): Promise<void> {
    await secureStore.clearAuth();
  }
};
