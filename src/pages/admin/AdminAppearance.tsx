import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { fetchSiteSettings, updateSiteSettings, uploadLogo, SiteSettings, HeroStat, FeatureItem } from "@/lib/api/site";
import { toast } from "sonner";
import { Loader2, Trash2, Plus, Upload } from "lucide-react";
import { useSiteSettings } from "@/contexts/SiteSettingsContext";

export default function AdminAppearance() {
  const { refresh } = useSiteSettings();
  const { data, isLoading, refetch } = useQuery({ queryKey: ["site_settings_admin"], queryFn: fetchSiteSettings });
  const [s, setS] = useState<SiteSettings | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => { if (data) setS(data); }, [data]);

  if (isLoading || !s) return <div className="text-muted-foreground">Načítám…</div>;

  const update = <K extends keyof SiteSettings>(k: K, v: SiteSettings[K]) => setS((prev) => prev ? { ...prev, [k]: v } : prev);

  const save = async () => {
    if (!s) return;
    setSaving(true);
    try {
      await updateSiteSettings(s.id, s);
      toast.success("Uloženo");
      refresh();
      refetch();
    } catch (e: any) { toast.error(e?.message ?? "Uložení selhalo"); }
    finally { setSaving(false); }
  };

  const handleLogo = async (file: File) => {
    setUploading(true);
    try {
      const url = await uploadLogo(file);
      update("logo_url", url);
      await updateSiteSettings(s.id, { logo_url: url });
      refresh();
      toast.success("Logo nahráno");
    } catch (e: any) { toast.error(e?.message ?? "Nahrání selhalo"); }
    finally { setUploading(false); }
  };

  const updateStat = (i: number, patch: Partial<HeroStat>) => {
    const next = [...s.hero_stats];
    next[i] = { ...next[i], ...patch };
    update("hero_stats", next);
  };
  const addStat = () => update("hero_stats", [...s.hero_stats, { label: "Nová", value: "0" }]);
  const removeStat = (i: number) => update("hero_stats", s.hero_stats.filter((_, idx) => idx !== i));

  const updateFeature = (i: number, patch: Partial<FeatureItem>) => {
    const next = [...s.features];
    next[i] = { ...next[i], ...patch };
    update("features", next);
  };
  const addFeature = () => update("features", [...s.features, { icon: "Package", title: "Nová vlastnost", desc: "Popis" }]);
  const removeFeature = (i: number) => update("features", s.features.filter((_, idx) => idx !== i));

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader><CardTitle>Logo a značka</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            {s.logo_url ? <img src={s.logo_url} alt="logo" className="h-12 w-auto rounded border border-border" /> : <div className="h-12 w-12 rounded bg-muted" />}
            <Label htmlFor="logo" className="cursor-pointer">
              <div className="inline-flex items-center gap-2 rounded-md border border-input px-3 py-2 text-sm hover:bg-secondary">
                {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                Nahrát logo
              </div>
              <input id="logo" type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && handleLogo(e.target.files[0])} />
            </Label>
            {s.logo_url && (
              <Button variant="ghost" size="sm" onClick={() => update("logo_url", null)}>Odstranit</Button>
            )}
          </div>
          <Field label="Název značky"><Input value={s.brand_name} onChange={(e) => update("brand_name", e.target.value)} /></Field>
          <Field label="Text v patičce pod logem"><Textarea rows={3} value={s.footer_text} onChange={(e) => update("footer_text", e.target.value)} /></Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="IČO"><Input value={s.company_ico ?? ""} onChange={(e) => update("company_ico", e.target.value)} /></Field>
            <Field label="DIČ"><Input value={s.company_dic ?? ""} onChange={(e) => update("company_dic", e.target.value)} /></Field>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Hlavní stránka — Hero</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <Field label="Badge nad nadpisem"><Input value={s.hero_badge} onChange={(e) => update("hero_badge", e.target.value)} /></Field>
          <Field label="Hlavní nadpis"><Input value={s.hero_title} onChange={(e) => update("hero_title", e.target.value)} /></Field>
          <Field label="Zvýrazněné slovo (musí být součástí nadpisu)"><Input value={s.hero_title_accent} onChange={(e) => update("hero_title_accent", e.target.value)} /></Field>
          <Field label="Podtitul"><Textarea rows={2} value={s.hero_subtitle} onChange={(e) => update("hero_subtitle", e.target.value)} /></Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Tlačítko 1"><Input value={s.hero_cta_primary} onChange={(e) => update("hero_cta_primary", e.target.value)} /></Field>
            <Field label="Tlačítko 2"><Input value={s.hero_cta_secondary} onChange={(e) => update("hero_cta_secondary", e.target.value)} /></Field>
          </div>
          <Field label="Drobný text pod tlačítky"><Input value={s.hero_note} onChange={(e) => update("hero_note", e.target.value)} /></Field>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Statistiky (4 dlaždice)</Label>
              <Button size="sm" variant="ghost" onClick={addStat}><Plus className="mr-1 h-4 w-4" /> Přidat</Button>
            </div>
            {s.hero_stats.map((st, i) => (
              <div key={i} className="grid grid-cols-[1fr_1fr_auto] gap-2">
                <Input placeholder="Hodnota" value={st.value} onChange={(e) => updateStat(i, { value: e.target.value })} />
                <Input placeholder="Popisek" value={st.label} onChange={(e) => updateStat(i, { label: e.target.value })} />
                <Button size="icon" variant="ghost" onClick={() => removeStat(i)}><Trash2 className="h-4 w-4" /></Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Sekce „Vlastnosti"</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <Field label="Nadpis sekce"><Input value={s.features_title} onChange={(e) => update("features_title", e.target.value)} /></Field>
          <Field label="Podnadpis"><Input value={s.features_subtitle} onChange={(e) => update("features_subtitle", e.target.value)} /></Field>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Karty</Label>
              <Button size="sm" variant="ghost" onClick={addFeature}><Plus className="mr-1 h-4 w-4" /> Přidat</Button>
            </div>
            {s.features.map((f, i) => (
              <div key={i} className="rounded-md border border-border p-3 space-y-2">
                <div className="grid grid-cols-[160px_1fr_auto] gap-2">
                  <Input placeholder="Ikona (Package, Zap, Users…)" value={f.icon} onChange={(e) => updateFeature(i, { icon: e.target.value })} />
                  <Input placeholder="Nadpis karty" value={f.title} onChange={(e) => updateFeature(i, { title: e.target.value })} />
                  <Button size="icon" variant="ghost" onClick={() => removeFeature(i)}><Trash2 className="h-4 w-4" /></Button>
                </div>
                <Textarea rows={2} placeholder="Popis" value={f.desc} onChange={(e) => updateFeature(i, { desc: e.target.value })} />
              </div>
            ))}
            <p className="text-xs text-muted-foreground">Dostupné ikony: Package, FileText, Users, ShieldCheck, Truck, Zap, Star, Heart, Award, Sparkles</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>CTA sekce (dole)</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <Field label="Nadpis"><Input value={s.cta_title} onChange={(e) => update("cta_title", e.target.value)} /></Field>
          <Field label="Text"><Textarea rows={2} value={s.cta_text} onChange={(e) => update("cta_text", e.target.value)} /></Field>
          <Field label="Tlačítko"><Input value={s.cta_button} onChange={(e) => update("cta_button", e.target.value)} /></Field>
        </CardContent>
      </Card>

      <div className="sticky bottom-4 flex justify-end">
        <Button size="lg" onClick={save} disabled={saving}>
          {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          Uložit změny
        </Button>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs uppercase tracking-wider text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}
