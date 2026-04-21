import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, ShieldCheck, Ban, Package, FileText, MapPin, User, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const statusBadge = {
  pending: { label: "Čeká na schválení", icon: Clock, className: "bg-warning text-warning-foreground" },
  approved: { label: "Schválený účet", icon: ShieldCheck, className: "bg-success text-success-foreground" },
  blocked: { label: "Účet je blokován", icon: Ban, className: "bg-destructive text-destructive-foreground" },
};

export default function AccountHome() {
  const { profile, isApproved, isAdmin } = useAuth();
  const status = profile?.status || "pending";
  const badge = statusBadge[status];

  return (
    <div className="container py-10">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold">Vítejte zpět{profile?.full_name ? `, ${profile.full_name.split(" ")[0]}` : ""}</h1>
          <p className="mt-1 text-muted-foreground">Přehled vašeho B2B účtu</p>
        </div>
        <Badge className={`${badge.className} h-7 px-3 text-xs`}>
          <badge.icon className="mr-1.5 h-3.5 w-3.5" /> {badge.label}
        </Badge>
      </div>

      {!isApproved && !isAdmin && (
        <Card className="mb-8 border-warning/30 bg-warning/5">
          <CardContent className="flex items-start gap-4 p-6">
            <Clock className="mt-0.5 h-5 w-5 shrink-0 text-warning" />
            <div>
              <h3 className="font-semibold">Váš účet čeká na schválení</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Děkujeme za registraci. Administrátor právě ověřuje údaje vaší firmy.
                Jakmile bude účet schválen, získáte přístup k cenám, dostupnosti a možnost objednávat.
                Obvykle to trvá do 24 hodin.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-3">
        <DashboardCard
          icon={Package}
          title="Moje objednávky"
          desc="Historie a stav objednávek"
          to="/ucet/objednavky"
          disabled={!isApproved && !isAdmin}
        />
        <DashboardCard
          icon={FileText}
          title="Faktury"
          desc="Stažení a stav úhrad"
          to="/ucet/faktury"
          disabled={!isApproved && !isAdmin}
        />
        <DashboardCard
          icon={MapPin}
          title="Adresy"
          desc="Fakturační a dodací údaje"
          to="/ucet/adresy"
        />
        <DashboardCard
          icon={User}
          title="Můj profil"
          desc="Osobní údaje a heslo"
          to="/ucet/profil"
        />
      </div>
    </div>
  );
}

function DashboardCard({
  icon: Icon,
  title,
  desc,
  to,
  disabled = false,
}: {
  icon: any;
  title: string;
  desc: string;
  to: string;
  disabled?: boolean;
}) {
  return (
    <Card className={disabled ? "opacity-60" : "transition-all hover:border-primary/30 hover:shadow-soft"}>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent-soft text-accent">
            <Icon className="h-5 w-5" />
          </div>
          <div>
            <CardTitle className="text-base">{title}</CardTitle>
            <CardDescription className="text-xs">{desc}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Button variant="ghost" size="sm" className="w-full justify-between" asChild={!disabled} disabled={disabled}>
          {disabled ? (
            <span>Bude dostupné po schválení</span>
          ) : (
            <Link to={to}>
              Otevřít <ArrowRight className="h-4 w-4" />
            </Link>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
