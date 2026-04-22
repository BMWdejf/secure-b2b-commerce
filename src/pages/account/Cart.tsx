import { Link } from "react-router-dom";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Trash2, ShoppingCart, ArrowRight, Package, Lock } from "lucide-react";
import { formatPrice } from "@/lib/format";

export default function Cart() {
  const { lines, subtotal, loading, setQty, remove, clear } = useCart();
  const { isApproved } = useAuth();

  if (loading) {
    return <div className="container py-12 text-center text-muted-foreground">Načítám košík…</div>;
  }

  if (lines.length === 0) {
    return (
      <div className="container py-16 text-center">
        <ShoppingCart className="mx-auto h-12 w-12 text-muted-foreground" />
        <h1 className="mt-4 font-display text-2xl font-semibold">Košík je prázdný</h1>
        <p className="mt-2 text-muted-foreground">Vyberte produkty z katalogu a přidejte je do košíku.</p>
        <Button asChild className="mt-6">
          <Link to="/katalog">Přejít do katalogu</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container py-8 md:py-10">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-display text-3xl font-bold">Košík</h1>
        <Button variant="ghost" size="sm" onClick={() => clear()}>
          <Trash2 className="mr-2 h-4 w-4" /> Vyprázdnit
        </Button>
      </div>

      {!isApproved && (
        <Card className="mb-6 border-warning/30 bg-warning/5 p-4">
          <p className="flex items-start gap-2 text-sm text-foreground">
            <Lock className="mt-0.5 h-4 w-4 shrink-0 text-warning" />
            Váš účet zatím nebyl schválen. Po schválení uvidíte ceny dle vašeho ceníku a budete moci dokončit objednávku.
          </p>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-3">
          {lines.map((l) => (
            <Card key={l.id} className="flex gap-4 p-4">
              <Link to={`/produkt/${l.product.slug}`} className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-md bg-secondary sm:h-24 sm:w-24">
                {l.product.main_image_url ? (
                  <img src={l.product.main_image_url} alt={l.product.name} className="h-full w-full object-cover" />
                ) : (
                  <Package className="h-6 w-6 text-muted-foreground" />
                )}
              </Link>
              <div className="flex flex-1 flex-col gap-2 min-w-0">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <Link to={`/produkt/${l.product.slug}`} className="line-clamp-2 font-semibold hover:text-primary">
                      {l.product.name}
                    </Link>
                    {l.product.sku && <p className="text-xs text-muted-foreground">SKU: {l.product.sku}</p>}
                  </div>
                  <Button size="icon" variant="ghost" onClick={() => remove(l.id)} aria-label="Odebrat">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap items-end justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      min={1}
                      value={l.qty}
                      onChange={(e) => {
                        const v = Math.max(1, parseInt(e.target.value || "1", 10));
                        setQty(l.id, v);
                      }}
                      className="h-9 w-20"
                    />
                    <span className="text-xs text-muted-foreground">{l.product.unit}</span>
                  </div>
                  <div className="text-right">
                    {isApproved ? (
                      <>
                        <p className="text-xs text-muted-foreground">{formatPrice(l.unit_price)} / {l.product.unit}</p>
                        <p className="font-semibold">{formatPrice(l.line_total)}</p>
                      </>
                    ) : (
                      <p className="text-xs text-muted-foreground">Cena dle ceníku</p>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        <Card className="h-fit p-5 lg:sticky lg:top-24">
          <h2 className="mb-4 text-lg font-semibold">Souhrn</h2>
          <div className="space-y-2 text-sm">
            <Row label="Mezisoučet (bez DPH)" value={isApproved ? formatPrice(subtotal) : "Po schválení"} />
            <Row label="Doprava" value="Bude vyčíslena" muted />
            <Row label="DPH 21 %" value={isApproved && subtotal != null ? formatPrice(subtotal * 0.21) : "—"} muted />
          </div>
          <div className="my-4 border-t border-border" />
          <Row label="Celkem (s DPH)" value={isApproved && subtotal != null ? formatPrice(subtotal * 1.21) : "—"} bold />
          <Button asChild className="mt-5 w-full bg-accent text-accent-foreground hover:bg-accent/90" disabled={!isApproved}>
            <Link to="/ucet/checkout">
              Pokračovat k objednávce <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button asChild variant="ghost" size="sm" className="mt-2 w-full">
            <Link to="/katalog">Pokračovat v nákupu</Link>
          </Button>
        </Card>
      </div>
    </div>
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
