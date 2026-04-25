import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { fetchContactAddresses, updateContactAddress, ContactAddress } from "@/lib/api/site";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export default function AdminContactInfo() {
  const { data = [], refetch } = useQuery({ queryKey: ["admin_contact_addresses"], queryFn: fetchContactAddresses });
  const [items, setItems] = useState<ContactAddress[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => { setItems(data); }, [data]);

  const update = (id: string, patch: Partial<ContactAddress>) => {
    setItems((prev) => prev.map((it) => it.id === id ? { ...it, ...patch } : it));
  };

  const save = async () => {
    setSaving(true);
    try {
      await Promise.all(items.map((it) => updateContactAddress(it.id, it)));
      toast.success("Uloženo");
      refetch();
    } catch (e: any) { toast.error(e?.message ?? "Uložení selhalo"); }
    finally { setSaving(false); }
  };

  return (
    <div className="space-y-4">
      {items.map((a) => (
        <Card key={a.id}>
          <CardHeader><CardTitle className="text-base">{a.kind === "billing" ? "Fakturační adresa" : "Dodací adresa"}</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <Row label="Název firmy"><Input value={a.company_name} onChange={(e) => update(a.id, { company_name: e.target.value })} /></Row>
            <div className="grid gap-3 sm:grid-cols-[1fr_140px_1fr]">
              <Row label="Ulice"><Input value={a.street ?? ""} onChange={(e) => update(a.id, { street: e.target.value })} /></Row>
              <Row label="PSČ"><Input value={a.postal_code ?? ""} onChange={(e) => update(a.id, { postal_code: e.target.value })} /></Row>
              <Row label="Město"><Input value={a.city ?? ""} onChange={(e) => update(a.id, { city: e.target.value })} /></Row>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              <Row label="Země"><Input value={a.country} onChange={(e) => update(a.id, { country: e.target.value })} /></Row>
              <Row label="IČO"><Input value={a.ico ?? ""} onChange={(e) => update(a.id, { ico: e.target.value })} /></Row>
              <Row label="DIČ"><Input value={a.dic ?? ""} onChange={(e) => update(a.id, { dic: e.target.value })} /></Row>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <Row label="E-mail"><Input value={a.email ?? ""} onChange={(e) => update(a.id, { email: e.target.value })} /></Row>
              <Row label="Telefon"><Input value={a.phone ?? ""} onChange={(e) => update(a.id, { phone: e.target.value })} /></Row>
            </div>
          </CardContent>
        </Card>
      ))}
      <div className="flex justify-end">
        <Button onClick={save} disabled={saving}>
          {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          Uložit
        </Button>
      </div>
    </div>
  );
}

function Row({ label, children }: any) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs uppercase tracking-wider text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}
