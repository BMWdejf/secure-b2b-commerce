import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { fetchPageBySlug } from "@/lib/api/site";
import { Skeleton } from "@/components/ui/skeleton";

export default function CmsPage({ slugOverride }: { slugOverride?: string }) {
  const params = useParams();
  const slug = slugOverride ?? params.slug ?? "";
  const { data, isLoading } = useQuery({
    queryKey: ["page", slug],
    queryFn: () => fetchPageBySlug(slug),
    enabled: !!slug,
  });

  if (isLoading) {
    return (
      <div className="container py-12">
        <Skeleton className="mb-4 h-10 w-1/2" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="container py-20 text-center">
        <h1 className="font-display text-2xl font-semibold">Stránka nenalezena</h1>
        <p className="mt-2 text-muted-foreground">Tato stránka neexistuje nebo není publikována.</p>
      </div>
    );
  }

  return (
    <div className="container py-10 md:py-14">
      <h1 className="font-display text-3xl font-bold md:text-4xl">{data.title}</h1>
      <article
        className="prose prose-neutral mt-6 max-w-3xl"
        dangerouslySetInnerHTML={{ __html: data.content_html }}
      />
    </div>
  );
}
