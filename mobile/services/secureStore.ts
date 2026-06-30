import * as SecureStore from 'expo-secure-store';

const TOKEN_KEY = 'auto_apply_pro_jwt_token';
const USER_KEY = 'auto_apply_pro_user_info';

export const secureStore = {
  /**
   * Save the JWT token to secure storage.
   */
  async saveToken(token: string): Promise<void> {
    await SecureStore.setItemAsync(TOKEN_KEY, token);
  },

  /**
   * Retrieve the JWT token from secure storage.
   */
  async getToken(): Promise<string | null> {
    return await SecureStore.getItemAsync(TOKEN_KEY);
  },

  /**
   * Delete the JWT token from secure storage (logout).
   */
  async deleteToken(): Promise<void> {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
  },

  /**
   * Save serialized user profile details.
   */
  async saveUser(user: any): Promise<void> {
    await SecureStore.setItemAsync(USER_KEY, JSON.stringify(user));
  },

  /**
   * Retrieve stored user profile details.
   */
  async getUser(): Promise<any | null> {
    const userStr = await SecureStore.getItemAsync(USER_KEY);
    if (!userStr) return null;
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  },

  /**
   * Delete user profile details from secure storage.
   */
  async deleteUser(): Promise<void> {
    await SecureStore.deleteItemAsync(USER_KEY);
  },

  /**
   * Clear all authentication data.
   */
  async clearAuth(): Promise<void> {
    await Promise.all([
      SecureStore.deleteItemAsync(TOKEN_KEY),
      SecureStore.deleteItemAsync(USER_KEY),
    ]);
  }
};
