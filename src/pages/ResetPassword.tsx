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

const PASSWORD_RECOVERY_STORAGE_KEY = "password-recovery-ready";

export default function ResetPassword() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [recoveryReady, setRecoveryReady] = useState<boolean | null>(null);
  const [recoveryError, setRecoveryError] = useState<string | null>(null);

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
  const passwordsMatch = confirm.length > 0 && password === confirm;

  useEffect(() => {
    let active = true;

    const resolve = async () => {
      const searchParams = new URLSearchParams(window.location.search);
      const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ""));
      const code = searchParams.get("code");
      const tokenHash = searchParams.get("token_hash") ?? hashParams.get("token_hash");
      const type = searchParams.get("type") ?? hashParams.get("type");
      const accessToken = hashParams.get("access_token");
      const refreshToken = hashParams.get("refresh_token");

      let recoveryFlag = window.sessionStorage.getItem(PASSWORD_RECOVERY_STORAGE_KEY) === "1";

      if (!recoveryFlag) {
        let directRecoveryOk = false;

        if (code) {
          const { error } = await supabase.auth.exchangeCodeForSession(code);
          directRecoveryOk = !error;
        } else if (tokenHash && type === "recovery") {
          const { error } = await supabase.auth.verifyOtp({
            token_hash: tokenHash,
            type: "recovery",
          });
          directRecoveryOk = !error;
        } else if (accessToken && refreshToken) {
          const { error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });
          directRecoveryOk = !error;
        }

        if (directRecoveryOk) {
          window.sessionStorage.setItem(PASSWORD_RECOVERY_STORAGE_KEY, "1");
          recoveryFlag = true;
          if (window.location.search || window.location.hash) {
            window.history.replaceState({}, document.title, "/reset-password");
          }
        }
      }

      for (let attempt = 0; attempt < 12; attempt += 1) {
        const { data } = await supabase.auth.getSession();
        if (!active) return;

        if (recoveryFlag && data.session) {
          setRecoveryError(null);
          setRecoveryReady(true);
          return;
        }

        await new Promise((resolveAttempt) => window.setTimeout(resolveAttempt, 250));
      }

      if (!active) return;
      setRecoveryReady(false);
      setRecoveryError("Resetovací odkaz není aktivní. Otevřete prosím nejnovější odkaz z e-mailu.");
    };

    const { data: subscription } = supabase.auth.onAuthStateChange((event, session) => {
      const recoveryFlag = window.sessionStorage.getItem(PASSWORD_RECOVERY_STORAGE_KEY) === "1";
      if ((recoveryFlag || event === "PASSWORD_RECOVERY") && session) {
        window.sessionStorage.setItem(PASSWORD_RECOVERY_STORAGE_KEY, "1");
        setRecoveryError(null);
        setRecoveryReady(true);
      }
    });

    void resolve();

    return () => {
      active = false;
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

    if (!passwordsMatch) {
      toast.error("Obě hesla se musí shodovat");
      return;
    }

    setLoading(true);

    const recoveryFlag = window.sessionStorage.getItem(PASSWORD_RECOVERY_STORAGE_KEY) === "1";
    const { data: sessionData } = await supabase.auth.getSession();

    if (!recoveryFlag || !sessionData.session) {
      setLoading(false);
      setRecoveryReady(false);
      setRecoveryError("Nepodařilo se ověřit resetovací odkaz. Požádejte prosím o nový.");
      toast.error("Resetovací odkaz už není platný. Požádejte o nový.");
      return;
    }

    const { error } = await supabase.auth.updateUser({ password: parsed.data.password });
    setLoading(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    window.sessionStorage.removeItem(PASSWORD_RECOVERY_STORAGE_KEY);
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
                <ul className="space-y-2 text-sm">
                  {passwordChecks.map((check) => (
                    <li
                      key={check.label}
                      className={check.ok ? "flex items-center gap-2 text-success" : "flex items-center gap-2 text-muted-foreground"}
                    >
                      {check.ok ? <CheckCircle2 className="h-4 w-4 text-success" /> : <Circle className="h-4 w-4" />}
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
                {confirm.length > 0 ? (
                  <div className={passwordsMatch ? "flex items-center gap-2 text-sm text-success" : "flex items-center gap-2 text-sm text-destructive"}>
                    {passwordsMatch ? <CheckCircle2 className="h-4 w-4 text-success" /> : <AlertCircle className="h-4 w-4 text-destructive" />}
                    <span>{passwordsMatch ? "Hesla se shodují" : "Hesla se neshodují"}</span>
                  </div>
                ) : null}
              </div>
              <Button type="submit" className="w-full" disabled={loading || recoveryReady !== true || !strongPassword || !passwordsMatch}>
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
