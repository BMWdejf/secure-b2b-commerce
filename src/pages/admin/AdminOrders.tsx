import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { adminListOrders } from "@/lib/api/adminOrders";
import { ORDER_STATUS_CLASS, ORDER_STATUS_LABEL, type OrderStatus } from "@/lib/api/orders";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { ArrowRight, Search, ShoppingCart } from "lucide-react";
import { formatDate, formatPrice } from "@/lib/format";

const STATUSES: OrderStatus[] = ["new", "confirmed", "processing", "shipped", "completed", "cancelled"];

export default function AdminOrders() {
  const [status, setStatus] = useState<OrderStatus | "all">("all");
  const [search, setSearch] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["admin-orders", status, search],
    queryFn: () => adminListOrders({ status: status === "all" ? undefined : status, search }),
  });

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-bold">Objednávky</h1>
          <p className="mt-1 text-sm text-muted-foreground">Správa objednávek, změna stavu, nahrávání faktur</p>
        </div>
      </header>

      <Card className="p-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[220px]">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Hledat podle čísla objednávky…"
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Select value={status} onValueChange={(v) => setStatus(v as any)}>
            <SelectTrigger className="w-[200px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Všechny stavy</SelectItem>
              {STATUSES.map((s) => (
                <SelectItem key={s} value={s}>{ORDER_STATUS_LABEL[s]}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </Card>

      {isLoading ? (
        <p className="text-muted-foreground">Načítám…</p>
      ) : !data || data.length === 0 ? (
        <Card className="p-10 text-center">
          <ShoppingCart className="mx-auto h-10 w-10 text-muted-foreground" />
          <p className="mt-3 font-medium">Žádné objednávky neodpovídají filtru</p>
        </Card>
      ) : (
        <Card className="overflow-hidden">
          <div className="hidden border-b border-border bg-secondary/40 px-5 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground md:grid md:grid-cols-[140px_1fr_140px_140px_140px_60px] md:gap-3">
            <span>Číslo</span><span>Firma</span><span>Datum</span><span>Stav</span><span className="text-right">Celkem</span><span></span>
          </div>
          <div className="divide-y divide-border">
            {data.map((o) => (
              <div key={o.id} className="flex flex-col gap-2 p-4 md:grid md:grid-cols-[140px_1fr_140px_140px_140px_60px] md:items-center md:gap-3">
                <span className="font-semibold">#{o.order_number}</span>
                <span className="text-sm">{o.company?.name ?? "—"}</span>
                <span className="text-xs text-muted-foreground">{formatDate(o.created_at)}</span>
                <span><Badge className={ORDER_STATUS_CLASS[o.status]}>{ORDER_STATUS_LABEL[o.status]}</Badge></span>
                <span className="font-semibold md:text-right">{formatPrice(o.total, o.currency)}</span>
                <Button asChild variant="ghost" size="icon" className="md:justify-self-end">
                  <Link to={`/admin/objednavky/${o.id}`} aria-label="Detail"><ArrowRight className="h-4 w-4" /></Link>
                </Button>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
