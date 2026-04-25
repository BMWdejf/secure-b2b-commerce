import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { RichTextEditor } from "@/components/cms/RichTextEditor";
import { fetchPages, upsertPage, deletePage, Page } from "@/lib/api/site";
import { toast } from "sonner";
import { Plus, Trash2, Edit, Loader2, ArrowLeft } from "lucide-react";

export default function AdminPages() {
  const { data: pages = [], refetch } = useQuery({ queryKey: ["admin_pages"], queryFn: fetchPages });
  const [editing, setEditing] = useState<Partial<Page> | null>(null);
  const [saving, setSaving] = useState(false);

  if (editing) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" size="sm" onClick={() => setEditing(null)}><ArrowLeft className="mr-2 h-4 w-4" /> Zpět</Button>
        <Card>
          <CardHeader><CardTitle>{editing.id ? "Upravit stránku" : "Nová stránka"}</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label>Název</Label>
                <Input value={editing.title ?? ""} onChange={(e) => setEditing({ ...editing, title: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label>Slug (URL)</Label>
                <Input value={editing.slug ?? ""} onChange={(e) => setEditing({ ...editing, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-") })} />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Obsah</Label>
              <RichTextEditor value={editing.content_html ?? ""} onChange={(html) => setEditing({ ...editing, content_html: html })} />
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={editing.is_published ?? true} onCheckedChange={(v) => setEditing({ ...editing, is_published: v })} />
              <Label>Publikováno</Label>
            </div>
            <Button
              onClick={async () => {
                if (!editing.title || !editing.slug) { toast.error("Vyplňte název a slug"); return; }
                setSaving(true);
                try {
                  await upsertPage(editing as any);
                  toast.success("Uloženo");
                  await refetch();
                  setEditing(null);
                } catch (e: any) { toast.error(e?.message ?? "Uložení selhalo"); }
                finally { setSaving(false); }
              }}
              disabled={saving}
            >
              {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Uložit
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Stránky</h2>
        <Button onClick={() => setEditing({ slug: "", title: "", content_html: "", is_published: true })}>
          <Plus className="mr-2 h-4 w-4" /> Nová stránka
        </Button>
      </div>
      <div className="space-y-2">
        {pages.map((p) => (
          <Card key={p.id}>
            <CardContent className="flex items-center justify-between p-4">
              <div>
                <p className="font-medium">{p.title}</p>
                <p className="text-xs text-muted-foreground">/{p.slug} · {p.is_published ? "Publikováno" : "Skryto"}</p>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="ghost" onClick={() => setEditing(p)}><Edit className="h-4 w-4" /></Button>
                <Button size="sm" variant="ghost" onClick={async () => {
                  if (!confirm("Smazat stránku?")) return;
                  await deletePage(p.id);
                  await refetch();
                }}><Trash2 className="h-4 w-4" /></Button>
              </div>
            </CardContent>
          </Card>
        ))}
        {pages.length === 0 && <p className="text-sm text-muted-foreground">Žádné stránky.</p>}
      </div>
    </div>
  );
}
