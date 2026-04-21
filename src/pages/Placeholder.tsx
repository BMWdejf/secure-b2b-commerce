import { Card, CardContent } from "@/components/ui/card";
import { Construction } from "lucide-react";

export default function Placeholder({ title, description }: { title: string; description?: string }) {
  return (
    <div className="container py-12">
      <Card className="mx-auto max-w-2xl">
        <CardContent className="p-10 text-center">
          <Construction className="mx-auto h-10 w-10 text-muted-foreground" />
          <h1 className="mt-4 font-display text-2xl font-bold">{title}</h1>
          <p className="mt-2 text-muted-foreground">
            {description || "Tato sekce bude doplněna v dalších fázích vývoje."}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
