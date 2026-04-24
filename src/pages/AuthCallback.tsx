import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import {
  cleanupRecoveryUrl,
  establishRecoverySession,
  getRecoveryPayloadFromUrl,
  storeRecoveryPayload,
} from "@/lib/auth/passwordRecovery";

export default function AuthCallback() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const startedRef = useRef(false);

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;

    const finalize = async () => {
      const searchParams = new URLSearchParams(window.location.search);
      const next = searchParams.get("next") || "/";
      const safeNext = next.startsWith("/") ? next : "/";

      const payload = getRecoveryPayloadFromUrl();
      storeRecoveryPayload(payload);

      const result = await establishRecoverySession(payload);

      if (result.ok) {
        cleanupRecoveryUrl(safeNext);
        window.setTimeout(() => {
          navigate(safeNext, { replace: true });
        }, 1000);
        return;
      }

      setTimeout(() => {
        navigate("/reset-password", { replace: true });
      }, 1000);
      setError("Nepodařilo se ověřit odkaz automaticky. Zkouším otevřít formulář pro změnu hesla.");
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