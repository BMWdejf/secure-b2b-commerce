import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, Package, FileText, Users, ShieldCheck, Truck, Zap, Star, Heart, Award, Sparkles } from "lucide-react";
import { fetchCategories } from "@/lib/api/catalog";
import { useSiteSettings } from "@/contexts/SiteSettingsContext";

const ICONS: Record<string, any> = { Package, FileText, Users, ShieldCheck, Truck, Zap, Star, Heart, Award, Sparkles };

export default function Index() {
  const { data: categories = [] } = useQuery({ queryKey: ["categories"], queryFn: fetchCategories });
  const { settings } = useSiteSettings();

  const heroTitle = settings?.hero_title ?? "Velkoobchod, který šetří čas vašim nákupčím.";
  const accent = settings?.hero_title_accent ?? "";
  const renderedTitle = accent && heroTitle.includes(accent)
    ? heroTitle.split(accent).flatMap((part, i, arr) =>
        i < arr.length - 1 ? [part, <span key={i} className="text-accent">{accent}</span>] : [part]
      )
    : heroTitle;

  const stats = settings?.hero_stats ?? [];
  const features = settings?.features ?? [];

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
              {settings?.hero_badge ?? "B2B velkoobchodní platforma"}
            </div>
            <h1 className="font-display text-4xl font-bold leading-tight text-balance md:text-5xl lg:text-6xl">
              {renderedTitle}
            </h1>
            <p className="max-w-xl text-lg text-primary-foreground/80">
              {settings?.hero_subtitle}
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button size="lg" asChild className="bg-accent text-accent-foreground hover:bg-accent/90">
                <Link to="/registrace">
                  {settings?.hero_cta_primary ?? "Registrovat firmu"} <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="border-primary-foreground/30 bg-transparent text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground">
                <Link to="/katalog">{settings?.hero_cta_secondary ?? "Procházet katalog"}</Link>
              </Button>
            </div>
            <p className="text-sm text-primary-foreground/60">{settings?.hero_note}</p>
          </div>

          {stats.length > 0 && (
            <div className="relative hidden md:block">
              <div className="absolute inset-0 rounded-3xl bg-primary-foreground/5 backdrop-blur-sm" />
              <div className="relative grid grid-cols-2 gap-4 p-8">
                {stats.map((stat, i) => (
                  <div key={i} className="rounded-2xl border border-primary-foreground/15 bg-primary-foreground/5 p-6 backdrop-blur-md">
                    <div className="font-display text-3xl font-bold text-accent">{stat.value}</div>
                    <div className="mt-1 text-sm text-primary-foreground/70">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* CATEGORIES */}
      {categories.length > 0 && (
        <section className="container py-16 md:py-20">
          <div className="mb-10 flex items-end justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-accent">Sortiment</p>
              <h2 className="mt-1 font-display text-3xl font-bold md:text-4xl">Procházejte podle kategorie</h2>
            </div>
            <Button variant="ghost" asChild className="hidden sm:inline-flex">
              <Link to="/katalog">Celý katalog <ArrowRight className="ml-2 h-4 w-4" /></Link>
            </Button>
          </div>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {categories.slice(0, 8).map((c) => (
              <Link
                key={c.id}
                to={`/katalog?kategorie=${c.slug}`}
                className="group relative overflow-hidden rounded-xl border border-border bg-card p-6 transition-all hover:-translate-y-1 hover:border-primary/30 hover:shadow-soft"
              >
                <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                  <Package className="h-5 w-5" />
                </div>
                <h3 className="font-semibold leading-tight">{c.name}</h3>
                {c.description && (
                  <p className="mt-1.5 line-clamp-2 text-xs text-muted-foreground">{c.description}</p>
                )}
                <ArrowRight className="absolute bottom-5 right-5 h-4 w-4 text-muted-foreground opacity-0 transition-all group-hover:translate-x-1 group-hover:opacity-100" />
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* FEATURES */}
      {features.length > 0 && (
        <section className="container py-20 md:py-28">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-display text-3xl font-bold md:text-4xl">{settings?.features_title}</h2>
            <p className="mt-4 text-lg text-muted-foreground">{settings?.features_subtitle}</p>
          </div>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f, i) => {
              const Icon = ICONS[f.icon] ?? Package;
              return (
                <Card key={i} className="group border-border/60 transition-all hover:border-primary/30 hover:shadow-soft">
                  <CardContent className="p-6">
                    <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-lg bg-accent-soft text-accent">
                      <Icon className="h-5 w-5" />
                    </div>
                    <h3 className="font-display text-lg font-semibold">{f.title}</h3>
                    <p className="mt-2 text-sm text-muted-foreground">{f.desc}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="container pb-20 md:pb-28">
        <div className="overflow-hidden rounded-3xl bg-gradient-hero p-10 text-primary-foreground shadow-elegant md:p-16">
          <div className="grid items-center gap-8 md:grid-cols-2">
            <div>
              <h2 className="font-display text-3xl font-bold md:text-4xl">{settings?.cta_title}</h2>
              <p className="mt-4 text-primary-foreground/80">{settings?.cta_text}</p>
            </div>
            <div className="flex justify-start md:justify-end">
              <Button size="lg" asChild className="bg-accent text-accent-foreground hover:bg-accent/90">
                <Link to="/registrace">
                  {settings?.cta_button} <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
