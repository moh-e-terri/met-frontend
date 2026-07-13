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
import {
  getSession,
  refreshCurrentUser,
  signIn as signInService,
  signOut as signOutService,
  signUp as signUpService,
} from "./authService";
import type { AuthSession, AuthSignUpPayload } from "./types";

interface AuthContextValue {
  session: AuthSession | null;
  isLoading: boolean;
  signIn: (identifier: string, password: string) => Promise<AuthSession>;
  signUp: (payload: AuthSignUpPayload) => Promise<AuthSession>;
  signOut: () => void;
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
    let isMounted = true;

    refreshCurrentUser()
      .then((nextSession) => {
        if (isMounted) setSession(nextSession ?? getSession());
      })
      .catch(() => {
        if (isMounted) setSession(getSession());
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const signIn = useCallback(async (identifier: string, password: string) => {
    resetCachedQueries();
    const nextSession = await signInService(identifier, password);
    setSession(nextSession);
    return nextSession;
  }, [resetCachedQueries]);

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

  const value = useMemo(
    () => ({ session, isLoading, signIn, signUp, signOut }),
    [session, isLoading, signIn, signUp, signOut],
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
