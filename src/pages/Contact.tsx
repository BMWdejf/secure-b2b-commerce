import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { fetchContactAddresses, sendContactMessage } from "@/lib/api/site";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Loader2, Mail, Phone, MapPin, Building2 } from "lucide-react";

const schema = z.object({
  name: z.string().trim().min(1, "Zadejte jméno").max(120),
  email: z.string().trim().email("Neplatný e-mail").max(255),
  phone: z.string().trim().max(40).optional().or(z.literal("")),
  message: z.string().trim().min(1, "Zadejte zprávu").max(4000),
});

export default function Contact() {
  const { user, profile } = useAuth();
  const { data: addresses = [] } = useQuery({ queryKey: ["contact_addresses"], queryFn: fetchContactAddresses });
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user?.email) setEmail(user.email);
    if (profile?.full_name) setName(profile.full_name);
    if (profile && (profile as any).phone) setPhone((profile as any).phone);
  }, [user, profile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse({ name, email, phone, message });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0].message);
      return;
    }
    setLoading(true);
    try {
      await sendContactMessage({
        name: parsed.data.name,
        email: parsed.data.email,
        phone: parsed.data.phone || null,
        message: parsed.data.message,
        user_id: user?.id ?? null,
      });
      toast.success("Zpráva byla odeslána. Děkujeme!");
      setMessage("");
    } catch (err: any) {
      console.error(err);
      toast.error(err?.message ?? "Zprávu se nepodařilo odeslat");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-10 md:py-14">
      <h1 className="font-display text-3xl font-bold md:text-4xl">Kontakt</h1>
      <p className="mt-2 text-muted-foreground">Ozvěte se nám. Odpovíme nejpozději následující pracovní den.</p>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_1fr]">
        <div className="space-y-4">
          {addresses.map((a) => (
            <Card key={a.id}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Building2 className="h-5 w-5 text-primary" />
                  {a.kind === "billing" ? "Fakturační adresa" : "Dodací adresa"}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-muted-foreground">
                <p className="font-medium text-foreground">{a.company_name}</p>
                {(a.street || a.city || a.postal_code) && (
                  <p className="flex items-start gap-2">
                    <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
                    <span>{a.street}{a.street ? ", " : ""}{a.postal_code} {a.city}{a.country ? `, ${a.country}` : ""}</span>
                  </p>
                )}
                {a.ico && <p>IČO: {a.ico}{a.dic ? ` · DIČ: ${a.dic}` : ""}</p>}
                {a.email && <p className="flex items-center gap-2"><Mail className="h-4 w-4" /> {a.email}</p>}
                {a.phone && <p className="flex items-center gap-2"><Phone className="h-4 w-4" /> {a.phone}</p>}
              </CardContent>
            </Card>
          ))}
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Napište nám</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Jméno *</Label>
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required maxLength={120} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">E-mail *</Label>
                <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required maxLength={255} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Telefon</Label>
                <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} maxLength={40} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="message">Zpráva *</Label>
                <Textarea id="message" rows={6} value={message} onChange={(e) => setMessage(e.target.value)} required maxLength={4000} />
              </div>
              <Button type="submit" disabled={loading} className="w-full">
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Odeslat
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
