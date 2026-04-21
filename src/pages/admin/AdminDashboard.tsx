import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, Users, Clock, Tag, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { adminGetStats } from "@/lib/api/admin";
import { Skeleton } from "@/components/ui/skeleton";

export default function AdminDashboard() {
  const { data: stats, isLoading } = useQuery({ queryKey: ["admin-stats"], queryFn: adminGetStats });

  const cards = [
    { label: "Produkty v katalogu", value: stats?.products, icon: Package, to: "/admin/produkty", tone: "primary" as const },
    { label: "Schválení klienti", value: stats?.approvedClients, icon: Users, to: "/admin/klienti?stav=approved", tone: "success" as const },
    { label: "Čekající registrace", value: stats?.pendingClients, icon: Clock, to: "/admin/klienti?stav=pending", tone: "warning" as const },
    { label: "Ceníky", value: stats?.pricelists, icon: Tag, to: "/admin/ceniky", tone: "primary" as const },
  ];

  return (
    <div className="space-y-8">
      <header>
        <h1 className="font-display text-3xl font-bold">Přehled</h1>
        <p className="mt-1 text-sm text-muted-foreground">Centrální správa B2B platformy</p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((c) => (
          <Link key={c.label} to={c.to}>
            <Card className="group transition-all hover:-translate-y-0.5 hover:shadow-soft">
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{c.label}</p>
                    {isLoading ? (
                      <Skeleton className="mt-2 h-9 w-16" />
                    ) : (
                      <p className="mt-2 font-display text-3xl font-bold">{c.value}</p>
                    )}
                  </div>
                  <div
                    className={
                      c.tone === "warning"
                        ? "rounded-lg bg-warning/10 p-2 text-warning"
                        : c.tone === "success"
                        ? "rounded-lg bg-success/10 p-2 text-success"
                        : "rounded-lg bg-primary/10 p-2 text-primary"
                    }
                  >
                    <c.icon className="h-5 w-5" />
                  </div>
                </div>
                <div className="mt-4 inline-flex items-center gap-1 text-xs text-muted-foreground group-hover:text-primary">
                  Otevřít <ArrowRight className="h-3 w-3" />
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Rychlé odkazy</CardTitle>
          <CardDescription>Nejčastější admin operace</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-2 sm:grid-cols-2">
          <Link to="/admin/produkty/novy" className="rounded-md border border-border bg-card p-3 text-sm hover:border-primary/40">
            ➕ Nový produkt
          </Link>
          <Link to="/admin/kategorie" className="rounded-md border border-border bg-card p-3 text-sm hover:border-primary/40">
            🗂️ Spravovat kategorie
          </Link>
          <Link to="/admin/klienti?stav=pending" className="rounded-md border border-border bg-card p-3 text-sm hover:border-primary/40">
            ✅ Schválit čekající registrace
          </Link>
          <Link to="/admin/ceniky" className="rounded-md border border-border bg-card p-3 text-sm hover:border-primary/40">
            💰 Upravit ceníky
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
