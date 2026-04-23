import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { CheckCircle2, Circle, Loader2 } from "lucide-react";

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
  const [recoveryReady, setRecoveryReady] = useState<boolean | null>(null);
  const [recoveryError, setRecoveryError] = useState<string | null>(null);
  const resolvedValidRef = useRef(false);

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

  const strongPassword = passwordChecks.every((check) => check.ok);

  useEffect(() => {
    let isActive = true;

    const hasRecoveryParams = () => {
      const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ""));
      const searchParams = new URLSearchParams(window.location.search);

      return (
        hashParams.get("type") === "recovery" ||
        Boolean(hashParams.get("access_token")) ||
        searchParams.get("type") === "recovery" ||
        Boolean(searchParams.get("code"))
      );
    };

    const setValidity = (next: boolean, errorMessage?: string) => {
      if (!isActive) return;

      if (next) {
        resolvedValidRef.current = true;
        if (window.location.search || window.location.hash) {
          window.history.replaceState({}, document.title, "/reset-password");
        }
        setRecoveryError(null);
        setRecoveryReady(true);
        return;
      }

      setRecoveryReady((current) => (resolvedValidRef.current || current === true ? true : false));
      if (!resolvedValidRef.current) {
        setRecoveryError(errorMessage ?? "Odkaz pro reset hesla je neplatný nebo vypršel. Požádejte o nový.");
      }
    };

    const resolveRecoverySession = async () => {
      const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ""));
      const searchParams = new URLSearchParams(window.location.search);
      const accessToken = hashParams.get("access_token");
      const refreshToken = hashParams.get("refresh_token");
      const code = searchParams.get("code");
      const tokenHash = searchParams.get("token_hash") ?? hashParams.get("token_hash");
      const type = searchParams.get("type") ?? hashParams.get("type");

      if (accessToken && refreshToken) {
        const { error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });

        setValidity(!error, error?.message);
        if (!error) return;
      }

      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        setValidity(!error, error?.message);
        if (!error) return;
      }

      if (tokenHash && type === "recovery") {
        const { error } = await supabase.auth.verifyOtp({
          token_hash: tokenHash,
          type: "recovery",
        });
        setValidity(!error, error?.message);
        if (!error) return;
      }

      if (!hasRecoveryParams()) {
        const { data } = await supabase.auth.getSession();
        setValidity(!!data.session);
        return;
      }

      for (let attempt = 0; attempt < 8; attempt += 1) {
        const { data } = await supabase.auth.getSession();
        if (data.session) {
          setValidity(true);
          return;
        }

        await new Promise((resolve) => window.setTimeout(resolve, 500));
      }

      setValidity(false);
    };

    const { data: subscription } = supabase.auth.onAuthStateChange((event, session) => {
      if (
        event === "PASSWORD_RECOVERY" ||
        event === "SIGNED_IN" ||
        event === "INITIAL_SESSION"
      ) {
        setValidity(!!session);
        return;
      }
    });

    resolveRecoverySession();

    return () => {
      isActive = false;
      subscription.subscription.unsubscribe();
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse({ password, confirm });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0].message);
      return;
    }
    if (!strongPassword) {
      toast.error("Zvolte silnější heslo podle uvedených pravidel");
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

  return (
    <div className="container flex min-h-[calc(100vh-4rem)] items-center justify-center py-12">
      <Card className="w-full max-w-md shadow-soft">
        <CardHeader className="space-y-2 text-center">
          <CardTitle className="font-display text-2xl">Nové heslo</CardTitle>
          <CardDescription>Zadejte si prosím nové heslo</CardDescription>
        </CardHeader>
        <CardContent>
          {recoveryReady === null ? (
            <div className="flex justify-center py-6">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {recoveryReady === false ? (
                <div className="rounded-md border border-input bg-muted/30 p-3 text-sm text-muted-foreground">
                  {recoveryError ?? "Recovery relace zatím není aktivní. Otevřete prosím nejnovější odkaz z e-mailu."}
                </div>
              ) : null}
              <div className="space-y-2">
                <Label htmlFor="password">Nové heslo</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="new-password"
                  required
                />
              </div>
              <div className="space-y-2 rounded-md border border-input bg-muted/20 p-3">
                <p className="text-sm font-medium">Síla hesla</p>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  {passwordChecks.map((check) => (
                    <li key={check.label} className="flex items-center gap-2">
                      {check.ok ? <CheckCircle2 className="h-4 w-4 text-primary" /> : <Circle className="h-4 w-4" />}
                      <span>{check.label}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm">Heslo znovu</Label>
                <Input
                  id="confirm"
                  type="password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  autoComplete="new-password"
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading || recoveryReady !== true || !strongPassword}>
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Nastavit nové heslo
              </Button>
            </form>
          )}
          {recoveryReady === false ? (
            <Button asChild variant="outline" className="mt-4 w-full">
              <Link to="/zapomenute-heslo">Požádat o nový odkaz</Link>
            </Button>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
