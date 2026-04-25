import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Lock, Package, CheckCircle2, Clock } from "lucide-react";
import type { Product } from "@/lib/api/catalog";
import { useAuth } from "@/contexts/AuthContext";
import { useSiteSettings } from "@/contexts/SiteSettingsContext";

interface Props {
  product: Product;
}

export function ProductCard({ product }: Props) {
  const { user, isApproved } = useAuth();
  const { settings } = useSiteSettings();
  const showPricing = !!user && isApproved;
  const inStock = product.availability === "in_stock";
  const packLabel = product.pack_label || settings?.default_pack_label || "Karton";

  return (
    <Card className="group flex flex-col overflow-hidden border-border/60 transition-all hover:-translate-y-1 hover:shadow-elegant">
      <Link to={`/produkt/${product.slug}`} className="relative block aspect-square overflow-hidden bg-secondary">
        {product.main_image_url ? (
          <img
            src={product.main_image_url}
            alt={product.name}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-muted-foreground">
            <Package className="h-10 w-10" />
          </div>
        )}
        {product.sku && (
          <Badge variant="secondary" className="absolute left-3 top-3 bg-background/90 text-xs">
            {product.sku}
          </Badge>
        )}
      </Link>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <Link to={`/produkt/${product.slug}`} className="space-y-1">
          <h3 className="line-clamp-2 text-sm font-semibold leading-tight text-foreground group-hover:text-primary">
            {product.name}
          </h3>
          {product.short_description && (
            <p className="line-clamp-2 text-xs text-muted-foreground">{product.short_description}</p>
          )}
        </Link>

        <div className="flex flex-wrap gap-1.5 text-[11px] text-muted-foreground">
          <span className="rounded-md bg-secondary px-2 py-0.5">MOQ {product.moq} {product.unit}</span>
          <span className="rounded-md bg-secondary px-2 py-0.5">Karton {product.pack_size}</span>
        </div>

        <div className="mt-auto flex items-center justify-between gap-2 border-t border-border/60 pt-3">
          {showPricing ? (
            <span className="text-sm font-medium text-muted-foreground">Cena dle ceníku</span>
          ) : (
            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
              <Lock className="h-3.5 w-3.5" />
              Cena po přihlášení
            </span>
          )}
          <Button size="sm" variant="ghost" asChild className="text-primary hover:text-primary-hover">
            <Link to={`/produkt/${product.slug}`}>Detail →</Link>
          </Button>
        </div>
      </div>
    </Card>
  );
}
