import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { deleteAddress, fetchAddresses, setDefaultAddress, upsertAddress, type Address, type AddressKind } from "@/lib/api/account";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Pencil, Trash2, Star } from "lucide-react";
import { toast } from "sonner";

const empty: Partial<Address> = { kind: "billing", country: "CZ" };

export default function Addresses() {
  const { profile } = useAuth();
  const companyId = profile?.company_id ?? null;
  const qc = useQueryClient();
  const { data: items = [], isLoading } = useQuery({
    queryKey: ["addresses", companyId],
    queryFn: () => fetchAddresses(companyId!),
    enabled: !!companyId,
  });

  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<Partial<Address>>(empty);

  if (!companyId) return <div className="container py-10">Profil zatím nemá přiřazenou firmu.</div>;

  const openNew = () => { setDraft(empty); setOpen(true); };
  const openEdit = (a: Address) => { setDraft(a); setOpen(true); };

  const save = async () => {
    try {
      await upsertAddress({ ...draft, company_id: companyId } as any);
      toast.success("Adresa uložena");
      setOpen(false);
      qc.invalidateQueries({ queryKey: ["addresses", companyId] });
    } catch (e: any) { toast.error(e.message); }
  };
  const remove = async (id: string) => {
    if (!confirm("Smazat adresu?")) return;
    await deleteAddress(id);
    qc.invalidateQueries({ queryKey: ["addresses", companyId] });
  };
  const makeDefault = async (a: Address) => {
    await setDefaultAddress(a.id, companyId, a.kind);
    qc.invalidateQueries({ queryKey: ["addresses", companyId] });
  };

  return (
    <div className="container py-8 md:py-10">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-display text-3xl font-bold">Adresy</h1>
        <Button onClick={openNew}><Plus className="mr-2 h-4 w-4" /> Přidat adresu</Button>
      </div>

      {isLoading ? (
        <p className="text-muted-foreground">Načítám…</p>
      ) : items.length === 0 ? (
        <Card className="p-10 text-center text-muted-foreground">Zatím nemáte žádnou adresu.</Card>
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {items.map((a) => (
            <Card key={a.id} className="p-4">
              <div className="mb-2 flex items-start justify-between gap-2">
                <div>
                  <p className="text-xs uppercase tracking-wider text-muted-foreground">{a.kind === "billing" ? "Fakturační" : "Dodací"}</p>
                  <p className="font-semibold">{a.label || (a.kind === "billing" ? "Fakturační adresa" : "Dodací adresa")}{a.is_default && <Star className="ml-1 inline h-3.5 w-3.5 fill-warning text-warning" />}</p>
                </div>
                <div className="flex gap-1">
                  {!a.is_default && (
                    <Button size="icon" variant="ghost" onClick={() => makeDefault(a)} title="Nastavit jako výchozí">
                      <Star className="h-4 w-4" />
                    </Button>
                  )}
                  <Button size="icon" variant="ghost" onClick={() => openEdit(a)}><Pencil className="h-4 w-4" /></Button>
                  <Button size="icon" variant="ghost" onClick={() => remove(a.id)}><Trash2 className="h-4 w-4" /></Button>
                </div>
              </div>
              {a.contact_name && <p className="text-sm">{a.contact_name}</p>}
              <p className="text-sm text-muted-foreground">{a.street}</p>
              <p className="text-sm text-muted-foreground">{a.postal_code} {a.city}, {a.country}</p>
              {a.phone && <p className="text-sm text-muted-foreground">Tel: {a.phone}</p>}
            </Card>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{draft.id ? "Upravit adresu" : "Nová adresa"}</DialogTitle></DialogHeader>
          <div className="grid gap-3">
            <Field label="Typ">
              <Select value={draft.kind} onValueChange={(v) => setDraft((d) => ({ ...d, kind: v as AddressKind }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="billing">Fakturační</SelectItem>
                  <SelectItem value="shipping">Dodací</SelectItem>
                </SelectContent>
              </Select>
            </Field>
            <Field label="Název adresy"><Input value={draft.label ?? ""} onChange={(e) => setDraft({ ...draft, label: e.target.value })} placeholder="např. Centrála" /></Field>
            <Field label="Kontaktní osoba"><Input value={draft.contact_name ?? ""} onChange={(e) => setDraft({ ...draft, contact_name: e.target.value })} /></Field>
            <Field label="Ulice a č.p."><Input value={draft.street ?? ""} onChange={(e) => setDraft({ ...draft, street: e.target.value })} required /></Field>
            <div className="grid grid-cols-3 gap-3">
              <Field label="PSČ"><Input value={draft.postal_code ?? ""} onChange={(e) => setDraft({ ...draft, postal_code: e.target.value })} required /></Field>
              <div className="col-span-2"><Field label="Město"><Input value={draft.city ?? ""} onChange={(e) => setDraft({ ...draft, city: e.target.value })} required /></Field></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Země"><Input value={draft.country ?? "CZ"} onChange={(e) => setDraft({ ...draft, country: e.target.value })} /></Field>
              <Field label="Telefon"><Input value={draft.phone ?? ""} onChange={(e) => setDraft({ ...draft, phone: e.target.value })} /></Field>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Zrušit</Button>
            <Button onClick={save}>Uložit</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
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
