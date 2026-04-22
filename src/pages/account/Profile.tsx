import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { fetchMyProfile, updateMyCompany, updateMyProfile } from "@/lib/api/account";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function Profile() {
  const { user, refreshProfile } = useAuth();
  const { data, isLoading, refetch } = useQuery({ queryKey: ["my-profile", user?.id], queryFn: () => fetchMyProfile(user!.id), enabled: !!user });

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [ico, setIco] = useState("");
  const [dic, setDic] = useState("");
  const [companyEmail, setCompanyEmail] = useState("");
  const [companyPhone, setCompanyPhone] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!data) return;
    setFullName(data.full_name || "");
    setPhone(data.phone || "");
    setCompanyName(data.company?.name || "");
    setIco(data.company?.ico || "");
    setDic(data.company?.dic || "");
    setCompanyEmail(data.company?.email || "");
    setCompanyPhone(data.company?.phone || "");
  }, [data]);

  if (isLoading) return <div className="container py-10 text-muted-foreground">Načítám…</div>;
  if (!user || !data) return null;

  const save = async () => {
    setSaving(true);
    try {
      await updateMyProfile(user.id, { full_name: fullName, phone: phone || null });
      if (data.company) {
        await updateMyCompany(data.company.id, {
          name: companyName,
          ico: ico || null,
          dic: dic || null,
          email: companyEmail || null,
          phone: companyPhone || null,
        });
      }
      toast.success("Údaje byly uloženy");
      await refetch();
      await refreshProfile();
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="container max-w-3xl py-8 md:py-10">
      <h1 className="mb-6 font-display text-3xl font-bold">Můj profil</h1>

      <div className="space-y-6">
        <Card className="p-6">
          <h2 className="mb-4 text-lg font-semibold">Osobní údaje</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Jméno a příjmení"><Input value={fullName} onChange={(e) => setFullName(e.target.value)} /></Field>
            <Field label="E-mail"><Input value={user.email ?? ""} disabled /></Field>
            <Field label="Telefon"><Input value={phone} onChange={(e) => setPhone(e.target.value)} /></Field>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="mb-4 text-lg font-semibold">Firma</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Název firmy"><Input value={companyName} onChange={(e) => setCompanyName(e.target.value)} /></Field>
            <Field label="IČO"><Input value={ico} onChange={(e) => setIco(e.target.value)} /></Field>
            <Field label="DIČ"><Input value={dic} onChange={(e) => setDic(e.target.value)} /></Field>
            <Field label="E-mail firmy"><Input type="email" value={companyEmail} onChange={(e) => setCompanyEmail(e.target.value)} /></Field>
            <Field label="Telefon firmy"><Input value={companyPhone} onChange={(e) => setCompanyPhone(e.target.value)} /></Field>
          </div>
        </Card>

        <div className="flex justify-end">
          <Button onClick={save} disabled={saving}>
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Uložit změny
          </Button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs">{label}</Label>
      {children}
    </div>
  );
}
