import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, Users, ShoppingCart, BarChart3, Tag, FolderTree, Settings } from "lucide-react";
import { Link } from "react-router-dom";

const sections = [
  { icon: Package, title: "Produkty a sklad", desc: "Spravujte katalog, varianty a sklady", to: "/admin/produkty" },
  { icon: FolderTree, title: "Kategorie", desc: "Stromová struktura kategorií", to: "/admin/kategorie" },
  { icon: Tag, title: "Ceníky", desc: "Hlavní a individuální ceníky", to: "/admin/ceniky" },
  { icon: Users, title: "Klienti", desc: "Schvalování a správa B2B partnerů", to: "/admin/klienti" },
  { icon: ShoppingCart, title: "Objednávky", desc: "Stav, faktury, export", to: "/admin/objednavky" },
  { icon: BarChart3, title: "Statistiky", desc: "Tržby, top produkty, klienti", to: "/admin/statistiky" },
  { icon: Settings, title: "Nastavení", desc: "Konfigurace platformy", to: "/admin/nastaveni" },
];

export default function AdminHome() {
  return (
    <div className="container py-10">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold">Admin dashboard</h1>
        <p className="mt-1 text-muted-foreground">Centrální správa B2B platformy</p>
      </div>

      <Card className="mb-8 border-primary/20 bg-gradient-subtle">
        <CardContent className="p-6">
          <p className="text-sm text-muted-foreground">
            <strong className="text-foreground">Fáze 1 hotová.</strong> Auth, role, schvalování klientů a chráněné routy fungují.
            V dalších fázích doplníme katalog produktů, ceníky, objednávky a statistiky.
          </p>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {sections.map((s) => (
          <Link key={s.to} to={s.to} className="group">
            <Card className="h-full transition-all hover:border-primary/30 hover:shadow-soft">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                    <s.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <CardTitle className="text-base">{s.title}</CardTitle>
                    <CardDescription className="text-xs">{s.desc}</CardDescription>
                  </div>
                </div>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
