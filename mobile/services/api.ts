import axios from 'axios';
import Constants from 'expo-constants';
import { secureStore } from './secureStore';

// Expo's hostUri helps us resolve the local development machine IP dynamically
const debuggerHost = Constants.expoConfig?.hostUri;
const localIp = debuggerHost ? debuggerHost.split(':')[0] : 'localhost';

export const API_BASE_URL = __DEV__
  ? `http://${localIp}:8060`
  : 'https://api.autoapplypro.com'; // Fallback production API endpoint

console.log('[API] Backend URL set to:', API_BASE_URL);

export const api = axios.create({
  baseURL: `${API_BASE_URL}/api/v1`,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Automatically inject JWT Bearer Token into headers
api.interceptors.request.use(
  async (config) => {
    const token = await secureStore.getToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);
