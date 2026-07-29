/**
 * AuthContext — holds the authenticated session for the mobile app and
 * exposes signup / login / logout helpers wired to the Node backend.
 */
import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { tokenStore } from "../services/tokenStore";
import {
  login as apiLogin,
  logout as apiLogout,
  signup as apiSignup,
  getProfile,
  SessionUser,
  Profile,
} from "../services/kudiApi";

interface AuthState {
  loading: boolean;
  user: SessionUser | null;
  profile: Profile | null;
}

interface AuthContextValue extends AuthState {
  signIn: (phone: string, password: string) => Promise<SessionUser>;
  register: (input: {
    email: string;
    password: string;
    phone: string;
    full_name: string;
    preferred_language?: string;
  }) => Promise<{ message: string }>;

  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    loading: true,
    user: null,
    profile: null,
  });

  // On boot, try to restore a session from a stored token.
  useEffect(() => {
    (async () => {
      const token = await tokenStore.getAccessToken();
      if (!token) {
        setState((s) => ({ ...s, loading: false }));
        return;
      }
      try {
        const { profile } = await getProfile();
        setState({
          loading: false,
          profile,
          user: {
            id: profile.id,
            phone: profile.phone || "",
            full_name: profile.full_name,
            role: profile.role,
            approval_status: profile.approval_status,
            kyc_tier: profile.kyc_tier,
          },
        });
      } catch {
        await tokenStore.clear();
        setState({ loading: false, user: null, profile: null });
      }
    })();
  }, []);

  const signIn = useCallback(async (phone: string, password: string) => {
    const user = await apiLogin(phone, password);
    let profile: Profile | null = null;
    try {
      profile = (await getProfile()).profile;
    } catch {
      /* non-fatal */
    }
    setState({ loading: false, user, profile });
    return user;
  }, []);

  const register = useCallback(
    async (input: {
      email: string;
      password: string;
      phone: string;
      full_name: string;
      preferred_language?: string;
    }) => {
      const res = await apiSignup(input);
      return { message: res.message };
    },
    [],
  );

  const signOut = useCallback(async () => {
    await apiLogout();
    setState({ loading: false, user: null, profile: null });
  }, []);

  const refreshProfile = useCallback(async () => {
    const { profile } = await getProfile();
    setState((s) => ({ ...s, profile }));
  }, []);

  return (
    <AuthContext.Provider
      value={{ ...state, signIn, register, signOut, refreshProfile }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
