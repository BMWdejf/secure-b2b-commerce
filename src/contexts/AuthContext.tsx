import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

type ProfileStatus = "pending" | "approved" | "blocked";
type AppRole = "admin" | "client";

interface ProfileInfo {
  id: string;
  full_name: string;
  status: ProfileStatus;
  company_id: string | null;
}

interface AuthContextValue {
  user: User | null;
  session: Session | null;
  profile: ProfileInfo | null;
  roles: AppRole[];
  isAdmin: boolean;
  isApproved: boolean;
  loading: boolean;
  refreshProfile: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<ProfileInfo | null>(null);
  const [roles, setRoles] = useState<AppRole[]>([]);
  const [loading, setLoading] = useState(true);

  const loadProfileAndRoles = async (userId: string) => {
    const [profileRes, rolesRes] = await Promise.all([
      supabase.from("profiles").select("id, full_name, status, company_id").eq("id", userId).maybeSingle(),
      supabase.from("user_roles").select("role").eq("user_id", userId),
    ]);

    if (profileRes.data) {
      setProfile(profileRes.data as ProfileInfo);
    } else {
      setProfile(null);
    }
    if (rolesRes.data) {
      setRoles(rolesRes.data.map((r: { role: AppRole }) => r.role));
    } else {
      setRoles([]);
    }
  };

  useEffect(() => {
    // 1) Listener PRVNÍ — kvůli race conditions
    const { data: subscription } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      setUser(newSession?.user ?? null);
      if (newSession?.user) {
        // Defer DB volání mimo callback
        setTimeout(() => {
          loadProfileAndRoles(newSession.user.id);
        }, 0);
      } else {
        setProfile(null);
        setRoles([]);
      }
    });

    // 2) Pak existující session
    supabase.auth.getSession().then(({ data: { session: existing } }) => {
      setSession(existing);
      setUser(existing?.user ?? null);
      if (existing?.user) {
        loadProfileAndRoles(existing.user.id).finally(() => setLoading(false));
      } else {
        setLoading(false);
      }
    });

    return () => {
      subscription.subscription.unsubscribe();
    };
  }, []);

  const refreshProfile = async () => {
    if (user) await loadProfileAndRoles(user.id);
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setProfile(null);
    setRoles([]);
  };

  const isAdmin = roles.includes("admin");
  const isApproved = profile?.status === "approved";

  return (
    <AuthContext.Provider
      value={{ user, session, profile, roles, isAdmin, isApproved, loading, refreshProfile, signOut }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth musí být uvnitř AuthProvider");
  return ctx;
}
