import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { AlertCircle, CheckCircle2, Circle, Loader2 } from "lucide-react";

const schema = z
  .object({
    password: z.string().min(8, "Heslo musí mít alespoň 8 znaků").max(72),
    confirm: z.string(),
  })
  .refine((d) => d.password === d.confirm, { message: "Hesla se neshodují", path: ["confirm"] });

export default function ResetPassword() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [hasSession, setHasSession] = useState<boolean | null>(null);

  const passwordChecks = useMemo(
    () => [
      { label: "alespoň 8 znaků", ok: password.length >= 8 },
      { label: "velké písmeno", ok: /[A-ZÁČĎÉĚÍŇÓŘŠŤÚŮÝŽ]/.test(password) },
      { label: "malé písmeno", ok: /[a-záčďéěíňóřšťúůýž]/.test(password) },
      { label: "číslo", ok: /\d/.test(password) },
      { label: "speciální znak", ok: /[^A-Za-z0-9]/.test(password) },
    ],
    [password],
  );

  const strongPassword = passwordChecks.every((c) => c.ok);
  const passwordsMatch = confirm.length > 0 && password === confirm;

  useEffect(() => {
    let cancelled = false;
    let resolved = false;

    const markReady = () => {
      if (cancelled || resolved) return;
      resolved = true;
      setHasSession(true);
      // Vyčisti URL od recovery tokenů
      if (window.location.search || window.location.hash) {
        window.history.replaceState({}, "", "/reset-password");
      }
    };

    // Posluchač – Supabase při zachycení recovery tokenu z URL emituje PASSWORD_RECOVERY
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY" || (session && (event === "SIGNED_IN" || event === "INITIAL_SESSION" || event === "TOKEN_REFRESHED"))) {
        markReady();
      }
    });

    // Nejdřív se podívej, jestli už session existuje
    void supabase.auth.getSession().then(({ data }) => {
      if (data.session) markReady();
    });

    // Fallback: pokud po 1500 ms není session ani PASSWORD_RECOVERY,
    // zkus token z URL ručně (starší linky / token_hash)
    const fallbackTimer = window.setTimeout(async () => {
      if (resolved || cancelled) return;

      const url = new URL(window.location.href);
      const code = url.searchParams.get("code");
      const tokenHash = url.searchParams.get("token_hash");
      const type = url.searchParams.get("type");
      const hash = new URLSearchParams(window.location.hash.replace(/^#/, ""));
      const at = hash.get("access_token");
      const rt = hash.get("refresh_token");

      let ok = false;

      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (!error) ok = true;
      } else if (tokenHash && (type === "recovery" || !type)) {
        const { error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type: "recovery" });
        if (!error) ok = true;
      } else if (at && rt) {
        const { error } = await supabase.auth.setSession({ access_token: at, refresh_token: rt });
        if (!error) ok = true;
      }

      if (ok) {
        markReady();
        return;
      }

      // Zkontroluj ještě jednou session (mohl ji nastavit listener mezitím)
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        markReady();
        return;
      }

      if (!cancelled && !resolved) {
        setHasSession(false);
      }
    }, 1500);

    return () => {
      cancelled = true;
      window.clearTimeout(fallbackTimer);
      sub.subscription.unsubscribe();
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse({ password, confirm });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0].message);
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password: parsed.data.password });
    setLoading(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Heslo bylo změněno. Můžete se přihlásit.");
    await supabase.auth.signOut();
    navigate("/prihlaseni", { replace: true });
  };

  const canSubmit = hasSession === true && strongPassword && passwordsMatch && !loading;

  return (
    <div className="container flex min-h-[calc(100vh-4rem)] items-center justify-center py-12">
      <Card className="w-full max-w-md shadow-soft">
        <CardHeader className="space-y-2 text-center">
          <CardTitle className="font-display text-2xl">Nové heslo</CardTitle>
          <CardDescription>Zadejte si prosím nové heslo</CardDescription>
        </CardHeader>
        <CardContent>
          {hasSession === null ? (
            <div className="flex justify-center py-6">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : hasSession === false ? (
            <div className="space-y-4">
              <div className="rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
                Odkaz pro reset hesla je neplatný nebo vypršel. Požádejte o nový.
              </div>
              <Button asChild className="w-full">
                <Link to="/zapomenute-heslo">Požádat o nový odkaz</Link>
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password">Nové heslo</Label>
                <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="new-password" required />
              </div>

              <div className="space-y-2 rounded-md border border-input bg-muted/20 p-3">
                <p className="text-sm font-medium">Síla hesla</p>
                <ul className="space-y-2 text-sm">
                  {passwordChecks.map((check) => (
                    <li key={check.label} className={check.ok ? "flex items-center gap-2 text-success" : "flex items-center gap-2 text-muted-foreground"}>
                      {check.ok ? <CheckCircle2 className="h-4 w-4 text-success" /> : <Circle className="h-4 w-4" />}
                      <span>{check.label}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirm">Heslo znovu</Label>
                <Input id="confirm" type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} autoComplete="new-password" required />
                {confirm.length > 0 && (
                  <div className={passwordsMatch ? "flex items-center gap-2 text-sm text-success" : "flex items-center gap-2 text-sm text-destructive"}>
                    {passwordsMatch ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                    <span>{passwordsMatch ? "Hesla se shodují" : "Hesla se neshodují"}</span>
                  </div>
                )}
              </div>

              <Button type="submit" className="w-full" disabled={!canSubmit}>
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Nastavit nové heslo
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
