import { createContext, ReactNode, useContext } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchSiteSettings, SiteSettings } from "@/lib/api/site";

interface Ctx {
  settings: SiteSettings | null;
  loading: boolean;
  refresh: () => void;
}

const SiteCtx = createContext<Ctx | undefined>(undefined);

export function SiteSettingsProvider({ children }: { children: ReactNode }) {
  const { data, isLoading, refetch } = useQuery({
    queryKey: ["site_settings"],
    queryFn: fetchSiteSettings,
    staleTime: 60_000,
  });

  return (
    <SiteCtx.Provider value={{ settings: data ?? null, loading: isLoading, refresh: () => void refetch() }}>
      {children}
    </SiteCtx.Provider>
  );
}

export function useSiteSettings() {
  const c = useContext(SiteCtx);
  if (!c) throw new Error("useSiteSettings musí být uvnitř SiteSettingsProvider");
  return c;
}
