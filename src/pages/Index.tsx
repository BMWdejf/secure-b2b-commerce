import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { fetchCategories } from "@/lib/api/catalog";
import { useSiteSettings } from "@/contexts/SiteSettingsContext";

export default function Index() {
  const { data: categories = [] } = useQuery({ queryKey: ["categories"], queryFn: fetchCategories });
  const { settings } = useSiteSettings();

  const heroTitle = settings?.hero_title ?? "Látky pro ty, kdo tvoří s láskou.";
  const accent = settings?.hero_title_accent ?? "";
  const renderedTitle =
    accent && heroTitle.includes(accent)
      ? heroTitle.split(accent).flatMap((part, i, arr) =>
          i < arr.length - 1 ? [part, <em key={i} className="font-serif italic text-terracotta">{accent}</em>] : [part],
        )
      : heroTitle;

  const stats = settings?.hero_stats ?? [];
  const features = settings?.features ?? [];

  return (
    <div className="bg-cream text-ink animate-fade-in">
      {/* HERO */}
      <section className="relative overflow-hidden border-b border-line/60">
        <div className="container grid gap-14 py-16 md:grid-cols-12 md:py-24 lg:py-32">
          <div className="md:col-span-7 lg:col-span-7">
            <div className="mb-8 flex items-center gap-3 text-xs uppercase tracking-[0.24em] text-ink-soft">
              <span className="h-px w-10 bg-ink/40" />
              {settings?.hero_badge ?? "Velkoobchod · látky metráž"}
            </div>
            <h1 className="font-serif text-5xl font-medium leading-[1.02] tracking-tight text-balance md:text-6xl lg:text-7xl xl:text-[5.5rem]">
              {renderedTitle}
            </h1>
            {settings?.hero_subtitle && (
              <p className="mt-8 max-w-lg text-lg leading-relaxed text-ink-soft">
                {settings.hero_subtitle}
              </p>
            )}
            <div className="mt-10 flex flex-wrap items-center gap-6">
              <Button
                asChild
                size="lg"
                className="rounded-none bg-ink text-cream hover:bg-terracotta"
              >
                <Link to="/registrace" className="gap-3">
                  {settings?.hero_cta_primary ?? "Registrovat firmu"}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Link
                to="/katalog"
                className="group inline-flex items-center gap-2 border-b border-ink pb-0.5 text-sm font-medium tracking-wide text-ink transition-colors hover:text-terracotta hover:border-terracotta"
              >
                {settings?.hero_cta_secondary ?? "Procházet katalog"}
                <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </Link>
            </div>
            {settings?.hero_note && (
              <p className="mt-6 text-xs uppercase tracking-widest text-ink-soft/70">{settings.hero_note}</p>
            )}
          </div>

          {/* Editorial image column */}
          <div className="md:col-span-5 lg:col-span-5">
            <div className="relative">
              <div className="aspect-[4/5] w-full overflow-hidden rounded-sm bg-rose-soft">
                <div
                  className="h-full w-full"
                  style={{
                    backgroundImage:
                      "radial-gradient(circle at 30% 30%, hsl(var(--rose)) 0%, transparent 55%), radial-gradient(circle at 75% 70%, hsl(var(--terracotta) / 0.65) 0%, transparent 55%), linear-gradient(160deg, hsl(var(--rose-soft)) 0%, hsl(var(--cream-deep)) 100%)",
                  }}
                />
              </div>
              <div className="absolute -bottom-6 -left-6 hidden bg-cream px-5 py-4 shadow-[0_1px_0_hsl(var(--line))] sm:block">
                <div className="text-xs uppercase tracking-widest text-ink-soft">Nová kolekce</div>
                <div className="mt-1 font-serif text-2xl italic text-ink">jaro / léto</div>
              </div>
              <div className="absolute -top-4 -right-4 hidden rounded-full border border-ink bg-cream px-4 py-2 text-xs uppercase tracking-widest text-ink md:block">
                B2B ceny
              </div>
            </div>
          </div>
        </div>

        {/* Stats strip */}
        {stats.length > 0 && (
          <div className="border-t border-line/60">
            <div className="container grid grid-cols-2 divide-x divide-line/60 md:grid-cols-4">
              {stats.slice(0, 4).map((stat, i) => (
                <div key={i} className="px-6 py-8 first:pl-0 last:pr-0">
                  <div className="font-serif text-3xl italic text-terracotta md:text-4xl">{stat.value}</div>
                  <div className="mt-2 text-xs uppercase tracking-widest text-ink-soft">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* CATEGORIES — editorial grid */}
      {categories.length > 0 && (
        <section className="container py-20 md:py-28">
          <div className="mb-14 flex items-end justify-between gap-6 border-b border-line/60 pb-6">
            <div>
              <div className="mb-3 text-xs uppercase tracking-[0.24em] text-ink-soft">— Sortiment</div>
              <h2 className="font-serif text-4xl font-medium leading-none tracking-tight md:text-5xl">
                Procházejte podle <em className="italic text-terracotta">kategorie</em>
              </h2>
            </div>
            <Link
              to="/katalog"
              className="group hidden shrink-0 items-center gap-2 border-b border-ink pb-0.5 text-sm font-medium sm:inline-flex hover:text-terracotta hover:border-terracotta transition-colors"
            >
              Celý katalog
              <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
            {categories.slice(0, 6).map((c, idx) => {
              const tones = [
                "linear-gradient(160deg, hsl(var(--rose-soft)) 0%, hsl(var(--cream-deep)) 100%)",
                "linear-gradient(160deg, hsl(var(--cream-deep)) 0%, hsl(var(--olive) / 0.35) 100%)",
                "linear-gradient(160deg, hsl(var(--terracotta) / 0.25) 0%, hsl(var(--cream-deep)) 100%)",
              ];
              return (
                <Link
                  key={c.id}
                  to={`/katalog?kategorie=${c.slug}`}
                  className="group block"
                >
                  <div className="relative aspect-[4/5] overflow-hidden rounded-sm">
                    {(c as any).image_url ? (
                      <img
                        src={(c as any).image_url}
                        alt={c.name}
                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    ) : (
                      <div
                        className="h-full w-full transition-transform duration-700 group-hover:scale-105"
                        style={{ background: tones[idx % tones.length] }}
                      />
                    )}
                    <span className="absolute left-4 top-4 rounded-full bg-cream/90 px-3 py-1 text-[10px] uppercase tracking-widest text-ink backdrop-blur-sm">
                      {String(idx + 1).padStart(2, "0")}
                    </span>
                  </div>
                  <div className="mt-5 flex items-start justify-between gap-4">
                    <div>
                      <h3 className="font-serif text-2xl font-medium leading-tight tracking-tight group-hover:text-terracotta transition-colors">
                        {c.name}
                      </h3>
                      {c.description && (
                        <p className="mt-1.5 line-clamp-2 text-sm text-ink-soft">{c.description}</p>
                      )}
                    </div>
                    <ArrowUpRight className="mt-2 h-5 w-5 shrink-0 text-ink-soft transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-terracotta" />
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* FEATURES — numbered editorial */}
      {features.length > 0 && (
        <section className="border-y border-line/60 bg-cream-deep/40">
          <div className="container py-20 md:py-28">
            <div className="grid gap-14 md:grid-cols-12">
              <div className="md:col-span-4">
                <div className="mb-3 text-xs uppercase tracking-[0.24em] text-ink-soft">— Proč u nás</div>
                <h2 className="font-serif text-4xl font-medium leading-[1.05] tracking-tight md:text-5xl">
                  {settings?.features_title ?? (
                    <>
                      Přístup, kterému <em className="italic text-terracotta">věříte</em>
                    </>
                  )}
                </h2>
                {settings?.features_subtitle && (
                  <p className="mt-6 max-w-md text-base leading-relaxed text-ink-soft">
                    {settings.features_subtitle}
                  </p>
                )}
              </div>
              <div className="md:col-span-8">
                <ul className="divide-y divide-line/60">
                  {features.map((f, i) => (
                    <li key={i} className="grid grid-cols-12 gap-6 py-8 first:pt-0">
                      <div className="col-span-2 font-serif text-2xl italic text-terracotta md:text-3xl">
                        {String(i + 1).padStart(2, "0")}
                      </div>
                      <div className="col-span-10">
                        <h3 className="font-serif text-2xl font-medium leading-snug tracking-tight md:text-3xl">
                          {f.title}
                        </h3>
                        <p className="mt-3 max-w-xl text-base leading-relaxed text-ink-soft">{f.desc}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="container py-20 md:py-28">
        <div className="relative overflow-hidden rounded-sm bg-terracotta px-8 py-16 text-cream md:px-16 md:py-24">
          <div
            className="pointer-events-none absolute inset-0 opacity-30"
            style={{
              backgroundImage:
                "radial-gradient(circle at 90% 10%, hsl(var(--rose-soft) / 0.6) 0%, transparent 45%), radial-gradient(circle at 10% 90%, hsl(var(--cream) / 0.4) 0%, transparent 45%)",
            }}
          />
          <div className="relative grid items-end gap-10 md:grid-cols-12">
            <div className="md:col-span-8">
              <div className="mb-4 text-xs uppercase tracking-[0.24em] text-cream/70">— Začněte dnes</div>
              <h2 className="font-serif text-4xl font-medium leading-[1.05] tracking-tight md:text-6xl">
                {settings?.cta_title ?? (
                  <>
                    Otevřete si <em className="italic">velkoobchodní</em> ceny.
                  </>
                )}
              </h2>
              {settings?.cta_text && (
                <p className="mt-6 max-w-xl text-lg leading-relaxed text-cream/85">{settings.cta_text}</p>
              )}
            </div>
            <div className="md:col-span-4 md:text-right">
              <Button
                asChild
                size="lg"
                className="rounded-none bg-cream text-ink hover:bg-cream/90"
              >
                <Link to="/registrace" className="gap-3">
                  {settings?.cta_button ?? "Registrovat firmu"}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
