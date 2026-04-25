import { Link } from "react-router-dom";
import { useSiteSettings } from "@/contexts/SiteSettingsContext";

export function PublicFooter() {
  const { settings } = useSiteSettings();
  const brand = settings?.brand_name ?? "NordB2B";
  return (
    <footer className="border-t border-border/60 bg-secondary/40">
      <div className="container py-12">
        <div className="grid gap-8 md:grid-cols-4">
          <div className="md:col-span-2">
            <Link to="/" className="flex items-center gap-2 font-display text-xl font-bold text-primary">
              {settings?.logo_url ? (
                <img src={settings.logo_url} alt={brand} className="h-9 w-auto" />
              ) : (
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-hero text-primary-foreground">
                  {brand.charAt(0)}
                </div>
              )}
              {brand}
            </Link>
            <p className="mt-3 max-w-md text-sm text-muted-foreground">
              {settings?.footer_text ?? "Velkoobchodní platforma navržená pro moderní B2B partnery."}
            </p>
          </div>
          <div>
            <h4 className="mb-3 text-sm font-semibold">Platforma</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/katalog" className="hover:text-foreground">Katalog</Link></li>
              <li><Link to="/registrace" className="hover:text-foreground">Registrace</Link></li>
              <li><Link to="/prihlaseni" className="hover:text-foreground">Přihlášení</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="mb-3 text-sm font-semibold">Společnost</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/o-nas" className="hover:text-foreground">O nás</Link></li>
              <li><Link to="/kontakt" className="hover:text-foreground">Kontakt</Link></li>
            </ul>
          </div>
        </div>
        <div className="mt-10 flex flex-col items-start justify-between gap-3 border-t border-border/60 pt-6 text-xs text-muted-foreground sm:flex-row">
          <p>© {new Date().getFullYear()} {brand}. Všechna práva vyhrazena.</p>
          <p>
            {settings?.company_ico ? `IČO: ${settings.company_ico}` : ""} {settings?.company_dic ? `· DIČ: ${settings.company_dic}` : ""}
          </p>
        </div>
      </div>
    </footer>
  );
}
