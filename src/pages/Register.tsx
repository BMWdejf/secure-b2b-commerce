import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, ShieldCheck } from "lucide-react";

const registerSchema = z.object({
  full_name: z.string().trim().min(2, "Zadejte celé jméno").max(100),
  company_name: z.string().trim().min(2, "Zadejte název firmy").max(150),
  ico: z.string().trim().regex(/^\d{6,10}$/, "IČO musí být 6–10 číslic"),
  dic: z.string().trim().max(20).optional().or(z.literal("")),
  phone: z.string().trim().min(9, "Zadejte telefon").max(20),
  email: z.string().trim().email("Neplatný e-mail").max(255),
  password: z.string().min(8, "Heslo musí mít alespoň 8 znaků").max(72),
});

export default function Register() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    full_name: "",
    company_name: "",
    ico: "",
    dic: "",
    phone: "",
    email: "",
    password: "",
  });

  const update = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = registerSchema.safeParse(form);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0].message);
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email: parsed.data.email,
      password: parsed.data.password,
      options: {
        emailRedirectTo: `${window.location.origin}/`,
        data: {
          full_name: parsed.data.full_name,
          company_name: parsed.data.company_name,
          ico: parsed.data.ico,
          dic: parsed.data.dic || null,
          phone: parsed.data.phone,
        },
      },
    });
    setLoading(false);

    if (error) {
      if (error.message.toLowerCase().includes("registered")) {
        toast.error("Uživatel s tímto e-mailem už existuje. Přihlaste se.");
      } else {
        toast.error(error.message);
      }
      return;
    }

    toast.success("Registrace odeslána");
    navigate("/registrace-hotovo", { replace: true });
  };

  return (
    <div className="container py-12 md:py-16">
      <div className="mx-auto grid max-w-5xl gap-8 md:grid-cols-[1fr_340px]">
        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle className="font-display text-2xl">Registrace B2B partnera</CardTitle>
            <CardDescription>
              Po odeslání žádosti váš účet schválí administrátor. Poté získáte přístup k cenám a možnost objednávat.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="full_name">Celé jméno *</Label>
                  <Input id="full_name" value={form.full_name} onChange={update("full_name")} required />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="company_name">Název firmy *</Label>
                  <Input id="company_name" value={form.company_name} onChange={update("company_name")} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ico">IČO *</Label>
                  <Input id="ico" inputMode="numeric" value={form.ico} onChange={update("ico")} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dic">DIČ</Label>
                  <Input id="dic" placeholder="CZ12345678" value={form.dic} onChange={update("dic")} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Telefon *</Label>
                  <Input id="phone" type="tel" value={form.phone} onChange={update("phone")} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">E-mail *</Label>
                  <Input id="email" type="email" autoComplete="email" value={form.email} onChange={update("email")} required />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="password">Heslo * <span className="text-xs text-muted-foreground">(min. 8 znaků)</span></Label>
                  <Input id="password" type="password" autoComplete="new-password" value={form.password} onChange={update("password")} required />
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Odeslat žádost o registraci
              </Button>

              <p className="text-center text-sm text-muted-foreground">
                Už máte účet?{" "}
                <Link to="/prihlaseni" className="font-medium text-primary hover:underline">
                  Přihlásit se
                </Link>
              </p>
            </form>
          </CardContent>
        </Card>

        <aside className="space-y-4">
          <Card className="border-primary/20 bg-gradient-subtle">
            <CardContent className="p-6">
              <ShieldCheck className="mb-3 h-8 w-8 text-primary" />
              <h3 className="font-display text-lg font-semibold">Schvalovací proces</h3>
              <ol className="mt-4 space-y-3 text-sm text-muted-foreground">
                <li className="flex gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">1</span>
                  Vyplníte údaje o firmě
                </li>
                <li className="flex gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">2</span>
                  Administrátor ověří firmu (obvykle do 24 h)
                </li>
                <li className="flex gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent text-xs font-bold text-accent-foreground">3</span>
                  Získáte přístup k cenám a objednávkám
                </li>
              </ol>
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  );
}
