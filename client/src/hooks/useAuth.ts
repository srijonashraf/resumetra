import { useState, useEffect, useCallback } from "react";
import { googleLogin } from "../services/api";

export interface AppUser {
  id: string;
  email: string | null;
  name: string | null;
  picture: string | null;
}

/**
 * Auth state interface returned by the useAuth hook
 */
interface AuthState {
  user: AppUser | null;
  token: string | null;
  isLoggedIn: boolean | null;
  isLoading: boolean;
  loginWithGoogle: (idToken: string) => Promise<void>;
  logout: () => Promise<void>;
}

const TOKEN_STORAGE_KEY = "resumetra_token";
const USER_STORAGE_KEY = "resumetra_user";

/**
 * Custom hook for managing authentication state.
 * Centralizes auth logic to avoid repetition across components.
 */
export const useAuth = (): AuthState => {
  const [user, setUser] = useState<AppUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load auth state from localStorage on mount
  useEffect(() => {
    const storedToken = localStorage.getItem(TOKEN_STORAGE_KEY);
    const storedUser = localStorage.getItem(USER_STORAGE_KEY);

    if (storedToken && storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser) as AppUser;
        setToken(storedToken);
        setUser(parsedUser);
      } catch {
        localStorage.removeItem(TOKEN_STORAGE_KEY);
        localStorage.removeItem(USER_STORAGE_KEY);
      }
    }

    setIsLoading(false);
  }, []);

  const loginWithGoogle = useCallback(async (idToken: string) => {
    const result = await googleLogin(idToken);

    const appUser: AppUser = {
      id: result.user.id,
      email: result.user.email,
      name: result.user.name,
      picture: result.user.picture,
    };

    localStorage.setItem(TOKEN_STORAGE_KEY, result.token);
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(appUser));

    setToken(result.token);
    setUser(appUser);
  }, []);

  const logout = useCallback(async () => {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    localStorage.removeItem(USER_STORAGE_KEY);

    setToken(null);
    setUser(null);
  }, []);

  return {
    user,
    token,
    isLoggedIn: isLoading ? null : !!user,
    isLoading,
    loginWithGoogle,
    logout,
  };
};

export default useAuth;
