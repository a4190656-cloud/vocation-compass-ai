import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface SiteSettings {
  min_public_rating: number;
  show_reviews: boolean;
  announcement: string;
}

export const DEFAULT_SETTINGS: SiteSettings = {
  min_public_rating: 4,
  show_reviews: true,
  announcement: "",
};

export async function fetchSiteSettings(): Promise<SiteSettings> {
  const { data, error } = await supabase.from("site_settings").select("key, value");
  if (error || !data) return DEFAULT_SETTINGS;
  const out: SiteSettings = { ...DEFAULT_SETTINGS };
  for (const row of data) {
    if (row.key === "min_public_rating") out.min_public_rating = Number(row.value) || 1;
    if (row.key === "show_reviews") out.show_reviews = row.value !== false;
    if (row.key === "announcement") out.announcement = String(row.value ?? "");
  }
  return out;
}

export function useSiteSettings() {
  return useQuery({ queryKey: ["site-settings"], queryFn: fetchSiteSettings });
}
