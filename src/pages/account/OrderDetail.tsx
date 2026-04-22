import { useQuery } from "@tanstack/react-query";
import { Link, useParams } from "react-router-dom";
import { fetchOrderDetail, getInvoiceSignedUrl, ORDER_STATUS_CLASS, ORDER_STATUS_LABEL } from "@/lib/api/orders";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, FileDown } from "lucide-react";
import { formatDate, formatPrice } from "@/lib/format";
import { toast } from "sonner";

export default function OrderDetail() {
  const { id = "" } = useParams();
  const { data, isLoading } = useQuery({ queryKey: ["order", id], queryFn: () => fetchOrderDetail(id), enabled: !!id });

  async function downloadInvoice() {
    if (!data?.invoice_url) return;
    try {
      const url = await getInvoiceSignedUrl(data.invoice_url);
      window.open(url, "_blank", "noopener,noreferrer");
    } catch (e: any) {
      toast.error(e.message ?? "Fakturu se nepodařilo otevřít.");
    }
  }

  if (isLoading) return <div className="container py-12 text-muted-foreground">Načítám…</div>;
  if (!data) return <div className="container py-12">Objednávka nebyla nalezena.</div>;

  return (
    <div className="container py-8 md:py-10">
      <Button asChild variant="ghost" size="sm" className="mb-4">
        <Link to="/ucet/objednavky"><ArrowLeft className="mr-1 h-4 w-4" /> Zpět na objednávky</Link>
      </Button>

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-bold">Objednávka #{data.order_number}</h1>
          <p className="text-sm text-muted-foreground">{formatDate(data.created_at)}</p>
        </div>
        <Badge className={ORDER_STATUS_CLASS[data.status]}>{ORDER_STATUS_LABEL[data.status]}</Badge>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-4">
          <Card className="overflow-hidden">
            <div className="border-b border-border bg-secondary/40 px-5 py-3 font-semibold">Položky</div>
            <div className="divide-y divide-border">
              {data.items.map((it) => (
                <div key={it.id} className="flex items-start justify-between gap-3 p-4">
                  <div className="min-w-0">
                    <p className="font-medium">{it.product_name}</p>
                    {it.product_sku && <p className="text-xs text-muted-foreground">SKU: {it.product_sku}</p>}
                    <p className="text-xs text-muted-foreground">{it.qty} {it.unit} × {formatPrice(it.unit_price, data.currency)}</p>
                  </div>
                  <p className="font-semibold">{formatPrice(it.line_total, data.currency)}</p>
                </div>
              ))}
            </div>
          </Card>

          <div className="grid gap-4 md:grid-cols-2">
            <AddressCard title="Fakturační adresa" address={data.billing_address} />
            <AddressCard title="Dodací adresa" address={data.shipping_address} />
          </div>

          {data.customer_note && (
            <Card className="p-4">
              <p className="text-xs uppercase tracking-wider text-muted-foreground">Poznámka</p>
              <p className="mt-1 whitespace-pre-line text-sm">{data.customer_note}</p>
            </Card>
          )}
        </div>

        <Card className="h-fit space-y-2 p-5 lg:sticky lg:top-24">
          <h2 className="mb-2 text-lg font-semibold">Souhrn</h2>
          <Row label="Mezisoučet" value={formatPrice(data.subtotal, data.currency)} />
          <Row label="Doprava" value={formatPrice(data.shipping, data.currency)} muted />
          <Row label="DPH" value={formatPrice(data.vat, data.currency)} muted />
          <div className="my-3 border-t border-border" />
          <Row label="Celkem" value={formatPrice(data.total, data.currency)} bold />
          {data.invoice_url ? (
            <Button onClick={downloadInvoice} variant="outline" className="mt-4 w-full">
              <FileDown className="mr-2 h-4 w-4" /> Stáhnout fakturu
            </Button>
          ) : (
            <p className="mt-4 text-center text-xs text-muted-foreground">Faktura zatím není k dispozici.</p>
          )}
        </Card>
      </div>
    </div>
  );
}

function AddressCard({ title, address }: { title: string; address: any }) {
  if (!address) return null;
  return (
    <Card className="p-4">
      <p className="text-xs uppercase tracking-wider text-muted-foreground">{title}</p>
      {address.contact_name && <p className="mt-1 font-medium">{address.contact_name}</p>}
      <p className="text-sm text-muted-foreground">{address.street}</p>
      <p className="text-sm text-muted-foreground">{address.postal_code} {address.city}, {address.country}</p>
      {address.phone && <p className="mt-1 text-sm text-muted-foreground">Tel: {address.phone}</p>}
    </Card>
  );
}

function Row({ label, value, muted = false, bold = false }: { label: string; value: string; muted?: boolean; bold?: boolean }) {
  return (
    <div className={`flex items-center justify-between text-sm ${bold ? "text-base font-semibold" : ""}`}>
      <span className={muted ? "text-muted-foreground" : ""}>{label}</span>
      <span>{value}</span>
    </div>
  );
}
