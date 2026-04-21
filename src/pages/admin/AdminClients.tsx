import { useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  adminListClients,
  adminSetClientStatus,
  adminAssignPricelist,
  adminListPricelists,
  AdminClientRow,
} from "@/lib/api/admin";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Check, X, Lock, Unlock } from "lucide-react";
import { toast } from "@/hooks/use-toast";

type StatusFilter = "all" | "pending" | "approved" | "blocked";

export default function AdminClients() {
  const [params, setParams] = useSearchParams();
  const filter = (params.get("stav") as StatusFilter) || "pending";
  const qc = useQueryClient();

  const { data = [], isLoading } = useQuery({
    queryKey: ["admin-clients", filter],
    queryFn: () => adminListClients(filter === "all" ? undefined : filter),
  });

  const { data: pricelists = [] } = useQuery({ queryKey: ["admin-pricelists"], queryFn: adminListPricelists });

  const setStatus = useMutation({
    mutationFn: ({ id, status }: { id: string; status: "pending" | "approved" | "blocked" }) => adminSetClientStatus(id, status),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-clients"] });
      qc.invalidateQueries({ queryKey: ["admin-stats"] });
      toast({ title: "Stav aktualizován" });
    },
    onError: (e: Error) => toast({ title: "Chyba", description: e.message, variant: "destructive" }),
  });

  const assignPL = useMutation({
    mutationFn: ({ companyId, pricelistId }: { companyId: string; pricelistId: string | null }) =>
      adminAssignPricelist(companyId, pricelistId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-clients"] });
      toast({ title: "Ceník přiřazen" });
    },
    onError: (e: Error) => toast({ title: "Chyba", description: e.message, variant: "destructive" }),
  });

  const counts = useMemo(() => ({ total: data.length }), [data]);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-3xl font-bold">Klienti</h1>
        <p className="mt-1 text-sm text-muted-foreground">B2B partneři a jejich přístupy</p>
      </header>

      <Tabs value={filter} onValueChange={(v) => setParams({ stav: v })}>
        <TabsList>
          <TabsTrigger value="pending">Čekající</TabsTrigger>
          <TabsTrigger value="approved">Schválení</TabsTrigger>
          <TabsTrigger value="blocked">Blokovaní</TabsTrigger>
          <TabsTrigger value="all">Všichni</TabsTrigger>
        </TabsList>
      </Tabs>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Firma / kontakt</TableHead>
                <TableHead>IČO / DIČ</TableHead>
                <TableHead>E-mail</TableHead>
                <TableHead>Stav</TableHead>
                <TableHead>Ceník</TableHead>
                <TableHead className="text-right">Akce</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground">Načítám…</TableCell></TableRow>
              ) : data.length === 0 ? (
                <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground">Žádní klienti</TableCell></TableRow>
              ) : (
                data.map((c: AdminClientRow) => (
                  <TableRow key={c.id}>
                    <TableCell>
                      <div className="font-medium">{c.company?.name ?? "—"}</div>
                      <div className="text-xs text-muted-foreground">{c.full_name} {c.phone && `· ${c.phone}`}</div>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {c.company?.ico ?? "—"}<br />
                      {c.company?.dic ?? ""}
                    </TableCell>
                    <TableCell className="text-xs">{c.company?.email ?? "—"}</TableCell>
                    <TableCell>
                      {c.status === "approved" && <Badge className="bg-success text-success-foreground">Schválený</Badge>}
                      {c.status === "pending" && <Badge className="bg-warning text-warning-foreground">Čeká</Badge>}
                      {c.status === "blocked" && <Badge variant="destructive">Blokován</Badge>}
                    </TableCell>
                    <TableCell>
                      {c.company ? (
                        <Select
                          value={c.company.pricelist_id ?? "_none"}
                          onValueChange={(v) =>
                            assignPL.mutate({ companyId: c.company!.id, pricelistId: v === "_none" ? null : v })
                          }
                        >
                          <SelectTrigger className="h-8 w-44 text-xs"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="_none">— Bez ceníku —</SelectItem>
                            {pricelists.map((p) => (
                              <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : "—"}
                    </TableCell>
                    <TableCell className="text-right">
                      {c.status !== "approved" && (
                        <Button size="sm" variant="ghost" onClick={() => setStatus.mutate({ id: c.id, status: "approved" })}>
                          <Check className="mr-1 h-3.5 w-3.5 text-success" /> Schválit
                        </Button>
                      )}
                      {c.status === "pending" && (
                        <Button size="sm" variant="ghost" onClick={() => setStatus.mutate({ id: c.id, status: "blocked" })}>
                          <X className="mr-1 h-3.5 w-3.5 text-destructive" /> Zamítnout
                        </Button>
                      )}
                      {c.status === "approved" && (
                        <Button size="sm" variant="ghost" onClick={() => setStatus.mutate({ id: c.id, status: "blocked" })}>
                          <Lock className="mr-1 h-3.5 w-3.5 text-destructive" /> Blokovat
                        </Button>
                      )}
                      {c.status === "blocked" && (
                        <Button size="sm" variant="ghost" onClick={() => setStatus.mutate({ id: c.id, status: "approved" })}>
                          <Unlock className="mr-1 h-3.5 w-3.5 text-success" /> Odblokovat
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      <p className="text-xs text-muted-foreground">Zobrazeno {counts.total} záznamů</p>
    </div>
  );
}
