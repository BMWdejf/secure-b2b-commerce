import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

const loginSchema = z.object({
  email: z.string().trim().email({ message: "Neplatný e-mail" }).max(255),
  password: z.string().min(6, { message: "Heslo musí mít alespoň 6 znaků" }).max(72),
});

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const from = (location.state as { from?: string })?.from || "/ucet";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = loginSchema.safeParse({ email, password });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0].message);
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: parsed.data.email,
      password: parsed.data.password,
    });
    setLoading(false);

    if (error) {
      if (error.message.toLowerCase().includes("invalid")) {
        toast.error("Nesprávný e-mail nebo heslo");
      } else {
        toast.error(error.message);
      }
      return;
    }

    toast.success("Přihlášeno");
    navigate(from, { replace: true });
  };

  return (
    <div className="container flex min-h-[calc(100vh-4rem)] items-center justify-center py-12">
      <Card className="w-full max-w-md shadow-soft">
        <CardHeader className="space-y-2 text-center">
          <CardTitle className="font-display text-2xl">Přihlášení</CardTitle>
          <CardDescription>Zadejte své firemní přihlašovací údaje</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                placeholder="vy@firma.cz"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Heslo</Label>
                <Link to="/zapomenute-heslo" className="text-xs text-primary hover:underline">
                  Zapomenuté heslo?
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Přihlásit se
            </Button>
          </form>
          <p className="mt-6 text-center text-sm text-muted-foreground">
            Nemáte účet?{" "}
            <Link to="/registrace" className="font-medium text-primary hover:underline">
              Registrovat firmu
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
