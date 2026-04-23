import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

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
  const [validLink, setValidLink] = useState<boolean | null>(null);

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

    const setValidity = (next: boolean) => {
      if (isActive) setValidLink(next);
    };

    const resolveRecoverySession = async () => {
      const searchParams = new URLSearchParams(window.location.search);
      const code = searchParams.get("code");

      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        setValidity(!error);
        return;
      }

      const { data } = await supabase.auth.getSession();
      if (data.session) {
        setValidity(true);
        return;
      }

      if (!hasRecoveryParams()) {
        setValidity(false);
        return;
      }

      window.setTimeout(async () => {
        const { data: delayedData } = await supabase.auth.getSession();
        setValidity(!!delayedData.session);
      }, 400);
    };

    const { data: subscription } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY" || (event === "SIGNED_IN" && !!session)) {
        setValidity(true);
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
          {validLink === null ? (
            <div className="flex justify-center py-6">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : validLink === false ? (
            <p className="text-center text-sm text-muted-foreground">
              Odkaz pro reset hesla je neplatný nebo vypršel. Požádejte o nový.
            </p>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password">Nové heslo</Label>
                <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm">Heslo znovu</Label>
                <Input id="confirm" type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} required />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Nastavit nové heslo
              </Button>
            </form>
          )}
          {validLink === false ? (
            <Button asChild variant="outline" className="mt-4 w-full">
              <Link to="/zapomenute-heslo">Požádat o nový odkaz</Link>
            </Button>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
