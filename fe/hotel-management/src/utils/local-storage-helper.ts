// localStorageHelper.ts

const TOKEN_KEY = "token";
const USER_KEY = "user";

export const localStorageHelper = {
  // Save token and user
  setAuthData: (accessToken: string, user: any): void => {
    localStorage.setItem(TOKEN_KEY, accessToken);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  },

  // Get token
  getToken: (): string | null => {
    return localStorage.getItem(TOKEN_KEY);
  },

  // Get user (parsed object)
  getUser: <T = any>(): T | null => {
    const data = localStorage.getItem(USER_KEY);
    return data ? (JSON.parse(data) as T) : null;
  },

  // Remove only auth data
  clearAuthData: (): void => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },

  // Clear all localStorage (use with caution)
  clearAll: (): void => {
    localStorage.clear();
  },
};
