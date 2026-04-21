import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  adminListPricelists,
  adminUpsertPricelist,
  adminDeletePricelist,
  adminListPricelistItems,
  adminUpsertPricelistItem,
  adminDeletePricelistItem,
  adminListProducts,
  Pricelist,
  PricelistItem,
} from "@/lib/api/admin";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, Pencil } from "lucide-react";
import { toast } from "@/hooks/use-toast";

export default function AdminPricelists() {
  const qc = useQueryClient();
  const { data: pricelists = [] } = useQuery({ queryKey: ["admin-pricelists"], queryFn: adminListPricelists });
  const [activeId, setActiveId] = useState<string | null>(null);
  const active = pricelists.find((p) => p.id === activeId) ?? pricelists[0];
  const currentId = active?.id;

  const [editingPL, setEditingPL] = useState<Partial<Pricelist> | null>(null);

  const { data: items = [] } = useQuery({
    queryKey: ["pricelist-items", currentId],
    queryFn: () => adminListPricelistItems(currentId!),
    enabled: !!currentId,
  });

  const { data: products = [] } = useQuery({ queryKey: ["admin-products", ""], queryFn: () => adminListProducts() });

  const upsertPL = useMutation({
    mutationFn: adminUpsertPricelist,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-pricelists"] }); setEditingPL(null); toast({ title: "Uloženo" }); },
    onError: (e: Error) => toast({ title: "Chyba", description: e.message, variant: "destructive" }),
  });
  const deletePL = useMutation({
    mutationFn: adminDeletePricelist,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-pricelists"] }); setActiveId(null); toast({ title: "Smazáno" }); },
    onError: (e: Error) => toast({ title: "Chyba", description: e.message, variant: "destructive" }),
  });

  const [editingItem, setEditingItem] = useState<Partial<PricelistItem> | null>(null);
  const upsertItem = useMutation({
    mutationFn: adminUpsertPricelistItem,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["pricelist-items", currentId] }); setEditingItem(null); toast({ title: "Uloženo" }); },
    onError: (e: Error) => toast({ title: "Chyba", description: e.message, variant: "destructive" }),
  });
  const deleteItem = useMutation({
    mutationFn: adminDeletePricelistItem,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["pricelist-items", currentId] }); toast({ title: "Smazáno" }); },
    onError: (e: Error) => toast({ title: "Chyba", description: e.message, variant: "destructive" }),
  });

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold">Ceníky</h1>
          <p className="mt-1 text-sm text-muted-foreground">Hlavní ceník a individuální ceníky pro klienty</p>
        </div>
        <Button onClick={() => setEditingPL({ name: "", currency: "CZK", is_default: false })}>
          <Plus className="mr-2 h-4 w-4" /> Nový ceník
        </Button>
      </header>

      <div className="grid gap-6 lg:grid-cols-[260px,1fr]">
        <Card>
          <CardHeader><CardTitle className="text-sm">Seznam ceníků</CardTitle></CardHeader>
          <CardContent className="space-y-1 p-2">
            {pricelists.map((p) => (
              <button
                key={p.id}
                onClick={() => setActiveId(p.id)}
                className={`flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-sm transition-colors ${
                  p.id === currentId ? "bg-primary text-primary-foreground" : "hover:bg-secondary"
                }`}
              >
                <span className="truncate">{p.name}</span>
                {p.is_default && <Badge variant="secondary" className="ml-2 text-[10px]">Default</Badge>}
              </button>
            ))}
            {pricelists.length === 0 && <p className="px-2 py-4 text-xs text-muted-foreground">Žádné ceníky</p>}
          </CardContent>
        </Card>

        <div className="space-y-4">
          {active ? (
            <>
              <Card>
                <CardContent className="flex flex-wrap items-center justify-between gap-3 p-4">
                  <div>
                    <h2 className="font-semibold">{active.name}</h2>
                    <p className="text-xs text-muted-foreground">Měna: {active.currency} · {items.length} položek</p>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => setEditingPL(active)}>
                      <Pencil className="mr-2 h-3.5 w-3.5" /> Upravit
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => setEditingItem({ pricelist_id: active.id, min_qty: 1, unit_price: 0 })}>
                      <Plus className="mr-2 h-3.5 w-3.5" /> Položka
                    </Button>
                    {!active.is_default && (
                      <Button
                        size="sm" variant="ghost"
                        onClick={() => { if (confirm("Smazat ceník?")) deletePL.mutate(active.id); }}
                      >
                        <Trash2 className="h-3.5 w-3.5 text-destructive" />
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Produkt</TableHead>
                        <TableHead>SKU</TableHead>
                        <TableHead className="text-right">Min. množství</TableHead>
                        <TableHead className="text-right">Cena / jedn.</TableHead>
                        <TableHead className="w-24 text-right"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {items.length === 0 ? (
                        <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground">Žádné položky</TableCell></TableRow>
                      ) : items.map((it) => (
                        <TableRow key={it.id}>
                          <TableCell className="font-medium">{it.product?.name}</TableCell>
                          <TableCell className="font-mono text-xs">{it.product?.sku ?? "—"}</TableCell>
                          <TableCell className="text-right">{it.min_qty} {it.product?.unit}</TableCell>
                          <TableCell className="text-right font-semibold">
                            {it.unit_price.toLocaleString("cs-CZ", { minimumFractionDigits: 2 })} {active.currency}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button size="icon" variant="ghost" onClick={() => setEditingItem(it)}>
                              <Pencil className="h-3.5 w-3.5" />
                            </Button>
                            <Button size="icon" variant="ghost" onClick={() => { if (confirm("Smazat?")) deleteItem.mutate(it.id); }}>
                              <Trash2 className="h-3.5 w-3.5 text-destructive" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </>
          ) : (
            <Card><CardContent className="p-12 text-center text-muted-foreground">Vyberte ceník vlevo nebo vytvořte nový.</CardContent></Card>
          )}
        </div>
      </div>

      {/* Pricelist edit dialog */}
      <Dialog open={!!editingPL} onOpenChange={(o) => !o && setEditingPL(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editingPL?.id ? "Upravit ceník" : "Nový ceník"}</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Název</Label>
              <Input value={editingPL?.name ?? ""} onChange={(e) => setEditingPL((s) => ({ ...(s ?? {}), name: e.target.value }))} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Měna</Label>
                <Input value={editingPL?.currency ?? "CZK"} onChange={(e) => setEditingPL((s) => ({ ...(s ?? {}), currency: e.target.value }))} />
              </div>
              <div className="flex items-end gap-2 pb-2">
                <Switch
                  checked={editingPL?.is_default ?? false}
                  onCheckedChange={(v) => setEditingPL((s) => ({ ...(s ?? {}), is_default: v }))}
                />
                <Label>Výchozí</Label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingPL(null)}>Zrušit</Button>
            <Button onClick={() => editingPL?.name && upsertPL.mutate(editingPL as Pricelist)}>Uložit</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Item edit dialog */}
      <Dialog open={!!editingItem} onOpenChange={(o) => !o && setEditingItem(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editingItem?.id ? "Upravit položku" : "Nová položka ceníku"}</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Produkt</Label>
              <Select
                value={editingItem?.product_id ?? ""}
                onValueChange={(v) => setEditingItem((s) => ({ ...(s ?? {}), product_id: v }))}
              >
                <SelectTrigger><SelectValue placeholder="Vyberte produkt" /></SelectTrigger>
                <SelectContent>
                  {products.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name} {p.sku && `· ${p.sku}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Min. množství</Label>
                <Input
                  type="number" min={1}
                  value={editingItem?.min_qty ?? 1}
                  onChange={(e) => setEditingItem((s) => ({ ...(s ?? {}), min_qty: Number(e.target.value) }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Cena za jednotku</Label>
                <Input
                  type="number" step="0.01" min={0}
                  value={editingItem?.unit_price ?? 0}
                  onChange={(e) => setEditingItem((s) => ({ ...(s ?? {}), unit_price: Number(e.target.value) }))}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingItem(null)}>Zrušit</Button>
            <Button
              onClick={() => {
                if (!editingItem?.product_id || !editingItem.pricelist_id) return;
                upsertItem.mutate({
                  id: editingItem.id,
                  pricelist_id: editingItem.pricelist_id,
                  product_id: editingItem.product_id,
                  min_qty: editingItem.min_qty ?? 1,
                  unit_price: editingItem.unit_price ?? 0,
                });
              }}
            >
              Uložit
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
