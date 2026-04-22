import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { fetchMyOrders, getInvoiceSignedUrl } from "@/lib/api/orders";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileDown, FileText } from "lucide-react";
import { formatDate, formatPrice } from "@/lib/format";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface InvoiceRow {
  id: string;
  order_number: string;
  total: number;
  currency: string;
  created_at: string;
  invoice_url: string | null;
}

export default function Invoices() {
  const { data, isLoading } = useQuery({
    queryKey: ["my-invoices"],
    queryFn: async (): Promise<InvoiceRow[]> => {
      const { data, error } = await supabase
        .from("orders")
        .select("id, order_number, total, currency, created_at, invoice_url")
        .not("invoice_url", "is", null)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as InvoiceRow[];
    },
  });

  async function open(path: string) {
    try {
      const url = await getInvoiceSignedUrl(path);
      window.open(url, "_blank", "noopener,noreferrer");
    } catch (e: any) {
      toast.error(e.message ?? "Fakturu nelze otevřít.");
    }
  }

  return (
    <div className="container py-8 md:py-10">
      <h1 className="mb-6 font-display text-3xl font-bold">Faktury</h1>
      {isLoading ? (
        <p className="text-muted-foreground">Načítám…</p>
      ) : !data || data.length === 0 ? (
        <Card className="p-10 text-center">
          <FileText className="mx-auto h-10 w-10 text-muted-foreground" />
          <p className="mt-3 font-medium">Zatím nemáte žádné faktury</p>
          <p className="mt-1 text-sm text-muted-foreground">Faktury vám zpřístupní administrátor po vyřízení objednávky.</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {data.map((o) => (
            <Card key={o.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <Link to={`/ucet/objednavky/${o.id}`} className="font-semibold hover:text-primary">
                  Faktura k objednávce #{o.order_number}
                </Link>
                <p className="text-xs text-muted-foreground">{formatDate(o.created_at)}</p>
              </div>
              <div className="flex items-center justify-between gap-4 sm:justify-end">
                <p className="font-semibold">{formatPrice(o.total, o.currency)}</p>
                <Button variant="outline" size="sm" onClick={() => o.invoice_url && open(o.invoice_url)}>
                  <FileDown className="mr-1 h-3.5 w-3.5" /> Stáhnout PDF
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
