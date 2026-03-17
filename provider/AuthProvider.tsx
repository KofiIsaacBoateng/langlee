import { AuthContext } from "@/context/AuthContext";
import { supabase } from "@/utils/supabase";
import { Session } from "@supabase/supabase-js";
import { PropsWithChildren, useEffect, useState } from "react";

export const AuthProvider = ({ children }: PropsWithChildren) => {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<any | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isAppReady, setIsAppReady] = useState<boolean>(false);

  const premiumExpiresAt: string | null =
    profile?.is_premium?.expiresAt ?? null;
  const isPremium =
    !!profile?.is_premium &&
    (!premiumExpiresAt || new Date(premiumExpiresAt) > new Date());

  const loadProfile = async (s: Session | null) => {
    if (!s) {
      setProfile(null);
      return;
    }

    const { error, data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", s.user.id)
      .maybeSingle();

    setProfile(error ? null : data);
  };

  const refreshProfile = () => loadProfile(session);

  useEffect(() => {
    const init = async (s: Session | null) => {
      setLoading(true);
      const initialSession =
        s ?? (await supabase.auth.getSession()).data?.session ?? null;
      setSession(initialSession);
      await loadProfile(initialSession);
      setLoading(false);
    };

    init(null).finally(() => setIsAppReady(true));

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_e, newSession) => init(newSession));

    return () => subscription.unsubscribe();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        session,
        profile,
        user: profile?.user,
        loading,
        premiumExpiresAt,
        isPremium,
        isAdmin: false,
        isAppReady,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
