import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { ResultsView, type StoredResult } from "@/routes/results";

export const Route = createFileRoute("/_authenticated/report/$id")({
  head: () => ({
    meta: [
      { title: "דוח אבחון מלא | ניהול מצפן" },
      { name: "description", content: "צפייה בדוח האבחון המלא של משתמש." },
      { property: "og:title", content: "דוח אבחון מלא | ניהול מצפן" },
      { property: "og:description", content: "צפייה בדוח האבחון המלא של משתמש." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: Report,
});

function Report() {
  const { id } = Route.useParams();
  const q = useQuery({
    queryKey: ["report", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("diagnoses")
        .select("full_name, email, scores")
        .eq("id", id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const back = (
    <div className="mx-auto max-w-3xl px-4 pt-4 lg:max-w-5xl print:hidden">
      <Link to="/admin" className="inline-flex items-center gap-1 text-sm text-primary underline underline-offset-4">
        <ArrowRight className="h-4 w-4" /> חזרה לאזור הניהול
      </Link>
    </div>
  );

  if (q.isLoading) return <>{back}<p className="p-6 text-center text-muted-foreground">טוען דוח...</p></>;
  const profile = (q.data?.scores as { profile?: StoredResult["profile"] } | null)?.profile;
  if (!q.data || !profile)
    return (
      <>
        {back}
        <p className="glass mx-auto mt-6 max-w-3xl p-6 text-center text-sm text-muted-foreground">
          לאבחון הזה אין דוח מלא שמור — הוא בוצע לפני שהתחלנו לשמור את הדוח המלא. אבחונים חדשים יוצגו כאן במלואם.
        </p>
      </>
    );

  return (
    <>
      {back}
      <ResultsView admin result={{ profile, user: { name: q.data.full_name, email: q.data.email } }} />
    </>
  );
}
