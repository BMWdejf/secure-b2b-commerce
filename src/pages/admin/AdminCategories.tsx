import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { adminListCategories, adminUpsertCategory, adminDeleteCategory, AdminCategory } from "@/lib/api/admin";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { slugify } from "@/lib/slug";
import { toast } from "@/hooks/use-toast";

export default function AdminCategories() {
  const qc = useQueryClient();
  const { data = [], isLoading } = useQuery({ queryKey: ["admin-categories"], queryFn: adminListCategories });

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Partial<AdminCategory> | null>(null);

  const upsert = useMutation({
    mutationFn: adminUpsertCategory,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-categories"] });
      qc.invalidateQueries({ queryKey: ["categories"] });
      setOpen(false);
      toast({ title: "Uloženo" });
    },
    onError: (e: Error) => toast({ title: "Chyba", description: e.message, variant: "destructive" }),
  });

  const remove = useMutation({
    mutationFn: adminDeleteCategory,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-categories"] });
      qc.invalidateQueries({ queryKey: ["categories"] });
      toast({ title: "Smazáno" });
    },
    onError: (e: Error) => toast({ title: "Chyba", description: e.message, variant: "destructive" }),
  });

  const openNew = () => {
    setEditing({ name: "", slug: "", description: "", sort_order: 0, is_active: true });
    setOpen(true);
  };

  const openEdit = (c: AdminCategory) => {
    setEditing(c);
    setOpen(true);
  };

  const submit = () => {
    if (!editing?.name || !editing?.slug) {
      toast({ title: "Vyplňte název a slug", variant: "destructive" });
      return;
    }
    upsert.mutate(editing as AdminCategory);
  };

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold">Kategorie</h1>
          <p className="mt-1 text-sm text-muted-foreground">Stromová struktura katalogu</p>
        </div>
        <Button onClick={openNew}>
          <Plus className="mr-2 h-4 w-4" /> Nová kategorie
        </Button>
      </header>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Pořadí</TableHead>
                <TableHead>Název</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>Stav</TableHead>
                <TableHead className="w-32 text-right">Akce</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground">Načítám…</TableCell></TableRow>
              ) : data.length === 0 ? (
                <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground">Žádné kategorie</TableCell></TableRow>
              ) : (
                data.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell className="text-muted-foreground">{c.sort_order}</TableCell>
                    <TableCell className="font-medium">{c.name}</TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">{c.slug}</TableCell>
                    <TableCell>
                      {c.is_active ? <Badge>Aktivní</Badge> : <Badge variant="secondary">Skrytá</Badge>}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button size="icon" variant="ghost" onClick={() => openEdit(c)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => {
                          if (confirm(`Smazat kategorii „${c.name}"? Produkty zůstanou bez kategorie.`)) remove.mutate(c.id);
                        }}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing?.id ? "Upravit kategorii" : "Nová kategorie"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Název</Label>
              <Input
                value={editing?.name ?? ""}
                onChange={(e) => {
                  const name = e.target.value;
                  setEditing((s) => ({
                    ...(s ?? {}),
                    name,
                    slug: !s?.id && (!s?.slug || s?.slug === slugify(s?.name ?? "")) ? slugify(name) : s?.slug,
                  }));
                }}
              />
            </div>
            <div className="space-y-2">
              <Label>Slug</Label>
              <Input value={editing?.slug ?? ""} onChange={(e) => setEditing((s) => ({ ...(s ?? {}), slug: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Popis</Label>
              <Textarea
                rows={3}
                value={editing?.description ?? ""}
                onChange={(e) => setEditing((s) => ({ ...(s ?? {}), description: e.target.value }))}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Pořadí</Label>
                <Input
                  type="number"
                  value={editing?.sort_order ?? 0}
                  onChange={(e) => setEditing((s) => ({ ...(s ?? {}), sort_order: Number(e.target.value) }))}
                />
              </div>
              <div className="flex items-end gap-2 pb-2">
                <Switch
                  checked={editing?.is_active ?? true}
                  onCheckedChange={(v) => setEditing((s) => ({ ...(s ?? {}), is_active: v }))}
                />
                <Label>Aktivní</Label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Zrušit</Button>
            <Button onClick={submit} disabled={upsert.isPending}>Uložit</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
