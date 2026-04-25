import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

export default function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    const search = window.location.search;
    const hash = window.location.hash;
    const params = new URLSearchParams(search);
    const next = params.get("next") || "/reset-password";
    const safeNext = next.startsWith("/") ? next : "/reset-password";
    // Forward query+hash so ResetPassword can establish the session itself
    const cleanedSearch = new URLSearchParams(search);
    cleanedSearch.delete("next");
    const qs = cleanedSearch.toString();
    const target = `${safeNext}${qs ? `?${qs}` : ""}${hash}`;
    navigate(target, { replace: true });
  }, [navigate]);

  return (
    <div className="container flex min-h-[calc(100vh-4rem)] items-center justify-center py-12">
      <Card className="w-full max-w-md shadow-soft">
        <CardHeader className="space-y-2 text-center">
          <CardTitle className="font-display text-2xl">Otevírám…</CardTitle>
          <CardDescription>Přesměrovávám vás na bezpečnou změnu hesla.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center py-6">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
