import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { fetchMyOrders, ORDER_STATUS_CLASS, ORDER_STATUS_LABEL } from "@/lib/api/orders";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Package, ArrowRight } from "lucide-react";
import { formatDate, formatPrice } from "@/lib/format";

export default function MyOrders() {
  const { data, isLoading } = useQuery({ queryKey: ["my-orders"], queryFn: fetchMyOrders });

  return (
    <div className="container py-8 md:py-10">
      <h1 className="mb-6 font-display text-3xl font-bold">Moje objednávky</h1>

      {isLoading ? (
        <p className="text-muted-foreground">Načítám…</p>
      ) : !data || data.length === 0 ? (
        <Card className="p-10 text-center">
          <Package className="mx-auto h-10 w-10 text-muted-foreground" />
          <p className="mt-3 font-medium">Zatím nemáte žádné objednávky</p>
          <Button asChild className="mt-4"><Link to="/katalog">Přejít do katalogu</Link></Button>
        </Card>
      ) : (
        <div className="space-y-3">
          {data.map((o) => {
            return (
              <Card key={o.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-semibold">#{o.order_number}</p>
                    <Badge className={ORDER_STATUS_CLASS[o.status]}>{ORDER_STATUS_LABEL[o.status]}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">{formatDate(o.created_at)}</p>
                </div>
                <div className="flex items-center justify-between gap-4 sm:justify-end">
                  <p className="font-semibold">{formatPrice(o.total, o.currency)}</p>
                  <Button asChild variant="outline" size="sm">
                    <Link to={`/ucet/objednavky/${o.id}`}>Detail <ArrowRight className="ml-1 h-3.5 w-3.5" /></Link>
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
