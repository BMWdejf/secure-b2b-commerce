import { Link } from "react-router-dom";
import { Lock, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";

export function PriceGate() {
  const { user, isApproved, profile } = useAuth();

  if (user && isApproved) {
    return (
      <Card className="border-success/30 bg-success/5 p-5">
        <p className="text-sm text-foreground">
          <span className="font-semibold">Cena dle vašeho ceníku.</span> Přesné ceny a dostupnost se zobrazí po
          dokončení katalogového ceníku ve fázi 4.
        </p>
      </Card>
    );
  }

  if (user && !isApproved) {
    return (
      <Card className="border-warning/40 bg-warning/5 p-5">
        <div className="flex items-start gap-3">
          <Clock className="mt-0.5 h-5 w-5 text-warning" />
          <div className="space-y-1">
            <h3 className="text-sm font-semibold text-foreground">
              {profile?.status === "blocked" ? "Účet zablokován" : "Účet čeká na schválení"}
            </h3>
            <p className="text-sm text-muted-foreground">
              Ceny a dostupnost se zobrazí, jakmile administrátor schválí vaši B2B registraci.
            </p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="border-primary/20 bg-gradient-subtle p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="rounded-md bg-primary/10 p-2 text-primary">
            <Lock className="h-5 w-5" />
          </div>
          <div className="space-y-0.5">
            <h3 className="text-sm font-semibold text-foreground">Ceny pouze pro registrované B2B partnery</h3>
            <p className="text-sm text-muted-foreground">Po schválení uvidíte ceny dle individuálního ceníku.</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link to="/prihlaseni">Přihlásit se</Link>
          </Button>
          <Button size="sm" asChild className="bg-accent text-accent-foreground hover:bg-accent/90">
            <Link to="/registrace">Registrace B2B</Link>
          </Button>
        </div>
      </div>
    </Card>
  );
}
