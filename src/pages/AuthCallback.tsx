import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const PASSWORD_RECOVERY_STORAGE_KEY = "password-recovery-ready";

export default function AuthCallback() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const startedRef = useRef(false);

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;

    const finalize = async () => {
      const searchParams = new URLSearchParams(window.location.search);
      const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ""));

      const code = searchParams.get("code");
      const tokenHash = searchParams.get("token_hash") ?? hashParams.get("token_hash");
      const type = searchParams.get("type") ?? hashParams.get("type");
      const accessToken = hashParams.get("access_token");
      const refreshToken = hashParams.get("refresh_token");
      const next = searchParams.get("next") || "/";
      const safeNext = next.startsWith("/") ? next : "/";

      let sessionError: string | null = null;

      if (code) {
        const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
        if (exchangeError) sessionError = exchangeError.message;
      } else if (tokenHash && type) {
        const { error: verifyError } = await supabase.auth.verifyOtp({
          token_hash: tokenHash,
          type: type as "recovery" | "email_change" | "signup" | "invite" | "email",
        });
        if (verifyError) sessionError = verifyError.message;
      } else if (accessToken && refreshToken) {
        const { error: setSessionError } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });
        if (setSessionError) sessionError = setSessionError.message;
      }

      for (let attempt = 0; attempt < 12; attempt += 1) {
        const { data } = await supabase.auth.getSession();
        if (data.session) {
          if (type === "recovery" || safeNext === "/reset-password") {
            window.sessionStorage.setItem(PASSWORD_RECOVERY_STORAGE_KEY, "1");
          }
          navigate(safeNext, { replace: true });
          return;
        }

        await new Promise((resolve) => window.setTimeout(resolve, 250));
      }

      setError(sessionError ?? "Nepodařilo se ověřit odkaz. Požádejte prosím o nový.");
    };

    void finalize();
  }, [navigate]);

  return (
    <div className="container flex min-h-[calc(100vh-4rem)] items-center justify-center py-12">
      <Card className="w-full max-w-md shadow-soft">
        <CardHeader className="space-y-2 text-center">
          <CardTitle className="font-display text-2xl">Ověřuji odkaz</CardTitle>
          <CardDescription>
            {error ? "Odkaz se nepodařilo potvrdit." : "Chvíli strpení, připravuji bezpečnou změnu hesla."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error ? (
            <div className="space-y-4">
              <div className="rounded-md border border-input bg-muted/30 p-3 text-sm text-muted-foreground">
                {error}
              </div>
              <Button asChild className="w-full">
                <Link to="/zapomenute-heslo">Požádat o nový odkaz</Link>
              </Button>
            </div>
          ) : (
            <div className="flex justify-center py-6">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}