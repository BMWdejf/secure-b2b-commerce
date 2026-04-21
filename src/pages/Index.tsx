import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, Package, FileText, Users, ShieldCheck, Truck, Zap } from "lucide-react";
import { fetchCategories } from "@/lib/api/catalog";

const features = [
  {
    icon: Package,
    title: "Individuální ceníky",
    desc: "Každý B2B partner má vlastní cenovou hladinu a množstevní slevy přizpůsobené objemu.",
  },
  {
    icon: FileText,
    title: "Fakturace bez platební brány",
    desc: "Objednávky se realizují klasicky fakturou se splatností. Žádné poplatky za platby.",
  },
  {
    icon: Zap,
    title: "Rychlé opakované objednávky",
    desc: "Vytvořte objednávku jedním kliknutím podle historie. Šetří čas vašim nákupčím.",
  },
  {
    icon: Users,
    title: "Více uživatelů ve firmě",
    desc: "Přidejte své kolegy a nákupčí pod jeden firemní účet s přehledem o všech objednávkách.",
  },
  {
    icon: Truck,
    title: "Přehled o stavu zásilek",
    desc: "Sledujte stav každé objednávky v reálném čase, od potvrzení až po doručení.",
  },
  {
    icon: ShieldCheck,
    title: "Bezpečný a ověřený přístup",
    desc: "Ceny a sklad jsou viditelné až po schválení vaší firmy. Žádné úniky obchodních podmínek.",
  },
];

export default function Index() {
  return (
    <div className="animate-fade-in">
      {/* HERO */}
      <section className="relative overflow-hidden bg-gradient-hero text-primary-foreground">
        <div className="absolute inset-0 opacity-20" style={{
          backgroundImage: "radial-gradient(circle at 20% 50%, hsl(var(--accent)) 0%, transparent 40%), radial-gradient(circle at 80% 80%, hsl(var(--primary-glow)) 0%, transparent 40%)"
        }} />
        <div className="container relative grid gap-10 py-20 md:grid-cols-2 md:py-28 lg:py-32">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary-foreground/20 bg-primary-foreground/10 px-3 py-1 text-xs font-medium backdrop-blur-sm">
              <span className="h-2 w-2 animate-pulse rounded-full bg-accent" />
              B2B velkoobchodní platforma nové generace
            </div>
            <h1 className="font-display text-4xl font-bold leading-tight text-balance md:text-5xl lg:text-6xl">
              Velkoobchod, který šetří čas vašim <span className="text-accent">nákupčím</span>.
            </h1>
            <p className="max-w-xl text-lg text-primary-foreground/80">
              NordB2B je moderní platforma pro velkoobchodní partnery. Individuální ceny,
              rychlé objednávky a přehledná fakturace — vše na jednom místě.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button size="lg" asChild className="bg-accent text-accent-foreground hover:bg-accent/90">
                <Link to="/registrace">
                  Registrovat firmu <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="border-primary-foreground/30 bg-transparent text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground">
                <Link to="/katalog">Procházet katalog</Link>
              </Button>
            </div>
            <p className="text-sm text-primary-foreground/60">
              Ceny a dostupnost se zobrazí až po schválení vaší firmy administrátorem.
            </p>
          </div>

          <div className="relative hidden md:block">
            <div className="absolute inset-0 rounded-3xl bg-primary-foreground/5 backdrop-blur-sm" />
            <div className="relative grid grid-cols-2 gap-4 p-8">
              {[
                { label: "B2B partnerů", value: "500+" },
                { label: "Produktů v katalogu", value: "12 000" },
                { label: "Objednávek měsíčně", value: "8 500" },
                { label: "Spokojenost", value: "98 %" },
              ].map((stat) => (
                <div key={stat.label} className="rounded-2xl border border-primary-foreground/15 bg-primary-foreground/5 p-6 backdrop-blur-md">
                  <div className="font-display text-3xl font-bold text-accent">{stat.value}</div>
                  <div className="mt-1 text-sm text-primary-foreground/70">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="container py-20 md:py-28">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-3xl font-bold md:text-4xl">Vše, co B2B nákupčí potřebuje</h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Postaveno pro velkoobchod. Bez zbytečných funkcí, se vším podstatným.
          </p>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <Card key={f.title} className="group border-border/60 transition-all hover:border-primary/30 hover:shadow-soft">
              <CardContent className="p-6">
                <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-lg bg-accent-soft text-accent">
                  <f.icon className="h-5 w-5" />
                </div>
                <h3 className="font-display text-lg font-semibold">{f.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{f.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="container pb-20 md:pb-28">
        <div className="overflow-hidden rounded-3xl bg-gradient-hero p-10 text-primary-foreground shadow-elegant md:p-16">
          <div className="grid items-center gap-8 md:grid-cols-2">
            <div>
              <h2 className="font-display text-3xl font-bold md:text-4xl">Začněte s NordB2B ještě dnes</h2>
              <p className="mt-4 text-primary-foreground/80">
                Registrace je zdarma. Po schválení vaší firmy získáte okamžitý přístup
                k cenám, dostupnosti a možnost objednávat.
              </p>
            </div>
            <div className="flex justify-start md:justify-end">
              <Button size="lg" asChild className="bg-accent text-accent-foreground hover:bg-accent/90">
                <Link to="/registrace">
                  Registrovat firmu zdarma <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
