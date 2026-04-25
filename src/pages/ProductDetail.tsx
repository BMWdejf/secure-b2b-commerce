import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { fetchProductBySlug } from "@/lib/api/catalog";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PriceGate } from "@/components/catalog/PriceGate";
import { ChevronRight, Package, ShoppingCart, Minus, Plus, CheckCircle2, Clock } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import { useSiteSettings } from "@/contexts/SiteSettingsContext";
import { Input } from "@/components/ui/input";

export default function ProductDetail() {
  const { slug = "" } = useParams();
  const { user, isApproved } = useAuth();
  const { add } = useCart();
  const { settings } = useSiteSettings();
  const [activeImage, setActiveImage] = useState(0);
  const [qty, setQty] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ["product", slug],
    queryFn: () => fetchProductBySlug(slug),
    enabled: !!slug,
  });

  // Initialize qty to pack_size (or moq) when product loads
  useEffect(() => {
    if (data?.product) {
      const initial = Math.max(data.product.pack_size || 1, data.product.moq || 1);
      setQty(initial);
    }
  }, [data?.product?.id]);

  if (isLoading) {
    return (
      <div className="container py-12">
        <div className="grid gap-10 md:grid-cols-2">
          <Skeleton className="aspect-square w-full" />
          <div className="space-y-4">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-32 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="container py-20 text-center">
        <h1 className="font-display text-2xl font-semibold">Produkt nenalezen</h1>
        <p className="mt-2 text-muted-foreground">Produkt mohl být zneaktivněn nebo přesunut.</p>
        <Button asChild className="mt-6">
          <Link to="/katalog">Zpět do katalogu</Link>
        </Button>
      </div>
    );
  }

  const { product, images } = data;
  const gallery = images.length > 0
    ? images
    : product.main_image_url
      ? [{ id: "main", url: product.main_image_url, alt: product.name, sort_order: 0, is_primary: true }]
      : [];

  const canOrder = !!user && isApproved && product.availability === "in_stock";
  const inStock = product.availability === "in_stock";
  const stepSize = product.pack_size || 1;
  const minQty = Math.max(product.moq || 1, stepSize);
  const packLabel = product.pack_label || settings?.default_pack_label || "Karton";

  const inStockLabel = settings?.availability_in_stock_label ?? "Skladem";
  const onRequestLabel = settings?.availability_on_request_label ?? "Na dotaz";

  return (
    <div className="container py-8 md:py-12">
      <nav className="mb-6 flex items-center gap-1.5 text-sm text-muted-foreground">
        <Link to="/" className="hover:text-foreground">Domů</Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <Link to="/katalog" className="hover:text-foreground">Katalog</Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="line-clamp-1 text-foreground">{product.name}</span>
      </nav>

      <div className="grid gap-10 md:grid-cols-2">
        <div className="space-y-3">
          <div className="aspect-square overflow-hidden rounded-xl border border-border bg-secondary">
            {gallery[activeImage] ? (
              <img
                src={gallery[activeImage].url}
                alt={gallery[activeImage].alt ?? product.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                <Package className="h-16 w-16" />
              </div>
            )}
          </div>
          {gallery.length > 1 && (
            <div className="grid grid-cols-5 gap-2">
              {gallery.map((img, idx) => (
                <button
                  key={img.id}
                  onClick={() => setActiveImage(idx)}
                  className={`aspect-square overflow-hidden rounded-md border-2 transition-colors ${
                    idx === activeImage ? "border-primary" : "border-transparent hover:border-border"
                  }`}
                >
                  <img src={img.url} alt={img.alt ?? ""} className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              {product.sku && <Badge variant="secondary">SKU: {product.sku}</Badge>}
              {inStock ? (
                <Badge className="bg-success text-success-foreground hover:bg-success/90">
                  <CheckCircle2 className="mr-1 h-3 w-3" /> {inStockLabel}
                </Badge>
              ) : (
                <Badge variant="outline" className="border-warning/40 text-warning">
                  <Clock className="mr-1 h-3 w-3" /> {onRequestLabel}
                </Badge>
              )}
            </div>
            <h1 className="font-display text-3xl font-bold tracking-tight md:text-4xl">{product.name}</h1>
            {product.short_description && (
              <p className="text-lg text-muted-foreground">{product.short_description}</p>
            )}
          </div>

          <PriceGate />

          <Card className="grid grid-cols-3 gap-4 p-5">
            <Spec label="Jednotka" value={product.unit} />
            <Spec label={packLabel} value={`${product.pack_size} ${product.unit}`} />
            <Spec label="Hmotnost" value={product.weight_kg ? `${product.weight_kg} kg` : "—"} />
          </Card>

          {product.description && (
            <div className="space-y-2">
              <h2 className="text-base font-semibold">Popis</h2>
              <p className="whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
                {product.description}
              </p>
            </div>
          )}

          <div className="flex flex-wrap items-center gap-3 border-t border-border pt-6">
            {canOrder && (
              <div className="flex items-center gap-1 rounded-md border border-border">
                <Button size="icon" variant="ghost" onClick={() => setQty((q) => Math.max(minQty, q - stepSize))}>
                  <Minus className="h-4 w-4" />
                </Button>
                <Input
                  type="number"
                  min={minQty}
                  step={stepSize}
                  value={qty}
                  onChange={(e) => setQty(Math.max(minQty, parseInt(e.target.value || String(minQty), 10)))}
                  className="h-9 w-24 border-0 text-center focus-visible:ring-0"
                />
                <Button size="icon" variant="ghost" onClick={() => setQty((q) => q + stepSize)}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            )}
            <Button
              size="lg"
              disabled={!canOrder}
              onClick={() => canOrder && add(product.id, qty)}
              className="bg-accent text-accent-foreground hover:bg-accent/90"
            >
              <ShoppingCart className="mr-2 h-4 w-4" />
              {!user
                ? "Objednávka po přihlášení"
                : !isApproved
                  ? "Po schválení účtu"
                  : !inStock
                    ? "Nedostupné — kontaktujte nás"
                    : "Přidat do košíku"}
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link to="/katalog">Zpět do katalogu</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Spec({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[11px] uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="mt-0.5 text-sm font-semibold text-foreground">{value}</p>
    </div>
  );
}
