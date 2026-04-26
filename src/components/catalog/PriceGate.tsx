import { Link } from "react-router-dom";
import { Lock, Clock } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { fetchPricesForProducts } from "@/lib/api/cart";

interface PriceGateProps {
  productId?: string;
  unit?: string;
}

const formatPrice = (value: number) =>
  new Intl.NumberFormat("cs-CZ", { style: "currency", currency: "CZK", maximumFractionDigits: 2 }).format(value);

export function PriceGate({ productId, unit = "ks" }: PriceGateProps) {
  const { user, isApproved, profile } = useAuth();

  const { data, isLoading } = useQuery({
    queryKey: ["product-price", productId],
    queryFn: () => fetchPricesForProducts([productId!]),
    enabled: !!productId && !!user && isApproved,
  });

  if (user && isApproved) {
    const tiers = (productId && data?.[productId]) || [];
    const sorted = [...tiers].sort((a, b) => a.min_qty - b.min_qty);
    const base = sorted[0];

    if (isLoading) {
      return (
        <Card className="border-primary/20 bg-primary/5 p-5">
          <p className="text-sm text-muted-foreground">Načítám vaši cenu…</p>
        </Card>
      );
    }

    if (!base) {
      return (
        <Card className="border-warning/40 bg-warning/5 p-5">
          <p className="text-sm">
            <span className="font-semibold">Cena na vyžádání.</span> Pro tento produkt zatím nemáte přiřazenou ceníkovou cenu — kontaktujte nás prosím.
          </p>
        </Card>
      );
    }

    return (
      <Card className="border-success/30 bg-success/5 p-5">
        <div className="space-y-2">
          <div className="flex items-baseline gap-2">
            <span className="font-display text-3xl font-bold text-foreground">{formatPrice(base.unit_price)}</span>
            <span className="text-sm text-muted-foreground">/ {unit}</span>
          </div>
          {sorted.length > 1 && (
            <div className="space-y-1 pt-2">
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Množstevní slevy</p>
              <ul className="space-y-0.5 text-sm">
                {sorted.slice(1).map((t) => (
                  <li key={t.min_qty} className="flex items-center justify-between">
                    <span className="text-muted-foreground">od {t.min_qty} {unit}</span>
                    <span className="font-semibold text-foreground">{formatPrice(t.unit_price)} / {unit}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </Card>
    );
  }

  if (user && !isApproved) {
    return (
      <Card className="border-warning/40 bg-warning/5 p-5">
        <div className="flex items-start gap-3">
          <Clock className="mt-0.5 h-5 w-5 text-warning" />
          <div className="space-y-1">
            <h3 className="text-sm font-semibold text-foreground">
              {profile?.status === "blocked" ? "Účet zablokován" : "Účet čeká na schválení"}
            </h3>
            <p className="text-sm text-muted-foreground">
              Ceny a dostupnost se zobrazí, jakmile administrátor schválí vaši B2B registraci.
            </p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="border-primary/20 bg-gradient-subtle p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="rounded-md bg-primary/10 p-2 text-primary">
            <Lock className="h-5 w-5" />
          </div>
          <div className="space-y-0.5">
            <h3 className="text-sm font-semibold text-foreground">Ceny pouze pro registrované B2B partnery</h3>
            <p className="text-sm text-muted-foreground">Po schválení uvidíte ceny dle individuálního ceníku.</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link to="/prihlaseni">Přihlásit se</Link>
          </Button>
          <Button size="sm" asChild className="bg-accent text-accent-foreground hover:bg-accent/90">
            <Link to="/registrace">Registrace B2B</Link>
          </Button>
        </div>
      </div>
    </Card>
  );
}
