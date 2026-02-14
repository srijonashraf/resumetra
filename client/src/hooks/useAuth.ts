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
  /** Current authenticated user, null if not logged in */
  user: AppUser | null;
  /** JWT token issued by the backend */
  token: string | null;
  /** True if user is authenticated, false if not, null if still loading */
  isLoggedIn: boolean | null;
  /** True while checking initial auth state */
  isLoading: boolean;
  /** Login with a Google ID token obtained from the frontend SDK */
  loginWithGoogle: (idToken: string) => Promise<void>;
  /** Sign out the current user */
  logout: () => Promise<void>;
}

const TOKEN_STORAGE_KEY = "resume_radar_token";
const USER_STORAGE_KEY = "resume_radar_user";

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
    if (typeof window === "undefined") {
      setIsLoading(false);
      return;
    }

    const storedToken = window.localStorage.getItem(TOKEN_STORAGE_KEY);
    const storedUser = window.localStorage.getItem(USER_STORAGE_KEY);

    if (storedToken && storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser) as AppUser;
        setToken(storedToken);
        setUser(parsedUser);
      } catch {
        window.localStorage.removeItem(TOKEN_STORAGE_KEY);
        window.localStorage.removeItem(USER_STORAGE_KEY);
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

    if (typeof window !== "undefined") {
      window.localStorage.setItem(TOKEN_STORAGE_KEY, result.token);
      window.localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(appUser));
    }

    setToken(result.token);
    setUser(appUser);
  }, []);

  const logout = useCallback(async () => {
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(TOKEN_STORAGE_KEY);
      window.localStorage.removeItem(USER_STORAGE_KEY);
    }
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
