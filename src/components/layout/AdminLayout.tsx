import { NavLink, Outlet, Link } from "react-router-dom";
import { LayoutDashboard, Package, FolderTree, Tag, Users, ShoppingCart, BarChart3, Settings, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { to: "/admin", end: true, icon: LayoutDashboard, label: "Přehled" },
  { to: "/admin/produkty", icon: Package, label: "Produkty" },
  { to: "/admin/kategorie", icon: FolderTree, label: "Kategorie" },
  { to: "/admin/ceniky", icon: Tag, label: "Ceníky" },
  { to: "/admin/klienti", icon: Users, label: "Klienti" },
  { to: "/admin/objednavky", icon: ShoppingCart, label: "Objednávky" },
  { to: "/admin/statistiky", icon: BarChart3, label: "Statistiky" },
  { to: "/admin/nastaveni", icon: Settings, label: "Nastavení" },
];

export default function AdminLayout() {
  return (
    <div className="min-h-[calc(100vh-4rem)] bg-secondary/30">
      <div className="container flex flex-col gap-6 py-6 lg:flex-row lg:gap-8 lg:py-8">
        <aside className="lg:w-60 lg:shrink-0">
          <div className="sticky top-24 space-y-1 rounded-xl border border-border bg-card p-3 shadow-sm">
            <Link
              to="/"
              className="mb-2 flex items-center gap-2 rounded-md px-3 py-2 text-xs text-muted-foreground hover:bg-secondary hover:text-foreground"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Zpět na web
            </Link>
            <div className="border-t border-border pt-2">
              {items.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) =>
                    cn(
                      "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-secondary hover:text-foreground",
                    )
                  }
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </NavLink>
              ))}
            </div>
          </div>
        </aside>
        <main className="flex-1 min-w-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
