import { useState } from "react";
import { Link } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { adminListProducts, adminDeleteProduct, AdminProduct } from "@/lib/api/admin";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Trash2, Search, Package } from "lucide-react";
import { toast } from "@/hooks/use-toast";

export default function AdminProducts() {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const { data = [], isLoading } = useQuery({
    queryKey: ["admin-products", search],
    queryFn: () => adminListProducts(search),
  });

  const remove = useMutation({
    mutationFn: adminDeleteProduct,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-products"] });
      toast({ title: "Produkt smazán" });
    },
    onError: (e: Error) => toast({ title: "Chyba", description: e.message, variant: "destructive" }),
  });

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold">Produkty</h1>
          <p className="mt-1 text-sm text-muted-foreground">{data.length} produktů v katalogu</p>
        </div>
        <Button asChild>
          <Link to="/admin/produkty/novy"><Plus className="mr-2 h-4 w-4" /> Nový produkt</Link>
        </Button>
      </header>

      <div className="relative max-w-md">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Hledat název nebo SKU…"
          className="pl-9"
        />
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16"></TableHead>
                <TableHead>Produkt</TableHead>
                <TableHead>SKU</TableHead>
                <TableHead className="text-right">MOQ</TableHead>
                <TableHead className="text-right">Karton</TableHead>
                <TableHead>Stav</TableHead>
                <TableHead className="w-32 text-right">Akce</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground">Načítám…</TableCell></TableRow>
              ) : data.length === 0 ? (
                <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground">Žádné produkty</TableCell></TableRow>
              ) : (
                data.map((p: AdminProduct) => (
                  <TableRow key={p.id}>
                    <TableCell>
                      <div className="h-10 w-10 overflow-hidden rounded-md bg-secondary">
                        {p.main_image_url ? (
                          <img src={p.main_image_url} alt="" className="h-full w-full object-cover" />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                            <Package className="h-4 w-4" />
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Link to={`/admin/produkty/${p.id}`} className="font-medium hover:text-primary">{p.name}</Link>
                      <div className="text-xs text-muted-foreground">/{p.slug}</div>
                    </TableCell>
                    <TableCell className="font-mono text-xs">{p.sku ?? "—"}</TableCell>
                    <TableCell className="text-right text-sm">{p.moq} {p.unit}</TableCell>
                    <TableCell className="text-right text-sm">{p.pack_size} {p.unit}</TableCell>
                    <TableCell>
                      {p.is_active ? <Badge>Aktivní</Badge> : <Badge variant="secondary">Skrytý</Badge>}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button size="icon" variant="ghost" asChild>
                        <Link to={`/admin/produkty/${p.id}`}><Pencil className="h-4 w-4" /></Link>
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => {
                          if (confirm(`Smazat produkt „${p.name}"?`)) remove.mutate(p.id);
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
    </div>
  );
}
