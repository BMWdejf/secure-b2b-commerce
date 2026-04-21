import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2 } from "lucide-react";

export default function RegisterDone() {
  return (
    <div className="container flex min-h-[calc(100vh-4rem)] items-center justify-center py-12">
      <Card className="w-full max-w-lg shadow-soft">
        <CardContent className="p-10 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-success/10 text-success">
            <CheckCircle2 className="h-8 w-8" />
          </div>
          <h1 className="mt-6 font-display text-2xl font-bold">Žádost odeslána</h1>
          <p className="mt-3 text-muted-foreground">
            Děkujeme za registraci. Váš účet nyní čeká na schválení administrátorem.
            Po ověření vás budeme informovat e-mailem a získáte přístup k cenám a možnost objednávat.
          </p>
          <div className="mt-8 flex flex-col gap-2 sm:flex-row sm:justify-center">
            <Button asChild>
              <Link to="/prihlaseni">Přejít na přihlášení</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to="/">Zpět na hlavní stránku</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
