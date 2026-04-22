import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import { fetchAddresses } from "@/lib/api/account";
import { createOrder } from "@/lib/api/orders";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Loader2, MapPin, Plus } from "lucide-react";
import { Link } from "react-router-dom";
import { formatPrice } from "@/lib/format";
import { toast } from "sonner";

export default function Checkout() {
  const { user, profile } = useAuth();
  const { lines, subtotal, clear } = useCart();
  const navigate = useNavigate();
  const companyId = profile?.company_id ?? null;

  const { data: addresses = [], isLoading } = useQuery({
    queryKey: ["addresses", companyId],
    queryFn: () => fetchAddresses(companyId!),
    enabled: !!companyId,
  });

  const billingOptions = useMemo(() => addresses.filter((a) => a.kind === "billing"), [addresses]);
  const shippingOptions = useMemo(() => addresses.filter((a) => a.kind === "shipping"), [addresses]);

  const [billingId, setBillingId] = useState<string>("");
  const [shippingId, setShippingId] = useState<string>("");
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!billingId && billingOptions.length > 0) setBillingId(billingOptions.find((a) => a.is_default)?.id ?? billingOptions[0].id);
    if (!shippingId && shippingOptions.length > 0) setShippingId(shippingOptions.find((a) => a.is_default)?.id ?? shippingOptions[0].id);
  }, [billingOptions, shippingOptions]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!user || !companyId) return null;

  if (lines.length === 0) {
    return (
      <div className="container py-16 text-center">
        <h1 className="font-display text-2xl font-semibold">Košík je prázdný</h1>
        <Button asChild className="mt-6"><Link to="/katalog">Do katalogu</Link></Button>
      </div>
    );
  }

  const canSubmit = !!billingId && !!shippingId && lines.every((l) => l.unit_price != null) && !submitting;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    try {
      const billing = addresses.find((a) => a.id === billingId)!;
      const shipping = addresses.find((a) => a.id === shippingId)!;
      const result = await createOrder({
        company_id: companyId,
        user_id: user.id,
        items: lines.map((l) => ({
          product_id: l.product_id,
          product_name: l.product.name,
          product_sku: l.product.sku,
          unit: l.product.unit,
          qty: l.qty,
          unit_price: l.unit_price as number,
        })),
        billing_address: stripAddress(billing),
        shipping_address: stripAddress(shipping),
        customer_note: note || undefined,
      });
      await clear();
      toast.success(`Objednávka ${result.order_number} byla vytvořena`);
      navigate(`/ucet/objednavky/${result.id}`);
    } catch (e: any) {
      toast.error(e.message || "Nepodařilo se vytvořit objednávku");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container py-8 md:py-10">
      <h1 className="mb-6 font-display text-3xl font-bold">Dokončení objednávky</h1>

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          <AddressBlock
            title="Fakturační adresa"
            kind="billing"
            options={billingOptions}
            value={billingId}
            onChange={setBillingId}
            loading={isLoading}
          />
          <AddressBlock
            title="Dodací adresa"
            kind="shipping"
            options={shippingOptions}
            value={shippingId}
            onChange={setShippingId}
            loading={isLoading}
          />

          <Card className="p-5">
            <Label htmlFor="note" className="mb-2 block">Poznámka pro nás (volitelné)</Label>
            <Textarea id="note" rows={4} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Termín dodání, kontakt na řidiče atp." />
          </Card>
        </div>

        <Card className="h-fit p-5 lg:sticky lg:top-24">
          <h2 className="mb-4 text-lg font-semibold">Shrnutí</h2>
          <div className="space-y-2 max-h-64 overflow-auto pr-1 text-sm">
            {lines.map((l) => (
              <div key={l.id} className="flex justify-between gap-3">
                <span className="line-clamp-1">{l.qty}× {l.product.name}</span>
                <span className="shrink-0">{formatPrice(l.line_total)}</span>
              </div>
            ))}
          </div>
          <div className="my-4 border-t border-border" />
          <div className="space-y-1 text-sm">
            <Row label="Mezisoučet" value={formatPrice(subtotal)} />
            <Row label="DPH 21 %" value={formatPrice((subtotal ?? 0) * 0.21)} muted />
            <Row label="Doprava" value="Bude doplněna" muted />
          </div>
          <div className="my-4 border-t border-border" />
          <Row label="Celkem (s DPH)" value={formatPrice((subtotal ?? 0) * 1.21)} bold />

          <Button onClick={handleSubmit} disabled={!canSubmit} className="mt-5 w-full bg-accent text-accent-foreground hover:bg-accent/90">
            {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Závazně objednat
          </Button>
          <p className="mt-2 text-[11px] text-muted-foreground">Vytvořením objednávky souhlasíte s obchodními podmínkami.</p>
        </Card>
      </div>
    </div>
  );
}

function AddressBlock({
  title,
  kind,
  options,
  value,
  onChange,
  loading,
}: {
  title: string;
  kind: "billing" | "shipping";
  options: any[];
  value: string;
  onChange: (id: string) => void;
  loading: boolean;
}) {
  return (
    <Card className="p-5">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-lg font-semibold"><MapPin className="h-4 w-4" /> {title}</h2>
        <Button variant="ghost" size="sm" asChild>
          <Link to="/ucet/adresy"><Plus className="mr-1 h-3.5 w-3.5" /> Spravovat</Link>
        </Button>
      </div>
      {loading ? (
        <p className="text-sm text-muted-foreground">Načítám…</p>
      ) : options.length === 0 ? (
        <div className="rounded-md border border-dashed border-border p-4 text-sm text-muted-foreground">
          Nemáte žádnou {kind === "billing" ? "fakturační" : "dodací"} adresu. <Link to="/ucet/adresy" className="font-medium text-primary hover:underline">Přidejte adresu</Link>.
        </div>
      ) : (
        <RadioGroup value={value} onValueChange={onChange} className="space-y-2">
          {options.map((a) => (
            <Label
              key={a.id}
              htmlFor={a.id}
              className={`flex cursor-pointer items-start gap-3 rounded-md border p-3 transition-colors ${value === a.id ? "border-primary bg-primary/5" : "border-border hover:bg-secondary/50"}`}
            >
              <RadioGroupItem id={a.id} value={a.id} className="mt-0.5" />
              <div className="text-sm">
                <p className="font-medium">{a.label || (a.kind === "billing" ? "Fakturační adresa" : "Dodací adresa")}{a.is_default && <span className="ml-2 rounded bg-secondary px-1.5 py-0.5 text-[10px] uppercase">Výchozí</span>}</p>
                {a.contact_name && <p className="text-muted-foreground">{a.contact_name}</p>}
                <p className="text-muted-foreground">{a.street}, {a.postal_code} {a.city}, {a.country}</p>
              </div>
            </Label>
          ))}
        </RadioGroup>
      )}
    </Card>
  );
}

function Row({ label, value, muted = false, bold = false }: { label: string; value: string; muted?: boolean; bold?: boolean }) {
  return (
    <div className={`flex items-center justify-between ${bold ? "text-base font-semibold" : ""}`}>
      <span className={muted ? "text-muted-foreground" : ""}>{label}</span>
      <span>{value}</span>
    </div>
  );
}

function stripAddress(a: any) {
  return {
    label: a.label,
    contact_name: a.contact_name,
    street: a.street,
    city: a.city,
    postal_code: a.postal_code,
    country: a.country,
    phone: a.phone,
  };
}
