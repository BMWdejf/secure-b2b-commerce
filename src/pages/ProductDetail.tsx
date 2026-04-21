import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { fetchProductBySlug } from "@/lib/api/catalog";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PriceGate } from "@/components/catalog/PriceGate";
import { ChevronRight, Package, ShoppingCart } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export default function ProductDetail() {
  const { slug = "" } = useParams();
  const { user, isApproved } = useAuth();
  const [activeImage, setActiveImage] = useState(0);

  const { data, isLoading } = useQuery({
    queryKey: ["product", slug],
    queryFn: () => fetchProductBySlug(slug),
    enabled: !!slug,
  });

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

  const canOrder = !!user && isApproved;

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
            {product.sku && <Badge variant="secondary">SKU: {product.sku}</Badge>}
            <h1 className="font-display text-3xl font-bold tracking-tight md:text-4xl">{product.name}</h1>
            {product.short_description && (
              <p className="text-lg text-muted-foreground">{product.short_description}</p>
            )}
          </div>

          <PriceGate />

          <Card className="grid grid-cols-2 gap-4 p-5 sm:grid-cols-4">
            <Spec label="Jednotka" value={product.unit} />
            <Spec label="MOQ" value={`${product.moq} ${product.unit}`} />
            <Spec label="Karton" value={`${product.pack_size} ${product.unit}`} />
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

          <div className="flex flex-wrap gap-3 border-t border-border pt-6">
            <Button size="lg" disabled={!canOrder} className="bg-accent text-accent-foreground hover:bg-accent/90">
              <ShoppingCart className="mr-2 h-4 w-4" />
              {canOrder ? "Přidat do košíku" : "Objednávka po přihlášení"}
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
