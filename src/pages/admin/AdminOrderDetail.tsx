import { useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useParams } from "react-router-dom";
import { fetchOrderDetail, ORDER_STATUS_CLASS, ORDER_STATUS_LABEL, type OrderStatus } from "@/lib/api/orders";
import {
  adminUpdateOrderStatus,
  adminUpdateOrderInternalNote,
  adminUploadInvoice,
  adminRemoveInvoice,
  adminGetSignedInvoiceUrl,
} from "@/lib/api/adminOrders";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, FileDown, Trash2, Upload } from "lucide-react";
import { formatDate, formatPrice } from "@/lib/format";
import { toast } from "sonner";

const STATUSES: OrderStatus[] = ["new", "confirmed", "processing", "shipped", "completed", "cancelled"];

export default function AdminOrderDetail() {
  const { id = "" } = useParams();
  const qc = useQueryClient();
  const fileRef = useRef<HTMLInputElement>(null);
  const [internalNote, setInternalNote] = useState("");
  const [noteLoaded, setNoteLoaded] = useState(false);

  const { data, isLoading, error } = useQuery({
    queryKey: ["admin-order", id],
    queryFn: () => fetchOrderDetail(id),
    enabled: !!id,
    retry: 1,
  });

  if (data && !noteLoaded) {
    setInternalNote(data.internal_note ?? "");
    setNoteLoaded(true);
  }

  const statusMut = useMutation({
    mutationFn: (status: OrderStatus) => adminUpdateOrderStatus(id, status),
    onSuccess: () => {
      toast.success("Stav byl změněn.");
      qc.invalidateQueries({ queryKey: ["admin-order", id] });
      qc.invalidateQueries({ queryKey: ["admin-orders"] });
    },
    onError: (e: any) => toast.error(e.message),
  });

  const noteMut = useMutation({
    mutationFn: () => adminUpdateOrderInternalNote(id, internalNote),
    onSuccess: () => toast.success("Poznámka uložena."),
    onError: (e: any) => toast.error(e.message),
  });

  const uploadMut = useMutation({
    mutationFn: (file: File) => adminUploadInvoice(id, data!.company_id, file),
    onSuccess: () => {
      toast.success("Faktura byla nahrána.");
      qc.invalidateQueries({ queryKey: ["admin-order", id] });
    },
    onError: (e: any) => toast.error(e.message),
  });

  const removeMut = useMutation({
    mutationFn: () => adminRemoveInvoice(id, data!.invoice_url!),
    onSuccess: () => {
      toast.success("Faktura byla smazána.");
      qc.invalidateQueries({ queryKey: ["admin-order", id] });
    },
    onError: (e: any) => toast.error(e.message),
  });

  async function openInvoice() {
    if (!data?.invoice_url) return;
    try {
      const url = await adminGetSignedInvoiceUrl(data.invoice_url);
      window.open(url, "_blank", "noopener,noreferrer");
    } catch (e: any) {
      toast.error(e.message);
    }
  }

  if (isLoading) return <p className="text-muted-foreground">Načítám…</p>;
  if (error) return <p className="text-destructive">Objednávku se nepodařilo načíst: {(error as any).message}</p>;
  if (!data) return <p>Objednávka nebyla nalezena.</p>;

  return (
    <div className="space-y-6">
      <Button asChild variant="ghost" size="sm">
        <Link to="/admin/objednavky"><ArrowLeft className="mr-1 h-4 w-4" /> Zpět na seznam</Link>
      </Button>

      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-bold">Objednávka #{data.order_number}</h1>
          <p className="text-sm text-muted-foreground">{formatDate(data.created_at)}</p>
        </div>
        <Badge className={ORDER_STATUS_CLASS[data.status]}>{ORDER_STATUS_LABEL[data.status]}</Badge>
      </header>

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
              <p className="text-xs uppercase tracking-wider text-muted-foreground">Poznámka klienta</p>
              <p className="mt-1 whitespace-pre-line text-sm">{data.customer_note}</p>
            </Card>
          )}

          <Card className="p-4">
            <p className="mb-2 text-xs uppercase tracking-wider text-muted-foreground">Interní poznámka</p>
            <Textarea
              rows={3}
              value={internalNote}
              onChange={(e) => setInternalNote(e.target.value)}
              placeholder="Pouze pro interní účely…"
            />
            <Button size="sm" className="mt-2" onClick={() => noteMut.mutate()} disabled={noteMut.isPending}>
              Uložit poznámku
            </Button>
          </Card>
        </div>

        <div className="space-y-4 lg:sticky lg:top-24 h-fit">
          <Card className="space-y-2 p-5">
            <h2 className="mb-2 text-lg font-semibold">Souhrn</h2>
            <Row label="Mezisoučet" value={formatPrice(data.subtotal, data.currency)} />
            <Row label="Doprava" value={formatPrice(data.shipping, data.currency)} muted />
            <Row label="DPH" value={formatPrice(data.vat, data.currency)} muted />
            <div className="my-3 border-t border-border" />
            <Row label="Celkem" value={formatPrice(data.total, data.currency)} bold />
          </Card>

          <Card className="space-y-3 p-5">
            <h2 className="text-lg font-semibold">Stav objednávky</h2>
            <Select value={data.status} onValueChange={(v) => statusMut.mutate(v as OrderStatus)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {STATUSES.map((s) => (
                  <SelectItem key={s} value={s}>{ORDER_STATUS_LABEL[s]}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Card>

          <Card className="space-y-3 p-5">
            <h2 className="text-lg font-semibold">Faktura (PDF)</h2>
            {data.invoice_url ? (
              <>
                <Button variant="outline" className="w-full" onClick={openInvoice}>
                  <FileDown className="mr-2 h-4 w-4" /> Otevřít fakturu
                </Button>
                <Button
                  variant="ghost"
                  className="w-full text-destructive hover:bg-destructive/10 hover:text-destructive"
                  onClick={() => removeMut.mutate()}
                  disabled={removeMut.isPending}
                >
                  <Trash2 className="mr-2 h-4 w-4" /> Odstranit fakturu
                </Button>
              </>
            ) : (
              <>
                <input
                  ref={fileRef}
                  type="file"
                  accept="application/pdf"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) uploadMut.mutate(f);
                    e.target.value = "";
                  }}
                />
                <Button className="w-full" onClick={() => fileRef.current?.click()} disabled={uploadMut.isPending}>
                  <Upload className="mr-2 h-4 w-4" /> {uploadMut.isPending ? "Nahrávám…" : "Nahrát PDF fakturu"}
                </Button>
                <p className="text-xs text-muted-foreground">PDF bude přístupné klientovi v sekci Faktury.</p>
              </>
            )}
          </Card>
        </div>
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
