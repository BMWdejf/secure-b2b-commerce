import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  adminGetProduct,
  adminListCategories,
  adminUpsertProduct,
  uploadProductImage,
  AdminProduct,
} from "@/lib/api/admin";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Upload, Package, Loader2 } from "lucide-react";
import { slugify } from "@/lib/slug";
import { toast } from "@/hooks/use-toast";

export default function AdminProductForm() {
  const { id } = useParams();
  const isNew = !id || id === "novy";
  const navigate = useNavigate();
  const qc = useQueryClient();

  const [form, setForm] = useState<Partial<AdminProduct>>({
    name: "",
    slug: "",
    sku: "",
    short_description: "",
    description: "",
    unit: "ks",
    moq: 1,
    pack_size: 1,
    pack_label: "Karton",
    availability: "in_stock",
    is_active: true,
    category_id: null,
    main_image_url: null,
  });
  const [uploading, setUploading] = useState(false);

  const { data: categories = [] } = useQuery({ queryKey: ["admin-categories"], queryFn: adminListCategories });
  const { data: existing, isLoading } = useQuery({
    queryKey: ["admin-product", id],
    queryFn: () => adminGetProduct(id!),
    enabled: !isNew,
  });

  useEffect(() => {
    if (existing) setForm(existing);
  }, [existing]);

  const save = useMutation({
    mutationFn: () => adminUpsertProduct(form as AdminProduct),
    onSuccess: (newId) => {
      qc.invalidateQueries({ queryKey: ["admin-products"] });
      qc.invalidateQueries({ queryKey: ["products"] });
      toast({ title: "Uloženo" });
      if (isNew) navigate(`/admin/produkty/${newId}`);
    },
    onError: (e: Error) => toast({ title: "Chyba", description: e.message, variant: "destructive" }),
  });

  const handleUpload = async (file: File) => {
    setUploading(true);
    try {
      const url = await uploadProductImage(file);
      setForm((s) => ({ ...s, main_image_url: url }));
      toast({ title: "Obrázek nahrán" });
    } catch (e) {
      toast({ title: "Chyba uploadu", description: (e as Error).message, variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.slug) {
      toast({ title: "Vyplňte název a slug", variant: "destructive" });
      return;
    }
    save.mutate();
  };

  if (!isNew && isLoading) {
    return <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-6">
      <Button variant="ghost" size="sm" asChild className="-ml-2">
        <Link to="/admin/produkty"><ArrowLeft className="mr-2 h-4 w-4" /> Zpět na produkty</Link>
      </Button>

      <header>
        <h1 className="font-display text-3xl font-bold">{isNew ? "Nový produkt" : form.name}</h1>
        {!isNew && <p className="mt-1 text-sm text-muted-foreground">SKU: {form.sku || "—"}</p>}
      </header>

      <form onSubmit={submit} className="grid gap-6 lg:grid-cols-[1fr,320px]">
        <div className="space-y-6">
          <Card>
            <CardHeader><CardTitle className="text-base">Základní informace</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Název *</Label>
                <Input
                  value={form.name ?? ""}
                  onChange={(e) => {
                    const name = e.target.value;
                    setForm((s) => ({
                      ...s,
                      name,
                      slug: isNew && (!s.slug || s.slug === slugify(s.name ?? "")) ? slugify(name) : s.slug,
                    }));
                  }}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Slug *</Label>
                  <Input value={form.slug ?? ""} onChange={(e) => setForm((s) => ({ ...s, slug: e.target.value }))} required />
                </div>
                <div className="space-y-2">
                  <Label>SKU</Label>
                  <Input value={form.sku ?? ""} onChange={(e) => setForm((s) => ({ ...s, sku: e.target.value }))} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Krátký popis</Label>
                <Input
                  value={form.short_description ?? ""}
                  onChange={(e) => setForm((s) => ({ ...s, short_description: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Popis</Label>
                <Textarea
                  rows={6}
                  value={form.description ?? ""}
                  onChange={(e) => setForm((s) => ({ ...s, description: e.target.value }))}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-base">Parametry</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <div className="space-y-2">
                <Label>Jednotka</Label>
                <Input value={form.unit ?? "ks"} onChange={(e) => setForm((s) => ({ ...s, unit: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Název balení</Label>
                <Input placeholder="Karton / Balení / Role" value={form.pack_label ?? "Karton"} onChange={(e) => setForm((s) => ({ ...s, pack_label: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Velikost balení</Label>
                <Input type="number" min={1} value={form.pack_size ?? 1} onChange={(e) => setForm((s) => ({ ...s, pack_size: Number(e.target.value) }))} />
              </div>
              <div className="space-y-2">
                <Label>Hmotnost (kg)</Label>
                <Input
                  type="number"
                  step="0.001"
                  value={form.weight_kg ?? ""}
                  onChange={(e) => setForm((s) => ({ ...s, weight_kg: e.target.value ? Number(e.target.value) : null }))}
                />
              </div>
              <div className="col-span-2 space-y-2 sm:col-span-4">
                <Label>Dostupnost</Label>
                <Select
                  value={form.availability ?? "in_stock"}
                  onValueChange={(v) => setForm((s) => ({ ...s, availability: v as any }))}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="in_stock">Skladem</SelectItem>
                    <SelectItem value="on_request">Na dotaz</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader><CardTitle className="text-base">Stav</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Aktivní</Label>
                <Switch
                  checked={form.is_active ?? true}
                  onCheckedChange={(v) => setForm((s) => ({ ...s, is_active: v }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Kategorie</Label>
                <Select
                  value={form.category_id ?? "_none"}
                  onValueChange={(v) => setForm((s) => ({ ...s, category_id: v === "_none" ? null : v }))}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="_none">— Bez kategorie —</SelectItem>
                    {categories.map((c) => (
                      <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-base">Hlavní obrázek</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div className="aspect-square overflow-hidden rounded-lg border border-border bg-secondary">
                {form.main_image_url ? (
                  <img src={form.main_image_url} alt="" className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                    <Package className="h-12 w-12" />
                  </div>
                )}
              </div>
              <label>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0])}
                />
                <Button type="button" variant="outline" className="w-full" disabled={uploading} asChild>
                  <span className="cursor-pointer">
                    {uploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
                    {uploading ? "Nahrávám…" : "Nahrát obrázek"}
                  </span>
                </Button>
              </label>
              <Input
                placeholder="… nebo vložit URL"
                value={form.main_image_url ?? ""}
                onChange={(e) => setForm((s) => ({ ...s, main_image_url: e.target.value || null }))}
              />
            </CardContent>
          </Card>

          <Button type="submit" className="w-full" disabled={save.isPending} size="lg">
            {save.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Uložit produkt
          </Button>
        </div>
      </form>
    </div>
  );
}
