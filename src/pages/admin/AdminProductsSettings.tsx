import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { fetchSiteSettings, updateSiteSettings, SiteSettings } from "@/lib/api/site";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { useSiteSettings } from "@/contexts/SiteSettingsContext";

export default function AdminProductsSettings() {
  const { refresh } = useSiteSettings();
  const { data, refetch } = useQuery({ queryKey: ["site_settings_products"], queryFn: fetchSiteSettings });
  const [s, setS] = useState<SiteSettings | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => { if (data) setS(data); }, [data]);
  if (!s) return <div className="text-muted-foreground">Načítám…</div>;

  const update = (k: keyof SiteSettings, v: any) => setS({ ...s, [k]: v });

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader><CardTitle>Vzhled produktů</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label>Výchozí název balení (např. Karton, Balení, Role)</Label>
            <Input value={s.default_pack_label} onChange={(e) => update("default_pack_label", e.target.value)} />
            <p className="text-xs text-muted-foreground">U konkrétního produktu lze přepsat v editaci produktu.</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Popisek dostupnosti — Skladem</Label>
              <Input value={s.availability_in_stock_label} onChange={(e) => update("availability_in_stock_label", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Popisek dostupnosti — Na dotaz</Label>
              <Input value={s.availability_on_request_label} onChange={(e) => update("availability_on_request_label", e.target.value)} />
            </div>
          </div>
          <div className="flex justify-end">
            <Button onClick={async () => {
              setSaving(true);
              try { await updateSiteSettings(s.id, s); toast.success("Uloženo"); refresh(); refetch(); }
              catch (e: any) { toast.error(e?.message ?? "Chyba"); }
              finally { setSaving(false); }
            }} disabled={saving}>
              {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null} Uložit
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
