import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";
import { fetchCategories, fetchProducts } from "@/lib/api/catalog";
import { ProductCard } from "@/components/catalog/ProductCard";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function Catalog() {
  const [searchParams, setSearchParams] = useSearchParams();
  const categorySlug = searchParams.get("kategorie") || undefined;
  const searchInUrl = searchParams.get("q") || "";
  const sort = (searchParams.get("razeni") as "newest" | "name_asc" | "name_desc") || "newest";

  const [searchInput, setSearchInput] = useState(searchInUrl);

  const updateParam = (key: string, value: string | undefined) => {
    const next = new URLSearchParams(searchParams);
    if (value && value.length > 0) next.set(key, value);
    else next.delete(key);
    setSearchParams(next, { replace: true });
  };

  const { data: categories = [] } = useQuery({ queryKey: ["categories"], queryFn: fetchCategories });

  const { data: products = [], isLoading } = useQuery({
    queryKey: ["products", { categorySlug, search: searchInUrl, sort }],
    queryFn: () => fetchProducts({ categorySlug, search: searchInUrl, sort }),
  });

  const activeCategory = useMemo(
    () => categories.find((c) => c.slug === categorySlug),
    [categories, categorySlug],
  );

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateParam("q", searchInput.trim() || undefined);
  };

  const FilterPanel = (
    <div className="space-y-6">
      <div>
        <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Kategorie</h3>
        <div className="space-y-1">
          <button
            onClick={() => updateParam("kategorie", undefined)}
            className={`w-full rounded-md px-3 py-2 text-left text-sm transition-colors ${
              !categorySlug ? "bg-primary text-primary-foreground" : "hover:bg-secondary"
            }`}
          >
            Všechny produkty
          </button>
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => updateParam("kategorie", c.slug)}
              className={`w-full rounded-md px-3 py-2 text-left text-sm transition-colors ${
                categorySlug === c.slug ? "bg-primary text-primary-foreground" : "hover:bg-secondary"
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="container py-8 md:py-12">
      <header className="mb-8 space-y-2">
        <p className="text-sm font-medium text-accent">Katalog</p>
        <h1 className="font-display text-3xl font-bold tracking-tight md:text-4xl">
          {activeCategory ? activeCategory.name : "Všechny produkty"}
        </h1>
        {activeCategory?.description && (
          <p className="max-w-2xl text-muted-foreground">{activeCategory.description}</p>
        )}
      </header>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[260px,1fr]">
        <aside className="hidden lg:block">
          <div className="sticky top-24">{FilterPanel}</div>
        </aside>

        <div className="space-y-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <form onSubmit={handleSearchSubmit} className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Hledat název nebo SKU…"
                className="pl-9 pr-9"
              />
              {searchInput && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchInput("");
                    updateParam("q", undefined);
                  }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-muted-foreground hover:bg-secondary"
                  aria-label="Vymazat"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </form>

            <Select value={sort} onValueChange={(v) => updateParam("razeni", v === "newest" ? undefined : v)}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Nejnovější</SelectItem>
                <SelectItem value="name_asc">Název A–Z</SelectItem>
                <SelectItem value="name_desc">Název Z–A</SelectItem>
              </SelectContent>
            </Select>

            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" className="lg:hidden">
                  <SlidersHorizontal className="mr-2 h-4 w-4" /> Filtry
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[300px]">
                <SheetHeader>
                  <SheetTitle>Filtry</SheetTitle>
                </SheetHeader>
                <div className="mt-6">{FilterPanel}</div>
              </SheetContent>
            </Sheet>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="aspect-[3/4] w-full" />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="rounded-lg border border-dashed border-border bg-card p-12 text-center">
              <p className="text-muted-foreground">Žádné produkty neodpovídají vybraným kritériím.</p>
            </div>
          ) : (
            <>
              <p className="text-sm text-muted-foreground">
                Zobrazeno <span className="font-medium text-foreground">{products.length}</span> produktů
              </p>
              <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
                {products.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
