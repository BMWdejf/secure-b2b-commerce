import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { adminGetOrderStats, adminGetTopProducts } from "@/lib/api/adminOrders";
import { ORDER_STATUS_LABEL } from "@/lib/api/orders";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, BarChart, Bar, PieChart, Pie, Cell, Legend } from "recharts";
import { formatPrice } from "@/lib/format";
import { TrendingUp, ShoppingCart, Receipt } from "lucide-react";

const PERIODS = [
  { v: 7, l: "7 dní" },
  { v: 30, l: "30 dní" },
  { v: 90, l: "90 dní" },
];

const STATUS_COLORS = ["hsl(var(--primary))", "hsl(var(--accent))", "hsl(var(--warning))", "hsl(var(--success))", "hsl(var(--muted-foreground))", "hsl(var(--destructive))"];

export default function AdminStats() {
  const [days, setDays] = useState(30);

  const { data: stats, isLoading } = useQuery({
    queryKey: ["admin-stats-orders", days],
    queryFn: () => adminGetOrderStats(days),
  });
  const { data: top } = useQuery({
    queryKey: ["admin-top-products", days],
    queryFn: () => adminGetTopProducts(days, 10),
  });

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-bold">Statistiky</h1>
          <p className="mt-1 text-sm text-muted-foreground">Přehled tržeb a objednávek</p>
        </div>
        <Tabs value={String(days)} onValueChange={(v) => setDays(Number(v))}>
          <TabsList>
            {PERIODS.map((p) => <TabsTrigger key={p.v} value={String(p.v)}>{p.l}</TabsTrigger>)}
          </TabsList>
        </Tabs>
      </header>

      <div className="grid gap-4 sm:grid-cols-3">
        <KpiCard
          icon={Receipt}
          label="Tržby (s DPH)"
          value={isLoading ? "…" : formatPrice(stats?.totals.revenue ?? 0)}
          tone="primary"
        />
        <KpiCard
          icon={ShoppingCart}
          label="Počet objednávek"
          value={isLoading ? "…" : String(stats?.totals.orders ?? 0)}
          tone="success"
        />
        <KpiCard
          icon={TrendingUp}
          label="Průměrná objednávka"
          value={isLoading ? "…" : formatPrice(stats?.totals.avg ?? 0)}
          tone="warning"
        />
      </div>

      <Card>
        <CardHeader><CardTitle>Tržby v čase</CardTitle></CardHeader>
        <CardContent className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={stats?.series ?? []}>
              <defs>
                <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} tickFormatter={(v) => v.slice(5)} />
              <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
              <Tooltip
                contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }}
                formatter={(v: any) => formatPrice(Number(v))}
              />
              <Area type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" strokeWidth={2} fill="url(#rev)" />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Objednávky podle stavu</CardTitle></CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={(stats?.byStatus ?? []).map((s) => ({ name: ORDER_STATUS_LABEL[s.status], value: s.count }))}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={50}
                  outerRadius={90}
                  paddingAngle={2}
                >
                  {(stats?.byStatus ?? []).map((_, i) => (
                    <Cell key={i} fill={STATUS_COLORS[i % STATUS_COLORS.length]} />
                  ))}
                </Pie>
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Počet objednávek denně</CardTitle></CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats?.series ?? []}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} tickFormatter={(v) => v.slice(5)} />
                <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} allowDecimals={false} />
                <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} />
                <Bar dataKey="orders" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Top produkty</CardTitle></CardHeader>
        <CardContent>
          {!top || top.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">Pro vybrané období nejsou data.</p>
          ) : (
            <div className="overflow-hidden rounded-md border border-border">
              <div className="grid grid-cols-[1fr_100px_140px] gap-3 border-b border-border bg-secondary/40 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                <span>Produkt</span><span className="text-right">Množství</span><span className="text-right">Tržby</span>
              </div>
              <div className="divide-y divide-border">
                {top.map((p) => (
                  <div key={p.name} className="grid grid-cols-[1fr_100px_140px] items-center gap-3 px-4 py-2.5 text-sm">
                    <span className="truncate">{p.name}</span>
                    <span className="text-right tabular-nums">{p.qty}</span>
                    <span className="text-right font-semibold tabular-nums">{formatPrice(p.revenue)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function KpiCard({ icon: Icon, label, value, tone }: { icon: any; label: string; value: string; tone: "primary" | "success" | "warning" }) {
  const toneClass =
    tone === "warning" ? "bg-warning/10 text-warning"
    : tone === "success" ? "bg-success/10 text-success"
    : "bg-primary/10 text-primary";
  return (
    <Card>
      <CardContent className="flex items-center justify-between p-5">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</p>
          <p className="mt-2 font-display text-2xl font-bold">{value}</p>
        </div>
        <div className={`rounded-lg p-2.5 ${toneClass}`}>
          <Icon className="h-5 w-5" />
        </div>
      </CardContent>
    </Card>
  );
}
