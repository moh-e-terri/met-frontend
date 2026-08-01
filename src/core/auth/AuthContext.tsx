import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useQueryClient } from "@tanstack/react-query";
import { isApiError } from "@/core/api/client";
import {
  patchMemorySession,
  refreshCurrentUser,
  signIn as signInService,
  signOut as signOutService,
  signUp as signUpService,
} from "./authService";
import {
  clearAuthToken,
  clearLegacyAuthStorage,
  onAuthTokenCleared,
} from "./tokenStorage";
import type { AuthSession, AuthSignUpPayload } from "./types";

interface AuthContextValue {
  session: AuthSession | null;
  isLoading: boolean;
  signIn: (identifier: string, password: string) => Promise<AuthSession>;
  signUp: (payload: AuthSignUpPayload) => Promise<AuthSession>;
  signOut: () => void;
  refreshSession: () => Promise<AuthSession | null>;
  /** Merge fields into the in-memory session (e.g. after uploading a profile photo). */
  patchSession: (partial: Partial<AuthSession>) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const queryClient = useQueryClient();
  const [session, setSession] = useState<AuthSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const resetCachedQueries = useCallback(() => {
    queryClient.clear();
  }, [queryClient]);

  useEffect(() => {
    let cancelled = false;
    clearLegacyAuthStorage();

    const bootstrap = async () => {
      try {
        return await refreshCurrentUser();
      } catch (error) {
        // Retry once for cold starts / transient network errors.
        if (isApiError(error) && error.status === 401) {
          throw error;
        }
        return await refreshCurrentUser();
      }
    };

    bootstrap()
      .then((nextSession) => {
        if (!cancelled) setSession(nextSession);
      })
      .catch((error) => {
        // Only wipe tokens when this effect is still active (avoids Strict Mode races).
        if (!cancelled && isApiError(error) && error.status === 401) {
          clearAuthToken();
        }
        if (!cancelled) setSession(null);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    return onAuthTokenCleared(() => {
      setSession(null);
      resetCachedQueries();
    });
  }, [resetCachedQueries]);

  const signIn = useCallback(
    async (identifier: string, password: string) => {
      resetCachedQueries();
      const nextSession = await signInService(identifier, password);
      setSession(nextSession);
      return nextSession;
    },
    [resetCachedQueries],
  );

  const signUp = useCallback(
    async (payload: AuthSignUpPayload) => {
      resetCachedQueries();
      const nextSession = await signUpService(payload);
      setSession(nextSession);
      return nextSession;
    },
    [resetCachedQueries],
  );

  const signOut = useCallback(() => {
    resetCachedQueries();
    void signOutService();
    setSession(null);
  }, [resetCachedQueries]);

  const refreshSession = useCallback(async () => {
    const nextSession = await refreshCurrentUser();
    setSession(nextSession);
    return nextSession;
  }, []);

  const patchSession = useCallback((partial: Partial<AuthSession>) => {
    const next = patchMemorySession(partial);
    if (next) setSession(next);
  }, []);

  const value = useMemo(
    () => ({
      session,
      isLoading,
      signIn,
      signUp,
      signOut,
      refreshSession,
      patchSession,
    }),
    [session, isLoading, signIn, signUp, signOut, refreshSession, patchSession],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};
