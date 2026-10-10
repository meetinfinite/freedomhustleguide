import type { Session } from "@supabase/supabase-js";
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { supabase } from "./supabase";
import { registerMe } from "./api";

interface AuthState {
  session: Session | null;
  /** True until the stored session has been read from disk. */
  loading: boolean;
}

const AuthContext = createContext<AuthState>({ session: null, loading: true });

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({ session: null, loading: true });

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setState({ session: data.session, loading: false });
    });
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      setState({ session, loading: false });
      // First sign-in on this device: make sure the website has a member
      // record for them (and Slack hears about new sign-ups).
      if (event === "SIGNED_IN" && session) registerMe().catch(() => {});
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  return <AuthContext.Provider value={state}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}

/** Display name captured at sign-up (stored in Supabase user metadata). */
export function useFirstName(): string | null {
  const { session } = useAuth();
  const name = session?.user.user_metadata?.name;
  return typeof name === "string" && name.trim() ? name.trim().split(/\s+/)[0] : null;
}
